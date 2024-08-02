/**
 * RSI.tsx
 * This component renders a Relative Strength Index (RSI) chart using pre-calculated data.
 */

import React, { useEffect, useRef } from 'react';
import { createChart, IChartApi, LineStyle } from 'lightweight-charts';
import { CalculatedIndicators } from '../utils/calculateIndicators';

/**
 * Props for the RSI component
 * @interface RSIProps
 */
interface RSIProps {
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
   * Pre-calculated indicators including RSI
   */
  indicators: CalculatedIndicators;
}

/**
 * RSI (Relative Strength Index) Component
 * 
 * This component displays a chart of the Relative Strength Index (RSI),
 * including the RSI line and overbought/oversold levels.
 * 
 * @param {RSIProps} props - The props for this component
 * @returns {JSX.Element} A React functional component
 */
const RSI: React.FC<RSIProps> = ({ historicalData, indicators }) => {
  // Reference to the chart container DOM element
  const chartContainerRef = useRef<HTMLDivElement>(null);
  // Reference to the chart instance
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    // Only proceed if we have historical data and a valid chart container
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

      // Add RSI line series to the chart
      const rsiSeries = chartRef.current.addLineSeries({
        color: '#2962FF',
        lineWidth: 2,
        title: 'RSI',
      });

      // Combine historical dates with RSI values
      const rsiData = indicators.rsi.map((value, index) => ({
        time: historicalData[index].time,
        value: value
      }));

      // Set the RSI data
      rsiSeries.setData(rsiData);

      // Add overbought line (RSI = 70)
      const overboughtLine = chartRef.current.addLineSeries({
        color: '#FF0000',
        lineWidth: 1,
        lineStyle: LineStyle.Dashed,
        title: 'Overbought (70)',
      });
      overboughtLine.setData(rsiData.map(d => ({ time: d.time, value: 70 })));

      // Add oversold line (RSI = 30)
      const oversoldLine = chartRef.current.addLineSeries({
        color: '#00FF00',
        lineWidth: 1,
        lineStyle: LineStyle.Dashed,
        title: 'Oversold (30)',
      });
      oversoldLine.setData(rsiData.map(d => ({ time: d.time, value: 30 })));

      // Set the visible range of values
      chartRef.current.priceScale('right').applyOptions({
        autoScale: false,
        scaleMargins: {
          top: 0.1,
          bottom: 0.1,
        },
      });

      // Manually set the price range to 0-100
      rsiSeries.applyOptions({
        autoscaleInfoProvider: () => ({
          priceRange: {
            minValue: 0,
            maxValue: 100,
          },
        }),
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
  }, [historicalData, indicators]); // This effect runs when historicalData or indicators change

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        Relative Strength Index (RSI)
      </h2>
      {/* Chart container div, referenced by chartContainerRef */}
      <div ref={chartContainerRef} className="w-full h-[400px]" />
      {/* Optional: Add description or interpretation of RSI */}
      <div className="mt-4 text-sm text-gray-600">
        <p>The RSI is a momentum indicator that measures the magnitude of recent price changes to evaluate overbought or oversold conditions in the price of a stock or other asset.</p>
        <ul className="list-disc pl-5 mt-2">
          <li>RSI values of 70 or above indicate that a security is becoming overbought or overvalued.</li>
          <li>RSI values of 30 or below suggest that a security is becoming oversold or undervalued.</li>
          <li>RSI can also be used to identify the general trend.</li>
        </ul>
      </div>
    </div>
  );
};

export default RSI;