import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUserBalance, getMeterStatus, MeterStatus } from '../lib/api';
import { useRealtimeBalance } from '../hooks/useRealtimeBalance';
import { hasFirebaseConfig } from '../lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import TransactionList from '../components/TransactionList';
import PaymentModal from '../components/PaymentModal';
import ConsumptionChart from '../components/ConsumptionChart';
import { CreditCard, User, Hash, LogOut, Wifi, WifiOff, RefreshCw, Zap, TrendingUp, Wallet, Clock } from 'lucide-react';

const DashboardPage = () => {
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [totalAmountPaid, setTotalAmountPaid] = useState<number>(0);
  const [totalUnitsPurchased, setTotalUnitsPurchased] = useState<number>(0);
  const [transactionCount, setTransactionCount] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [meterStatus, setMeterStatus] = useState<MeterStatus | null>(null);
  const { user, logout } = useAuth();

  // Firebase real-time balance (only if Firebase is configured)
  const { balance: firebaseBalance, loading: firebaseLoading, error: balanceError, lastUpdated } = useRealtimeBalance(user?.user_id || null);

  // Fallback: HTTP polling for balance when Firebase isn't available
  const [httpBalance, setHttpBalance] = useState<number>(0);
  const [isLoadingHttpBalance, setIsLoadingHttpBalance] = useState(false);
  const [httpLastUpdated, setHttpLastUpdated] = useState<Date | null>(null);

  // Use Firebase balance if available, otherwise HTTP balance
  const availableUnits = hasFirebaseConfig ? firebaseBalance : httpBalance;
  const isLoadingBalance = hasFirebaseConfig ? firebaseLoading : isLoadingHttpBalance;
  const effectiveLastUpdated = hasFirebaseConfig ? lastUpdated : httpLastUpdated;

  // Fetch balance via HTTP (fallback when Firebase not configured)
  const fetchBalanceHTTP = async () => {
    if (!user?.meter_no) return;
    
    try {
      setIsLoadingHttpBalance(true);
      console.log(`[Dashboard] Fetching balance for meter: ${user.meter_no}`);
      const balanceData = await getUserBalance(user.meter_no);
      console.log('[Dashboard] Balance data received:', balanceData);
      
      const balance = typeof balanceData.availableUnits === 'number' ? balanceData.availableUnits : parseFloat(String(balanceData.availableUnits)) || 0;
      console.log('[Dashboard] Setting HTTP balance to:', balance);
      
      setHttpBalance(balance);
      setTotalAmountPaid(balanceData.totalAmountPaid || 0);
      setTotalUnitsPurchased(balanceData.totalUnitsPurchased || 0);
      setTransactionCount(balanceData.transactionCount || 0);
      setHttpLastUpdated(new Date());
    } catch (error) {
      console.error('[Dashboard] Error fetching balance:', error);
      setHttpBalance(0);
      setTotalAmountPaid(0);
      setTotalUnitsPurchased(0);
      setTransactionCount(0);
    } finally {
      setIsLoadingHttpBalance(false);
    }
  };

  // Fetch initial transaction stats (non-real-time data)
  const fetchTransactionStats = async () => {
    if (!user?.meter_no) return;
    
    try {
      const balanceData = await getUserBalance(user.meter_no);
      setTotalAmountPaid(balanceData.totalAmountPaid || 0);
      setTotalUnitsPurchased(balanceData.totalUnitsPurchased || 0);
      setTransactionCount(balanceData.transactionCount || 0);
    } catch (error) {
      console.error('Error fetching transaction stats:', error);
      setTotalAmountPaid(0);
      setTotalUnitsPurchased(0);
      setTransactionCount(0);
    }
  };

  // Live clock - update every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  // Fetch meter status (ESP32 connectivity)
  const fetchMeterStatus = async () => {
    if (!user?.meter_no) return;
    
    try {
      const status = await getMeterStatus(user.meter_no);
      setMeterStatus(status);
      console.log(`[Dashboard] Meter status: ${status.online ? 'Online' : 'Offline'}, Last seen: ${status.last_seen_ago_seconds}s ago`);
    } catch (error) {
      console.error('[Dashboard] Error fetching meter status:', error);
    }
  };

  // Fetch meter status on mount and every 5 seconds for near-instant updates
  useEffect(() => {
    fetchMeterStatus();
    const statusInterval = setInterval(fetchMeterStatus, 5000); // 5 seconds
    return () => clearInterval(statusInterval);
  }, [user?.meter_no]);

  useEffect(() => {
    // If Firebase is configured, fetch transaction stats only
    // If Firebase is NOT configured, fetch full balance via HTTP
    console.log('[Dashboard] Firebase configured:', hasFirebaseConfig);
    console.log('[Dashboard] User ID:', user?.user_id);
    console.log('[Dashboard] Meter No:', user?.meter_no);
    
    if (hasFirebaseConfig) {
      console.log('[Dashboard] Using Firebase real-time mode');
      fetchTransactionStats();
    } else {
      console.log('[Dashboard] Firebase not configured, using HTTP polling for balance');
      fetchBalanceHTTP();
      
      // Poll every 10 seconds when using HTTP fallback
      const interval = setInterval(fetchBalanceHTTP, 10000);
      return () => clearInterval(interval);
    }
  }, [user?.user_id]);

  const handlePaymentSuccess = () => {
    // Refresh data after successful payment
    console.log('[Dashboard] Payment successful, refreshing balance...');
    if (hasFirebaseConfig) {
      console.log('[Dashboard] Fetching transaction stats (Firebase mode)');
      fetchTransactionStats(); // Balance will update automatically via Firebase listener
    } else {
      console.log('[Dashboard] Fetching balance via HTTP');
      fetchBalanceHTTP(); // Fetch full balance via HTTP
    }
  };

  if (!user) {
    return null; // This shouldn't happen due to routing, but good fallback
  }

  const calculateUnits = (amount: number) => {
    return Math.floor(amount / 25);
  };

  // Use calculated balance and units from transactions
  const userBalance = totalAmountPaid;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Compact Modern Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Title */}
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-2 rounded-lg">
                <img 
                  src="/ioticon.png" 
                  alt="IOT Smart Meter Logo" 
                  className="h-6 w-6 object-contain"
                />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-bold text-gray-900">IOT Smart Meter</h1>
                <p className="text-xs text-gray-600 hidden sm:block">Meter #{user.meter_no}</p>
              </div>
            </div>

            {/* User Info and Actions */}
            <div className="flex items-center gap-3">
              {/* Meter Status - ESP32 Device Connectivity */}
              <div className="hidden md:flex items-center gap-2 text-sm">
                {!meterStatus ? (
                  <span className="flex items-center gap-1.5 text-gray-500" title="Checking meter status...">
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span className="hidden lg:inline">Checking...</span>
                  </span>
                ) : meterStatus.online ? (
                  <span className="flex items-center gap-1.5 text-green-600" title={`ESP32 Connected - Last seen ${meterStatus.last_seen_ago_seconds}s ago`}>
                    <Wifi className="h-3.5 w-3.5 animate-pulse" />
                    <span className="hidden lg:inline">Meter Online</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-red-600" title="ESP32 Disconnected - Device is offline">
                    <WifiOff className="h-3.5 w-3.5" />
                    <span className="hidden lg:inline">Meter Offline</span>
                  </span>
                )}
              </div>

              {/* User Email */}
              <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg">
                <User className="h-4 w-4 text-gray-600" />
                <span className="text-sm text-gray-700">{user.email}</span>
              </div>

              {/* Logout Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="flex items-center gap-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Quick Actions - Prominent at Top */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-lg p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="text-white">
              <h2 className="text-2xl font-bold mb-1">Welcome back, {user.name || 'User'}!</h2>
              <p className="text-indigo-100 text-sm">Make Payments and get account summary</p>
            </div>
            <Button 
              onClick={() => setIsPaymentModalOpen(true)}
              size="lg"
              className="bg-white hover:bg-gray-100 text-indigo-600 font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 w-full sm:w-auto"
            >
              <CreditCard className="h-5 w-5 mr-2" />
              Make Payment
            </Button>
          </div>
        </div>

        {/* Stats Grid - Modern Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Available Units */}
          <Card className="bg-white border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="bg-gradient-to-br from-green-100 to-emerald-100 p-3 rounded-xl">
                  <Zap className="h-6 w-6 text-green-600" />
                </div>
                {isLoadingBalance && (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600"></div>
                )}
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-600">Available Units</p>
                <p className="text-3xl font-bold text-gray-900">
                  {isLoadingBalance ? '---' : availableUnits.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500">⚡ kWh remaining</p>
              </div>
            </CardContent>
          </Card>

          {/* Total Purchased */}
          <Card className="bg-white border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="bg-gradient-to-br from-blue-100 to-indigo-100 p-3 rounded-xl">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-600">Total Purchased</p>
                <p className="text-3xl font-bold text-gray-900">
                  {totalUnitsPurchased.toFixed(0)}
                </p>
                <p className="text-xs text-gray-500">Units all-time</p>
              </div>
            </CardContent>
          </Card>

          {/* Total Spent */}
          <Card className="bg-white border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="bg-gradient-to-br from-purple-100 to-pink-100 p-3 rounded-xl">
                  <Wallet className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-600">Total Spent</p>
                <p className="text-3xl font-bold text-gray-900">
                  {totalAmountPaid.toFixed(0)}
                </p>
                <p className="text-xs text-gray-500">KSH • {transactionCount} payments</p>
              </div>
            </CardContent>
          </Card>

          {/* Current Time */}
          <Card className="bg-white border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="bg-gradient-to-br from-orange-100 to-amber-100 p-3 rounded-xl">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-600">Current Time</p>
                <p className="text-2xl font-bold text-gray-900 tabular-nums">
                  {currentTime.toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    hour12: true
                  })}
                </p>
                <p className="text-xs text-gray-500">
                  {currentTime.toLocaleDateString('en-US', { 
                    weekday: 'short', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Consumption Analytics Chart */}
        <ConsumptionChart userId={user.user_id} />

        {/* Transaction History */}
        <TransactionList />
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        meterNo={user.meter_no}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
};

export default DashboardPage;