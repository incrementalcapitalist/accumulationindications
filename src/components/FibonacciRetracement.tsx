// Import necessary dependencies from React and lightweight-charts
import React, { useEffect, useRef } from 'react';
import { createChart, IChartApi, LineStyle } from 'lightweight-charts';

// Define the props interface for the FibonacciRetracement component
interface FibonacciRetracementProps {
  historicalData: { 
    time: string;   // Date/time of the data point
    open: number;   // Opening price
    high: number;   // Highest price
    low: number;    // Lowest price
    close: number;  // Closing price
    volume: number; // Trading volume
  }[];
}

// Define the FibonacciRetracement functional component
const FibonacciRetracement: React.FC<FibonacciRetracementProps> = ({ historicalData }) => {
  // Create refs for the chart container and chart instance
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  // useEffect hook to create and update the chart when historicalData changes
  useEffect(() => {
    if (historicalData.length > 0 && chartContainerRef.current) {
      // If the chart doesn't exist, create it
      if (!chartRef.current) {
        chartRef.current = createChart(chartContainerRef.current, {
          width: chartContainerRef.current.clientWidth,
          height: 600,
          layout: {
            background: { color: '#ffffff' },
            textColor: '#333',
          },
          grid: {
            vertLines: { visible: false },
            horzLines: { visible: false },
          },
        });
      }

      // Add candlestick series for price data
      const candlestickSeries = chartRef.current.addCandlestickSeries({
        upColor: '#26a69a',       // Green color for up candles
        downColor: '#ef5350',     // Red color for down candles
        borderVisible: false,
        wickUpColor: '#26a69a',   // Green color for up wicks
        wickDownColor: '#ef5350', // Red color for down wicks
      });
      
      // Set the historical price data to the candlestick series
      candlestickSeries.setData(historicalData);

      // Calculate Fibonacci retracement levels
      const fibLevels = calculateFibonacciLevels(historicalData);

      // Add Fibonacci retracement lines
      const fibColors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5'];
      fibLevels.forEach((level, index) => {
        const lineSeries = chartRef.current!.addLineSeries({
          color: fibColors[index % fibColors.length],
          lineWidth: 1,
          lineStyle: LineStyle.Dashed,
        });
        lineSeries.setData([
          { time: historicalData[0].time, value: level },
          { time: historicalData[historicalData.length - 1].time, value: level }
        ]);
      });

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

  // Function to calculate Fibonacci retracement levels
  const calculateFibonacciLevels = (data: typeof historicalData): number[] => {
    // Find the highest high and lowest low in the data set
    const highestHigh = Math.max(...data.map(d => d.high));
    const lowestLow = Math.min(...data.map(d => d.low));
    
    // Calculate the full range
    const fullRange = highestHigh - lowestLow;
    
    // Define Fibonacci ratios
    const fibRatios = [0.236, 0.382, 0.5, 0.618, 0.786];
    
    // Calculate Fibonacci levels
    return fibRatios.map(ratio => highestHigh - fullRange * ratio);
  };

  // Render the component
  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        Fibonacci Retracement
      </h2>
      {/* Chart container div, referenced by chartContainerRef */}
      <div ref={chartContainerRef} className="w-full h-[600px]" />
    </div>
  );
};

// Export the FibonacciRetracement component
export default FibonacciRetracement;