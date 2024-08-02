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
 *      a) Consecutive purple candles suggest a strong uptrend.
 *      b) Consecutive orange candles indicate a strong downtrend.
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
import { createChart, IChartApi, CandlestickData, LineStyle } from 'lightweight-charts';

// Define the props interface for the HeikinAshiDarvas component
interface HeikinAshiDarvasProps {
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

// Define the interface for Darvas box
interface DarvasBox {
  start: string;    // Start time of the box
  end: string;      // End time of the box
  high: number;     // High price of the box
  low: number;      // Low price of the box
}

// Define the HeikinAshiDarvas functional component
const HeikinAshiDarvas: React.FC<HeikinAshiDarvasProps> = ({ historicalData }) => {
  // Create a ref for the chart container DOM element
  const chartContainerRef = useRef<HTMLDivElement>(null);
  // Create a ref for the chart instance
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
      darvasBoxes.forEach((box, index) => {
        // Check if this is the latest (current) box
        const isLatestBox = index === darvasBoxes.length - 1;

        // Add top line of the Darvas box
        const topLineSeries = chartRef.current!.addLineSeries({
          color: '#4169E1',  // Royal Blue
          lineWidth: 2,
          lineStyle: LineStyle.Solid,
          title: isLatestBox ? 'Darvas Box Top' : '',
          lastValueVisible: isLatestBox,
        });

        // Set the data for the top line
        topLineSeries.setData([
          { time: box.start, value: box.high },
          { time: box.end, value: box.high },
        ]);

        // Add bottom line of the Darvas box
        const bottomLineSeries = chartRef.current!.addLineSeries({
          color: '#4169E1',  // Royal Blue
          lineWidth: 2,
          lineStyle: LineStyle.Solid,
          title: isLatestBox ? 'Darvas Box Bottom' : '',
          lastValueVisible: isLatestBox,
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

  // Function to calculate Heikin-Ashi data from regular candlestick data
  const calculateHeikinAshi = (data: typeof historicalData): CandlestickData[] => {
    // Return an array of Heikin-Ashi data
    return data.map((d, i, arr) => {
      // Calculate Heikin-Ashi open (average of previous open and close, or current open for first candle)
      const haOpen = i === 0 ? d.open : (arr[i-1].open + arr[i-1].close) / 2;
      // Calculate Heikin-Ashi close (average of open, high, low, and close)
      const haClose = (d.open + d.high + d.low + d.close) / 4;
      // Calculate Heikin-Ashi high (maximum of current high, haOpen, and haClose)
      const haHigh = Math.max(d.high, haOpen, haClose);
      // Calculate Heikin-Ashi low (minimum of current low, haOpen, and haClose)
      const haLow = Math.min(d.low, haOpen, haClose);
      // Return the Heikin-Ashi data point
      return { time: d.time, open: haOpen, high: haHigh, low: haLow, close: haClose };
    });
  };

  // Function to calculate Darvas boxes from historical data
  const calculateDarvasBoxes = (data: typeof historicalData): DarvasBox[] => {
    // Initialize an array to store Darvas boxes
    const boxes: DarvasBox[] = [];
    // Initialize variables for tracking the current box
    let currentHigh = data[0].high;
    let currentLow = data[0].low;
    let boxStart = data[0].time;
    let consecutiveLower = 0;

    // Iterate through the data to find Darvas boxes
    for (let i = 1; i < data.length; i++) {
      // If we have a new high, reset the box
      if (data[i].high > currentHigh) {
        currentHigh = data[i].high;
        currentLow = data[i].low;
        boxStart = data[i].time;
        consecutiveLower = 0;
      // If we have a new low, update the low
      } else if (data[i].low < currentLow) {
        currentLow = data[i].low;
        consecutiveLower++;

        // If we have 3 consecutive lower lows, close the box
        if (consecutiveLower >= 3) {
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

    // Return the array of Darvas boxes
    return boxes;
  };

  // Render the component
  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        Heikin-Ashi Chart with Darvas Boxes
      </h2>
      {/* Chart container div, referenced by chartContainerRef */}
      <div ref={chartContainerRef} className="w-full h-[400px]" />
      
      {/* Comprehensive description of Heikin-Ashi and Darvas Boxes */}
      <div className="mt-4 text-sm text-gray-600">
        <h3 className="text-lg font-semibold mb-2">Understanding Heikin-Ashi and Darvas Boxes</h3>
        <p>This chart combines Heikin-Ashi candlesticks with Darvas Boxes to provide a powerful tool for trend identification and potential breakout detection.</p>
        
        <h4 className="font-semibold mt-3 mb-1">Key Components:</h4>
        <ul className="list-disc pl-5">
          <li><span className="font-semibold">Heikin-Ashi Candlesticks:</span> Modified candlesticks that use average price data to filter out market noise.</li>
          <li><span className="font-semibold">Darvas Boxes:</span> Rectangle patterns that help identify potential breakout levels.</li>
        </ul>

        <h4 className="font-semibold mt-3 mb-1">Why This Combination Matters:</h4>
        <ol className="list-decimal pl-5">
          <li><span className="font-semibold">Trend Clarity:</span> Heikin-Ashi candlesticks provide a clearer view of the prevailing trend.</li>
          <li><span className="font-semibold">Breakout Identification:</span> Darvas Boxes help identify potential breakout levels and consolidation areas.</li>
          <li><span className="font-semibold">Reduced False Signals:</span> The combination can help filter out false breakouts and provide more reliable trading signals.</li>
          <li><span className="font-semibold">Support and Resistance:</span> Darvas Box levels often act as support or resistance in future price action.</li>
        </ol>

        <h4 className="font-semibold mt-3 mb-1">How to Interpret:</h4>
        <ul className="list-disc pl-5">
          <li><span className="font-semibold">Heikin-Ashi Trends:</span> Consecutive purple candles suggest an uptrend, while consecutive orange candles indicate a downtrend.</li>
          <li><span className="font-semibold">Potential Reversals:</span> Small bodies with long wicks in Heikin-Ashi candles might signal potential reversals.</li>
          <li><span className="font-semibold">Breakouts:</span> A price move above the top of a Darvas Box could signal a bullish breakout, while a move below the bottom might indicate a bearish breakout.</li>
          <li><span className="font-semibold">Consolidation:</span> Price oscillating within a Darvas Box suggests a period of consolidation.</li>
        </ul>

        <p className="mt-3"><span className="font-semibold">Note:</span> While this combination provides valuable insights, it should be used in conjunction with other technical indicators and fundamental analysis. Always consider the broader market context when interpreting these signals.</p>
      </div>
    </div>
  );
};

// Export the HeikinAshiDarvas component
export default HeikinAshiDarvas;