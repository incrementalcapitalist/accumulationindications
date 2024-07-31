/**
 * HeikinAshiPivotPoints Component
 *
 * This component renders a chart displaying Heikin-Ashi candles and Pivot Points as horizontal lines.
 *
 * @module HeikinAshiPivotPoints
 */
import React, { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi, CandlestickData, LineData } from 'lightweight-charts';

/**
 * Props interface for the HeikinAshiPivotPoints component.
 */
interface HeikinAshiPivotPointsProps {
  /**
   * Array containing historical price data.
   */
  historicalData: {
    time: string;    // Date/time string of the data point
    open: number;    // Opening price
    high: number;    // Highest price
    low: number;     // Lowest price
    close: number;   // Closing price
    volume: number;  // Trading volume
  }[];
}

/**
 * HeikinAshiPivotPoints Component.
 *
 * @param {HeikinAshiPivotPointsProps} props - Component properties.
 * @returns {JSX.Element} The rendered chart component.
 */
const HeikinAshiPivotPoints: React.FC<HeikinAshiPivotPointsProps> = ({ historicalData }) => {
  // Ref for the chart container DOM element
  const chartContainerRef = useRef<HTMLDivElement>(null);

  // Ref for the chart API instance
  const chartRef = useRef<IChartApi | null>(null);

  // State to hold the calculated pivot point data
  const [pivotPoints, setPivotPoints] = useState<LineData[]>([]);

  /**
   * Effect hook to handle chart creation, data updates, and cleanup.
   *
   * This effect runs whenever the `historicalData` changes.
   */
  useEffect(() => {
    // Check if data is available and the chart container exists
    if (historicalData.length > 0 && chartContainerRef.current) {
      // Create a new chart if it doesn't exist
      if (!chartRef.current) {
        chartRef.current = createChart(chartContainerRef.current, {
          width: chartContainerRef.current.clientWidth, // Dynamic width based on container
          height: 400,                                  // Fixed height
          layout: {
            background: { color: '#ffffff' },
            textColor: '#333',
          },
          grid: {
            vertLines: { visible: false },
            horzLines: { visible: false },
          },
          rightPriceScale: {
            borderVisible: false,
          },
          timeScale: {
            borderVisible: false,
          },
        });
      }

      // Calculate Heikin-Ashi data (no timestamp conversion needed here)
      const heikinAshiData = calculateHeikinAshi(historicalData);

      // Add or update the candlestick series
      const candlestickSeries = chartRef.current.addCandlestickSeries({
        upColor: '#8A2BE2',       // Purple color for up days
        downColor: '#FFA500',     // Orange color for down days
        borderVisible: false,
        wickUpColor: '#8A2BE2',   // Purple color for up wicks
        wickDownColor: '#FFA500', // Orange color for down wicks
      });

      // Convert both Heikin-Ashi and pivot point data to use timestamps
      const heikinAshiDataWithTimestamps = heikinAshiData.map(dataPoint => ({
        ...dataPoint,
        time: new Date(dataPoint.time).getTime() / 1000 // Convert to Unix timestamp in seconds
      }));

      const newPivotPoints = calculatePivotPoints(historicalData, 20, 99).map(dataPoint => ({
        ...dataPoint,
        time: new Date(dataPoint.time).getTime() / 1000 // Convert to Unix timestamp in seconds
      }));

      // Update the state with the new pivot points (triggers re-render)
      setPivotPoints(newPivotPoints);

      // Remove any existing pivot lines
      chartRef.current.removeSeriesByType(LightweightCharts.SeriesType.HorizontalLine);

      // Add horizontal lines for each pivot point
      newPivotPoints.forEach(pivotPoint => {
        chartRef.current.addHorizontalLine({
          price: pivotPoint.value,
          color: 'rgba(211, 211, 211, 1)',
          lineWidth: 1,
          lineStyle: LightweightCharts.LineStyle.Solid,
          axisLabelVisible: true,
          title: 'Pivot Points',
        });
      });

      chartRef.current.timeScale().fitContent(); // Adjust the timescale to fit all data
    }

    // Cleanup function to remove the chart when the component unmounts
    return () => {
      if (chartRef.current) {
        chartRef.current.remove();
      }
    };
  }, [historicalData]);

  /**
   * Calculate Heikin-Ashi candles from regular candlestick data
   *
   * @param {typeof historicalData} data - The historical price data
   * @returns {CandlestickData[]} The calculated Heikin-Ashi candle data
   */
  const calculateHeikinAshi = (data: typeof historicalData): CandlestickData[] => {
    return data.map((d, i) => {
      const haClose = (d.open + d.high + d.low + d.close) / 4;
      const haOpen = i === 0 ? d.open : (data[i - 1].open + data[i - 1].close) / 2;
      const haHigh = Math.max(d.high, haOpen, haClose);
      const haLow = Math.min(d.low, haOpen, haClose);
      return { time: d.time, open: haOpen, high: haHigh, low: haLow, close: haClose };
    });
  };

  /**
   * Calculate Pivot Points
   *
   * @param {typeof historicalData} data - The historical price data
   * @param {number} timeframe - The number of periods used to calculate each pivot point
   * @param {number} numPivotsBack - The number of pivot points to display
   * @returns {LineData[]} The calculated pivot points
   * 
   * Differences between TradingView and Lightweight Charts:
   * TradingView:
   * - "Number of Pivots Back" (99 in this case) determines how many pivot points are displayed on the chart.
   * - "Pivots Timeframe" (20 in this case) determines the period used to calculate each pivot point.
   * Lightweight Charts:
   * - Doesn't have built-in pivot point calculations, so we implement this logic ourselves.
   * - We calculate pivot points for the entire dataset and then limit the displayed points to the last 99.
   * 
   * Why these values matter:
   * - "Pivots Timeframe" (20 periods): This value determines the sensitivity of the pivot points. 
   *   A smaller timeframe will create more frequent pivot points, while a larger timeframe will create fewer, 
   *   more significant pivot points. Using 20 periods provides a balance between short-term fluctuations and longer-term trends.
   * - "Number of Pivots Back" (99 pivots): This value controls how many historical pivot points are displayed on the chart. 
   *   Showing 99 pivot points allows traders to see a significant amount of historical context without overcrowding the chart. 
   *   It's especially useful for identifying longer-term support and resistance levels.
   * 
   * Implementation details:
   * - We calculate pivot points for the entire dataset using the 20-period timeframe.
   * - We then limit the displayed pivot points to the last 99 using the slice method.
   * - This approach ensures that we always have the most recent 99 pivot points, regardless of how much historical data is provided.
   * 
   * The main difference in implementation is that TradingView likely has built-in optimizations for calculating and displaying pivot points, 
   * while in our Lightweight Charts implementation, we're doing these calculations manually. This might be less efficient for very large datasets, 
   * but it gives us more control over the calculation and display of pivot points.
   * 
   * If you want to modify the number of pivot points displayed or the calculation timeframe, you can easily adjust these values 
   * in the calculatePivotPoints(historicalData, 20, 99) call within the useEffect hook.
   */
  const calculatePivotPoints = (
    data: typeof historicalData,
    timeframe: number,
    numPivotsBack: number
  ): LineData[] => {
    const pivots: LineData[] = [];
    for (let i = timeframe; i < data.length; i++) {
      const periodData = data.slice(i - timeframe, i);
      const high = Math.max(...periodData.map(d => d.high));
      const low = Math.min(...periodData.map(d => d.low));
      const close = periodData[periodData.length - 1].close;

      const pivot = (high + low + close) / 3;
      pivots.push({ time: data[i].time, value: pivot });
    }

    // Only return the last 'numPivotsBack' pivot points
    return pivots.slice(-numPivotsBack);
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Heikin-Ashi with Pivot Points</h2>
      <div ref={chartContainerRef} className="w-full h-[400px]" />
    </div>
  );
};

export default HeikinAshiPivotPoints;