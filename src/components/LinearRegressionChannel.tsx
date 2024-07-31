// Import necessary dependencies from React and lightweight-charts
import React, { useEffect, useRef } from 'react';
import { createChart, IChartApi, CandlestickData, LineData } from 'lightweight-charts';

// Define the props interface for the LinearRegressionChannel component
interface LinearRegressionChannelProps {
  historicalData: {
    time: string;   // Date/time of the data point
    open: number;   // Opening price
    high: number;   // Highest price
    low: number;    // Lowest price
    close: number;  // Closing price
    volume: number; // Trading volume
  }[];
}

// Define the LinearRegressionChannel functional component
const LinearRegressionChannel: React.FC<LinearRegressionChannelProps> = ({ historicalData }) => {
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
        });
      }

      // Calculate Heikin-Ashi data
      const heikinAshiData = calculateHeikinAshi(historicalData);

      // Add Heikin-Ashi candlestick series to the chart
      const candlestickSeries = chartRef.current.addCandlestickSeries({
        upColor: '#8A2BE2',       // Purple color for up days
        downColor: '#FFA500',     // Orange color for down days
        borderVisible: false,
        wickUpColor: '#8A2BE2',   // Purple color for up wicks
        wickDownColor: '#FFA500', // Orange color for down wicks
      });
      // Set the Heikin-Ashi data
      candlestickSeries.setData(heikinAshiData);

      // Calculate and add 100-day linear regression channel with dynamic width (LRC-DW)
      const { upperChannel: upperDW, middleChannel, lowerChannel: lowerDW } = calculateLinearRegressionChannel(historicalData, 100);

      // Add LRC-DW to the chart
      const upperChannelSeriesDW = chartRef.current.addLineSeries({ color: 'rgba(76, 175, 80, 0.3)', lineWidth: 1 });
      const middleChannelSeries = chartRef.current.addLineSeries({ color: 'rgba(33, 150, 243, 0.5)', lineWidth: 1 });
      const lowerChannelSeriesDW = chartRef.current.addLineSeries({ color: 'rgba(76, 175, 80, 0.3)', lineWidth: 1 });

      upperChannelSeriesDW.setData(upperDW);
      middleChannelSeries.setData(middleChannel);
      lowerChannelSeriesDW.setData(lowerDW);

      // Calculate and add 100-day linear regression channel with fixed width (LRC-FW)
      const { upperChannel: upperFW, lowerChannel: lowerFW } = calculateFixedWidthLinearRegressionChannel(historicalData, 100, 2);

      // Add LRC-FW to the chart
      const upperChannelSeriesFW = chartRef.current.addLineSeries({ color: 'rgba(255, 99, 132, 0.5)', lineWidth: 1 });
      const lowerChannelSeriesFW = chartRef.current.addLineSeries({ color: 'rgba(255, 99, 132, 0.5)', lineWidth: 1 });

      upperChannelSeriesFW.setData(upperFW);
      lowerChannelSeriesFW.setData(lowerFW);

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

  // Function to calculate Linear Regression Channel with Dynamic Width (LRC-DW)
  const calculateLinearRegressionChannel = (data: typeof historicalData, period: number) => {
    const xValues = Array.from({ length: period }, (_, i) => i + 1);
    const xMean = (period + 1) / 2;
    const xSum = xValues.reduce((a, b) => a + b);
    const xSquaredSum = xValues.reduce((a, b) => a + b * b);

    const upperChannel: LineData[] = [];
    const middleChannel: LineData[] = [];
    const lowerChannel: LineData[] = [];

    for (let i = period - 1; i < data.length; i++) {
      const slice = data.slice(i - period + 1, i + 1);
      const yValues = slice.map(d => d.close);
      const yMean = yValues.reduce((a, b) => a + b) / period;
      const xySum = xValues.reduce((sum, x, j) => sum + x * yValues[j], 0);

      const slope = (xySum - xSum * yMean) / (xSquaredSum - xSum * xMean);
      const intercept = yMean - slope * xMean;

      const prediction = intercept + slope * period;
      const deviations = yValues.map((y, j) => y - (intercept + slope * (j + 1)));
      const standardDeviation = Math.sqrt(deviations.reduce((a, b) => a + b * b) / period);

      upperChannel.push({ time: data[i].time, value: prediction + 2 * standardDeviation });
      middleChannel.push({ time: data[i].time, value: prediction });
      lowerChannel.push({ time: data[i].time, value: prediction - 2 * standardDeviation });
    }

    return { upperChannel, middleChannel, lowerChannel };
  };

  // Function to calculate Linear Regression Channel with Fixed Width (LRC-FW)
  const calculateFixedWidthLinearRegressionChannel = (data: typeof historicalData, period: number, multiplier: number) => {
    const xValues = Array.from({ length: period }, (_, i) => i + 1);
    const xMean = (period + 1) / 2;
    const xSum = xValues.reduce((a, b) => a + b);
    const xSquaredSum = xValues.reduce((a, b) => a + b * b);

    const upperChannel: LineData[] = [];
    const lowerChannel: LineData[] = [];

    for (let i = period - 1; i < data.length; i++) {
      const slice = data.slice(i - period + 1, i + 1);
      const yValues = slice.map(d => d.close);
      const yMean = yValues.reduce((a, b) => a + b) / period;
      const xySum = xValues.reduce((sum, x, j) => sum + x * yValues[j], 0);

      const slope = (xySum - xSum * yMean) / (xSquaredSum - xSum * xMean);
      const intercept = yMean - slope * xMean;

      const prediction = intercept + slope * period;
      const fixedWidth = multiplier * (Math.max(...yValues) - Math.min(...yValues)) / 2;

      upperChannel.push({ time: data[i].time, value: prediction + fixedWidth });
      lowerChannel.push({ time: data[i].time, value: prediction - fixedWidth });
    }

    return { upperChannel, lowerChannel };
  };

  // Render the component
  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        Linear Regression Channels with Heikin-Ashi
      </h2>
      {/* Chart container div, referenced by chartContainerRef */}
      <div ref={chartContainerRef} className="w-full h-[400px]" />
    </div>
  );
};

// Export the LinearRegressionChannel component
export default LinearRegressionChannel;