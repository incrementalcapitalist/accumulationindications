/**
 * TradingViewWidget Component
 * 
 * This component renders an advanced TradingView chart widget for a given stock symbol.
 * It dynamically loads the TradingView script and configures the chart based on the provided symbol.
 * 
 * @module TradingViewWidget
 */

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
  autosize: boolean;
  symbol: string;
  timezone: string;
  theme: 'light' | 'dark';
  style: string;
  locale: string;
  gridColor: string;
  withdateranges: boolean;
  range: string;
  hide_side_toolbar: boolean;
  allow_symbol_change: boolean;
  watchlist: string[];
  compareSymbols: Array<{ symbol: string; position: string }>;
  details: boolean;
  hotlist: boolean;
  calendar: boolean;
  studies: string[];
  show_popup_button: boolean;
  popup_width: string;
  popup_height: string;
  support_host: string;
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
        show_popup_button: true,
        popup_width: "1000",
        popup_height: "650",
        support_host: "https://www.tradingview.com"
      };

      // Set the script's inner HTML to a stringified version of the configuration
      script.innerHTML = JSON.stringify(config);

      // Append the script to the container
      container.current.appendChild(script);

      // Cleanup function
      return () => {
        // Check if the container still exists
        if (container.current) {
          // Remove the script from the container
          container.current.removeChild(script);
        }

        // Optionally, you can also remove the TradingView widget if it's been created
        const widgetContainer = container.current.querySelector('.tradingview-widget-container__widget');
        if (widgetContainer) {
          container.current.removeChild(widgetContainer);
        }

        // Remove any global variables or event listeners that TradingView might have added
        if (window.TradingView) {
          delete window.TradingView;
        }
      };
    }
  }, [symbol]); // Re-run the effect when the symbol changes

  // Render the component
  return (
    <div style={{ height: "100vh" }}>
      <div className="tradingview-widget-container" ref={container} style={{ height: "100%", width: "100%" }}>
        <div className="tradingview-widget-container__widget" style={{ height: "100%", width: "100%" }}></div>
      </div>
    </div>
  );
}

// Export the memoized version of the component to optimize re-renders
export default memo(TradingViewWidget);