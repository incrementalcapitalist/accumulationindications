/**
 * HeikinAshiDarvas.tsx
 * This component renders a Heikin-Ashi candlestick chart with Darvas boxes overlay.
 * 
 * The combination of Heikin-Ashi candlesticks and Darvas boxes provides valuable insights:
 * 1. Heikin-Ashi candlesticks help identify trends more clearly than traditional candlesticks.
 *    They smooth out price action, making it easier to spot trend continuations and potential reversals.
 * 2. Darvas boxes help identify potential breakout levels and support/resistance areas.
 *    They can be particularly useful for determining entry and exit points in trending markets.
 * 
 * Together, these indicators can help traders:
 * - Identify strong trends and potential trend reversals
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
          color: 'rgba(173, 216, 230, 1)',  // Solid light blue color
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
          color: 'rgba(173, 216, 230, 1)',  // Solid light blue color
          lineWidth: 2,
          lineStyle: 0,  // Solid line
          priceLineVisible: false,
        });

        // Set the data for the bottom line
        bottomLineSeries.setData([
          { time: box.start, value: box.low },
          { time: box.end, value: box.low },
        ]);

        // Add vertical lines of the Darvas box
        const leftLineSeries = chartRef.current!.addLineSeries({
          color: 'rgba(173, 216, 230, 0.5)',  // Semi-transparent light blue
          lineWidth: 1,
          lineStyle: 2,  // Dashed line
          priceLineVisible: false,
        });

        // Set the data for the left vertical line
        leftLineSeries.setData([
          { time: box.start, value: box.low },
          { time: box.start, value: box.high },
        ]);

        const rightLineSeries = chartRef.current!.addLineSeries({
          color: 'rgba(173, 216, 230, 0.5)',  // Semi-transparent light blue
          lineWidth: 1,
          lineStyle: 2,  // Dashed line
          priceLineVisible: false,
        });

        // Set the data for the right vertical line
        rightLineSeries.setData([
          { time: box.end, value: box.low },
          { time: box.end, value: box.high },
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
      {/* Chart container div, referenced by chartContainerRef */}
      <div ref={chartContainerRef} className="w-full h-[400px]" />
    </div>
  );
};

// Export the HeikinAshiDarvas component
export default HeikinAshiDarvas;