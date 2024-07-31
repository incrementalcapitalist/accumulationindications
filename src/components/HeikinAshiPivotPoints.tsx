import React, { useEffect, useRef } from 'react';
import { createChart, IChartApi, CandlestickData, LineData } from 'lightweight-charts';

// Define the props interface for the HeikinAshiPivotPoints component
interface HeikinAshiPivotPointsProps {
  historicalData: {
    time: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }[];
}

// Define the HeikinAshiPivotPoints functional component
const HeikinAshiPivotPoints: React.FC<HeikinAshiPivotPointsProps> = ({ historicalData }) => {
  // Create refs for the chart container and chart instance
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  // useEffect hook to create and update the chart when historicalData changes
  useEffect(() => {
    // Check if we have historical data and a valid chart container
    if (historicalData.length > 0 && chartContainerRef.current) {
      // If the chart doesn't exist, create it
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
          rightPriceScale: {
            borderVisible: false,
          },
          timeScale: {
            borderVisible: false,
          },
        });
      }

      // Calculate Heikin-Ashi data
      const heikinAshiData = calculateHeikinAshi(historicalData);

      // Add Heikin-Ashi candlestick series to the chart
      const candlestickSeries = chartRef.current.addCandlestickSeries({
        upColor: '#26a69a',       // Green color for up days
        downColor: '#ef5350',     // Red color for down days
        borderVisible: false,
        wickUpColor: '#26a69a',   // Green color for up wicks
        wickDownColor: '#ef5350', // Red color for down wicks
      });
      // Set the Heikin-Ashi data
      candlestickSeries.setData(heikinAshiData);

      // Calculate and add pivot points
      const pivotPoints = calculatePivotPoints(historicalData);
      const pivotSeries = chartRef.current.addLineSeries({
        color: 'rgba(76, 175, 80, 1)',
        lineWidth: 1,
        title: 'Pivot Points',
      });
      pivotSeries.setData(pivotPoints);

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

  // Function to calculate Heikin-Ashi candles
  const calculateHeikinAshi = (data: typeof historicalData): CandlestickData[] => {
    return data.map((d, i) => {
      const haClose = (d.open + d.high + d.low + d.close) / 4;
      const haOpen = i === 0 ? d.open : (data[i - 1].open + data[i - 1].close) / 2;
      const haHigh = Math.max(d.high, haOpen, haClose);
      const haLow = Math.min(d.low, haOpen, haClose);
      return { time: d.time, open: haOpen, high: haHigh, low: haLow, close: haClose };
    });
  };

  // Function to calculate Pivot Points
  const calculatePivotPoints = (data: typeof historicalData): LineData[] => {
    return data.map((d, i) => {
      if (i === 0) return { time: d.time, value: d.close }; // Return closing price for the first day

      const prevDay = data[i - 1];
      const pivot = (prevDay.high + prevDay.low + prevDay.close) / 3;

      return { time: d.time, value: pivot };
    });
  };

  // Render the component
  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        Heikin-Ashi with Pivot Points
      </h2>
      {/* Chart container div, referenced by chartContainerRef */}
      <div ref={chartContainerRef} className="w-full h-[400px]" />
    </div>
  );
};

// Export the HeikinAshiPivotPoints component
export default HeikinAshiPivotPoints;