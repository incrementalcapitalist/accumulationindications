/**
 * TradingViewWidget Component
 * 
 * This component renders an advanced TradingView chart widget for a given stock symbol.
 * It dynamically loads the TradingView script and configures the chart based on the provided symbol.
 * 
 * @module TradingViewWidget
 */

// Import necessary dependencies from React
import React, { useEffect, useRef, memo } from 'react';

/**
 * Props for the TradingViewWidget component
 * @interface TradingViewWidgetProps
 */
interface TradingViewWidgetProps {
  /** The stock symbol to display in the TradingView chart */
  symbol: string;
}

/**
 * Configuration options for the TradingView widget
 * @interface TradingViewConfig
 */
interface TradingViewConfig {
  autosize: boolean;          // Whether the widget should automatically resize
  symbol: string;             // The stock symbol to display
  timezone: string;           // The timezone for the chart
  theme: 'light' | 'dark';    // The color theme of the chart
  style: string;              // The chart style
  locale: string;             // The language locale
  gridColor: string;          // The color of the grid lines
  withdateranges: boolean;    // Whether to show date range selector
  range: string;              // The default time range to display
  hide_side_toolbar: boolean; // Whether to hide the side toolbar
  allow_symbol_change: boolean; // Whether to allow changing the symbol
  watchlist: string[];        // List of symbols to include in the watchlist
  compareSymbols: Array<{ symbol: string; position: string }>; // Symbols to compare
  details: boolean;           // Whether to show details
  hotlist: boolean;           // Whether to show the hotlist
  calendar: boolean;          // Whether to show the calendar
  studies: string[];          // Technical studies to apply to the chart
  studies_overrides: {        // Overrides for specific studies
    [key: string]: boolean | string | number;
  };
  show_popup_button: boolean; // Whether to show the popup button
  popup_width: string;        // Width of the popup
  popup_height: string;       // Height of the popup
  support_host: string;       // The support host URL
}

/**
 * TradingViewWidget functional component
 * 
 * @param {TradingViewWidgetProps} props - The props for the component
 * @returns {React.ReactElement} The rendered TradingView widget
 */
function TradingViewWidget({ symbol }: TradingViewWidgetProps): React.ReactElement {
  // Create a ref to hold the container div element
  const container = useRef<HTMLDivElement>(null);

  // Effect hook to load and configure the TradingView widget
  useEffect(() => {
    // Only proceed if the container ref is available
    if (container.current) {
      // Create a new script element
      const script = document.createElement("script");
      
      // Set the script source to the TradingView widget URL
      script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
      
      // Set the script type
      script.type = "text/javascript";
      
      // Make the script load asynchronously
      script.async = true;

      // Define the configuration for the TradingView widget
      const config: TradingViewConfig = {
        autosize: true,
        symbol: symbol,
        timezone: "Etc/UTC",
        theme: "light",
        style: "1",
        locale: "en",
        gridColor: "rgba(255, 255, 255, 0.06)",
        withdateranges: true,
        range: "12M",
        hide_side_toolbar: false,
        allow_symbol_change: true,
        watchlist: ["NASDAQ:DDOG"],
        compareSymbols: [{ symbol: "CME_MINI:NQ1!", position: "NewPriceScale" }],
        details: true,
        hotlist: true,
        calendar: false,
        studies: [
          "STD;MA%Ribbon",
          "STD;Pivot%1Points%1Standard",
          "STD;Time%1Weighted%1Average%1Price",
          "STD;Visible%1Average%1Price"
        ],
        // Add studies_overrides to customize the Traditional Pivot Points
        studies_overrides: {
            "Traditional Pivot Points.show_P": true,    // Show Pivot (P) level
            "Traditional Pivot Points.show_S1": false,  // Hide S1 level
            "Traditional Pivot Points.show_S2": false,  // Hide S2 level
            "Traditional Pivot Points.show_S3": false,  // Hide S3 level
            "Traditional Pivot Points.show_S4": false,  // Hide S4 level
            "Traditional Pivot Points.show_S5": false,  // Hide S5 level
            "Traditional Pivot Points.show_R1": false,  // Hide R1 level
            "Traditional Pivot Points.show_R2": false,  // Hide R2 level
            "Traditional Pivot Points.show_R3": false,  // Hide R3 level
            "Traditional Pivot Points.show_R4": false,  // Hide R4 level
            "Traditional Pivot Points.show_R5": false,  // Hide R5 level
            "Traditional Pivot Points.color.p": "#FF0000",  // Set Pivot (P) color to red
            "Traditional Pivot Points.linewidth": 2     // Set line width for better visibility
          },
        show_popup_button: true,
        popup_width: "1000",
        popup_height: "650",
        support_host: "https://www.tradingview.com"
      };

      // Set the script's inner HTML to a stringified version of the configuration
      script.innerHTML = JSON.stringify(config);

      // Append the script to the container
      container.current.appendChild(script);
    }

    // Cleanup function to remove the script and widget when the component unmounts
    return () => {
      if (container.current) {
        // Remove the script element if it exists
        const scriptElement = container.current.querySelector('script');
        if (scriptElement) {
          container.current.removeChild(scriptElement);
        }

        // Remove the widget container if it exists
        const widgetContainer = container.current.querySelector('.tradingview-widget-container__widget');
        if (widgetContainer) {
          container.current.removeChild(widgetContainer);
        }
      }

      // Safely remove the TradingView object from the global scope if it exists
      if (window.TradingView) {
        delete window.TradingView;
      }
    };
  }, [symbol]); // Re-run the effect when the symbol changes

  // Render the component
  return (
    <div style={{ height: "100vh" }}>
      {/* Container for the TradingView widget */}
      <div className="tradingview-widget-container" ref={container} style={{ height: "100%", width: "100%" }}>
        {/* Placeholder div for the widget content */}
        <div className="tradingview-widget-container__widget" style={{ height: "100%", width: "100%" }}></div>
      </div>
    </div>
  );
}

// Export the memoized version of the component to optimize re-renders
export default memo(TradingViewWidget);