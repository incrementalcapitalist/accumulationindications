/**
 * StockQuote.tsx
 * This component renders detailed stock quote information and a Heikin-Ashi chart.
 */

import React, { useEffect, useRef } from 'react';
import { createChart, IChartApi, CandlestickData } from 'lightweight-charts';
import { StockData } from '../types';
import { useState } from 'react';
import OpenAI from 'openai';

/**
 * Props for the StockQuote component
 * @interface StockQuoteProps
 * @property {StockData} stockData - Current stock data
 * @property {Array<Object>} historicalData - Array of historical price data
 */
interface StockQuoteProps {
  stockData: StockData;
  historicalData: { time: string; open: number; high: number; low: number; close: number }[];
}

/**
 * Extends CandlestickData to include a string time property
 * @interface HeikinAshiData
 * @extends {CandlestickData}
 */
interface HeikinAshiData extends CandlestickData {
  time: string;
}

/**
 * StockQuote Component
 * Displays detailed stock information and a Heikin-Ashi chart
 * 
 * @param {StockQuoteProps} props - The props for this component
 * @returns {JSX.Element} A React functional component
 */
const StockQuote: React.FC<StockQuoteProps> = ({ stockData, historicalData }) => {
  // Reference to the chart container DOM element
  const chartContainerRef = useRef<HTMLDivElement>(null);
  // Reference to the chart instance
  const chartRef = useRef<IChartApi | null>(null);

  /**
   * Calculates Heikin-Ashi data from regular candlestick data
   * Heikin-Ashi candlesticks are used to identify trending periods and potential reversals
   * more easily than standard candlesticks.
   * 
   * @param {Array<Object>} data - Array of historical price data
   * @returns {Array<HeikinAshiData>} Array of Heikin-Ashi data
   */
  const calculateHeikinAshi = (data: typeof historicalData): HeikinAshiData[] => {
    let haData: HeikinAshiData[] = [];
    
    data.forEach((candle, index) => {
      const haCandle: HeikinAshiData = {
        time: candle.time,
        open: index === 0 ? candle.open : (haData[index - 1].open + haData[index - 1].close) / 2,
        close: (candle.open + candle.high + candle.low + candle.close) / 4,
        high: candle.high,
        low: candle.low
      };
      
      // Adjust high and low values
      haCandle.high = Math.max(haCandle.open, haCandle.close, candle.high);
      haCandle.low = Math.min(haCandle.open, haCandle.close, candle.low);
      
      haData.push(haCandle);
    });
    
    return haData;
  };

  // Effect to create and update the chart when historicalData changes
  useEffect(() => {
    if (historicalData.length > 0 && chartContainerRef.current) {
      // Create a new chart if it doesn't exist
      if (!chartRef.current) {
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
      const haData = calculateHeikinAshi(historicalData);

      // Add the Heikin-Ashi candlestick series to the chart
      const candlestickSeries = chartRef.current.addCandlestickSeries({
        upColor: '#9c27b0', // Purple for up days
        downColor: '#ff9800', // Orange for down days
        borderVisible: false,
        wickUpColor: '#9c27b0',
        wickDownColor: '#ff9800',
      });

      // Set the Heikin-Ashi data on the series
      candlestickSeries.setData(haData);

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
   * Formats a number to 2 decimal places
   * @param {number} num - The number to format
   * @returns {string} The formatted number
   */
  const formatNumber = (num: number): string => num.toFixed(2);

  /**
   * Determines the CSS class for price change (green for positive, red for negative)
   * @param {number} change - The price change
   * @returns {string} The CSS class name
   */
  const getPriceChangeClass = (change: number): string => 
    change >= 0 ? 'text-green-600' : 'text-red-600';

  // Render the component
  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      {/* Stock symbol and current price */}
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        {stockData.symbol} Quote
      </h2>
      <div className="text-3xl font-bold mb-2">
        ${formatNumber(stockData.price)}
        {/* Display price change and percentage */}
        <span className={`ml-2 text-xl ${getPriceChangeClass(stockData.change)}`}>
          {stockData.change >= 0 ? '+' : ''}{formatNumber(stockData.change)} 
          ({stockData.changePercent})
        </span>
      </div>

      {/* Grid layout for other stock information */}
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div>
          <span className="font-semibold">Open:</span> ${formatNumber(stockData.open)}
        </div>
        <div>
          <span className="font-semibold">Previous Close:</span> ${formatNumber(stockData.previousClose)}
        </div>
        <div>
          <span className="font-semibold">Day's High:</span> ${formatNumber(stockData.high)}
        </div>
        <div>
          <span className="font-semibold">Day's Low:</span> ${formatNumber(stockData.low)}
        </div>
        <div>
          <span className="font-semibold">Volume:</span> {stockData.volume.toLocaleString()}
        </div>
        <div>
          <span className="font-semibold">Latest Trading Day:</span> {stockData.latestTradingDay}
        </div>
      </div>

      {/* Heikin-Ashi chart */}
      <div className="mt-6">
        <h3 className="text-xl font-semibold mb-2">Heikin-Ashi Chart</h3>
        {/* Chart container div, referenced by chartContainerRef */}
        <div ref={chartContainerRef} className="w-full h-[400px]" />
      </div>
    </div>
  );
};

// Export the StockQuote component
export default StockQuote;