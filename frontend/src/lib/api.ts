import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface PaymentRequest {
  meter_no: string;
  amount: number;
}

export interface PaymentResponse {
  transaction_id: string;
  amount: number;
  status: string;
  meter_no: string;
  timestamp: string;
}

export interface Transaction {
  transaction_id: string;
  amount: number;
  units: number;
  remainder?: number;
  status: 'pending' | 'completed' | 'failed';
  timestamp: string;
  meter_no: string;
}

export interface User {
  user_id: string;
  name: string;
  email: string;
  meter_no: string;
  balance: number;
  latest_transaction_id?: string;
}

export const getTransactions = async (userId: string): Promise<Transaction[]> => {
  try {
    const response = await api.get(`/transactions/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw new Error('Failed to fetch transactions');
  }
};

export interface UserBalance {
  user_id: string;
  // Backend may return either a full object (from recompute) or a minimal one with only availableUnits when persisted
  totalAmountPaid?: number;
  totalUnitsPurchased?: number;
  availableUnits: number;
  transactionCount?: number;
  timestamp?: string;
}

export const getUserBalance = async (meterNo: string): Promise<UserBalance> => {
  try {
    const response = await api.get(`/users/${encodeURIComponent(meterNo)}/balance`);
    // Ensure we always return at least availableUnits and meter_no
    const data = response.data || {};
    return {
      user_id: data.user_id || undefined,
      // backend returns meter_no and availableUnits for persisted case
      availableUnits: typeof data.availableUnits === 'number' ? data.availableUnits : parseFloat(data.availableUnits) || 0,
      totalAmountPaid: typeof data.totalAmountPaid === 'number' ? data.totalAmountPaid : (data.totalAmountPaid ? parseFloat(data.totalAmountPaid) : undefined),
      totalUnitsPurchased: typeof data.totalUnitsPurchased === 'number' ? data.totalUnitsPurchased : (data.totalUnitsPurchased ? parseFloat(data.totalUnitsPurchased) : undefined),
      transactionCount: typeof data.transactionCount === 'number' ? data.transactionCount : undefined,
      timestamp: data.timestamp || undefined,
      // include the returned meter_no when present
      ...(data.meter_no ? { meter_no: data.meter_no } : {})
    } as UserBalance;
  } catch (error) {
    console.error('Error fetching user balance:', error);
    throw new Error('Failed to fetch user balance');
  }
};

/**
 * Login user by email and meter number
 * @param email User's email address
 * @param meterNo User's meter number
 * @returns User data if found
 */
export const loginUser = async (email: string, meterNo: string): Promise<User> => {
  try {
    const response = await api.get(`/users/lookup?email=${encodeURIComponent(email)}&meter_no=${encodeURIComponent(meterNo)}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      throw new Error('Invalid email or meter number');
    }
    throw new Error('Failed to connect to server');
  }
};

/**
 * Simulate a payment
 * @param paymentData Payment request data
 * @returns Payment response
 */
export const simulatePayment = async (paymentData: PaymentRequest): Promise<any> => {
  try {
    const response = await api.post('/daraja/simulate', paymentData);
    return response.data;
  } catch (error) {
    console.error('Error simulating payment:', error);
    throw new Error('Failed to simulate payment');
  }
};

/**
 * Get user by email and meter number (alias for loginUser)
 * @deprecated Use loginUser instead
 */
export const getUserByMeterNo = async (email: string, meterNo: string): Promise<User | null> => {
  try {
    return await loginUser(email, meterNo);
  } catch {
    return null;
  }
};

export interface ConsumptionDataPoint {
  label: string;
  value: number;
}

export interface ConsumptionAnalytics {
  period: 'daily' | 'weekly' | 'monthly';
  data: ConsumptionDataPoint[];
  summary: {
    total: number;
    average: number;
    peak: number;
    dataPoints: number;
  };
}

/**
 * Get consumption analytics for a user
 * @param userId User's ID
 * @param period Time period: 'daily', 'weekly', or 'monthly'
 * @returns Consumption analytics data
 */
export const getConsumptionAnalytics = async (
  userId: string, 
  period: 'daily' | 'weekly' | 'monthly' = 'daily'
): Promise<ConsumptionAnalytics> => {
  try {
    const response = await api.get(`/analytics/consumption/${userId}?period=${period}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching consumption analytics:', error);
    throw new Error('Failed to fetch consumption analytics');
  }
};

/**
 * Meter Status Interface
 */
export interface MeterStatus {
  meter_no: string;
  online: boolean;
  last_seen: number;
  last_seen_ago_ms: number;
  last_seen_ago_seconds: number;
  status: 'connected' | 'disconnected' | 'unknown';
  timestamp: number;
}

/**
 * Get meter status - check if ESP32 device is online
 */
export const getMeterStatus = async (meterNo: string): Promise<MeterStatus> => {
  try {
    const response = await api.get(`/meters/${meterNo}/status`);
    return response.data;
  } catch (error) {
    console.error('Error fetching meter status:', error);
    // Return offline status on error
    return {
      meter_no: meterNo,
      online: false,
      last_seen: 0,
      last_seen_ago_ms: 0,
      last_seen_ago_seconds: 0,
      status: 'unknown',
      timestamp: Date.now()
    };
  }
};

export default api;