/**
 * AIAnalysisArea.tsx
 * This component is responsible for rendering the AI-powered analysis
 * of the stock data based on the selected analysis type.
 */

import React from 'react';
import AIAnalysis from './AIAnalysis';
import { StockData, HistoricalDataPoint } from '../types';

/**
 * Props interface for the AIAnalysisArea component
 * @interface AIAnalysisAreaProps
 */
interface AIAnalysisAreaProps {
  /** The stock symbol */
  symbol: string;
  /** The type of analysis being performed */
  analysisType: string;
  /** Current stock data */
  stockData: StockData;
  /** Historical stock data */
  historicalData: HistoricalDataPoint[];
}

/**
 * AIAnalysisArea Component
 * 
 * @param {AIAnalysisAreaProps} props - The props for this component
 * @returns {JSX.Element} The rendered AIAnalysisArea component
 */
const AIAnalysisArea: React.FC<AIAnalysisAreaProps> = ({
  symbol,
  analysisType,
  stockData,
  historicalData,
}) => (
  // Container for the AI analysis with styling
  <div className="mt-6 bg-white shadow-md rounded-lg p-6">
    {/* Title for the AI analysis section */}
    <h2 className="text-2xl font-bold mb-4 text-gray-800">AI Analysis</h2>
    
    {/* Render the AIAnalysis component */}
    <AIAnalysis
      symbol={symbol}
      analysisType={analysisType}
      data={{
        // Pass the last 10 data points of historical data
        historicalData: historicalData.slice(-100),
        // Pass the current stock data
        stockData: stockData,
      }}
    />
  </div>
);

// Export the AIAnalysisArea component as the default export
export default AIAnalysisArea;