/**
 * MACD.tsx
 * This component renders a Moving Average Convergence Divergence (MACD) chart using pre-calculated data.
 */

import React, { useEffect, useRef } from 'react';
import { createChart, IChartApi, LineStyle } from 'lightweight-charts';
import { CalculatedIndicators } from '../utils/calculateIndicators';

/**
 * Props for the MACD component
 * @interface MACDProps
 */
interface MACDProps {
  /**
   * Historical data points for the stock
   */
  historicalData: {
    time: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }[];
  /**
   * Pre-calculated indicators including MACD
   */
  indicators: CalculatedIndicators;
}

/**
 * MACD (Moving Average Convergence Divergence) Component
 * 
 * This component displays a chart of the Moving Average Convergence Divergence (MACD),
 * including the MACD line, signal line, and histogram.
 * 
 * @param {MACDProps} props - The props for this component
 * @returns {JSX.Element} A React functional component
 */
const MACD: React.FC<MACDProps> = ({ historicalData, indicators }) => {
  // Reference to the chart container DOM element
  const chartContainerRef = useRef<HTMLDivElement>(null);
  // Reference to the chart instance
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    // Only proceed if we have historical data and a valid chart container
    if (historicalData.length > 0 && chartContainerRef.current) {
      // Create a new chart if it doesn't exist
      if (!chartRef.current) {
        // Initialize the chart with specific dimensions and styling
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

      // Combine historical dates with MACD values
      const macdData = indicators.macd.map((macd, index) => ({
        time: historicalData[index].time,
        macd: macd.macd,
        signal: macd.signal,
        histogram: macd.histogram
      }));

      // Add MACD line series to the chart
      const macdLineSeries = chartRef.current.addLineSeries({
        color: '#2962FF',
        lineWidth: 2,
        title: 'MACD',
      });
      // Set the MACD line data
      macdLineSeries.setData(macdData.map(d => ({ time: d.time, value: d.macd })));

      // Add Signal line series to the chart
      const signalLineSeries = chartRef.current.addLineSeries({
        color: '#FF6D00',
        lineWidth: 2,
        lineStyle: LineStyle.Dashed,
        title: 'Signal',
      });
      // Set the Signal line data
      signalLineSeries.setData(macdData.map(d => ({ time: d.time, value: d.signal })));

      // Add Histogram series to the chart
      const histogramSeries = chartRef.current.addHistogramSeries({
        color: '#26a69a',
        priceFormat: {
          type: 'volume',
        },
        priceScaleId: 'right',
        title: 'Histogram',
      });
      // Set the Histogram data with color coding
      histogramSeries.setData(macdData.map(d => ({
        time: d.time,
        value: d.histogram,
        color: d.histogram >= 0 ? '#26a69a' : '#ef5350'
      })));

      // Fit the chart content to the available space
      chartRef.current.timeScale().fitContent();
    }

    // Cleanup function to remove the chart when the component unmounts
    return () => {
      if (chartRef.current) {
        chartRef.current.remove();
      }
    };
  }, [historicalData, indicators]); // This effect runs when historicalData or indicators change

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        Moving Average Convergence Divergence (MACD)
      </h2>
      {/* Chart container div, referenced by chartContainerRef */}
      <div ref={chartContainerRef} className="w-full h-[400px]" />
      {/* Comprehensive description of MACD */}
      <div className="mt-4 text-sm text-gray-600">
        <h3 className="text-lg font-semibold mb-2">Understanding MACD</h3>
        <p>The Moving Average Convergence Divergence (MACD) is a trend-following momentum indicator that shows the relationship between two moving averages of a security's price.</p>
        
        <h4 className="font-semibold mt-3 mb-1">Key Components:</h4>
        <ul className="list-disc pl-5">
          <li><span className="font-semibold text-blue-600">MACD Line (Blue):</span> The difference between the 12-period and 26-period Exponential Moving Averages (EMA).</li>
          <li><span className="font-semibold text-orange-600">Signal Line (Orange):</span> 9-period EMA of the MACD Line.</li>
          <li><span className="font-semibold text-green-600">Histogram:</span> The difference between the MACD Line and the Signal Line.</li>
        </ul>

        <h4 className="font-semibold mt-3 mb-1">Why MACD Matters:</h4>
        <ol className="list-decimal pl-5">
          <li><span className="font-semibold">Trend Identification:</span> MACD helps identify the start, continuation, or end of trends.</li>
          <li><span className="font-semibold">Momentum Measurement:</span> The histogram shows the strength of price movements.</li>
          <li><span className="font-semibold">Signal Generation:</span> Crossovers between the MACD and Signal lines can indicate potential buy or sell signals.</li>
          <li><span className="font-semibold">Divergence Detection:</span> Divergences between MACD and price can signal potential trend reversals.</li>
        </ol>

        <h4 className="font-semibold mt-3 mb-1">How to Interpret MACD:</h4>
        <ul className="list-disc pl-5">
          <li><span className="font-semibold">Bullish Signals:</span>
            <ul className="list-circle pl-5">
              <li>MACD crosses above the signal line</li>
              <li>MACD line crosses above zero</li>
            </ul>
          </li>
          <li><span className="font-semibold">Bearish Signals:</span>
            <ul className="list-circle pl-5">
              <li>MACD crosses below the signal line</li>
              <li>MACD line crosses below zero</li>
            </ul>
          </li>
          <li><span className="font-semibold">Divergences:</span> When MACD diverges from price action, it can signal a potential trend reversal.</li>
        </ul>

        <p className="mt-3"><span className="font-semibold">Note:</span> While MACD is a powerful tool, it's most effective when used in conjunction with other technical indicators and fundamental analysis. Always consider the broader market context when interpreting MACD signals.</p>
      </div>
    </div>
  );
};

// Export the MACD component
export default MACD;