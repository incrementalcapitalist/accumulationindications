/**
 * HistoricalVolatility.tsx
 * This component calculates and renders a chart of historical volatility with multiple periods.
 */

// Import necessary dependencies from React and lightweight-charts
import React, { useEffect, useRef } from 'react';
import { createChart, IChartApi, LineStyle } from 'lightweight-charts';

// Define the props interface for the HistoricalVolatility component
interface HistoricalVolatilityProps {
  // Historical data points for the stock
  historicalData: { 
    time: string;   // Date/time of the data point
    close: number;  // Closing price
  }[];
}

// Define the HistoricalVolatility functional component
const HistoricalVolatility: React.FC<HistoricalVolatilityProps> = ({ historicalData }) => {
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

      // Calculate volatility for different periods
      const volatility10 = calculateHistoricalVolatility(historicalData, 10);
      const volatility20 = calculateHistoricalVolatility(historicalData, 20);
      const volatility30 = calculateHistoricalVolatility(historicalData, 30);

      // Add 10-day volatility line series to the chart (blue)
      const vol10Series = chartRef.current.addLineSeries({
        color: '#2962FF',
        lineWidth: 2,
        title: '10-day Volatility',
      });
      // Set the 10-day volatility data
      vol10Series.setData(volatility10);

      // Add 20-day volatility line series to the chart (green)
      const vol20Series = chartRef.current.addLineSeries({
        color: '#26A69A',
        lineWidth: 2,
        title: '20-day Volatility',
      });
      // Set the 20-day volatility data
      vol20Series.setData(volatility20);

      // Add 30-day volatility line series to the chart (red)
      const vol30Series = chartRef.current.addLineSeries({
        color: '#EF5350',
        lineWidth: 2,
        title: '30-day Volatility',
      });
      // Set the 30-day volatility data
      vol30Series.setData(volatility30);

      // Calculate and add linear regression line for 30-day volatility
      const regressionLine = calculateLinearRegression(volatility30);
      const regressionSeries = chartRef.current.addLineSeries({
        color: '#888888',
        lineWidth: 2,
        lineStyle: LineStyle.Dashed,
        title: 'Trend (30-day)',
      });
      // Set the regression line data
      regressionSeries.setData(regressionLine);

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

  // Function to calculate historical volatility
  const calculateHistoricalVolatility = (data: typeof historicalData, period: number) => {
    // Calculate logarithmic returns
    const returns = data.slice(1).map((d, i) => Math.log(d.close / data[i].close));
    // Initialize volatility array
    const volatility = [];

    // Calculate volatility for each period
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

      // Add volatility data point to array
      volatility.push({
        time: data[i].time,
        value: annualizedVol,
      });
    }

    // Return the calculated volatility array
    return volatility;
  };

  // Function to calculate linear regression
  const calculateLinearRegression = (data: { time: string; value: number }[]) => {
    // Get the number of data points
    const n = data.length;
    // Initialize sum variables
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;

    // Calculate sums for regression formula
    data.forEach((point, index) => {
      sumX += index;
      sumY += point.value;
      sumXY += index * point.value;
      sumXX += index * index;
    });

    // Calculate slope and intercept
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Generate regression line data points
    return data.map((point, index) => ({
      time: point.time,
      value: slope * index + intercept,
    }));
  };

  // Render the component
  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        Historical Volatility
      </h2>
      {/* Chart container div, referenced by chartContainerRef */}
      <div ref={chartContainerRef} className="w-full h-[400px]" />
      
      {/* Comprehensive description of Historical Volatility */}
      <div className="mt-4 text-sm text-gray-600">
        <h3 className="text-lg font-semibold mb-2">Understanding Historical Volatility</h3>
        <p>Historical Volatility (HV) measures the dispersion of returns for a given security or market index over a specific period of time. It quantifies the rate of price fluctuations and is typically expressed as an annualized percentage.</p>
        
        <h4 className="font-semibold mt-3 mb-1">Key Components:</h4>
        <ul className="list-disc pl-5">
          <li><span className="font-semibold text-blue-600">10-day Volatility (Blue):</span> Short-term volatility measure.</li>
          <li><span className="font-semibold text-green-600">20-day Volatility (Green):</span> Medium-term volatility measure.</li>
          <li><span className="font-semibold text-red-600">30-day Volatility (Red):</span> Longer-term volatility measure.</li>
          <li><span className="font-semibold text-gray-600">Trend Line (Gray, dashed):</span> Linear regression of 30-day volatility to show the overall trend.</li>
        </ul>

        <h4 className="font-semibold mt-3 mb-1">Why Historical Volatility Matters:</h4>
        <ol className="list-decimal pl-5">
          <li><span className="font-semibold">Risk Assessment:</span> Higher volatility indicates higher risk and potential for larger price swings.</li>
          <li><span className="font-semibold">Options Pricing:</span> Volatility is a key component in options pricing models.</li>
          <li><span className="font-semibold">Market Sentiment:</span> Changes in volatility can indicate shifts in market sentiment or incoming news.</li>
          <li><span className="font-semibold">Trading Strategies:</span> Volatility levels can inform entry and exit points for trades.</li>
        </ol>

        <h4 className="font-semibold mt-3 mb-1">How to Interpret Historical Volatility:</h4>
        <ul className="list-disc pl-5">
          <li><span className="font-semibold">Relative Levels:</span> Compare current volatility to past levels to gauge if it's high or low for the specific asset.</li>
          <li><span className="font-semibold">Trend Direction:</span> Rising volatility often indicates increasing uncertainty, while falling volatility may suggest complacency or stability.</li>
          <li><span className="font-semibold">Convergence/Divergence:</span> When short-term and long-term volatilities converge or diverge, it may signal potential trend changes.</li>
          <li><span className="font-semibold">Extreme Levels:</span> Very high volatility might indicate a potential reversal, while very low volatility could precede a significant move.</li>
        </ul>

        <p className="mt-3"><span className="font-semibold">Note:</span> While historical volatility provides valuable insights into past price behavior, it's not predictive of future movements. Always use it in conjunction with other technical and fundamental analysis tools for a comprehensive market view.</p>
      </div>
    </div>
  );
};

// Export the HistoricalVolatility component
export default HistoricalVolatility;