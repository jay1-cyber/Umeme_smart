import React, { useEffect, useState, useMemo, Suspense, lazy } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions,
} from 'chart.js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getConsumptionAnalytics, ConsumptionAnalytics } from '../lib/api';
import { Calendar, TrendingUp, Zap } from 'lucide-react';
import ChartErrorBoundary from './ChartErrorBoundary';

// Register ChartJS components globally
try {
  ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
  );
} catch (error) {
  console.error('Failed to register Chart.js components:', error);
}

// Lazy load the Line component
const Line = lazy(() => 
  import('react-chartjs-2').then(module => ({ default: module.Line }))
);

interface ConsumptionChartProps {
  userId: string;
}

type Period = 'daily' | 'weekly' | 'monthly';

const ConsumptionChart: React.FC<ConsumptionChartProps> = ({ userId }) => {
  const [period, setPeriod] = useState<Period>('daily');
  const [data, setData] = useState<ConsumptionAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartReady, setChartReady] = useState(false);

  // Initialize chart readiness after component mounts
  useEffect(() => {
    const timer = setTimeout(() => setChartReady(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        const analyticsData = await getConsumptionAnalytics(userId, period);
        if (analyticsData && analyticsData.data) {
          setData(analyticsData);
        } else {
          setError('Invalid data received');
        }
      } catch (err) {
        console.error('Error fetching consumption data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load consumption data');
      } finally {
        setLoading(false);
      }
    };

    if (chartReady) {
      fetchData();
    }
  }, [userId, period, chartReady]);

  const chartData = useMemo(() => ({
    labels: data?.data.map(d => d.label) || [],
    datasets: [
      {
        label: 'Units Consumed',
        data: data?.data.map(d => d.value) || [],
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: 'rgb(99, 102, 241)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      },
    ],
  }), [data]);

  const options = useMemo<ChartOptions<'line'>>(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 14,
          weight: 'bold' as const,
        },
        bodyFont: {
          size: 13,
        },
        callbacks: {
          label: (context: any) => {
            return `Consumption: ${context.parsed.y.toFixed(2)} units`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          font: {
            size: 12,
          },
          callback: (value: any) => `${value}`,
        },
        title: {
          display: true,
          text: 'Units Consumed',
          font: {
            size: 12,
            weight: 'bold' as const,
          },
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 11,
          },
          maxRotation: 45,
          minRotation: 0,
        },
      },
    },
  }), []);

  const getPeriodLabel = () => {
    switch (period) {
      case 'daily':
        return 'Last 24 Hours';
      case 'weekly':
        return 'Last 7 Days';
      case 'monthly':
        return 'Last 30 Days';
    }
  };

  return (
    <Card className="bg-white border border-gray-200 shadow-sm">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-black">
              <TrendingUp className="h-5 w-5 text-indigo-600" />
              Consumption Analytics
            </CardTitle>
            <CardDescription className="text-gray-600 mt-1">
              {getPeriodLabel()} - Track your energy usage patterns
            </CardDescription>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant={period === 'daily' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPeriod('daily')}
              className={period === 'daily' ? 'bg-indigo-600 hover:bg-indigo-700' : 'border-gray-300'}
            >
              Daily
            </Button>
            <Button
              variant={period === 'weekly' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPeriod('weekly')}
              className={period === 'weekly' ? 'bg-indigo-600 hover:bg-indigo-700' : 'border-gray-300'}
            >
              Weekly
            </Button>
            <Button
              variant={period === 'monthly' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPeriod('monthly')}
              className={period === 'monthly' ? 'bg-indigo-600 hover:bg-indigo-700' : 'border-gray-300'}
            >
              Monthly
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-80">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading consumption data...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-80">
            <div className="text-center text-red-600">
              <p className="font-medium">{error}</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => window.location.reload()}
                className="mt-4"
              >
                Retry
              </Button>
            </div>
          </div>
        ) : data && data.data.length > 0 ? (
          <>
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100">
                <div className="flex items-center gap-2 text-blue-700 mb-1">
                  <Zap className="h-4 w-4" />
                  <span className="text-xs font-medium uppercase">Total</span>
                </div>
                <p className="text-2xl font-bold text-blue-900">{data.summary.total.toFixed(2)}</p>
                <p className="text-xs text-blue-600 mt-1">Units consumed</p>
              </div>
              
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border border-green-100">
                <div className="flex items-center gap-2 text-green-700 mb-1">
                  <Calendar className="h-4 w-4" />
                  <span className="text-xs font-medium uppercase">Average</span>
                </div>
                <p className="text-2xl font-bold text-green-900">{data.summary.average.toFixed(2)}</p>
                <p className="text-xs text-green-600 mt-1">Per period</p>
              </div>
              
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-100">
                <div className="flex items-center gap-2 text-purple-700 mb-1">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-xs font-medium uppercase">Peak</span>
                </div>
                <p className="text-2xl font-bold text-purple-900">{data.summary.peak.toFixed(2)}</p>
                <p className="text-xs text-purple-600 mt-1">Highest usage</p>
              </div>
            </div>

            {/* Chart */}
            <div className="h-80">
              {chartData.labels.length > 0 && chartReady ? (
                <ChartErrorBoundary>
                  <Suspense fallback={
                    <div className="flex items-center justify-center h-full">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    </div>
                  }>
                    <Line 
                      key={`chart-${period}-${data.data.length}`}
                      data={chartData} 
                      options={options}
                    />
                  </Suspense>
                </ChartErrorBoundary>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <p>Preparing chart...</p>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-80">
            <div className="text-center text-gray-500">
              <Zap className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p className="font-medium">No consumption data available</p>
              <p className="text-sm mt-2">Data will appear as you use your meter</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ConsumptionChart;
