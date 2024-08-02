// Import necessary dependencies from React and lightweight-charts
import React, { useEffect, useRef } from 'react';
import { createChart, IChartApi } from 'lightweight-charts';
import { useState } from 'react';
import OpenAI from 'openai';

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

// Define a type for data points with numerical values
type DataPoint = { time: string; value: number };

// Define the ATR functional component
const ATR: React.FC<ATRProps> = ({ historicalData }) => {
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
          layout: { background: { color: '#ffffff' }, textColor: '#333' },
          grid: { vertLines: { visible: false }, horzLines: { visible: false } },
        });
      }

      // Wrap chart creation and data processing in a try-catch block
      try {
        // Calculate ATR data
        const atrData = calculateATR(historicalData, 14);
        // Check if ATR data is empty
        if (atrData.length === 0) {
          console.error("ATR data is empty");
          return;
        }

        // Calculate Keltner Channels on ATR data
        const keltnerChannels = calculateKeltnerChannels(atrData, 20, 2);
        // Calculate Bollinger Bands on ATR data
        const bollingerBands = calculateBollingerBands(atrData, 20, 2);

        // Add ATR line series to the chart
        const atrSeries = chartRef.current.addLineSeries({ color: '#2962FF', lineWidth: 2 });
        // Set the ATR data
        atrSeries.setData(atrData);

        // Add upper Keltner Channel to the chart
        const upperKeltnerSeries = chartRef.current.addLineSeries({ color: 'rgba(128, 128, 128, 0.5)', lineWidth: 1 });
        // Set the upper Keltner Channel data
        upperKeltnerSeries.setData(keltnerChannels.upper);

        // Add lower Keltner Channel to the chart
        const lowerKeltnerSeries = chartRef.current.addLineSeries({ color: 'rgba(128, 128, 128, 0.5)', lineWidth: 1 });
        // Set the lower Keltner Channel data
        lowerKeltnerSeries.setData(keltnerChannels.lower);

        // Add upper Bollinger Band to the chart
        const upperBollingerSeries = chartRef.current.addLineSeries({ color: 'rgba(255, 0, 0, 0.5)', lineWidth: 2, lineStyle: 2 });
        // Set the upper Bollinger Band data
        upperBollingerSeries.setData(bollingerBands.map(d => ({ time: d.time, value: d.upper })));

        // Add lower Bollinger Band to the chart
        const lowerBollingerSeries = chartRef.current.addLineSeries({ color: 'rgba(255, 0, 0, 0.5)', lineWidth: 2, lineStyle: 2 });
        // Set the lower Bollinger Band data
        lowerBollingerSeries.setData(bollingerBands.map(d => ({ time: d.time, value: d.lower })));

        // Fit the chart content to the available space
        chartRef.current.timeScale().fitContent();
      } catch (error) {
        // Log any errors that occur during chart creation or data processing
        console.error("Error processing ATR data:", error);
      }
    }

    // Cleanup function to remove the chart when the component unmounts
    return () => {
      if (chartRef.current) {
        chartRef.current.remove();
      }
    };
  }, [historicalData]); // This effect runs when historicalData changes

  // Function to calculate Average True Range (ATR)
  const calculateATR = (data: ATRProps['historicalData'], period: number): DataPoint[] => {
    // Check if there's enough data for the calculation
    if (data.length < period) {
      console.warn("Not enough data points for ATR calculation");
      return [];
    }

    // Calculate True Range (TR) for each data point
    const trueRanges = data.map((d, i) => {
      if (i === 0) return d.high - d.low;
      const previousClose = data[i - 1].close;
      return Math.max(d.high - d.low, Math.abs(d.high - previousClose), Math.abs(d.low - previousClose));
    });

    // Calculate initial ATR
    let atr = trueRanges.slice(0, period).reduce((sum, tr) => sum + tr, 0) / period;
    // Calculate subsequent ATR values
    return data.slice(period).map((d, i) => {
      atr = ((atr * (period - 1)) + trueRanges[i + period]) / period;
      return { time: d.time, value: atr };
    });
  };

  // Function to calculate Exponential Moving Average (EMA)
  const calculateEMA = (data: DataPoint[], period: number): DataPoint[] => {
    // Check if there's enough data for the calculation
    if (data.length < period) {
      console.warn("Not enough data points for EMA calculation");
      return [];
    }

    // Calculate the multiplier for weighted average
    const k = 2 / (period + 1);
    // Initialize EMA with the first data point's value
    let ema = data[0].value;
    // Calculate EMA for each data point
    return data.map((d, i) => {
      if (i === 0) return d;
      ema = d.value * k + ema * (1 - k);
      return { time: d.time, value: ema };
    });
  };

  // Function to calculate Keltner Channels
  const calculateKeltnerChannels = (data: DataPoint[], emaPeriod: number, atrMultiplier: number) => {
    // Calculate EMA of the data
    const ema = calculateEMA(data, emaPeriod);
    // Calculate ATR of the data
    const atr = calculateATR(data.map(d => ({ ...d, open: d.value, high: d.value, low: d.value, close: d.value, volume: 0 })), emaPeriod);

    // Check if EMA or ATR calculation failed
    if (ema.length === 0 || atr.length === 0) {
      console.warn("Unable to calculate Keltner Channels");
      return { upper: [], lower: [] };
    }

    // Calculate upper Keltner Channel
    const upper = ema.map((e, i) => ({
      time: e.time,
      value: e.value + atrMultiplier * (atr[i] ? atr[i].value : 0),
    }));

    // Calculate lower Keltner Channel
    const lower = ema.map((e, i) => ({
      time: e.time,
      value: e.value - atrMultiplier * (atr[i] ? atr[i].value : 0),
    }));

    return { upper, lower };
  };

  // Function to calculate Bollinger Bands
  const calculateBollingerBands = (data: DataPoint[], period: number, stdDev: number) => {
    // Check if there's enough data for the calculation
    if (data.length < period) {
      console.warn("Not enough data points for Bollinger Bands calculation");
      return [];
    }

    // Calculate Simple Moving Average (SMA)
    const sma = data.slice(period - 1).map((d, i) => {
      const sum = data.slice(i, i + period).reduce((acc, cur) => acc + cur.value, 0);
      return { time: d.time, value: sum / period };
    });

    // Calculate Standard Deviation
    const stdDevData = sma.map((s, i) => {
      const squareDiffs = data.slice(i, i + period).map(d => Math.pow(d.value - s.value, 2));
      const variance = squareDiffs.reduce((acc, cur) => acc + cur, 0) / period;
      return { time: s.time, value: Math.sqrt(variance) };
    });

    // Calculate Bollinger Bands
    return sma.map((s, i) => {
      const deviation = stdDevData[i].value * stdDev;
      return {
        time: s.time,
        upper: s.value + deviation,
        lower: s.value - deviation,
      };
    });
  };

  // Render the component
  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        ATR with Keltner Channels and Bollinger Bands
      </h2>
      {/* Chart container div, referenced by chartContainerRef */}
      <div ref={chartContainerRef} className="w-full h-[400px]" />
    </div>
  );
};

// Export the ATR component
export default ATR;