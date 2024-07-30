// Import necessary dependencies from React and lightweight-charts
import React, { useEffect, useRef } from 'react';
import { createChart, IChartApi, LineStyle } from 'lightweight-charts';

// Define the props interface for the PriceMACD component
interface PriceMACDProps {
  historicalData: { 
    time: string;   // Date/time of the data point
    open: number;   // Opening price
    high: number;   // Highest price
    low: number;    // Lowest price
    close: number;  // Closing price
    volume: number; // Trading volume
  }[];
}

// Define the structure for MACD data points
interface MACDData {
  time: string;    // Date/time of the data point
  macd: number;    // MACD line value
  signal: number;  // Signal line value
  histogram: number; // Histogram value (difference between MACD and signal)
}

// Define the PriceMACD functional component
const PriceMACD: React.FC<PriceMACDProps> = ({ historicalData }) => {
  // Create a ref for the chart container div
  const chartContainerRef = useRef<HTMLDivElement>(null);
  // Create a ref to store the chart instance
  const chartRef = useRef<IChartApi | null>(null);

  // useEffect hook to create and update the chart when historicalData changes
  useEffect(() => {
    // Check if we have historical data and a valid chart container
    if (historicalData.length > 0 && chartContainerRef.current) {
      // If the chart doesn't exist, create it
      if (!chartRef.current) {
        // Create a new chart instance
        chartRef.current = createChart(chartContainerRef.current, {
          width: chartContainerRef.current.clientWidth, // Set width to container width
          height: 600, // Set height to 600 pixels
          layout: {
            background: { color: '#ffffff' }, // Set background color to white
            textColor: '#333', // Set text color to dark gray
          },
          grid: {
            vertLines: { visible: false }, // Hide vertical grid lines
            horzLines: { visible: false }, // Hide horizontal grid lines
          },
        });
      }

      // Add candlestick series for price data
      const candlestickSeries = chartRef.current.addCandlestickSeries({
        upColor: '#26a69a', // Green color for up candles
        downColor: '#ef5350', // Red color for down candles
        borderVisible: false, // Hide candle borders
        wickUpColor: '#26a69a', // Green color for up wicks
        wickDownColor: '#ef5350', // Red color for down wicks
      });
      // Set the historical price data to the candlestick series
      candlestickSeries.setData(historicalData);

      // Calculate MACD data from historical price data
      const macdData = calculateMACD(historicalData);

      // Add MACD line series
      const macdLineSeries = chartRef.current.addLineSeries({
        color: '#2962FF', // Blue color for MACD line
        lineWidth: 2,
        priceScaleId: 'right', // Use right price scale for MACD
      });
      // Set MACD line data
      macdLineSeries.setData(macdData.map(d => ({ time: d.time, value: d.macd })));

      // Add Signal line series
      const signalLineSeries = chartRef.current.addLineSeries({
        color: '#FF6D00', // Orange color for signal line
        lineWidth: 2,
        priceScaleId: 'right', // Use right price scale for signal line
      });
      // Set signal line data
      signalLineSeries.setData(macdData.map(d => ({ time: d.time, value: d.signal })));

      // Add Histogram series
      const histogramSeries = chartRef.current.addHistogramSeries({
        color: '#26a69a', // Default green color for histogram
        priceFormat: {
          type: 'volume', // Use volume format for better scaling
        },
        priceScaleId: 'right', // Use right price scale for histogram
      });
      // Set histogram data with conditional coloring
      histogramSeries.setData(macdData.map(d => ({ 
        time: d.time, 
        value: d.histogram,
        color: d.histogram >= 0 ? '#26a69a' : '#ef5350' // Green for positive, red for negative
      })));

      // Set up price scales
      chartRef.current.priceScale('right').applyOptions({
        scaleMargins: {
          top: 0.7, // Adjust this value to position the MACD at the bottom
          bottom: 0,
        },
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

  // Function to calculate MACD
  const calculateMACD = (data: typeof historicalData): MACDData[] => {
    const shortPeriod = 12; // Short-term EMA period
    const longPeriod = 26; // Long-term EMA period
    const signalPeriod = 9; // Signal line EMA period

    // Helper function to calculate EMA
    const getEMA = (data: number[], period: number): number[] => {
      const k = 2 / (period + 1); // Smoothing factor
      let ema = [data[0]]; // Initialize EMA with first data point
      for (let i = 1; i < data.length; i++) {
        // EMA = Price(t) * k + EMA(y) * (1 – k)
        ema.push(data[i] * k + ema[i - 1] * (1 - k));
      }
      return ema;
    };

    // Extract close prices from historical data
    const closePrices = data.map(d => d.close);
    // Calculate short-term EMA
    const shortEMA = getEMA(closePrices, shortPeriod);
    // Calculate long-term EMA
    const longEMA = getEMA(closePrices, longPeriod);

    // Calculate MACD line (difference between short and long EMAs)
    const macdLine = shortEMA.map((v, i) => v - longEMA[i]);
    // Calculate signal line (EMA of MACD line)
    const signalLine = getEMA(macdLine, signalPeriod);

    // Combine all data into MACD data structure
    return data.map((d, i) => ({
      time: d.time,
      macd: macdLine[i],
      signal: signalLine[i],
      histogram: macdLine[i] - signalLine[i] // Difference between MACD and signal
    })).slice(longPeriod - 1); // Remove the first 25 elements as they're not accurate
  };

  // Render the component
  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        Price and MACD
      </h2>
      {/* Chart container div, referenced by chartContainerRef */}
      <div ref={chartContainerRef} className="w-full h-[600px]" />
    </div>
  );
};

// Export the PriceMACD component
export default PriceMACD;