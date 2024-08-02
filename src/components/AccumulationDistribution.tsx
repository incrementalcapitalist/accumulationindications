/**
 * AccumulationDistribution.tsx
 * This component renders an Accumulation/Distribution (A/D) chart using pre-calculated data.
 */

import React, { useEffect, useRef } from 'react';
import { createChart, IChartApi, LineStyle } from 'lightweight-charts';
import { CalculatedIndicators } from '../utils/calculateIndicators';

/**
 * Props for the AccumulationDistribution component
 * @interface AccumulationDistributionProps
 */
interface AccumulationDistributionProps {
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
   * Pre-calculated indicators including Accumulation/Distribution
   */
  indicators: CalculatedIndicators;
}

/**
 * AccumulationDistribution Component
 * 
 * This component displays a chart of the Accumulation/Distribution (A/D) line,
 * including the A/D line itself and a 21-day Exponential Moving Average (EMA) of the A/D line.
 * 
 * @param {AccumulationDistributionProps} props - The props for this component
 * @returns {JSX.Element} A React functional component
 */
const AccumulationDistribution: React.FC<AccumulationDistributionProps> = ({ historicalData, indicators }) => {
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

      // Combine historical dates with A/D values
      const adData = indicators.adl.map((value, index) => ({
        time: historicalData[index].time,
        value: value
      }));

      // Add A/D line series to the chart
      const adLineSeries = chartRef.current.addLineSeries({
        color: '#2962FF',
        lineWidth: 2,
        title: 'A/D Line',
      });
      // Set the A/D line data
      adLineSeries.setData(adData);

      // Calculate and add 21-day EMA of A/D line
      const emaWindow = 21;
      const k = 2 / (emaWindow + 1);
      let ema = adData[0].value;
      const emaData = adData.map((d, i) => {
        if (i === 0) return { time: d.time, value: ema };
        ema = d.value * k + ema * (1 - k);
        return { time: d.time, value: ema };
      });

      // Add EMA line series to the chart
      const emaLineSeries = chartRef.current.addLineSeries({
        color: '#FF6D00',
        lineWidth: 2,
        lineStyle: LineStyle.Dashed,
        title: '21-day EMA of A/D',
      });
      // Set the EMA line data
      emaLineSeries.setData(emaData);

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
        Accumulation/Distribution (A/D)
      </h2>
      {/* Chart container div, referenced by chartContainerRef */}
      <div ref={chartContainerRef} className="w-full h-[400px]" />
      {/* Comprehensive description of Accumulation/Distribution */}
      <div className="mt-4 text-sm text-gray-600">
        <h3 className="text-lg font-semibold mb-2">Understanding Accumulation/Distribution (A/D)</h3>
        <p>The Accumulation/Distribution (A/D) line is a volume-based indicator designed to measure the cumulative flow of money into and out of a security. It was developed by Marc Chaikin to assess the supply and demand of a stock.</p>
        
        <h4 className="font-semibold mt-3 mb-1">Key Components:</h4>
        <ul className="list-disc pl-5">
          <li><span className="font-semibold text-blue-600">A/D Line (Blue):</span> The cumulative value of the Accumulation/Distribution over time.</li>
          <li><span className="font-semibold text-orange-600">21-day EMA (Orange):</span> A smoothed version of the A/D line to help identify trends.</li>
        </ul>

        <h4 className="font-semibold mt-3 mb-1">Why A/D Matters:</h4>
        <ol className="list-decimal pl-5">
          <li><span className="font-semibold">Volume Confirmation:</span> A/D helps confirm price movements by considering volume in addition to price.</li>
          <li><span className="font-semibold">Trend Identification:</span> The A/D line can help identify the overall trend of a security.</li>
          <li><span className="font-semibold">Divergence Detection:</span> Divergences between A/D and price can signal potential trend reversals.</li>
          <li><span className="font-semibold">Money Flow Analysis:</span> A/D provides insight into whether money is flowing into or out of a security.</li>
        </ol>

        <h4 className="font-semibold mt-3 mb-1">How to Interpret A/D:</h4>
        <ul className="list-disc pl-5">
          <li><span className="font-semibold">Trend Confirmation:</span>
            <ul className="list-circle pl-5">
              <li>If both A/D and price are rising, it confirms an uptrend.</li>
              <li>If both A/D and price are falling, it confirms a downtrend.</li>
            </ul>
          </li>
          <li><span className="font-semibold">Divergences:</span>
            <ul className="list-circle pl-5">
              <li>Bullish Divergence: Price makes a lower low, but A/D makes a higher low. This suggests potential upward price movement.</li>
              <li>Bearish Divergence: Price makes a higher high, but A/D makes a lower high. This suggests potential downward price movement.</li>
            </ul>
          </li>
          <li><span className="font-semibold">Trend Strength:</span> A steep slope in the A/D line indicates a strong trend, while a flat A/D line suggests a weak trend.</li>
          <li><span className="font-semibold">Breakouts:</span> A significant change in the direction of the A/D line can precede a price breakout.</li>
        </ul>

        <p className="mt-3"><span className="font-semibold">Note:</span> While the A/D line is a powerful tool for analyzing volume trends and confirming price movements, it should be used in conjunction with other technical indicators and fundamental analysis. It's particularly useful when combined with price action analysis and other volume-based indicators.</p>
      </div>
    </div>
  );
};

export default AccumulationDistribution;