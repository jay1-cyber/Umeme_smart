import { useEffect, useState } from 'react';
import { ref, onValue, off } from 'firebase/database';
import { database } from '../lib/firebase';

interface RealtimeBalanceData {
  balance: number;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

/**
 * Custom hook to listen to real-time balance updates from Firebase
 * @param userId - The user's ID
 * @returns RealtimeBalanceData with balance, loading state, and error
 */
export const useRealtimeBalance = (userId: string | null): RealtimeBalanceData => {
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    if (!database) {
      console.log('[Firebase] Database not configured, skipping real-time listener');
      setBalance(0);
      setLoading(false);
      return;
    }

    console.log(`[Firebase] Setting up real-time listener for user: ${userId}`);
    
    // Set a timeout to prevent infinite loading
    const loadingTimeout = setTimeout(() => {
      console.warn('[Firebase] Loading timeout - connection may have failed');
      setLoading(false);
      setError('Connection timeout - check Firebase configuration');
    }, 5000); // 5 second timeout

    // Reference to user's balance in Firebase
    const balanceRef = ref(database, `users/${userId}/balance`);

    // Set up real-time listener
    const unsubscribe = onValue(
      balanceRef,
      (snapshot) => {
        clearTimeout(loadingTimeout); // Clear timeout on successful connection
        
        const data = snapshot.val();
        console.log(`[Firebase] Raw snapshot value:`, data);
        console.log(`[Firebase] Snapshot exists:`, snapshot.exists());
        
        if (data !== null && data !== undefined) {
          const balanceValue = typeof data === 'number' ? data : parseFloat(data);
          
          if (!isNaN(balanceValue)) {
            console.log(`[Firebase] ✅ Balance updated: ${balanceValue} units`);
            setBalance(balanceValue);
            setLastUpdated(new Date());
            setError(null);
          } else {
            console.warn('[Firebase] ❌ Invalid balance value received:', data);
            setError('Invalid balance data');
          }
        } else {
          // Balance is null or undefined, set to 0
          console.log('[Firebase] ⚠️ No balance data found in Firebase, setting to 0');
          setBalance(0);
          setLastUpdated(new Date());
        }
        setLoading(false);
      },
      (error) => {
        clearTimeout(loadingTimeout); // Clear timeout on error
        console.error('[Firebase] Error listening to balance:', error);
        setError(error.message || 'Failed to listen to balance updates');
        setBalance(0);
        setLoading(false);
      }
    );

    // Cleanup function
    return () => {
      clearTimeout(loadingTimeout);
      console.log(`[Firebase] Cleaning up listener for user: ${userId}`);
      off(balanceRef, 'value', unsubscribe);
    };
  }, [userId]);

  return { balance, loading, error, lastUpdated };
};
