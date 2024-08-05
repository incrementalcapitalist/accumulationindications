/**
 * ShortVolumeWidget Component
 * 
 * This component renders a TradingView widget displaying short volume data for a given stock symbol.
 * It dynamically loads the TradingView script and configures the widget based on the provided symbol.
 * 
 * @module ShortVolumeWidget
 */

import React, { useEffect, useRef, memo } from 'react';

/**
 * Props for the ShortVolumeWidget component
 * @interface ShortVolumeWidgetProps
 */
interface ShortVolumeWidgetProps {
  /** The stock symbol to display short volume data for */
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
    // Set the script source to the TradingView widget URL
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js";
    // Set the script type
    script.type = "text/javascript";
    // Make the script load asynchronously
    script.async = true;

    // Define the configuration for the TradingView widget
    const config = {
      symbol: `FINRA:${symbol}_SHORT_VOLUME`, // Set the symbol for short volume data
      width: "100%",                          // Set the width to 100% of the container
      height: "100%",                         // Set the height to 100% of the container
      locale: "en",                           // Set the locale to English
      dateRange: "12M",                       // Set the date range to 12 months
      colorTheme: "light",                    // Set the color theme to light
      isTransparent: false,                   // Set the background to be non-transparent
      autosize: true,                         // Allow the widget to autosize
      largeChartUrl: "",                      // No large chart URL specified
      chartOnly: true,                        // Display only the chart without additional elements
      noTimeScale: true                       // Hide the time scale
    };

    // Set the script's inner HTML to a stringified version of the configuration
    script.innerHTML = JSON.stringify(config);

    // Only append the script if the container exists
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
    <div className="tradingview-widget-container" ref={container} style={{ height: "200px", width: "100%" }}>
      <div className="tradingview-widget-container__widget" style={{ height: "100%", width: "100%" }}></div>
    </div>
  );
}

// Export the memoized version of the component to optimize re-renders
export default memo(ShortVolumeWidget);