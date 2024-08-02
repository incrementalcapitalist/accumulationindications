/**
 * ContentArea.tsx
 * This component is responsible for rendering the appropriate content
 * based on the active tab in the stock analysis dashboard.
 */

import React from 'react';
import { TabType, StockData, HistoricalDataPoint } from '../types';
import { CalculatedIndicators } from '../utils/calculateIndicators';

// Import all the different analysis components
import StockQuote from './StockQuote';
import AccumulationDistribution from './AccumulationDistribution';
import OBV from './OBV';
import RSI from './RSI';
import MACD from './MACD';
import ATR from './ATR';
import CMF from './ChaikinMoneyFlow';
import FibonacciRetracement from './FibonacciRetracement';
import HeikinAshiVolumeProfile from './HeikinAshiVolumeProfile';
import HeikinAshiDarvas from './HeikinAshiDarvas';
import HistoricalVolatility from './HistoricalVolatility';

/**
 * Props interface for the ContentArea component
 * @interface ContentAreaProps
 */
interface ContentAreaProps {
  /** The currently active tab */
  activeTab: TabType;
  /** Current stock data */
  stockData: StockData;
  /** Historical stock data */
  historicalData: HistoricalDataPoint[];
  indicators: CalculatedIndicators; // Add this line
}

/**
 * ContentArea Component
 * 
 * @param {ContentAreaProps} props - The props for this component
 * @returns {JSX.Element} The rendered ContentArea component
 */
const ContentArea: React.FC<ContentAreaProps> = ({ activeTab, stockData, historicalData, indicators }) => {
  /**
   * Renders the appropriate content based on the active tab
   * @returns {JSX.Element | null} The rendered content component or null
   */
  const renderContent = (): JSX.Element | null => {
    // Use a switch statement to determine which component to render
    switch (activeTab) {
        case 'quote':
          return <StockQuote stockData={stockData} historicalData={historicalData} indicators={indicators} />;
        case 'accumulation':
          return <AccumulationDistribution historicalData={historicalData} indicators={indicators} />;
        case 'obv':
          return <OBV historicalData={historicalData} indicators={indicators} />;
        case 'rsi':
          return <RSI historicalData={historicalData} indicators={indicators} />;
        case 'macd':
          return <MACD historicalData={historicalData} indicators={indicators} />;
      case 'atr':
        return <ATR historicalData={historicalData} indicators={indicators} />;
        case 'cmf':
          return <CMF historicalData={historicalData} indicators={indicators} />;
      case 'fibonacci':
        return <FibonacciRetracement historicalData={historicalData} />;
      case 'heikin-ashi':
        return <HeikinAshiVolumeProfile historicalData={historicalData} />;
      case 'darvas':
        return <HeikinAshiDarvas historicalData={historicalData} />;
      case 'volatility':
        return <HistoricalVolatility historicalData={historicalData} />;
      default:
        // Return null if no matching tab is found
        return null;
    }
  };

  return (
    // Container for the content with styling
    <div className="bg-white shadow-md rounded-lg p-6">
      {/* Render the content based on the active tab */}
      {renderContent()}
    </div>
  );
};

// Export the ContentArea component as the default export
export default ContentArea;