/**
 * AccumulationDistribution.tsx
 * This component renders an Accumulation/Distribution chart with a 20-day EMA overlay.
 * It also includes an explanation of the indicator and AI-powered analysis.
 */

import React, { useEffect, useRef, useState } from 'react'; // Import necessary React hooks
import { createChart, IChartApi, LineStyle } from 'lightweight-charts'; // Import chart creation tools
import OpenAI from 'openai'; // Import OpenAI for AI analysis
import { marked } from 'marked';

/**
 * Props interface for the AccumulationDistribution component
 * @interface AccumulationDistributionProps
 */
interface AccumulationDistributionProps {
  historicalData: { 
    time: string;   // Date/time of the data point
    open: number;   // Opening price
    high: number;   // Highest price
    low: number;    // Lowest price
    close: number;  // Closing price
    volume: number; // Trading volume
  }[];
  stockData?: {  // Make stockData optional
    symbol: string;
  };
}

/**
 * Interface for Accumulation/Distribution data points
 * @interface ADDataPoint
 */
interface ADDataPoint {
  time: string; // Date/time of the data point
  value: number; // Accumulation/Distribution value
}

/**
 * AccumulationDistribution Component
 * @param {AccumulationDistributionProps} props - Component props
 * @returns {JSX.Element} AccumulationDistribution component
 */
// Update the component to handle optional stockData
const AccumulationDistribution: React.FC<AccumulationDistributionProps> = ({ historicalData, stockData }) => {
  // Create refs for the chart container and chart instance
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  // State for AI analysis
  const [analysis, setAnalysis] = useState<string>('');
  
  // State for Accumulation/Distribution data
  const [adData, setAdData] = useState<ADDataPoint[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  /**
   * Calculates Accumulation/Distribution values
   * @param {AccumulationDistributionProps['historicalData']} data - Historical price data
   * @returns {ADDataPoint[]} Array of Accumulation/Distribution data points
   */
  const calculateAccumulationDistribution = (data: AccumulationDistributionProps['historicalData']): ADDataPoint[] => {
    if (data.length === 0) return [];
    let ad = 0;
    return data.map(d => {
      // Calculate the Money Flow Multiplier
      const mfm = ((d.close - d.low) - (d.high - d.close)) / (d.high - d.low);
      // Calculate the Money Flow Volume
      const mfv = mfm * d.volume;
      // Add to the running A/D total
      ad += mfv;
      // Return the A/D data point
      return { time: d.time, value: ad };
    });
  };

  /**
   * Calculates Exponential Moving Average (EMA)
   * @param {ADDataPoint[]} data - Accumulation/Distribution data
   * @param {number} period - EMA period
   * @returns {ADDataPoint[]} Array of EMA data points
   */
  const calculateEMA = (data: ADDataPoint[], period: number): ADDataPoint[] => {
    if (data.length === 0) return [];
    const k = 2 / (period + 1); // Smoothing factor
    let ema = data[0].value; // Initialize EMA with first data point
    
    return data.map((point, i) => {
      if (i < period) {
        // For the first 'period' points, use Simple Moving Average (SMA)
        const sma = data.slice(0, i + 1).reduce((sum, p) => sum + p.value, 0) / (i + 1);
        return { time: point.time, value: sma };
      } else {
        // EMA calculation: (Close - EMA(previous day)) x multiplier + EMA(previous day)
        ema = (point.value - ema) * k + ema;
        return { time: point.time, value: ema };
      }
    });
  };

  /**
   * Analyzes the Accumulation/Distribution data using GPT-4o-mini
   */

  const analyzeData = async () => {
    setIsAnalyzing(true);
    const openai = new OpenAI({
      apiKey: import.meta.env.VITE_OPENAI_API_KEY,
      dangerouslyAllowBrowser: true
    });

    try {
      // Prepare a more comprehensive prompt with historical data
      const prompt = `
        Analyze the following data for ${stockData ? stockData.symbol : 'the stock'}:

        1. Historical price and volume data (last 10 data points):
        ${JSON.stringify(historicalData.slice(-10), null, 2)}

        2. Accumulation/Distribution data (last 10 data points):
        ${JSON.stringify(adData.slice(-10), null, 2)}

        Based on this data, please provide:
        1. A brief overview of the stock's recent performance
        2. An analysis of the Accumulation/Distribution indicator
        3. Potential future movements or trends
        4. Any notable divergences between price and the A/D indicator
        5. Whether there's evidence of bullish momentum or bearish momentum or mean reversion
        6. Whether or not a trend or momentum trader could take advantage of future movements or trends
        7. How a trend or momentum trader could use options to take advantage of anticipated price moves
        8. What option expiration would be most ideal for a trend or momentum trading strategy
        9. Provide confidence levels for all predictions and a brief comparison to sector or market performance, if such data is available.
        10. List relevant economic or industry-specific factors that might influence the stock's performance

        Please format your response using markdown, including headers for each section.
      `;

      const chatCompletion = await openai.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "gpt-4o-mini",
      });

      // Set analysis state with AI response
      setAnalysis(chatCompletion.choices[0].message.content || 'No analysis available.');
    } catch (error) {
      // Handle any errors during API call
      console.error('Error analyzing data:', error);
      setAnalysis('Error analyzing data. Please try again later.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Effect to create and update the chart when historicalData changes
  useEffect(() => {
    if (historicalData.length > 0 && chartContainerRef.current) {
      // Create a new chart if it doesn't exist
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

      // Calculate Accumulation/Distribution data
      const calculatedAdData = calculateAccumulationDistribution(historicalData);
      setAdData(calculatedAdData);

      // Add Accumulation/Distribution line series to the chart
      if (calculatedAdData.length > 0) {
        const adSeries = chartRef.current.addLineSeries({ 
          color: '#2962FF',
          lineWidth: 2,
        });
        adSeries.setData(calculatedAdData);

        // Calculate and add 20-day EMA line series
        const emaData = calculateEMA(calculatedAdData, 20);
        if (emaData.length > 0) {
          const emaSeries = chartRef.current.addLineSeries({
            color: '#FF0000',
            lineWidth: 2,
            lineStyle: LineStyle.Dashed,
          });
          emaSeries.setData(emaData);
        }

      // Fit the chart content to the available space
        chartRef.current.timeScale().fitContent();
      }
    }

    // Cleanup function to remove the chart when the component unmounts
    return () => {
      if (chartRef.current) {
        chartRef.current.remove();
      }
    };
  }, [historicalData]); // This effect runs when historicalData changes

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        Accumulation/Distribution Indicator with 20-day EMA
      </h2>
      {/* Chart container div, referenced by chartContainerRef */}
      {historicalData.length > 0 ? (
        <div ref={chartContainerRef} className="w-full h-[400px]" />
      ) : (
        <p>No data available to display the chart.</p>
      )}

      {/* Explanation of the Accumulation/Distribution indicator */}
      <div className="mt-4 bg-gray-100 p-4 rounded-md">
        <h3 className="text-xl font-semibold mb-2">About Accumulation/Distribution (A/D)</h3>
        <p><strong>What it is:</strong> The A/D indicator measures the cumulative flow of money into and out of a security.</p>
        <p><strong>Why it matters:</strong> It helps identify divergences between price and volume flow, which can signal potential trend reversals or confirm existing trends.</p>
        <p><strong>How it's calculated:</strong> A/D = ((Close - Low) - (High - Close)) / (High - Low) * Volume + Previous A/D</p>
      </div>

      {/* AI Analysis component */}
      {stockData && (
        <AIAnalysis
          symbol={stockData.symbol}
          analysisType="Accumulation/Distribution"
          data={{
            historicalData: historicalData.slice(-10), // Send last 10 data points
            adData: adData.slice(-10) // Send last 10 A/D data points
          }}
        />
      )}
    </div>
  );
};

export default AccumulationDistribution;