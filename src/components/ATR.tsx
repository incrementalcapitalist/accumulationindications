import React, { useEffect, useRef } from 'react';
import { createChart, IChartApi } from 'lightweight-charts';

// Define the props interface for the ATR component
interface ATRProps {
  historicalData: { 
    time: string;   // Date/time of the data point
    open: number;   // Opening price
    high: number;   // Highest price
    low: number;    // Lowest price
    close: number;  // Closing price
    volume: number; // Trading volume
  }[];
}

// Define the ATR functional component
const ATR: React.FC<ATRProps> = ({ historicalData }) => {
  // Create refs for the chart container and chart instance
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    // Check if we have historical data and a valid chart container
    if (historicalData.length > 0 && chartContainerRef.current) {
      // If the chart doesn't exist, create it
      if (!chartRef.current) {
        chartRef.current = createChart(chartContainerRef.current, {
          width: chartContainerRef.current.clientWidth,
          height: 400,
          layout: {
            background: { color: '#ffffff' },
            textColor: '#333',
          },
          grid: {
            vertLines: { color: '#f0f0f0' },
            horzLines: { color: '#f0f0f0' },
          },
        });
      }

      // Calculate ATR data
      const atrData = calculateATR(historicalData, 14); // 14 is a common period for ATR

      // Add ATR line series to the chart
      const atrSeries = chartRef.current.addLineSeries({
        color: '#2962FF',
        lineWidth: 2,
      });
      atrSeries.setData(atrData);

      // Fit the chart content to the available space
      chartRef.current.timeScale().fitContent();
    }

    // Cleanup function to remove the chart when the component unmounts
    return () => {
      if (chartRef.current) {
        chartRef.current.remove();
      }
    };
  }, [historicalData]); // This effect runs when historicalData changes

  // Function to calculate Average True Range (ATR)
  const calculateATR = (data: typeof historicalData, period: number) => {
    // Calculate True Range (TR) for each data point
    const trueRanges = data.map((d, i) => {
      if (i === 0) return d.high - d.low; // First TR is just the first day's range
      const previousClose = data[i - 1].close;
      return Math.max(
        d.high - d.low,
        Math.abs(d.high - previousClose),
        Math.abs(d.low - previousClose)
      );
    });

    // Calculate ATR using simple moving average of TR
    let atr = trueRanges.slice(0, period).reduce((sum, tr) => sum + tr, 0) / period;
    const atrData = trueRanges.map((tr, i) => {
      if (i < period) {
        return { time: data[i].time, value: null }; // ATR not calculated for first 'period' points
      }
      atr = ((atr * (period - 1)) + tr) / period; // Smooth ATR calculation
      return { time: data[i].time, value: atr };
    });

    return atrData.filter(d => d.value !== null); // Remove initial null values
  };

  // Render the component
  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        Average True Range (ATR)
      </h2>
      {/* Chart container div, referenced by chartContainerRef */}
      <div ref={chartContainerRef} className="w-full h-[400px]" />
    </div>
  );
};

export default ATR;