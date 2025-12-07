import React, { useEffect, useState } from 'react';
import { Transaction, getTransactions } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Receipt, TrendingUp } from 'lucide-react';

const TransactionList: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchTransactions = async () => {
    if (!user?.user_id) return;
    
    setIsLoading(true);
    try {
      const userTransactions = await getTransactions(user.user_id);
      setTransactions(userTransactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setTransactions([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [user?.user_id]);

  useEffect(() => {
    const interval = setInterval(fetchTransactions, 30000);
    return () => clearInterval(interval);
  }, [user?.user_id]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      completed: { variant: 'default' as const, className: 'bg-green-100 text-green-700 border-green-200 font-medium' },
      pending: { variant: 'secondary' as const, className: 'bg-yellow-100 text-yellow-700 border-yellow-200 font-medium' },
      failed: { variant: 'destructive' as const, className: 'bg-red-100 text-red-700 border-red-200 font-medium' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    
    return (
      <Badge variant={config.variant} className={`${config.className} border`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <Card className="bg-white border-0 shadow-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-indigo-600" />
            <CardTitle className="text-gray-900">Transaction History</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto mb-3"></div>
              <p className="text-sm text-gray-600">Loading transactions...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white border-0 shadow-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Receipt className="h-5 w-5 text-indigo-600" />
              <CardTitle className="text-gray-900">Transaction History</CardTitle>
            </div>
            <CardDescription className="text-gray-600">
              {transactions.length} recent payment{transactions.length !== 1 ? 's' : ''}
            </CardDescription>
          </div>
          {transactions.length > 0 && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-indigo-50 rounded-lg">
              <TrendingUp className="h-4 w-4 text-indigo-600" />
              <span className="text-sm font-medium text-indigo-700">
                KSH {transactions.reduce((sum, t) => sum + (t.amount || 0), 0).toFixed(0)}
              </span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-gray-50 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
              <Receipt className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-gray-600 font-medium mb-1">No transactions yet</p>
            <p className="text-sm text-gray-500">Your payment history will appear here</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block rounded-lg border border-gray-200 overflow-hidden">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead className="font-semibold text-gray-700">Transaction ID</TableHead>
                    <TableHead className="font-semibold text-gray-700">Amount</TableHead>
                    <TableHead className="font-semibold text-gray-700">Units</TableHead>
                    <TableHead className="font-semibold text-gray-700">Status</TableHead>
                    <TableHead className="font-semibold text-gray-700">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.transaction_id} className="hover:bg-gray-50 transition-colors">
                      <TableCell className="font-mono text-sm text-gray-900">
                        {transaction.transaction_id}
                      </TableCell>
                      <TableCell className="font-semibold text-gray-900">
                        KSH {(transaction.amount || 0).toFixed(2)}
                      </TableCell>
                      <TableCell className="font-medium text-gray-900">
                        {(transaction.units || 0).toFixed(2)} ⚡
                        {transaction.remainder && transaction.remainder > 0 && (
                          <span className="text-xs text-orange-600 ml-1">
                            (+{transaction.remainder.toFixed(2)} rem)
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(transaction.status)}
                      </TableCell>
                      <TableCell className="text-gray-600 text-sm">
                        {formatDate(transaction.timestamp)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
              {transactions.map((transaction) => (
                <div 
                  key={transaction.transaction_id} 
                  className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-indigo-200 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <p className="font-mono text-xs text-gray-600 mb-1">
                        {transaction.transaction_id}
                      </p>
                      <p className="text-lg font-bold text-gray-900">
                        KSH {(transaction.amount || 0).toFixed(2)}
                      </p>
                    </div>
                    {getStatusBadge(transaction.status)}
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div>
                      <span className="text-gray-600">Units:</span>
                      <span className="font-semibold text-gray-900 ml-1">
                        {(transaction.units || 0).toFixed(2)} ⚡
                      </span>
                      {transaction.remainder && transaction.remainder > 0 && (
                        <span className="text-xs text-orange-600 ml-1">
                          (+{transaction.remainder.toFixed(2)})
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatDate(transaction.timestamp)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default TransactionList;