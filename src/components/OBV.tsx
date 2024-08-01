/**
 * OBV.tsx
 * This component renders an On-Balance Volume (OBV) chart with a 50-day EMA overlay.
 * 
 * OBV is a momentum indicator that uses volume flow to predict changes in stock price.
 * The theory behind OBV is that volume precedes price movements. When a stock closes
 * higher, all of that day's volume is considered up-volume. When it closes lower,
 * the volume is considered down-volume.
 * 
 * Why OBV matters:
 * 1. Trend Confirmation: OBV can be used to confirm price trends. If both OBV and price
 *    are making higher highs, it confirms an uptrend. Conversely, lower lows confirm a downtrend.
 * 2. Divergences: When OBV diverges from price action, it can signal potential reversals.
 *    For example, if price makes a new high but OBV doesn't, it might indicate weakness in the trend.
 * 3. Support and Resistance: OBV can be used to identify potential support and resistance levels.
 * 4. Volume Precedence: OBV is based on the idea that volume precedes price, potentially
 *    giving traders an early signal of upcoming price movements.
 * 
 * The 50-day EMA overlay helps to smooth out the OBV line and identify longer-term trends.
 */

import React, { useEffect, useRef } from 'react';
import { createChart, IChartApi, LineStyle } from 'lightweight-charts';

// Define the props interface for the OBV component
interface OBVProps {
  historicalData: { 
    time: string;   // Date/time of the data point
    open: number;   // Opening price
    high: number;   // Highest price
    low: number;    // Lowest price
    close: number;  // Closing price
    volume: number; // Trading volume
  }[];
}

// Define the OBV functional component
const OBV: React.FC<OBVProps> = ({ historicalData }) => {
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

      // Calculate OBV data
      const obvData = calculateOBV(historicalData);

      // Calculate 50-day EMA of OBV
      const emaData = calculateEMA(obvData, 50);

      // Add OBV line series to the chart
      const obvSeries = chartRef.current.addLineSeries({
        color: '#2962FF', // Blue color for OBV line
        lineWidth: 2,
        title: 'OBV',
      });
      // Set the OBV data to the series
      obvSeries.setData(obvData);

      // Add EMA line series to the chart
      const emaSeries = chartRef.current.addLineSeries({
        color: '#FF0000', // Red color for EMA line
        lineWidth: 2,
        lineStyle: LineStyle.Dashed, // Dashed line style
        title: '50-day EMA',
      });
      // Set the EMA data to the series
      emaSeries.setData(emaData);

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

  // Function to calculate On-Balance Volume (OBV)
  const calculateOBV = (data: typeof historicalData) => {
    // Initialize OBV to 0
    let obv = 0;
    // Map over the historical data to calculate OBV
    return data.map((d, i) => {
      // For the first data point, OBV is 0
      if (i === 0) {
        return { time: d.time, value: 0 };
      }
      // Get the previous day's closing price
      const previousClose = data[i - 1].close;
      // If today's close is higher than yesterday's, add volume to OBV
      if (d.close > previousClose) {
        obv += d.volume;
      // If today's close is lower than yesterday's, subtract volume from OBV
      } else if (d.close < previousClose) {
        obv -= d.volume;
      }
      // If today's close is equal to yesterday's, OBV doesn't change
      // Return the time and current OBV value
      return { time: d.time, value: obv };
    });
  };

  // Function to calculate Exponential Moving Average (EMA)
  const calculateEMA = (data: { time: string; value: number }[], period: number) => {
    // Calculate the multiplier for weighted average
    const multiplier = 2 / (period + 1);
    // Initialize EMA with the first data point's value
    let ema = data[0].value;
    // Map over the data to calculate EMA for each point
    return data.map((d, i) => {
      // For the first 'period' points, use simple moving average
      if (i < period) {
        const sma = data.slice(0, i + 1).reduce((sum, item) => sum + item.value, 0) / (i + 1);
        return { time: d.time, value: sma };
      }
      // Calculate EMA: (Current value - Previous EMA) x multiplier + Previous EMA
      ema = (d.value - ema) * multiplier + ema;
      // Return the time and calculated EMA value
      return { time: d.time, value: ema };
    });
  };

  // Render the component
  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        On-Balance Volume (OBV) with 50-day EMA
      </h2>
      {/* Chart container div, referenced by chartContainerRef */}
      <div ref={chartContainerRef} className="w-full h-[400px]" />
      <p className="mt-4 text-sm text-gray-600">
        OBV is a cumulative indicator that adds volume on up days and subtracts it on down days.
        The 50-day EMA (red dotted line) helps identify the long-term trend of the OBV.
        Divergences between OBV and price can signal potential trend reversals.
      </p>
    </div>
  );
};

// Export the OBV component
export default OBV;