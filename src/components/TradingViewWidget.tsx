import React, { useEffect, useRef, memo } from 'react';

interface TradingViewWidgetProps {
  symbol: string;
}

function TradingViewWidget({ symbol }: TradingViewWidgetProps) {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (container.current) {
      const script = document.createElement("script");
      script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
      script.type = "text/javascript";
      script.async = true;
      script.innerHTML = `
        {
          "autosize": true,
          "symbol": "${symbol}",
          "timezone": "Etc/UTC",
          "theme": "light",
          "style": "1",
          "locale": "en",
          "gridColor": "rgba(255, 255, 255, 0.06)",
          "withdateranges": true,
          "range": "12M",
          "hide_side_toolbar": false,
          "allow_symbol_change": true,
          "watchlist": [
            "NASDAQ:DDOG"
          ],
          "compareSymbols": [
            {
              "symbol": "CME_MINI:NQ1!",
              "position": "NewPriceScale"
            }
          ],
          "details": true,
          "hotlist": true,
          "calendar": false,
          "studies": [
            "STD;MA%Ribbon",
            "STD;Pivot%1Points%1Standard",
            "STD;Time%1Weighted%1Average%1Price",
            "STD;Visible%1Average%1Price"
          ],
          "show_popup_button": true,
          "popup_width": "1000",
          "popup_height": "650",
          "support_host": "https://www.tradingview.com"
        }`;
      container.current.appendChild(script);
    }
  }, [symbol]);

  return (
    <div style={{ height: "100vh" }}>
        <div className="tradingview-widget-container" ref={container} style={{ height: "100%", width: "100%" }}>
            <div className="tradingview-widget-container__widget" style={{ height: "100%", width: "100%" }}></div>
        </div>
    </div>
  );
}

export default memo(TradingViewWidget);