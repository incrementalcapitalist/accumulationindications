/**
 * App.tsx
 * This is the main component for the Stock Price and Trading Volume Analysis Dashboard.
 * It manages the overall state of the application and composes smaller components
 * to create the full user interface.
 */

import React, { useState } from 'react';
import Header from './components/Header';
import SearchForm from './components/SearchForm';
import TabNavigation from './components/TabNavigation';
import ControlButtons from './components/ControlButtons';
import ContentArea from './components/ContentArea';
import AIAnalysisArea from './components/AIAnalysisArea';
import { useStockData } from './hooks/useStockData';
import { TabType } from './types';

/**
 * App Component
 * @returns {JSX.Element} The rendered App component
 */
const App: React.FC = () => {
  // State hook for managing the stock symbol entered by the user
  const [symbol, setSymbol] = useState<string>('');

  // State hook for managing the currently active tab
  const [activeTab, setActiveTab] = useState<TabType>('quote');

  // State hook for managing the type of analysis being performed
  const [analysisType, setAnalysisType] = useState<string>('');

  // Custom hook for managing stock data fetching and state
  const { stockData, historicalData, loading, error, fetchData } = useStockData(symbol);

  /**
   * Handles the form submission event
   * @param {React.FormEvent} e - The form submission event
   */
  const handleSubmit = (e: React.FormEvent) => {
    // Prevent the default form submission behavior
    e.preventDefault();
    // Trigger the data fetching process
    fetchData();
  };

  /**
   * Handles the analyze button click event
   * @param {TabType} tabType - The type of tab/analysis to perform
   */
  const handleAnalyze = (tabType: TabType) => {
    // Set the analysis type based on the current active tab
    setAnalysisType(tabType);
  };

  // Render the component
  return (
    // Main container with full height, gray background, and centered content
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center items-center sm:py-12">
      {/* Content wrapper with responsive padding and maximum width */}
      <div className="px-4 sm:px-6 lg:px-8 w-full max-w-6xl">
        {/* Render the header component */}
        <Header />

        {/* Render the search form component */}
        <SearchForm
          symbol={symbol}
          setSymbol={setSymbol}
          handleSubmit={handleSubmit}
          loading={loading}
        />

        {/* Display error message if there's an error */}
        {error && <p className="text-red-500 mb-4 text-center" role="alert">{error}</p>}

        {/* Render the rest of the components if stock data is available */}
        {stockData && (
          <>
            {/* Render the tab navigation component */}
            <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

            {/* Render the control buttons component */}
            <ControlButtons
              activeTab={activeTab}
              handleAnalyze={handleAnalyze}
              stockData={stockData}
              historicalData={historicalData}
            />

            {/* Render the main content area component */}
            <ContentArea
              activeTab={activeTab}
              stockData={stockData}
              historicalData={historicalData}
            />

            {/* Render the AI analysis area if an analysis type is selected */}
            {analysisType && (
              <AIAnalysisArea
                symbol={stockData.symbol}
                analysisType={analysisType}
                stockData={stockData}
                historicalData={historicalData}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

// Export the App component as the default export
export default App;