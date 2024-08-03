/**
 * TabNavigation.tsx
 * This component renders a set of navigation tabs for different stock analysis views.
 */

import React from 'react';
import { TabType } from '../types';

/**
 * Props interface for the TabNavigation component
 * @interface TabNavigationProps
 */
interface TabNavigationProps {
  /** The currently active tab */
  activeTab: TabType;
  /** Function to set the active tab */
  setActiveTab: (tab: TabType) => void;
}

/**
 * TabNavigation Component
 * 
 * @param {TabNavigationProps} props - The props for this component
 * @returns {JSX.Element} The rendered TabNavigation component
 */
const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, setActiveTab }) => {
  // Define the tabs with their respective types and display texts
  const tabs: [TabType, string][] = [
    ['quote', 'Stock Quote'],
    ['accumulation', 'Accumulation/Distribution'],
    ['obv', 'OBV'],
    ['rsi', 'RSI'],
    ['macd', 'MACD'],
    ['atr', 'ATR'],
    ['cmf', 'CMF'],
    ['fibonacci', 'Fibonacci Retracement'],
    ['heikin-ashi', 'Heikin-Ashi & Anchored VWAP'], // Updated this line
    ['darvas', 'Heikin-Ashi & Darvas Boxes'],
    ['volatility', 'Historical Volatility'],
  ];

  return (
    // Container for the tab buttons with flex layout and center alignment
    <div className="flex flex-wrap justify-center mb-6">
      {/* Map over the tabs array to create button elements */}
      {tabs.map(([tab, displayText]) => (
        <button
          // Use the tab as the key for efficient rendering
          key={tab}
          // Apply different styles based on whether the tab is active
          className={`
            px-4 py-2 m-1 rounded-lg 
            ${activeTab === tab ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'} 
            hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 
            transition duration-200 ease-in-out
          `}
          // Set the active tab when the button is clicked
          onClick={() => setActiveTab(tab)}
        >
          {/* Display text for the tab */}
          {displayText}
        </button>
      ))}
    </div>
  );
};

// Export the TabNavigation component as the default export
export default TabNavigation;