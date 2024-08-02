/**
 * FibonacciRetracement.tsx
 * This component renders a Fibonacci Retracement chart with a 200-day SMA using historical price data.
 */

// Import necessary dependencies from React and lightweight-charts
import React, { useEffect, useRef } from 'react';
import { createChart, IChartApi, LineStyle, CandlestickSeriesOptions } from 'lightweight-charts';

// Define the props interface for the FibonacciRetracement component
interface FibonacciRetracementProps {
  // Historical data points for the stock
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
  // Create a ref for the chart container DOM element
  const chartContainerRef = useRef<HTMLDivElement>(null);
  // Create a ref for the chart instance
  const chartRef = useRef<IChartApi | null>(null);

  // Function to calculate Simple Moving Average (SMA)
  const calculateSMA = (data: typeof historicalData, period: number) => {
    // Return an array of SMA values
    return data.map((d, i) => {
      // If we don't have enough data for the period, return null
      if (i < period - 1) return { time: d.time, value: null };
      // Calculate the sum of closing prices for the period
      const sum = data.slice(i - period + 1, i + 1).reduce((acc, val) => acc + val.close, 0);
      // Return the average as the SMA value
      return { time: d.time, value: sum / period };
    });
  };

  // useEffect hook to create and update the chart when historicalData changes
  useEffect(() => {
    // Check if we have historical data and a valid chart container
    if (historicalData.length > 0 && chartContainerRef.current) {
      // If the chart doesn't exist, create it
      if (!chartRef.current) {
        // Create a new chart instance
        chartRef.current = createChart(chartContainerRef.current, {
          width: chartContainerRef.current.clientWidth,
          height: 400,
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

      // Add candlestick series to the chart
      const candlestickSeries = chartRef.current.addCandlestickSeries({
        upColor: '#8B008B',   // Violet color for up days
        downColor: '#FFA500', // Orange color for down days
        borderVisible: false,
        wickUpColor: '#8B008B',
        wickDownColor: '#FFA500',
      });

      // Set the candlestick data
      candlestickSeries.setData(historicalData);

      // Calculate Fibonacci retracement levels
      const highestPoint = Math.max(...historicalData.map(d => d.high));
      const lowestPoint = Math.min(...historicalData.map(d => d.low));
      const difference = highestPoint - lowestPoint;
      const levels = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1];

      // Add Fibonacci retracement lines
      levels.forEach(level => {
        // Calculate the price level for each Fibonacci ratio
        const price = highestPoint - difference * level;
        // Add a line series for each Fibonacci level
        const lineSeries = chartRef.current!.addLineSeries({
          color: `rgba(76, 175, 80, ${1 - level})`, // Green color with varying opacity
          lineWidth: 1,
          lineStyle: LineStyle.Dashed,
          title: `Fib ${level.toFixed(3)}`,
        });
        // Set the data for the line series
        lineSeries.setData([
          { time: historicalData[0].time, value: price },
          { time: historicalData[historicalData.length - 1].time, value: price }
        ]);
      });

      // Calculate and add 200-day SMA
      const smaData = calculateSMA(historicalData, 200);
      const smaSeries = chartRef.current.addLineSeries({
        color: '#FF0000', // Red color for SMA line
        lineWidth: 2,
        lineStyle: 2, // Dashed Line
      });
      // Set the SMA data
      smaSeries.setData(smaData);

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

  // Render the component
  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        Fibonacci Retracement with 200-day SMA
      </h2>
      {/* Chart container div, referenced by chartContainerRef */}
      <div ref={chartContainerRef} className="w-full h-[400px]" />
      {/* Comprehensive description of Fibonacci Retracement and 200-day SMA */}
      <div className="mt-4 text-sm text-gray-600">
        <h3 className="text-lg font-semibold mb-2">Understanding Fibonacci Retracement and 200-day SMA</h3>
        <p>This chart combines Fibonacci Retracement levels with a 200-day Simple Moving Average (SMA) to provide a comprehensive view of potential support/resistance levels and long-term trend.</p>
        
        <h4 className="font-semibold mt-3 mb-1">Key Components:</h4>
        <ul className="list-disc pl-5">
          <li><span className="font-semibold">Fibonacci Levels:</span> Horizontal lines showing potential reversal, support, or resistance points (23.6%, 38.2%, 50%, 61.8%, 78.6%).</li>
          <li><span className="font-semibold">200-day SMA (Red Line):</span> A long-term trend indicator showing the average closing price over the last 200 days.</li>
        </ul>

        <h4 className="font-semibold mt-3 mb-1">Why This Combination Matters:</h4>
        <ol className="list-decimal pl-5">
          <li><span className="font-semibold">Multiple Reference Points:</span> Provides both short-term (Fibonacci) and long-term (SMA) levels for analysis.</li>
          <li><span className="font-semibold">Trend Confirmation:</span> The 200-day SMA helps confirm the overall trend direction.</li>
          <li><span className="font-semibold">Support/Resistance Confluence:</span> Areas where Fibonacci levels and the 200-day SMA intersect can be particularly strong support/resistance zones.</li>
          <li><span className="font-semibold">Reversal Signals:</span> Price reversals at Fibonacci levels, especially when near the 200-day SMA, can be powerful signals.</li>
        </ol>

        <h4 className="font-semibold mt-3 mb-1">How to Interpret:</h4>
        <ul className="list-disc pl-5">
          <li><span className="font-semibold">Trend Identification:</span> Price above the 200-day SMA suggests a bullish trend, below suggests a bearish trend.</li>
          <li><span className="font-semibold">Potential Reversals:</span> Watch for price reactions at Fibonacci levels, especially when they coincide with the 200-day SMA.</li>
          <li><span className="font-semibold">Breakouts:</span> A strong move through a Fibonacci level and the 200-day SMA could signal a significant trend change.</li>
          <li><span className="font-semibold">Confluence:</span> The most powerful signals often occur when multiple factors align (e.g., price at a key Fibonacci level and the 200-day SMA).</li>
        </ul>

        <p className="mt-3"><span className="font-semibold">Note:</span> While this combination provides valuable insights, it should be used in conjunction with other technical indicators and fundamental analysis. No single tool can predict market movements with certainty.</p>
      </div>
    </div>
  );
};

// Export the FibonacciRetracement component
export default FibonacciRetracement;