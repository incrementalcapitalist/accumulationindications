/**
 * StockQuote.tsx
 * This component renders detailed stock quote information, a Heikin-Ashi chart,
 * and a Linear Regression Channel with statistics.
 */

// Import necessary dependencies
import React, { useEffect, useRef } from 'react';
import { createChart, IChartApi, CandlestickSeriesOptions, LineStyle } from 'lightweight-charts';
import { StockData, HistoricalDataPoint } from '../types';
import { CalculatedIndicators } from '../utils/calculateIndicators';
import TradingViewWidget from './TradingViewWidget';
import ShortVolumeWidget from './ShortVolumeWidget';
import MiniChartWidget from './MiniChartWidget';

/**
 * Props for the StockQuote component
 * @interface StockQuoteProps
 */
interface StockQuoteProps {
  /** Current stock data */
  stockData: StockData;
  /** Historical price data */
  historicalData: HistoricalDataPoint[];
  /** Pre-calculated indicators */
  indicators: CalculatedIndicators;
}

/**
 * StockQuote Component
 * Displays detailed stock information, a Heikin-Ashi chart with Linear Regression Channel, and regression statistics
 * 
 * @param {StockQuoteProps} props - The props for this component
 * @returns {JSX.Element} A React functional component
 */
const StockQuote: React.FC<StockQuoteProps> = ({ stockData, historicalData, indicators }) => {
  // Create a ref for the chart container DOM element
  const chartContainerRef = useRef<HTMLDivElement>(null);
  
  // Create a ref for the chart instance
  const chartRef = useRef<IChartApi | null>(null);

  // Extract the current price from stockData
  const currentPrice = stockData.price;
  
  // Get the previous day's closing price from historical data, or use stockData if unavailable
  const previousClose = historicalData.length > 1 ? historicalData[historicalData.length - 2].close : stockData.previousClose;
  
  // Calculate the price change (current price minus previous close)
  const priceChange = currentPrice - previousClose;
  
  // Calculate the percentage change ((price change / previous close) * 100)
  const percentageChange = (priceChange / previousClose) * 100;

  /**
   * Calculates Heikin-Ashi data from regular candlestick data
   * @param {Array<HistoricalDataPoint>} data - Array of historical price data
   * @returns {Array<CandlestickData>} Array of Heikin-Ashi data
   */
  const calculateHeikinAshi = (data: HistoricalDataPoint[]) => {
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
      return { time: d.time, open: haOpen, high: haHigh, low: haLow, close: haClose };
    });
  };

  /**
   * Calculates linear regression channel data and statistics
   * @param {Array<HistoricalDataPoint>} data - Array of historical price data
   * @returns {Object} Object containing channel data and regression statistics
   */
const calculateRegressionChannel = (data: HistoricalDataPoint[]) => {
    // Extract the last 100 data points or all if less than 100
  const regressionData = data.slice(-100);
  const n = regressionData.length;

    // Calculate the sum of x, y, xy, x^2, and y^2
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;
  regressionData.forEach((d, i) => {
    sumX += i;
    sumY += d.close;
    sumXY += i * d.close;
    sumX2 += i * i;
    sumY2 += d.close * d.close;
  });

    // Calculate the slope and y-intercept of the regression line
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

    // Calculate Pearson's R (correlation coefficient)
  const r = (n * sumXY - sumX * sumY) / 
    (Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY)));

    // Calculate R-squared (coefficient of determination)
  const rSquared = r * r;

    // Calculate the standard error of the estimate
  const stdError = Math.sqrt(
    regressionData.reduce((sum, d, i) => {
      const estimate = slope * i + intercept;
      return sum + Math.pow(d.close - estimate, 2);
    }, 0) / (n - 2)
  );

  // Only generate channel data for the actual data points
  const channelData = regressionData.map((d, i) => {
    const regressionValue = slope * i + intercept;
    return {
      time: d.time,
      upper: regressionValue + 2 * stdError,
      middle: regressionValue,
      lower: regressionValue - 2 * stdError
    };
  });

  return { channelData, r, rSquared };
};

// Inside the useEffect hook where we add the chart series
useEffect(() => {
    // Check if we have historical data and a valid chart container
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

      // Calculate Heikin-Ashi data
      const heikinAshiData = calculateHeikinAshi(historicalData);

      // Add the Heikin-Ashi candlestick series to the chart
      const heikinAshiSeries = chartRef.current.addCandlestickSeries({
        upColor: '#9c27b0',    // Purple for up candles
        downColor: '#ff9800',  // Orange for down candles
        borderVisible: false,
        wickUpColor: '#9c27b0',
        wickDownColor: '#ff9800',
      } as CandlestickSeriesOptions);

      // Set the Heikin-Ashi data
      heikinAshiSeries.setData(heikinAshiData);

      // Calculate regression channel and statistics
    const { channelData, r, rSquared } = calculateRegressionChannel(historicalData);

    // Add upper channel line
    const upperChannelSeries = chartRef.current.addLineSeries({
      color: 'red',
      lineWidth: 2,
      lineStyle: LineStyle.Dashed,
    });
    upperChannelSeries.setData(channelData.map(d => ({ time: d.time, value: d.upper })));

    // Add middle channel line (regression line)
    const middleChannelSeries = chartRef.current.addLineSeries({
      color: 'blue',
      lineWidth: 1,
      lineStyle: LineStyle.Solid,
    });
    middleChannelSeries.setData(channelData.map(d => ({ time: d.time, value: d.middle })));

    // Add lower channel line
    const lowerChannelSeries = chartRef.current.addLineSeries({
      color: 'red',
      lineWidth: 2,
      lineStyle: LineStyle.Dashed,
    });
    lowerChannelSeries.setData(channelData.map(d => ({ time: d.time, value: d.lower })));

    // Add statistics to the chart using createPriceLine on the lowerChannelSeries
    const lastPoint = channelData[channelData.length - 1];
    lowerChannelSeries.createPriceLine({
      price: lastPoint.lower,
      color: 'red',
      lineWidth: 2,
      lineStyle: LineStyle.Dashed,
      axisLabelVisible: true,
      title: `R: ${r.toFixed(2)}, R²: ${rSquared.toFixed(2)}`,
    });

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

  /**
   * Formats a number to 2 decimal places
   * @param {number} num - The number to format
   * @returns {string} The formatted number
   */
  const formatNumber = (num: number): string => num.toFixed(2);

  /**
   * Determines the CSS class for price change (green for positive, red for negative)
   * @param {number} change - The price change
   * @returns {string} The CSS class name
   */
  const getPriceChangeClass = (change: number): string => 
    change >= 0 ? 'text-green-600' : 'text-red-600';

  // Render the component
  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      {/* Stock symbol and current price */}
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        {stockData.symbol} Quote
      </h2>
      <div className="text-3xl font-bold mb-2">
        ${formatNumber(currentPrice)}
        {/* Display price change and percentage */}
        <span className={`ml-2 text-xl ${getPriceChangeClass(priceChange)}`}>
          {priceChange >= 0 ? '+' : ''}{formatNumber(priceChange)} 
          ({formatNumber(percentageChange)}%)
        </span>
      </div>

      {/* Stock Quote */}
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div>
          <span className="font-semibold">Open:</span> ${formatNumber(stockData.open)}
        </div>
        <div>
          <span className="font-semibold">Previous Close:</span> ${formatNumber(previousClose)}
        </div>
        <div>
          <span className="font-semibold">Day's High:</span> ${formatNumber(stockData.high)}
        </div>
        <div>
          <span className="font-semibold">Day's Low:</span> ${formatNumber(stockData.low)}
        </div>
        <div>
          <span className="font-semibold">Volume:</span> {stockData.volume.toLocaleString()}
        </div>
        <div>
          <span className="font-semibold">Latest Trading Day:</span> {stockData.latestTradingDay}
        </div>
      </div>

      {/* TradingView Widget */}
      <div className="mt-6">
        <TradingViewWidget symbol={`${stockData.symbol}`} />
      </div>

      {/* Mini Chart Widget */}
      <div className="mt-6">
        <h3 className="text-xl font-semibold mb-2">Yearly Mini Chart</h3>
        <MiniChartWidget symbol={stockData.symbol} />
      </div>

      {/* Short Volume Widget */}
      <div className="mt-6">
        <h3 className="text-xl font-semibold mb-2">Yearly Short Volume</h3>
        <ShortVolumeWidget symbol={stockData.symbol} />
      </div>

      {/* Heikin-Ashi Candlestick chart */}
      <div className="mt-6">
        <h3 className="text-xl font-semibold mb-2">Heikin-Ashi Chart with Linear Regression Channel</h3>
        {/* Chart container div, referenced by chartContainerRef */}
        <div ref={chartContainerRef} className="w-full h-[400px]" />
      </div>

      {/* Comprehensive description of the stock quote information and chart */}
      <div className="mt-4 text-sm text-gray-600">
        <h3 className="text-lg font-semibold mb-2">Understanding the Chart and Statistics</h3>
        
        <h4 className="font-semibold mt-3 mb-1">1. Heikin-Ashi Candlesticks:</h4>
        <p>Heikin-Ashi candlesticks help smooth price action and make trends easier to spot:</p>
        <ul className="list-disc pl-5">
          <li><span className="font-semibold">Purple candles:</span> Indicate up trends.</li>
          <li><span className="font-semibold">Orange candles:</span> Indicate down trends.</li>
          <li><span className="font-semibold">Long candles:</span> Suggest strong trends.</li>
          <li><span className="font-semibold">Small candles or doji:</span> May indicate potential reversals.</li>
        </ul>

        <h4 className="font-semibold mt-3 mb-1">2. Linear Regression Channel:</h4>
        <p>The red dashed lines represent the upper and lower bounds of the linear regression channel:</p>
        <ul className="list-disc pl-5">
          <li><span className="font-semibold">Blue middle line:</span> The linear regression line (average trend).</li>
          <li><span className="font-semibold">Channel width:</span> Indicates price volatility.</li>
          <li><span className="font-semibold">Price above upper channel:</span> Potentially overbought.</li>
          <li><span className="font-semibold">Price below lower channel:</span> Potentially oversold.</li>
        </ul>

        <h4 className="font-semibold mt-3 mb-1">3. Regression Statistics:</h4>
        <p>The statistics on the lower channel line provide insights into the strength and reliability of the trend:</p>
        <ul className="list-disc pl-5">
          <li><span className="font-semibold">R (Pearson's R):</span> Measures the linear correlation between time and price. 
            Values range from -1 to 1, where 1 indicates a perfect positive correlation, -1 a perfect negative correlation, 
            and 0 no linear correlation.</li>
          <li><span className="font-semibold">R² (R-squared):</span> The coefficient of determination, represents the proportion 
            of the variance in the price that is predictable from the time. It ranges from 0 to 1, where 1 indicates that 
            the regression line perfectly fits the data.</li>
        </ul>

        <p className="mt-3"><span className="font-semibold">Interpretation:</span></p>
        <ul className="list-disc pl-5">
          <li>R closer to 1 or -1 indicates a stronger trend (positive or negative, respectively).</li>
          <li>Higher R² values suggest that the trend is more consistent and reliable.</li>
          <li>These statistics can be used to compare trend strength between different stocks or time periods.</li>
          <li>The channel provides visual cues for potential support and resistance levels.</li>
        </ul>

        <p className="mt-3"><span className="font-semibold">Note:</span> While these tools provide valuable insights, 
        always use them in conjunction with other forms of analysis for a comprehensive view of market conditions. 
        The Linear Regression Channel is based on historical data and does not predict future price movements with certainty.</p>
      </div>
    </div>
  );
};

// Export the StockQuote component
export default StockQuote;