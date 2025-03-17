
import { useState, useEffect, useCallback } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  AreaChart,
  Area
} from 'recharts';
import { HistoricalDataPoint } from '../types/stock';
import { formatCurrency } from '../lib/stockData';

interface StockChartProps {
  data: HistoricalDataPoint[];
  symbol: string;
  color?: string;
  showGrid?: boolean;
  showTooltip?: boolean;
  showAxis?: boolean;
  height?: number;
  animated?: boolean;
  type?: 'line' | 'area';
  className?: string;
}

const StockChart = ({
  data,
  symbol,
  color = '#0EA5E9',
  showGrid = true,
  showTooltip = true,
  showAxis = true,
  height = 300,
  animated = true,
  type = 'line',
  className = ''
}: StockChartProps) => {
  const [chartData, setChartData] = useState<HistoricalDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Get the start and ending price for reference line
  const startPrice = data[0]?.price || 0;
  const endPrice = data[data.length - 1]?.price || 0;
  const trendIsUp = endPrice >= startPrice;
  
  // Define line color based on trend
  const lineColor = trendIsUp ? '#34D399' : '#F87171';
  const fillColor = trendIsUp ? 'url(#colorGradientUp)' : 'url(#colorGradientDown)';
  const chartColor = color === 'auto' ? lineColor : color;
  
  const animateChart = useCallback(() => {
    if (!animated || data.length === 0) {
      setChartData(data);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setChartData([]);
    
    // Animate the chart by progressively adding data points
    const totalPoints = data.length;
    let currentIndex = 0;
    
    const animationInterval = setInterval(() => {
      currentIndex += 1;
      
      if (currentIndex >= totalPoints) {
        clearInterval(animationInterval);
        setChartData([...data]);
        setIsLoading(false);
        return;
      }
      
      // Calculate how many points to show at this step
      const pointsToShow = Math.ceil((currentIndex / totalPoints) * totalPoints);
      setChartData(data.slice(0, pointsToShow));
    }, 20); // Controls animation speed
    
    return () => clearInterval(animationInterval);
  }, [data, animated]);
  
  useEffect(() => {
    animateChart();
  }, [animateChart]);
  
  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass shadow-md p-3 rounded-lg border border-gray-200 text-sm">
          <p className="font-medium text-gray-800">{label}</p>
          <p className="text-gray-600">
            Price: <span className="font-medium">{formatCurrency(payload[0].value)}</span>
          </p>
          {payload[0].payload.volume && (
            <p className="text-gray-600">
              Volume: <span className="font-medium">{payload[0].payload.volume.toLocaleString()}</span>
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`w-full transition-opacity duration-500 ${isLoading ? 'opacity-70' : 'opacity-100'} ${className}`}>
      <ResponsiveContainer width="100%" height={height}>
        {type === 'line' ? (
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
          >
            {showGrid && (
              <CartesianGrid 
                strokeDasharray="3 3" 
                vertical={false} 
                stroke="#E5E7EB" 
              />
            )}
            {showAxis && (
              <>
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12, fill: '#9CA3AF' }} 
                  tickLine={false}
                  axisLine={{ stroke: '#E5E7EB' }}
                  minTickGap={30}
                />
                <YAxis 
                  domain={['auto', 'auto']}
                  tick={{ fontSize: 12, fill: '#9CA3AF' }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `$${value}`}
                  width={50}
                />
              </>
            )}
            {showTooltip && <Tooltip content={<CustomTooltip />} />}
            <ReferenceLine 
              y={startPrice} 
              stroke="#9CA3AF" 
              strokeDasharray="3 3" 
            />
            <Line
              type="monotone"
              dataKey="price"
              stroke={chartColor}
              strokeWidth={2}
              dot={false}
              activeDot={{ 
                r: 5, 
                stroke: chartColor, 
                strokeWidth: 1,
                fill: 'white' 
              }}
              animationDuration={2000}
              animationEasing="ease-in-out"
            />
          </LineChart>
        ) : (
          <AreaChart
            data={chartData}
            margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
          >
            <defs>
              <linearGradient id="colorGradientUp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#34D399" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#34D399" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorGradientDown" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F87171" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#F87171" stopOpacity={0} />
              </linearGradient>
            </defs>
            {showGrid && (
              <CartesianGrid 
                strokeDasharray="3 3" 
                vertical={false} 
                stroke="#E5E7EB" 
              />
            )}
            {showAxis && (
              <>
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12, fill: '#9CA3AF' }} 
                  tickLine={false}
                  axisLine={{ stroke: '#E5E7EB' }}
                  minTickGap={30}
                />
                <YAxis 
                  domain={['auto', 'auto']}
                  tick={{ fontSize: 12, fill: '#9CA3AF' }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `$${value}`}
                  width={50}
                />
              </>
            )}
            {showTooltip && <Tooltip content={<CustomTooltip />} />}
            <ReferenceLine 
              y={startPrice} 
              stroke="#9CA3AF" 
              strokeDasharray="3 3" 
            />
            <Area
              type="monotone"
              dataKey="price"
              stroke={chartColor}
              strokeWidth={2}
              fill={fillColor}
              activeDot={{ 
                r: 5, 
                stroke: chartColor, 
                strokeWidth: 1,
                fill: 'white' 
              }}
              animationDuration={2000}
              animationEasing="ease-in-out"
            />
          </AreaChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};

export default StockChart;
