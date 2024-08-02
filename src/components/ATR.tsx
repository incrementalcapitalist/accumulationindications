/**
 * ATR.tsx
 * This component renders an Average True Range (ATR) chart using pre-calculated data,
 * along with Bollinger Bands and Keltner Channels calculated on the ATR data.
 */

import React, { useEffect, useRef } from 'react';
import { createChart, IChartApi, LineStyle } from 'lightweight-charts';
import { CalculatedIndicators } from '../utils/calculateIndicators';

// Define the props interface for the ATR component
interface ATRProps {
  historicalData: {
    time: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }[];
  indicators: CalculatedIndicators;
}

interface ADDataPoint {
  time: string;
  value: number;
}

const ATR: React.FC<ATRProps> = ({ historicalData, indicators }) => {
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

      const atrData = indicators.atr.map((value, index) => ({
        time: historicalData[index].time,
        value: value
      }));

      // Calculate Bollinger Bands on ATR data
      const period = 20;
      const stdDevMultiplier = 2;
      const bollingerBands = calculateBollingerBands(atrData, period, stdDevMultiplier);

      // Calculate Keltner Channels on ATR data
      const keltnerMultiplier = 1.5;
      const keltnerChannels = calculateKeltnerChannels(atrData, period, period, keltnerMultiplier);

      // Add ATR line series
      const atrLineSeries = chartRef.current.addLineSeries({
        color: '#2962FF',
        lineWidth: 2,
        title: 'ATR',
      });
      atrLineSeries.setData(atrData);

      // Add Bollinger Bands
      const upperBBSeries = chartRef.current.addLineSeries({
        color: '#FF4136',
        lineWidth: 1,
        lineStyle: LineStyle.Dotted,
        title: 'Upper Bollinger Band',
      });
      upperBBSeries.setData(bollingerBands.upper);

      const lowerBBSeries = chartRef.current.addLineSeries({
        color: '#FF4136',
        lineWidth: 1,
        lineStyle: LineStyle.Dotted,
        title: 'Lower Bollinger Band',
      });
      lowerBBSeries.setData(bollingerBands.lower);

      // Add Keltner Channels
      const upperKCSeries = chartRef.current.addLineSeries({
        color: '#2ECC40',
        lineWidth: 1,
        lineStyle: LineStyle.Dashed,
        title: 'Upper Keltner Channel',
      });
      upperKCSeries.setData(keltnerChannels.upper);

      const lowerKCSeries = chartRef.current.addLineSeries({
        color: '#2ECC40',
        lineWidth: 1,
        lineStyle: LineStyle.Dashed,
        title: 'Lower Keltner Channel',
      });
      lowerKCSeries.setData(keltnerChannels.lower);

      chartRef.current.timeScale().fitContent();
    }

    return () => {
      if (chartRef.current) {
        chartRef.current.remove();
      }
    };
  }, [historicalData, indicators]);

  // Function to calculate Bollinger Bands
  const calculateBollingerBands = (data: { time: string; value: number }[], period: number, stdDevMultiplier: number) => {
    const sma = data.map((d, i, arr) => {
      if (i < period - 1) return { time: d.time, value: null };
      const sum = arr.slice(i - period + 1, i + 1).reduce((acc, val) => acc + val.value, 0);
      return { time: d.time, value: sum / period };
    });

    const stdDev = data.map((d, i, arr) => {
      if (i < period - 1) return { time: d.time, value: null };
      const avg = sma[i].value!;
      const squareDiffs = arr.slice(i - period + 1, i + 1).map(val => Math.pow(val.value - avg, 2));
      const variance = squareDiffs.reduce((acc, val) => acc + val, 0) / period;
      return { time: d.time, value: Math.sqrt(variance) };
    });

    return {
      upper: sma.map((d, i) => ({ time: d.time, value: d.value !== null ? d.value + stdDevMultiplier * stdDev[i].value! : null })),
      lower: sma.map((d, i) => ({ time: d.time, value: d.value !== null ? d.value - stdDevMultiplier * stdDev[i].value! : null })),
    };
  };

  // Function to calculate Keltner Channels
  const calculateKeltnerChannels = (data: ADDataPoint[], period: number, atrPeriod: number, multiplier: number) => {
    const ema = data.map((d, i, arr) => {
      if (i === 0) return { time: d.time, value: d.value };
      const k = 2 / (period + 1);
      const emaValue = d.value * k + (arr[i - 1] as ADDataPoint).value * (1 - k);
      return { time: d.time, value: emaValue };
    });

    const atr = calculateATR(data.map(d => ({ ...d, open: d.value, high: d.value, low: d.value, close: d.value, volume: 0 })), atrPeriod);

    return {
      upper: ema.map((d: ADDataPoint, i: number) => ({
        time: d.time,
        value: d.value + multiplier * (atr[i] ? atr[i].value : 0),
      })),
      lower: ema.map((d: ADDataPoint, i: number) => ({
        time: d.time,
        value: d.value - multiplier * (atr[i] ? atr[i].value : 0),
      })),
    };
  };

  // Function to calculate ATR
  const calculateATR = (data: { time: string; open: number; high: number; low: number; close: number; volume: number }[], period: number) => {
    const atr = data.map((d, i, arr) => {
      if (i < period - 1) return { time: d.time, value: null };
      const tr = arr.slice(i - period + 1, i + 1).map(val => Math.max(val.high - val.low, Math.abs(val.high - val.close), Math.abs(val.low - val.close)));
      const sum = tr.reduce((acc, val) => acc + val, 0);
      return { time: d.time, value: sum / period };
    });
    return atr;
  };

  // Render the component
  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        Average True Range (ATR) with Bollinger Bands and Keltner Channels
      </h2>
      <div ref={chartContainerRef} className="w-full h-[400px]" />
      <div className="mt-4 text-sm text-gray-600">
        <h3 className="text-lg font-semibold mb-2">Understanding ATR with Bollinger Bands and Keltner Channels</h3>
        <p>This chart combines the Average True Range (ATR) with Bollinger Bands and Keltner Channels calculated on the ATR data itself. This combination provides a unique view of volatility trends and potential breakouts.</p>

        <h4 className="font-semibold mt-3 mb-1">Key Components:</h4>
        <ul className="list-disc pl-5">
          <li><span className="font-semibold text-blue-600">ATR Line (Blue):</span> The average of the true range over the specified period.</li>
          <li><span className="font-semibold text-red-600">Bollinger Bands (Red, dotted):</span> Upper and lower bands calculated as 2 standard deviations from a 20-period simple moving average of ATR.</li>
          <li><span className="font-semibold text-green-600">Keltner Channels (Green, dashed):</span> Upper and lower channels calculated as 1.5 times the ATR above and below a 20-period exponential moving average of ATR.</li>
        </ul>

        <h4 className="font-semibold mt-3 mb-1">How to Interpret:</h4>
        <ul className="list-disc pl-5">
          <li><span className="font-semibold">Volatility Expansion/Contraction:</span> When Bollinger Bands widen relative to Keltner Channels, it indicates potential volatility expansion.</li>
          <li><span className="font-semibold">Breakout Potential:</span> ATR breaking above the upper Bollinger Band or Keltner Channel may signal a potential volatility breakout.</li>
          <li><span className="font-semibold">Volatility Squeeze:</span> When Bollinger Bands contract inside the Keltner Channels, it may indicate a period of low volatility, often preceding a significant move.</li>
          <li><span className="font-semibold">Trend Strength:</span> ATR consistently rising and staying above the upper bands may indicate a strong trend.</li>
        </ul>

        <p className="mt-3"><span className="font-semibold">Note:</span> This composite indicator provides a nuanced view of volatility trends. It's particularly useful for identifying potential breakouts and periods of volatility contraction that may precede significant price moves. As always, use this in conjunction with other technical and fundamental analysis for comprehensive trading decisions.</p>
      </div>
    </div>
  );
};

// Export the ATR component
export default ATR;