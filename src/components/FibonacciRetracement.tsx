// Import necessary dependencies from React and lightweight-charts
import React, { useEffect, useRef } from 'react';
import { createChart, IChartApi, CandlestickData } from 'lightweight-charts';
import { useState } from 'react';
import OpenAI from 'openai';

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
          lineStyle: 2, // Dashed line
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

  // Function to calculate Simple Moving Average (SMA)
  const calculateSMA = (data: typeof historicalData, period: number) => {
    // Initialize an array to store SMA values
    const smaData = [];
    // Loop through the data starting from the 'period'th element
    for (let i = period - 1; i < data.length; i++) {
      // Calculate the sum of closing prices for the last 'period' days
      const sum = data.slice(i - period + 1, i + 1).reduce((acc, val) => acc + val.close, 0);
      // Calculate the average (SMA) and add it to smaData
      smaData.push({
        time: data[i].time,
        value: sum / period
      });
    }
    // Return the calculated SMA data
    return smaData;
  };

  // Render the component
  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        Fibonacci Retracement with 200-day SMA
      </h2>
      {/* Chart container div, referenced by chartContainerRef */}
      <div ref={chartContainerRef} className="w-full h-[400px]" />
    </div>
  );
};

// Export the FibonacciRetracement component
export default FibonacciRetracement;