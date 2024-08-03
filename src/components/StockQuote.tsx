/**
 * StockQuote.tsx
 * This component renders detailed stock quote information, a Heikin-Ashi chart,
 * and linear regression channel lines.
 */

// Import necessary dependencies
import React, { useEffect, useRef } from 'react';
import { createChart, IChartApi, CandlestickSeriesOptions, LineStyle } from 'lightweight-charts';
import { StockData, HistoricalDataPoint } from '../types';
import { CalculatedIndicators } from '../utils/calculateIndicators';

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
 * Displays detailed stock information, a Heikin-Ashi chart, and linear regression channels
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
   * Calculates linear regression channel lines
   * @param {Array<HistoricalDataPoint>} data - Array of historical price data
   * @returns {Object} Object containing upper and lower channel line data
   */
  const calculateRegressionChannels = (data: HistoricalDataPoint[]) => {
    // Extract the last 100 data points or all if less than 100
    const regressionData = data.slice(-100);
    const n = regressionData.length;

    // Calculate the sum of x, y, xy, and x^2
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    regressionData.forEach((d, i) => {
      sumX += i;
      sumY += d.close;
      sumXY += i * d.close;
      sumX2 += i * i;
    });

    // Calculate the slope and y-intercept of the regression line
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Calculate the standard error of the estimate
    const stdError = Math.sqrt(
      regressionData.reduce((sum, d, i) => {
        const estimate = slope * i + intercept;
        return sum + Math.pow(d.close - estimate, 2);
      }, 0) / (n - 2)
    );

    // Generate channel line data
    const channelData = regressionData.map((d, i) => {
      const regressionValue = slope * i + intercept;
      return {
        time: d.time,
        upper: regressionValue + 2 * stdError,
        lower: regressionValue - 2 * stdError
      };
    });

    return channelData;
  };

  // Effect to create and update the chart when historicalData changes
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

      // Calculate and add linear regression channel lines
      const channelData = calculateRegressionChannels(historicalData);

      // Add upper channel line
      const upperChannelSeries = chartRef.current.addLineSeries({
        color: 'red',
        lineWidth: 2,
        lineStyle: LineStyle.Dashed,
      });
      upperChannelSeries.setData(channelData.map(d => ({ time: d.time, value: d.upper })));

      // Add lower channel line
      const lowerChannelSeries = chartRef.current.addLineSeries({
        color: 'red',
        lineWidth: 2,
        lineStyle: LineStyle.Dashed,
      });
      lowerChannelSeries.setData(channelData.map(d => ({ time: d.time, value: d.lower })));

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

      {/* Grid layout for other stock information */}
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

      {/* Candlestick chart */}
      <div className="mt-6">
        <h3 className="text-xl font-semibold mb-2">Heikin-Ashi Chart with Regression Channels</h3>
        {/* Chart container div, referenced by chartContainerRef */}
        <div ref={chartContainerRef} className="w-full h-[400px]" />
      </div>

      {/* Comprehensive description of the stock quote information and chart */}
      <div className="mt-4 text-sm text-gray-600">
        <h3 className="text-lg font-semibold mb-2">Understanding the Chart</h3>
        <p>This chart combines Heikin-Ashi candlesticks with linear regression channels to provide a comprehensive view of price action and trends:</p>

        <h4 className="font-semibold mt-3 mb-1">1. Heikin-Ashi Candlesticks:</h4>
        <p>Heikin-Ashi, meaning "average bar" in Japanese, is a modified candlestick technique that helps smooth price action and make trends easier to spot:</p>
        <ul className="list-disc pl-5">
          <li><span className="font-semibold">Purple candles:</span> Indicate up trends.</li>
          <li><span className="font-semibold">Orange candles:</span> Indicate down trends.</li>
          <li><span className="font-semibold">Long candles:</span> Suggest strong trends.</li>
          <li><span className="font-semibold">Small candles or doji:</span> May indicate potential reversals.</li>
        </ul>

        <h4 className="font-semibold mt-3 mb-1">2. Linear Regression Channels:</h4>
        <p>The red dashed lines represent the upper and lower bounds of the linear regression channel:</p>
        <ul className="list-disc pl-5">
          <li><span className="font-semibold">Channel width:</span> Indicates price volatility.</li>
          <li><span className="font-semibold">Price above upper channel:</span> Potentially overbought.</li>
          <li><span className="font-semibold">Price below lower channel:</span> Potentially oversold.</li>
          <li><span className="font-semibold">Price movement within channel:</span> Suggests normal trading range.</li>
        </ul>

        <p className="mt-3"><span className="font-semibold">Note:</span> While these tools provide valuable insights, always use them in conjunction with other forms of analysis for a comprehensive view of market conditions.</p>
      </div>
    </div>
  );
};

// Export the StockQuote component
export default StockQuote;