/**
 * ControlButtons.tsx
 * This component renders a set of control buttons for analyzing stock data and downloading CSV files.
 */

import React from 'react';
import { TabType, StockData, HistoricalDataPoint } from '../types';
import { useCSVDownload } from '../hooks/useCSVDownload';

/**
 * Props interface for the ControlButtons component
 * @interface ControlButtonsProps
 */
interface ControlButtonsProps {
  /** The currently active tab */
  activeTab: TabType;
  /** Function to handle the analyze action */
  handleAnalyze: (tab: TabType) => void;
  /** Current stock data */
  stockData: StockData;
  /** Historical stock data */
  historicalData: HistoricalDataPoint[];
}

/**
 * ControlButtons Component
 * 
 * @param {ControlButtonsProps} props - The props for this component
 * @returns {JSX.Element} The rendered ControlButtons component
 */
const ControlButtons: React.FC<ControlButtonsProps> = ({
  activeTab,
  handleAnalyze,
  stockData,
  historicalData,
}) => {
  // Use the custom hook for CSV download functionality
  const { downloadCSV, downloadLatestPriceCSV } = useCSVDownload(stockData, historicalData);

  return (
    // Container for the control buttons with flex layout and spacing
    <div className="flex justify-center items-center space-x-4 mb-6">
      {/* Analyze button */}
      <button
        onClick={() => handleAnalyze(activeTab)}
        className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition duration-200 ease-in-out"
      >
        Analyze {activeTab}
      </button>

      {/* Download Historical Data button */}
      <button
        onClick={downloadCSV}
        className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition duration-200 ease-in-out"
      >
        Download Historical Data (CSV)
      </button>

      {/* Download Latest Price button */}
      <button
        onClick={downloadLatestPriceCSV}
        className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50 transition duration-200 ease-in-out"
      >
        Download Latest Price (CSV)
      </button>
    </div>
  );
};

// Export the ControlButtons component as the default export
export default ControlButtons;