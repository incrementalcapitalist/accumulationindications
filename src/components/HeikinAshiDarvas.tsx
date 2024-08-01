/**
 * HeikinAshiDarvas.tsx
 * This component renders a Heikin-Ashi candlestick chart with Darvas boxes overlay.
 * 
 * @description
 * This component combines two powerful technical analysis tools:
 * 
 * 1. Heikin-Ashi Candlesticks:
 *    - Purpose: To smooth price action and make trends easier to spot.
 *    - How it's used: 
 *      a) Consecutive green (purple) candles suggest a strong uptrend.
 *      b) Consecutive red (orange) candles indicate a strong downtrend.
 *      c) Small bodies with long wicks might signal potential reversals.
 *    - Why it matters: Heikin-Ashi charts filter out some market noise, making
 *      trend identification and potential reversal spots more apparent than
 *      with traditional candlesticks.
 * 
 * 2. Darvas Boxes:
 *    - Purpose: To identify potential breakout levels and support/resistance areas.
 *    - How it's used:
 *      a) The top of a box often acts as resistance; a break above it could signal a buy opportunity.
 *      b) The bottom of a box typically acts as support; a break below might indicate a sell signal.
 *      c) Price tends to oscillate between the top and bottom of the current box.
 *    - Why it matters: Darvas boxes help traders spot key price levels for potential
 *      entry and exit points, especially in trending markets.
 * 
 * Combined, these tools provide a powerful visual representation of price action,
 * helping traders to:
 * - Identify strong trends and potential reversals
 * - Spot key support and resistance levels
 * - Determine potential entry and exit points for trades
 * - Filter out market noise and focus on significant price movements
 */

import React, { useEffect, useRef } from 'react';
import { createChart, IChartApi, CandlestickData } from 'lightweight-charts';

/**
 * Props for the HeikinAshiDarvas component
 * @typedef {Object} HeikinAshiDarvasProps
 * @property {Array<Object>} historicalData - Array of historical price data
 */
interface HeikinAshiDarvasProps {
  historicalData: {
    time: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }[];
}

/**
 * HeikinAshiDarvas component
 * @param {HeikinAshiDarvasProps} props - The component props
 * @returns {JSX.Element} The rendered component
 */
const HeikinAshiDarvas: React.FC<HeikinAshiDarvasProps> = ({ historicalData }) => {
  // Create a ref for the chart container div
  const chartContainerRef = useRef<HTMLDivElement>(null);
  // Create a ref for the chart instance
  const chartRef = useRef<IChartApi | null>(null);

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

      // Calculate Heikin-Ashi data
      const heikinAshiData = calculateHeikinAshi(historicalData);

      // Add Heikin-Ashi candlestick series to the chart
      const candlestickSeries = chartRef.current.addCandlestickSeries({
        upColor: '#8A2BE2',       // Purple color for up candles
        downColor: '#FFA500',     // Orange color for down candles
        borderVisible: false,
        wickUpColor: '#8A2BE2',   // Purple color for up wicks
        wickDownColor: '#FFA500', // Orange color for down wicks
      });

      // Set the Heikin-Ashi data
      candlestickSeries.setData(heikinAshiData);

      // Calculate Darvas boxes
      const darvasBoxes = calculateDarvasBoxes(historicalData);

      // Add Darvas boxes to the chart
      darvasBoxes.forEach((box) => {
        // Add top line of the Darvas box
        const topLineSeries = chartRef.current!.addLineSeries({
          color: '#4169E1',  // Royal Blue, fully opaque
          lineWidth: 2,
          lineStyle: 0,  // Solid line
          priceLineVisible: false,
        });

        // Set the data for the top line
        topLineSeries.setData([
          { time: box.start, value: box.high },
          { time: box.end, value: box.high },
        ]);

        // Add bottom line of the Darvas box
        const bottomLineSeries = chartRef.current!.addLineSeries({
          color: '#4169E1',  // Royal Blue, fully opaque
          lineWidth: 2,
          lineStyle: 0,  // Solid line
          priceLineVisible: false,
        });

        // Set the data for the bottom line
        bottomLineSeries.setData([
          { time: box.start, value: box.low },
          { time: box.end, value: box.low },
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

  /**
   * Calculate Heikin-Ashi data from regular candlestick data
   * Heikin-Ashi candlesticks provide a clearer view of trends by smoothing price action.
   * 
   * @param {Array<Object>} data - The historical price data
   * @returns {Array<CandlestickData>} The calculated Heikin-Ashi data
   * 
   * @description
   * Heikin-Ashi candlesticks are calculated as follows:
   * - Close = (Open + High + Low + Close) / 4
   * - Open = (Previous Open + Previous Close) / 2
   * - High = Max(High, Open, Close)
   * - Low = Min(Low, Open, Close)
   * 
   * This calculation smooths the price action, making trends more apparent and
   * reducing the noise seen in traditional candlestick charts.
   */
  const calculateHeikinAshi = (data: typeof historicalData): CandlestickData[] => {
    return data.map((d, i) => {
      // Calculate Heikin-Ashi close (average of open, high, low, and close)
      const haClose = (d.open + d.high + d.low + d.close) / 4;
      // Calculate Heikin-Ashi open (average of previous open and close, or current open for first candle)
      const haOpen = i === 0 ? d.open : (data[i - 1].open + data[i - 1].close) / 2;
      // Calculate Heikin-Ashi high (maximum of current high, haOpen, and haClose)
      const haHigh = Math.max(d.high, haOpen, haClose);
      // Calculate Heikin-Ashi low (minimum of current low, haOpen, and haClose)
      const haLow = Math.min(d.low, haOpen, haClose);
      // Return the Heikin-Ashi data point
      return { time: d.time, open: haOpen, high: haHigh, low: haLow, close: haClose };
    });
  };

  /**
   * Calculate Darvas boxes from historical data
   * Darvas boxes help identify potential breakout levels and support/resistance areas.
   * 
   * @param {Array<Object>} data - The historical price data
   * @returns {Array<Object>} The calculated Darvas boxes
   * 
   * @description
   * Darvas boxes are calculated as follows:
   * 1. A new box is started when the price reaches a new high.
   * 2. The top of the box is set at this new high.
   * 3. The bottom of the box is set at the lowest price reached since the new high.
   * 4. The box is considered complete when the price falls below the bottom of the box.
   * 
   * This method helps identify potential breakout levels and support/resistance areas,
   * which can be crucial for determining entry and exit points in trades.
   */
  const calculateDarvasBoxes = (data: typeof historicalData) => {
    const boxes = [];
    let currentHigh = data[0].high;
    let currentLow = data[0].low;
    let boxStart = data[0].time;
    let consecutiveLower = 0;

    // Iterate through the data to find Darvas boxes
    for (let i = 1; i < data.length; i++) {
      if (data[i].high > currentHigh) {
        // If we have a new high, reset the box
        currentHigh = data[i].high;
        currentLow = data[i].low;
        boxStart = data[i].time;
        consecutiveLower = 0;
      } else if (data[i].low < currentLow) {
        // If we have a new low, update the low
        currentLow = data[i].low;
        consecutiveLower++;

        if (consecutiveLower >= 3) {
          // If we have 3 consecutive lower lows, close the box
          boxes.push({
            start: boxStart,
            end: data[i].time,
            high: currentHigh,
            low: currentLow,
          });

          // Start a new box
          currentHigh = data[i].high;
          currentLow = data[i].low;
          boxStart = data[i].time;
          consecutiveLower = 0;
        }
      } else {
        // Reset consecutive lower count if we don't have a lower low
        consecutiveLower = 0;
      }
    }

    // Add the last box if it's still open
    if (boxStart !== data[data.length - 1].time) {
      boxes.push({
        start: boxStart,
        end: data[data.length - 1].time,
        high: currentHigh,
        low: currentLow,
      });
    }

    return boxes;
  };

  // Render the component
  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        Heikin-Ashi Chart with Darvas Boxes
      </h2>
      <div ref={chartContainerRef} className="w-full h-[400px]" />
      
      {/* New explanation section */}
      <div className="mb-4 text-sm text-gray-600">
        <p><strong>How to interpret this chart:</strong></p>
        <ul className="list-disc pl-5 mt-2">
          <li><span className="text-purple-600 font-semibold">Purple candles</span> indicate upward price movement, while <span className="text-orange-500 font-semibold">orange candles</span> show downward movement.</li>
          <li>Consecutive candles of the same color suggest a strong trend in that direction.</li>
          <li>The <span className="text-blue-600 font-semibold">blue horizontal lines</span> represent Darvas boxes:</li>
          <ul className="list-circle pl-5 mt-1">
            <li>The top line often acts as resistance; a break above it could signal a buy opportunity.</li>
            <li>The bottom line typically acts as support; a break below might indicate a sell signal.</li>
          </ul>
          <li>Price tends to oscillate between the top and bottom of the current box.</li>
          <li>Small candles with long wicks might signal potential trend reversals.</li>
        </ul>
      </div>

      
    </div>
  );
};

// Export the HeikinAshiDarvas component
export default HeikinAshiDarvas;