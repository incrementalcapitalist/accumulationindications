export interface StockData {
    symbol: string;
    price: number;
    open: number;
    high: number;
    low: number;
    volume: number;
    latestTradingDay: string;
    previousClose: number;
    change: number;
    changePercent: string;
  }