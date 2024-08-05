import React, { useEffect, useRef, memo } from 'react';

interface ShortVolumeWidgetProps {
  symbol: string;
}

function ShortVolumeWidget({ symbol }: ShortVolumeWidgetProps) {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (container.current) {
      const script = document.createElement("script");
      script.src = "https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js";
      script.type = "text/javascript";
      script.async = true;
      script.innerHTML = JSON.stringify({
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
      });

      container.current.appendChild(script);

      // Cleanup function
      return () => {
        if (container.current) {
          container.current.removeChild(script);
        }
      };
    }
  }, [symbol]);

  return (
    <div className="tradingview-widget-container" ref={container} style={{ height: "200px", width: "100%" }}>
      <div className="tradingview-widget-container__widget" style={{ height: "100%", width: "100%" }}></div>
    </div>
  );
}

export default memo(ShortVolumeWidget);