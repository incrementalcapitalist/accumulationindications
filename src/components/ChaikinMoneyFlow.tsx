// Import necessary dependencies from React and lightweight-charts
import React, { useEffect, useRef } from 'react';
import { createChart, IChartApi } from 'lightweight-charts';
import { useState } from 'react';
import OpenAI from 'openai';

// Define the props interface for the ChaikinMoneyFlow component
interface ChaikinMoneyFlowProps {
  historicalData: { 
    time: string;   // Date/time of the data point
    open: number;   // Opening price
    high: number;   // Highest price
    low: number;    // Lowest price
    close: number;  // Closing price
    volume: number; // Trading volume
  }[];
}

// Define the ChaikinMoneyFlow functional component
const ChaikinMoneyFlow: React.FC<ChaikinMoneyFlowProps> = ({ historicalData }) => {
  // Create refs for the chart container and chart instance
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  // useEffect hook to create and update the chart when historicalData changes
  useEffect(() => {
    // Check if we have historical data and a valid chart container
    if (historicalData.length > 0 && chartContainerRef.current) {
      // If the chart doesn't exist, create it
      if (!chartRef.current) {
        // Create a new chart instance without gridlines
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

      // Calculate Chaikin Money Flow data
      const cmfData = calculateChaikinMoneyFlow(historicalData, 20); // 20-period CMF

      // Add CMF line series to the chart
      const cmfSeries = chartRef.current.addLineSeries({
        color: '#2962FF',
        lineWidth: 2,
      });
      // Set the CMF data
      cmfSeries.setData(cmfData);

      // Calculate 7-day EMA of CMF
      const emaData = calculateEMA(cmfData, 7);

      // Add EMA line series to the chart
      const emaSeries = chartRef.current.addLineSeries({
        color: '#FF0000',
        lineWidth: 2,
        lineStyle: 2, // Dashed Line
      });
      // Set the EMA data
      emaSeries.setData(emaData);

      // Add a zero line for reference
      const zeroLine = chartRef.current.addLineSeries({
        color: '#888888',
        lineWidth: 1,
        lineStyle: 2, // Dashed line
      });
      // Set the zero line data
      zeroLine.setData([
        { time: historicalData[0].time, value: 0 },
        { time: historicalData[historicalData.length - 1].time, value: 0 }
      ]);

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

  // Function to calculate Chaikin Money Flow
  const calculateChaikinMoneyFlow = (data: typeof historicalData, period: number) => {
    // Initialize an array to store CMF values
    const cmfValues = [];

    // Loop through the data to calculate CMF for each period
    for (let i = period - 1; i < data.length; i++) {
      let moneyFlowVolume = 0;
      let volume = 0;

      // Calculate Money Flow Volume and total Volume for the period
      for (let j = i - period + 1; j <= i; j++) {
        const h = data[j].high;
        const l = data[j].low;
        const c = data[j].close;
        const v = data[j].volume;

        // Calculate Money Flow Multiplier
        const moneyFlowMultiplier = ((c - l) - (h - c)) / (h - l);
        
        moneyFlowVolume += moneyFlowMultiplier * v;
        volume += v;
      }

      // Calculate CMF
      const cmf = volume !== 0 ? moneyFlowVolume / volume : 0;
      
      // Add CMF value to the array
      cmfValues.push({
        time: data[i].time,
        value: cmf
      });
    }

    return cmfValues;
  };

  // Function to calculate Exponential Moving Average (EMA)
  const calculateEMA = (data: { time: string; value: number }[], period: number) => {
    // Calculate the multiplier for weighted average
    const multiplier = 2 / (period + 1);
    // Initialize EMA with the first data point's value
    let ema = data[0].value;

    // Calculate EMA for each data point
    return data.map((d, i) => {
      if (i === 0) return d; // First point remains the same
      // EMA = (Close - EMA(previous day)) x multiplier + EMA(previous day)
      ema = (d.value - ema) * multiplier + ema;
      return { time: d.time, value: ema };
    });
  };

  // Render the component
  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        Chaikin Money Flow with 7-day EMA
      </h2>
      {/* Chart container div, referenced by chartContainerRef */}
      <div ref={chartContainerRef} className="w-full h-[400px]" />
    </div>
  );
};

// Export the ChaikinMoneyFlow component
export default ChaikinMoneyFlow;