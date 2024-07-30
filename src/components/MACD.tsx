import React, { useEffect, useRef } from 'react';
import { createChart, IChartApi } from 'lightweight-charts';

// Define the props interface for the MACD component
interface MACDProps {
  historicalData: { 
    time: string;   // Date/time of the data point
    open: number;   // Opening price
    high: number;   // Highest price
    low: number;    // Lowest price
    close: number;  // Closing price
    volume: number; // Trading volume
  }[];
}

// Define the MACD functional component
const MACD: React.FC<MACDProps> = ({ historicalData }) => {
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

      // Calculate MACD data
      const macdData = calculateMACD(historicalData);

      // Add MACD line series to the chart
      const macdLineSeries = chartRef.current.addLineSeries({
        color: '#2962FF',
        lineWidth: 2,
      });
      macdLineSeries.setData(macdData.map(d => ({ time: d.time, value: d.macd })));

      // Add Signal line series to the chart
      const signalLineSeries = chartRef.current.addLineSeries({
        color: '#FF6D00',
        lineWidth: 2,
      });
      signalLineSeries.setData(macdData.map(d => ({ time: d.time, value: d.signal })));

      // Add Histogram series to the chart
      const histogramSeries = chartRef.current.addHistogramSeries({
        color: '#26a69a',
        lineWidth: 2,
      });
      histogramSeries.setData(macdData.map(d => ({
        time: d.time,
        value: d.histogram,
        color: d.histogram >= 0 ? '#26a69a' : '#ef5350'
      })));

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

  // Function to calculate Moving Average Convergence Divergence (MACD)
  const calculateMACD = (data: typeof historicalData) => {
    const shortPeriod = 12;
    const longPeriod = 26;
    const signalPeriod = 9;

    const getEMA = (data: number[], period: number) => {
      const k = 2 / (period + 1);
      let ema = [data[0]];
      for (let i = 1; i < data.length; i++) {
        ema.push(data[i] * k + ema[i - 1] * (1 - k));
      }
      return ema;
    };

    const closePrices = data.map(d => d.close);
    const shortEMA = getEMA(closePrices, shortPeriod);
    const longEMA = getEMA(closePrices, longPeriod);

    const macdLine = shortEMA.map((v, i) => v - longEMA[i]);
    const signalLine = getEMA(macdLine, signalPeriod);

    return data.map((d, i) => ({
      time: d.time,
      macd: macdLine[i],
      signal: signalLine[i],
      histogram: macdLine[i] - signalLine[i]
    })).slice(longPeriod - 1); // Remove the first 25 elements as they're not accurate
  };

  // Render the component
  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        Moving Average Convergence Divergence (MACD)
      </h2>
      {/* Chart container div, referenced by chartContainerRef */}
      <div ref={chartContainerRef} className="w-full h-[400px]" />
    </div>
  );
};

export default MACD;