// Import necessary dependencies from React and lightweight-charts
import React, { useEffect, useRef } from 'react';
import { createChart, IChartApi } from 'lightweight-charts';

// Define the props interface for the ATR component
interface ATRProps {
  historicalData: { 
    time: string;   // Date/time of the data point
    open: number;   // Opening price
    high: number;   // Highest price
    low: number;    // Lowest price
    close: number;  // Closing price
    volume: number; // Trading volume
  }[];
}

// Define the ATR functional component
const ATR: React.FC<ATRProps> = ({ historicalData }) => {
  // Create refs for the chart container and chart instance
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

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

      // Calculate ATR data
      const atrData = calculateATR(historicalData, 14); // 14 is a common period for ATR

      // Calculate Bollinger Bands data on ATR
      const bollingerData = calculateBollingerBands(atrData, 20, 2); // 20-period SMA, 2 standard deviations

      // Add ATR line series to the chart
      const atrSeries = chartRef.current.addLineSeries({
        color: '#2962FF',
        lineWidth: 2,
      });
      atrSeries.setData(atrData);

      // Add Bollinger Bands to the chart
      const upperBandSeries = chartRef.current.addLineSeries({
        color: 'rgba(255, 255, 0, 0.5)', // Semi-transparent yellow
        lineWidth: 1,
      });
      upperBandSeries.setData(bollingerData.map(d => ({ time: d.time, value: d.upper })));

      const lowerBandSeries = chartRef.current.addLineSeries({
        color: 'rgba(255, 255, 0, 0.5)', // Semi-transparent yellow
        lineWidth: 1,
      });
      lowerBandSeries.setData(bollingerData.map(d => ({ time: d.time, value: d.lower })));

      const middleBandSeries = chartRef.current.addLineSeries({
        color: 'rgba(255, 255, 255, 0.5)', // Semi-transparent white
        lineWidth: 1,
      });
      middleBandSeries.setData(bollingerData.map(d => ({ time: d.time, value: d.middle })));

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

  // Function to calculate Average True Range (ATR)
  const calculateATR = (data: typeof historicalData, period: number) => {
    // Calculate True Range (TR) for each data point
    const trueRanges = data.map((d, i) => {
      if (i === 0) return d.high - d.low; // First TR is just the first day's range
      const previousClose = data[i - 1].close;
      return Math.max(
        d.high - d.low,
        Math.abs(d.high - previousClose),
        Math.abs(d.low - previousClose)
      );
    });

    // Calculate ATR using simple moving average of TR
    let atr = trueRanges.slice(0, period).reduce((sum, tr) => sum + tr, 0) / period;
    const atrData = trueRanges.map((tr, i) => {
      if (i < period) {
        return { time: data[i].time, value: null }; // ATR not calculated for first 'period' points
      }
      atr = ((atr * (period - 1)) + tr) / period; // Smooth ATR calculation
      return { time: data[i].time, value: atr };
    });

    return atrData.filter(d => d.value !== null); // Remove initial null values
  };

  // Function to calculate Bollinger Bands
  const calculateBollingerBands = (data: { time: string; value: number | null }[], period: number, stdDev: number) => {
    // Calculate Simple Moving Average (SMA)
    const sma = data.map((d, i) => {
      if (i < period - 1) return { time: d.time, value: null };
      const sum = data.slice(i - period + 1, i + 1).reduce((acc, cur) => acc + (cur.value || 0), 0);
      return { time: d.time, value: sum / period };
    });

    // Calculate Standard Deviation
    const stdDevData = data.map((d, i) => {
      if (i < period - 1) return { time: d.time, value: null };
      const avg = sma[i].value!;
      const squareDiffs = data.slice(i - period + 1, i + 1).map(d => Math.pow((d.value || 0) - avg, 2));
      const variance = squareDiffs.reduce((acc, cur) => acc + cur, 0) / period;
      return { time: d.time, value: Math.sqrt(variance) };
    });

    // Calculate Bollinger Bands
    return data.map((d, i) => {
      if (i < period - 1) return { time: d.time, upper: null, middle: null, lower: null };
      const middle = sma[i].value!;
      const deviation = stdDevData[i].value! * stdDev;
      return {
        time: d.time,
        upper: middle + deviation,
        middle: middle,
        lower: middle - deviation,
      };
    }).filter(d => d.upper !== null);
  };

  // Render the component
  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        Average True Range (ATR) with Bollinger Bands
      </h2>
      {/* Chart container div, referenced by chartContainerRef */}
      <div ref={chartContainerRef} className="w-full h-[400px]" />
    </div>
  );
};

// Export the ATR component
export default ATR;