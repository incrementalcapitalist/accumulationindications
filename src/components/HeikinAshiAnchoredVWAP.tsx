/**
 * HeikinAshiAnchoredVWAP.tsx
 * This component renders a Heikin-Ashi candlestick chart with two Anchored VWAP lines.
 */

// Import necessary dependencies from React and lightweight-charts
import React, { useEffect, useRef } from 'react';
import { createChart, IChartApi, CandlestickData, LineData, Time } from 'lightweight-charts';

// Define the props interface for the HeikinAshiAnchoredVWAP component
interface HeikinAshiAnchoredVWAPProps {
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

// Define the HeikinAshiAnchoredVWAP functional component
const HeikinAshiAnchoredVWAP: React.FC<HeikinAshiAnchoredVWAPProps> = ({ historicalData }) => {
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
      const haData = calculateHeikinAshi(historicalData);

      // Add Heikin-Ashi candlestick series to the chart
      const candlestickSeries = chartRef.current.addCandlestickSeries({
        upColor: '#9c27b0',    // Purple for up candles
        downColor: '#ff9800',  // Orange for down candles
        borderVisible: false,
        wickUpColor: '#9c27b0',
        wickDownColor: '#ff9800',
      });

      // Set the Heikin-Ashi data
      candlestickSeries.setData(haData);

      // Calculate and add 1-year Anchored VWAP
      const oneYearAgoIndex = Math.max(0, historicalData.length - 365);
      const oneYearVWAP = calculateAnchoredVWAP(historicalData.slice(oneYearAgoIndex));
      const vwapSeries1 = chartRef.current.addLineSeries({
        color: 'red',
        lineWidth: 2,
        lineStyle: 2, // Dashed
        title: '1-Year Anchored VWAP',
      });
      vwapSeries1.setData(oneYearVWAP);

      // Calculate and add 100-day Anchored VWAP
      const hundredDaysAgoIndex = Math.max(0, historicalData.length - 100);
      const hundredDayVWAP = calculateAnchoredVWAP(historicalData.slice(hundredDaysAgoIndex));
      const vwapSeries2 = chartRef.current.addLineSeries({
        color: 'lightgrey',
        lineWidth: 1,
        lineStyle: 3, // Dotted
        title: '100-Day Anchored VWAP',
      });
      vwapSeries2.setData(hundredDayVWAP);

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
      // Calculate Heikin-Ashi close (average of open, high, low, and close)
      const haClose = (d.open + d.high + d.low + d.close) / 4;
      // Calculate Heikin-Ashi open (average of previous open and close, or current open for first candle)
      const haOpen = i === 0 ? d.open : (arr[i-1].open + arr[i-1].close) / 2;
      // Calculate Heikin-Ashi high (maximum of current high, haOpen, and haClose)
      const haHigh = Math.max(d.high, haOpen, haClose);
      // Calculate Heikin-Ashi low (minimum of current low, haOpen, and haClose)
      const haLow = Math.min(d.low, haOpen, haClose);
      // Return the Heikin-Ashi data point
      return { time: d.time as Time, open: haOpen, high: haHigh, low: haLow, close: haClose };
    });
  };

  // Function to calculate Anchored VWAP
  const calculateAnchoredVWAP = (data: typeof historicalData): LineData[] => {
    // Initialize variables for cumulative values
    let cumulativeTPV = 0; // Total Price * Volume
    let cumulativeVolume = 0;
    
    // Calculate VWAP for each data point
    return data.map((d) => {
      // Calculate Typical Price: (High + Low + Close) / 3
      const typicalPrice = (d.high + d.low + d.close) / 3;
      // Add to cumulative values
      cumulativeTPV += typicalPrice * d.volume;
      cumulativeVolume += d.volume;
      // Calculate VWAP
      const vwap = cumulativeTPV / cumulativeVolume;
      // Return VWAP data point
      return { time: d.time as Time, value: vwap };
    });
  };

  // Render the component
  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        Heikin-Ashi with Anchored VWAP
      </h2>
      {/* Chart container div, referenced by chartContainerRef */}
      <div ref={chartContainerRef} className="w-full h-[400px]" />

      {/* Comprehensive description of Heikin-Ashi and Anchored VWAP */}
      <div className="mt-4 text-sm text-gray-600">
        <h3 className="text-lg font-semibold mb-2">Understanding Heikin-Ashi and Anchored VWAP</h3>
        <p>This chart combines Heikin-Ashi candlesticks with two Anchored Volume Weighted Average Price (VWAP) lines to provide insights into price action and potential support/resistance levels.</p>

        <h4 className="font-semibold mt-3 mb-1">Key Components:</h4>
        <ul className="list-disc pl-5">
          <li><span className="font-semibold">Heikin-Ashi Candlesticks:</span> Modified candlesticks that use average price data to filter out market noise. Purple candles indicate up days, while orange candles indicate down days.</li>
          <li><span className="font-semibold">1-Year Anchored VWAP (Red, dashed):</span> VWAP line anchored to the data point from one year ago.</li>
          <li><span className="font-semibold">100-Day Anchored VWAP (Light grey, dotted):</span> VWAP line anchored to the data point from 100 days ago.</li>
        </ul>

        <h4 className="font-semibold mt-3 mb-1">Why This Combination Matters:</h4>
        <ol className="list-decimal pl-5">
          <li><span className="font-semibold">Trend Clarity:</span> Heikin-Ashi candlesticks provide a clearer view of the prevailing trend.</li>
          <li><span className="font-semibold">Support/Resistance:</span> Anchored VWAP lines often act as dynamic support or resistance levels.</li>
          <li><span className="font-semibold">Multiple Timeframes:</span> Using two Anchored VWAP lines provides insight into both longer-term (1-year) and medium-term (100-day) price action.</li>
          <li><span className="font-semibold">Volume Consideration:</span> VWAP incorporates volume data, providing a more comprehensive view of price action.</li>
        </ol>

        <h4 className="font-semibold mt-3 mb-1">How to Interpret:</h4>
        <ul className="list-disc pl-5">
          <li><span className="font-semibold">Heikin-Ashi Trends:</span> Consecutive purple candles suggest an uptrend, while consecutive orange candles indicate a downtrend.</li>
          <li><span className="font-semibold">VWAP Crossovers:</span> Price crossing above or below the VWAP lines may signal potential trend changes or trading opportunities.</li>
          <li><span className="font-semibold">VWAP Divergence:</span> When the two VWAP lines diverge significantly, it may indicate a strong trend or potential reversal points.</li>
        </ul>

        <p className="mt-3"><span className="font-semibold">Note:</span> While this combination provides valuable insights, it should be used in conjunction with other technical indicators and fundamental analysis for comprehensive trading decisions.</p>
      </div>
    </div>
  );
};

// Export the HeikinAshiAnchoredVWAP component
export default HeikinAshiAnchoredVWAP;