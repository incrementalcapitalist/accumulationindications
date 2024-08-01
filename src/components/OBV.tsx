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

import React, { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi, LineStyle } from 'lightweight-charts';
import AIAnalysis from './AIAnalysis'; // Import the AIAnalysis component
import { marked } from 'marked';

/**
 * Props interface for the OBV component
 * @interface OBVProps
 */
interface OBVProps {
  historicalData: { 
    time: string;   // Date/time of the data point
    open: number;   // Opening price
    high: number;   // Highest price
    low: number;    // Lowest price
    close: number;  // Closing price
    volume: number; // Trading volume
  }[];
  stockData?: {     // Make stockData optional
    symbol: string;
  };
}

/**
 * Interface for OBV data points
 * @interface OBVDataPoint
 */
interface OBVDataPoint {
  time: string; // Date/time of the data point
  value: number; // OBV value
}

/**
 * OBV Component
 * @param {OBVProps} props - Component props
 * @returns {JSX.Element} OBV component
 */
const OBV: React.FC<OBVProps> = ({ historicalData, stockData }) => {
  // Create refs for the chart container and chart instance
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  // State for OBV data
  const [obvData, setObvData] = useState<OBVDataPoint[]>([]);

  /**
   * Calculates On-Balance Volume (OBV) values
   * @param {OBVProps['historicalData']} data - Historical price data
   * @returns {OBVDataPoint[]} Array of OBV data points
   */
  const calculateOBV = (data: OBVProps['historicalData']): OBVDataPoint[] => {
    if (data.length === 0) return [];
    let obv = 0;
    return data.map((d, i) => {
      if (i === 0) {
        return { time: d.time, value: 0 };
      }
      // Compare current close to previous close
      if (d.close > data[i - 1].close) {
        obv += d.volume; // Add volume on up days
      } else if (d.close < data[i - 1].close) {
        obv -= d.volume; // Subtract volume on down days
      }
      // If closes are equal, OBV remains unchanged
      return { time: d.time, value: obv };
    });
  };

  /**
   * Calculates Exponential Moving Average (EMA)
   * @param {OBVDataPoint[]} data - OBV data
   * @param {number} period - EMA period
   * @returns {OBVDataPoint[]} Array of EMA data points
   */
  const calculateEMA = (data: OBVDataPoint[], period: number): OBVDataPoint[] => {
    if (data.length === 0) return [];
    const k = 2 / (period + 1); // Smoothing factor
    let ema = data[0].value; // Initialize EMA with first data point
    
    return data.map((point, i) => {
      if (i < period) {
        // For the first 'period' points, use Simple Moving Average (SMA)
        const sma = data.slice(0, i + 1).reduce((sum, p) => sum + p.value, 0) / (i + 1);
        return { time: point.time, value: sma };
      } else {
        // EMA calculation: (Current OBV - EMA(previous day)) x multiplier + EMA(previous day)
        ema = (point.value - ema) * k + ema;
        return { time: point.time, value: ema };
      }
    });
  };

  // Effect to create and update the chart when historicalData changes
  useEffect(() => {
    // Check if we have historical data and a valid chart container
    if (historicalData.length > 0 && chartContainerRef.current) {
      // Create a new chart if it doesn't exist
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
      const calculatedObvData = calculateOBV(historicalData);
      setObvData(calculatedObvData);

      // Add OBV line series to the chart
      if (calculatedObvData.length > 0) {
        const obvSeries = chartRef.current.addLineSeries({ 
          color: '#2962FF',
          lineWidth: 2,
        });
        obvSeries.setData(calculatedObvData);

        // Calculate and add 50-day EMA line series
        const emaData = calculateEMA(calculatedObvData, 50);
        if (emaData.length > 0) {
          const emaSeries = chartRef.current.addLineSeries({
            color: '#FF0000',
            lineWidth: 2,
            lineStyle: LineStyle.Dotted,
          });
          emaSeries.setData(emaData);
        }

        // Fit the chart content to the available space
        chartRef.current.timeScale().fitContent();
      }
    }

    // Cleanup function to remove the chart when the component unmounts
    return () => {
      if (chartRef.current) {
        chartRef.current.remove();
      }
    };
  }, [historicalData]); // This effect runs when historicalData changes

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        On-Balance Volume (OBV) with 50-day EMA
      </h2>
      {/* Chart container div, referenced by chartContainerRef */}
      {historicalData.length > 0 ? (
        <div ref={chartContainerRef} className="w-full h-[400px]" />
      ) : (
        <p>No data available to display the chart.</p>
      )}

      {/* Explanation of the OBV indicator */}
      <div className="mt-4 bg-gray-100 p-4 rounded-md">
        <h3 className="text-xl font-semibold mb-2">About On-Balance Volume (OBV)</h3>
        <p><strong>What it is:</strong> OBV is a cumulative indicator that adds volume on up days and subtracts it on down days.</p>
        <p><strong>Why it matters:</strong> OBV helps identify buying and selling pressure, potential trend reversals, and confirms existing trends. The 50-day EMA (red dotted line) helps identify the long-term trend of the OBV.</p>
        <p><strong>How it&apos;s calculated:</strong></p>
        <ul>
          <li>If today&apos;s close &gt; yesterday&apos;s close: OBV = Previous OBV + Today&apos;s Volume</li>
          <li>If today&apos;s close &lt; yesterday&apos;s close: OBV = Previous OBV - Today&apos;s Volume</li>
          <li>If today&apos;s close = yesterday&apos;s close: OBV = Previous OBV</li>
        </ul>
        <p><strong>Interpretation:</strong> Divergences between OBV and price can signal potential trend reversals. A rising OBV indicates accumulation (buying pressure), while a falling OBV suggests distribution (selling pressure).</p>
      </div>

      {/* AI Analysis component */}
      {stockData && (
        <AIAnalysis
          symbol={stockData.symbol}
          analysisType="On-Balance Volume"
          data={{
            historicalData: historicalData.slice(-10), // Send last 10 data points
            obvData: obvData.slice(-10) // Send last 10 OBV data points
          }}
        />
      )}
    </div>
  );
};

// Export the OBV component
export default OBV;