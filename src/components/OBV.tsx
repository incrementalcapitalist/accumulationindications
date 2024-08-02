/**
 * OBV.tsx
 * This component renders an On-Balance Volume (OBV) chart using pre-calculated data.
 */

import React, { useEffect, useRef } from 'react';
import { createChart, IChartApi, LineStyle } from 'lightweight-charts';
import { CalculatedIndicators } from '../utils/calculateIndicators';

/**
 * Props for the OBV component
 * @interface OBVProps
 */
interface OBVProps {
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
   * Pre-calculated indicators including OBV
   */
  indicators: CalculatedIndicators;
}

/**
 * OBV (On-Balance Volume) Component
 * 
 * This component displays a chart of the On-Balance Volume (OBV),
 * including the OBV line and a 50-day moving average of OBV.
 * 
 * @param {OBVProps} props - The props for this component
 * @returns {JSX.Element} A React functional component
 */
const OBV: React.FC<OBVProps> = ({ historicalData, indicators }) => {
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

      // Combine historical dates with OBV values
      const obvData = indicators.obv.map((value, index) => ({
        time: historicalData[index].time,
        value: value
      }));

      // Add OBV line series to the chart
      const obvLineSeries = chartRef.current.addLineSeries({
        color: '#2962FF',
        lineWidth: 2,
        title: 'OBV',
      });
      // Set the OBV line data
      obvLineSeries.setData(obvData);

      // Calculate and add 50-day moving average of OBV
      const maWindow = 50;
      const maObvData = obvData.map((d, i, arr) => {
        if (i < maWindow - 1) return { time: d.time, value: null };
        const sum = arr.slice(i - maWindow + 1, i + 1).reduce((acc, val) => acc + val.value, 0);
        return { time: d.time, value: sum / maWindow };
      });

      // Add MA line series to the chart
      const maLineSeries = chartRef.current.addLineSeries({
        color: '#FF6D00',
        lineWidth: 2,
        lineStyle: LineStyle.Dashed,
        title: '50-day MA of OBV',
      });
      // Set the MA line data
      maLineSeries.setData(maObvData);

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
        On-Balance Volume (OBV)
      </h2>
      {/* Chart container div, referenced by chartContainerRef */}
      <div ref={chartContainerRef} className="w-full h-[400px]" />
      {/* Comprehensive description of OBV */}
      <div className="mt-4 text-sm text-gray-600">
        <h3 className="text-lg font-semibold mb-2">Understanding On-Balance Volume (OBV)</h3>
        <p>On-Balance Volume (OBV) is a momentum indicator that uses volume flow to predict changes in stock price. It was developed by Joe Granville in the 1963 book Granville's New Key to Stock Market Profits.</p>
        
        <h4 className="font-semibold mt-3 mb-1">Key Components:</h4>
        <ul className="list-disc pl-5">
          <li><span className="font-semibold text-blue-600">OBV Line (Blue):</span> The cumulative total of volume on up days minus volume on down days.</li>
          <li><span className="font-semibold text-orange-600">50-day Moving Average (Orange):</span> A smoothed version of the OBV line to help identify trends.</li>
        </ul>

        <h4 className="font-semibold mt-3 mb-1">Why OBV Matters:</h4>
        <ol className="list-decimal pl-5">
          <li><span className="font-semibold">Volume Precedes Price:</span> OBV is based on the idea that volume changes can predict price movements.</li>
          <li><span className="font-semibold">Trend Confirmation:</span> OBV can confirm price trends or warn of potential reversals.</li>
          <li><span className="font-semibold">Divergence Detection:</span> Divergences between OBV and price can signal potential trend changes.</li>
          <li><span className="font-semibold">Accumulation/Distribution:</span> OBV can indicate whether smart money is accumulating (buying) or distributing (selling) a stock.</li>
        </ol>

        <h4 className="font-semibold mt-3 mb-1">How to Interpret OBV:</h4>
        <ul className="list-disc pl-5">
          <li><span className="font-semibold">Trend Confirmation:</span>
            <ul className="list-circle pl-5">
              <li>If both OBV and price are making higher highs and higher lows, it confirms an uptrend.</li>
              <li>If both OBV and price are making lower highs and lower lows, it confirms a downtrend.</li>
            </ul>
          </li>
          <li><span className="font-semibold">Divergences:</span>
            <ul className="list-circle pl-5">
              <li>Bullish Divergence: Price makes a lower low, but OBV makes a higher low. This suggests potential upward price movement.</li>
              <li>Bearish Divergence: Price makes a higher high, but OBV makes a lower high. This suggests potential downward price movement.</li>
            </ul>
          </li>
          <li><span className="font-semibold">Breakouts:</span> A significant rise in OBV can precede a breakout in the stock price.</li>
          <li><span className="font-semibold">Support/Resistance:</span> OBV can be used to identify potential support and resistance levels.</li>
        </ul>

        <p className="mt-3"><span className="font-semibold">Note:</span> While OBV is a powerful tool for analyzing volume trends, it should be used in conjunction with other technical indicators and fundamental analysis. OBV is most effective in identifying broad, longer-term trends rather than short-term fluctuations.</p>
      </div>
    </div>
  );
};

export default OBV;