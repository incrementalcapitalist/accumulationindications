import React, { useEffect, useRef } from 'react';
import { createChart, IChartApi, LineStyle } from 'lightweight-charts';
import { useState } from 'react';
import OpenAI from 'openai';

/**
 * Props for the HistoricalVolatility component.
 * @interface HistoricalVolatilityProps
 */
interface HistoricalVolatilityProps {
  /** An array of historical price data points */
  historicalData: { 
    time: string;  // The date of the data point
    close: number; // The closing price for that date
  }[];
}

/**
 * A React component that calculates and displays historical volatility charts.
 * 
 * This component creates three volatility charts:
 * 1. 10-day historical volatility
 * 2. 30-day historical volatility
 * 3. 60-day historical volatility
 * 
 * @param {HistoricalVolatilityProps} props - The props for this component
 * @returns {JSX.Element} A React functional component
 */
const HistoricalVolatility: React.FC<HistoricalVolatilityProps> = ({ historicalData }) => {
  /** Reference to the chart container DOM element */
  const chartContainerRef = useRef<HTMLDivElement>(null);
  /** Reference to the chart instance */
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    // Only proceed if we have historical data and a valid chart container
    if (historicalData.length > 0 && chartContainerRef.current) {
      // Create a new chart if one doesn't exist
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

      // Calculate volatility for different periods
      const volatility10 = calculateHistoricalVolatility(historicalData, 10);
      const volatility30 = calculateHistoricalVolatility(historicalData, 30);
      const volatility60 = calculateHistoricalVolatility(historicalData, 60);

      // 10-day volatility (light grey)
      const vol10Series = chartRef.current.addLineSeries({
        color: '#D3D3D3', // Light grey
        lineWidth: 2,
        title: '10-day Volatility',
      });
      vol10Series.setData(volatility10);

      // 30-day volatility (orange)
      const vol30Series = chartRef.current.addLineSeries({
        color: '#FF6D00',
        lineWidth: 2,
        title: '30-day Volatility',
      });
      vol30Series.setData(volatility30);

      // 60-day volatility (blue)
      const vol60Series = chartRef.current.addLineSeries({
        color: '#2962FF', // Blue
        lineWidth: 2,
        title: '60-day Volatility',
      });
      vol60Series.setData(volatility60);

      // Calculate and add linear regression line for 60-day volatility
      const regressionLine = calculateLinearRegression(volatility60);
      const regressionSeries = chartRef.current.addLineSeries({
        color: '#FF0000', // Red
        lineWidth: 2,
        lineStyle: LineStyle.Dashed,
        title: 'Linear Regression (60-day)',
      });
      regressionSeries.setData(regressionLine);

      chartRef.current.timeScale().fitContent();
    }

    // Cleanup function to remove the chart when the component unmounts
    return () => {
      if (chartRef.current) {
        chartRef.current.remove();
      }
    };
  }, [historicalData]); // Re-run effect if historicalData changes

  /**
   * Calculates historical volatility for a given period.
   * 
   * @param {Array} data - Array of historical price data
   * @param {number} period - The period over which to calculate volatility
   * @returns {Array} An array of volatility data points
   */
  const calculateHistoricalVolatility = (data: typeof historicalData, period: number) => {
    // Calculate logarithmic returns
    const returns = data.slice(1).map((d, i) => Math.log(d.close / data[i].close));
    const volatility = [];

    for (let i = period; i < returns.length; i++) {
      // Get returns for the current period
      const periodReturns = returns.slice(i - period, i);
      
      // Calculate mean of returns
      const mean = periodReturns.reduce((sum, r) => sum + r, 0) / period;
      
      // Calculate variance
      const variance = periodReturns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / (period - 1);
      
      // Calculate standard deviation (volatility)
      const stdDev = Math.sqrt(variance);
      
      // Annualize volatility and convert to percentage
      const annualizedVol = stdDev * Math.sqrt(252) * 100; // 252 trading days in a year

      volatility.push({
        time: data[i].time,
        value: annualizedVol,
      });
    }

    return volatility;
  };

  // Function to calculate linear regression
  const calculateLinearRegression = (data: { time: string; value: number }[]) => {
    const n = data.length;
    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumXX = 0;

    data.forEach((point, index) => {
      sumX += index;
      sumY += point.value;
      sumXY += index * point.value;
      sumXX += index * index;
    });

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return data.map((point, index) => ({
      time: point.time,
      value: slope * index + intercept,
    }));
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        Historical Volatility
      </h2>
      <div ref={chartContainerRef} className="w-full h-[400px]" />
    </div>
  );
};

export default HistoricalVolatility;