import React, { useEffect, useRef, memo } from 'react';

interface ShortVolumeWidgetProps {
  symbol: string;
}

// Declare the TradingView property on the window object if not already declared
declare global {
  interface Window {
    TradingView?: any;
  }
}

function ShortVolumeWidget({ symbol }: ShortVolumeWidgetProps): React.ReactElement {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js";
    script.type = "text/javascript";
    script.async = true;

    const config = {
      symbol: `FINRA:${symbol}_SHORT_VOLUME`,
      width: "100%",
      height: "100%",
      locale: "en",
      dateRange: "12M",
      colorTheme: "light",
      isTransparent: false,
      autosize: true,
      largeChartUrl: "",
      chartOnly: true,
      noTimeScale: true
    };

    script.innerHTML = JSON.stringify(config);

    // Only append the script if the container exists
    if (container.current) {
      container.current.appendChild(script);
    }

    // Cleanup function
    return () => {
      if (container.current) {
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

      // Safely remove the TradingView object if it exists
      if (window.TradingView) {
        delete window.TradingView;
      }
    };
  }, [symbol]);

  return (
    <div className="tradingview-widget-container" ref={container} style={{ height: "200px", width: "100%" }}>
      <div className="tradingview-widget-container__widget" style={{ height: "100%", width: "100%" }}></div>
    </div>
  );
}

export default memo(ShortVolumeWidget);