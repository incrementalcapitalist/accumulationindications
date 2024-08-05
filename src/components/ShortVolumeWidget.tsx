/**
 * ShortVolumeWidget Component
 * 
 * This component renders a TradingView Advanced Chart widget displaying stock price and short volume data
 * for a given stock symbol. It dynamically loads the TradingView script and configures the widget based on
 * the provided symbol.
 * 
 * @module ShortVolumeWidget
 */

import React, { useEffect, useRef, memo } from 'react';

/**
 * Props for the ShortVolumeWidget component
 * @interface ShortVolumeWidgetProps
 */
interface ShortVolumeWidgetProps {
  /** The stock symbol to display data for */
  symbol: string;
}

// Declare the TradingView property on the window object if not already declared
// This helps TypeScript understand that the TradingView object may exist globally
declare global {
  interface Window {
    TradingView?: any;
  }
}

/**
 * ShortVolumeWidget functional component
 * 
 * @param {ShortVolumeWidgetProps} props - The props for the component
 * @returns {React.ReactElement} The rendered ShortVolumeWidget
 */
function ShortVolumeWidget({ symbol }: ShortVolumeWidgetProps): React.ReactElement {
  // Create a ref to hold the container div element
  const container = useRef<HTMLDivElement>(null);

  // Effect hook to load and configure the TradingView widget
  useEffect(() => {
    // Create a new script element
    const script = document.createElement("script");
    
    // Set the script source to the TradingView Advanced Chart widget URL
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    
    // Set the script type
    script.type = "text/javascript";
    
    // Make the script load asynchronously
    script.async = true;

    // Define the configuration for the TradingView widget
    const config = {
      autosize: true,                             // Allow the widget to automatically size
      symbol: `${symbol}`,                        // Set the main symbol for the chart
      interval: "D",                              // Set the interval to daily
      timezone: "Etc/UTC",                        // Set the timezone to UTC
      theme: "light",                             // Set the theme to light
      style: "3",                                 // Set the chart style (3 is usually candlestick)
      locale: "en",                               // Set the locale to English
      gridColor: "rgba(255, 255, 255, 0.06)",     // Set the grid color
      hide_top_toolbar: true,                     // Hide the top toolbar for a cleaner look
      hide_legend: true,                          // Hide the legend
      allow_symbol_change: false,                 // Disallow symbol changes
      save_image: false,                          // Disable saving images
      compareSymbols: [                           // Add the short volume data as a comparison
        {
          symbol: `FINRA:${symbol}_SHORT_VOLUME`,
          position: "NewPane"                     // Place short volume in a new pane
        }
      ],
      calendar: false,                            // Disable the calendar
      hide_volume: true,                          // Hide the volume indicator
      support_host: "https://www.tradingview.com" // Set the support host
    };

    // Set the script's inner HTML to a stringified version of the configuration
    script.innerHTML = JSON.stringify(config);

    // Append the script to the container if it exists
    if (container.current) {
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
      <div className="tradingview-widget-container" ref={container} style={{ height: "100%", width: "100%" }}>
        <div className="tradingview-widget-container__widget" style={{ height: "calc(100% - 32px)", width: "100%" }}></div>
      </div>
    </div>
  );
}

// Export the memoized version of the component to optimize re-renders
export default memo(ShortVolumeWidget);