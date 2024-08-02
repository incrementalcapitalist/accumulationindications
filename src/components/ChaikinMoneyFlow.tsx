/**
 * ChaikinMoneyFlow.tsx
 * This component renders a Chaikin Money Flow (CMF) chart using pre-calculated data.
 */

// Import necessary dependencies from React and lightweight-charts
import React, { useEffect, useRef } from 'react';
import { createChart, IChartApi, LineStyle } from 'lightweight-charts';
// Import the CalculatedIndicators type from our utility file
import { CalculatedIndicators } from '../utils/calculateIndicators';

/**
 * Props for the ChaikinMoneyFlow component
 * @interface ChaikinMoneyFlowProps
 */
interface ChaikinMoneyFlowProps {
  // Historical data points for the stock
  historicalData: {
    time: string;   // Date/time of the data point
    open: number;   // Opening price
    high: number;   // Highest price
    low: number;    // Lowest price
    close: number;  // Closing price
    volume: number; // Trading volume
  }[];
  // Pre-calculated indicators including CMF
  indicators: CalculatedIndicators;
}

/**
 * ChaikinMoneyFlow Component
 * 
 * This component displays a chart of the Chaikin Money Flow (CMF),
 * including the CMF line and a zero line for reference.
 * 
 * @param {ChaikinMoneyFlowProps} props - The props for this component
 * @returns {JSX.Element} A React functional component
 */
const ChaikinMoneyFlow: React.FC<ChaikinMoneyFlowProps> = ({ historicalData, indicators }) => {
  // Reference to the chart container DOM element
  const chartContainerRef = useRef<HTMLDivElement>(null);
  // Reference to the chart instance
  const chartRef = useRef<IChartApi | null>(null);

  // useEffect hook to create and update the chart when data changes
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

      // Combine historical dates with CMF values
      const cmfData = indicators.cmf.map((value, index) => ({
        time: historicalData[index].time,
        value: value
      }));

      // Add CMF line series to the chart
      const cmfLineSeries = chartRef.current.addLineSeries({
        color: '#2962FF',
        lineWidth: 2,
        title: 'CMF',
      });
      // Set the CMF line data
      cmfLineSeries.setData(cmfData);

      // Add a zero line for reference
      const zeroLine = chartRef.current.addLineSeries({
        color: '#888888',
        lineWidth: 1,
        lineStyle: LineStyle.Dashed,
        title: 'Zero Line',
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
  }, [historicalData, indicators]); // This effect runs when historicalData or indicators change

  // Render the component
  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        Chaikin Money Flow (CMF)
      </h2>
      {/* Chart container div, referenced by chartContainerRef */}
      <div ref={chartContainerRef} className="w-full h-[400px]" />
      {/* Comprehensive description of CMF */}
      <div className="mt-4 text-sm text-gray-600">
        <h3 className="text-lg font-semibold mb-2">Understanding Chaikin Money Flow (CMF)</h3>
        <p>Chaikin Money Flow (CMF) is a volume-weighted average of accumulation and distribution over a specified period, typically 20 or 21 days. It was developed by Marc Chaikin to measure the amount of Money Flow Volume over a specific period.</p>
        
        <h4 className="font-semibold mt-3 mb-1">Key Components:</h4>
        <ul className="list-disc pl-5">
          <li><span className="font-semibold text-blue-600">CMF Line (Blue):</span> The main indicator line showing the money flow.</li>
          <li><span className="font-semibold text-gray-600">Zero Line (Gray, dashed):</span> A reference line to easily identify positive and negative money flow.</li>
        </ul>

        <h4 className="font-semibold mt-3 mb-1">Why CMF Matters:</h4>
        <ol className="list-decimal pl-5">
          <li><span className="font-semibold">Buying/Selling Pressure:</span> CMF helps identify buying or selling pressure over time.</li>
          <li><span className="font-semibold">Trend Confirmation:</span> It can be used to confirm price trends or spot potential reversals.</li>
          <li><span className="font-semibold">Volume Analysis:</span> CMF provides insights into the volume flow, which can be more revealing than price action alone.</li>
          <li><span className="font-semibold">Divergence Detection:</span> Divergences between CMF and price can signal potential trend changes.</li>
        </ol>

        <h4 className="font-semibold mt-3 mb-1">How to Interpret CMF:</h4>
        <ul className="list-disc pl-5">
          <li><span className="font-semibold">Positive/Negative Values:</span>
            <ul className="list-circle pl-5">
              <li>CMF > 0 indicates buying pressure (accumulation)</li>
              <li>CMF < 0 indicates selling pressure (distribution)</li>
            </ul>
          </li>
          <li><span className="font-semibold">Magnitude:</span> The further from zero, the stronger the buying or selling pressure.</li>
          <li><span className="font-semibold">Trend Confirmation:</span> CMF moving in the same direction as price confirms the trend.</li>
          <li><span className="font-semibold">Divergences:</span> If price makes new highs/lows but CMF doesn't, it may signal a potential reversal.</li>
          <li><span className="font-semibold">Overbought/Oversold:</span> Extremely high or low CMF values may indicate overbought or oversold conditions.</li>
        </ul>

        <p className="mt-3"><span className="font-semibold">Note:</span> While CMF is a powerful volume-based indicator, it should be used in conjunction with other technical indicators and fundamental analysis for comprehensive trading decisions. Pay attention to CMF values sustaining above or below zero, as well as any significant divergences from price action.</p>
      </div>
    </div>
  );
};

// Export the ChaikinMoneyFlow component
export default ChaikinMoneyFlow;