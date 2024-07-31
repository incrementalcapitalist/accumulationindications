# Stock Price and Trading Volume Analysis Dashboard

## Overview

This project is a React-based web application that provides a comprehensive dashboard for stock price and trading volume analysis. It allows users to fetch and display stock quotes and visualize various technical indicators for a given stock symbol. The application uses TypeScript for type safety and Tailwind CSS for styling.

## Features

- Fetch real-time stock quotes
- Display detailed stock information including price, change, volume, etc.
- Visualize multiple technical indicators using TradingView's Lightweight Charts:
  - Heikin-Ashi candlestick chart with price data and Volume Profile overlay
  - On-Balance Volume (OBV)
  - Relative Strength Index (RSI)
  - Moving Average Convergence Divergence (MACD)
  - Average True Range (ATR) with Bollinger Bands and Keltner Channels
  - Fibonacci Retracement with 200-day Simple Moving Average (SMA)
  - Accumulation/Distribution
  - Chaikin Money Flow (CMF)
  - Pivot Points
- Responsive design for various screen sizes
- Centralized data fetching to minimize API calls

## Technologies Used

- React 18
- TypeScript 4
- Vite 4 (for fast development and building)
- TradingView Lightweight Charts
- Tailwind CSS
- Alpha Vantage API (for stock data)

## Project Structure

```
src/
├── components/
│   ├── StockQuote.tsx
│   ├── HeikinAshiVolumeProfile.tsx
│   ├── AccumulationDistribution.tsx
│   ├── OBV.tsx
│   ├── RSI.tsx
│   ├── MACD.tsx
│   ├── ATR.tsx
│   ├── FibonacciRetracement.tsx
│   ├── ChaikinMoneyFlow.tsx
│   └── HeikinAshiPivotPoints.tsx
├── types.ts
├── App.tsx
├── main.tsx
└── index.css
```

## Setup and Installation

1. Clone the repository:
   ```
   git clone https://github.com/your-username/stock-market-analysis-dashboard.git
   cd stock-market-analysis-dashboard
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory and add your Alpha Vantage API key:
   ```
   VITE_ALPHA_VANTAGE_API_KEY=your_api_key_here
   ```

4. Start the development server:
   ```
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:5173` (or the port specified by Vite).

## Usage

The main `App` component manages the overall state of the application, handles user input for stock symbols, fetches stock data from the Alpha Vantage API, and renders the various indicator components based on user selection.

To use a specific component, such as the `HeikinAshiVolumeProfile`:

1. Import the component:
   ```typescript
   import HeikinAshiVolumeProfile from './components/HeikinAshiVolumeProfile';
   ```

2. Use the component in your JSX, passing the required props:
   ```jsx
   <HeikinAshiVolumeProfile historicalData={stockData} />
   ```

   Where `stockData` is an array of `HistoricalDataPoint` objects containing the following properties:
   ```typescript
   interface HistoricalDataPoint {
     time: string;
     open: number;
     high: number;
     low: number;
     close: number;
     volume: number;
   }
   ```

3. The component will render a Heikin-Ashi candlestick chart with a volume profile overlay.

Note: Ensure that you have sufficient historical data for accurate volume profile calculation. The component is optimized for performance, but very large datasets might impact rendering speed.

## Building for Production

To create a production build, run:

```
npm run build
```

This will generate optimized files in the `dist/` directory.

## Technical Indicators

### Heikin-Ashi Candlestick Chart with Volume Profile
This chart combines Heikin-Ashi candlesticks with a volume profile overlay. Heikin-Ashi candles help identify trending periods more easily than standard candlesticks. The volume profile shows the trading volume distribution across different price levels, helping to identify significant support and resistance areas based on trading activity.

### On-Balance Volume (OBV)
OBV is a momentum indicator that uses volume flow to predict changes in stock price. The OBV component displays the OBV line along with a 50-day Exponential Moving Average (EMA) for additional trend confirmation.

### Relative Strength Index (RSI)
RSI is a momentum oscillator that measures the speed and change of price movements. The RSI component includes the main RSI line, a 7-day EMA of the RSI, and overbought/oversold lines at 70 and 30.

### Moving Average Convergence Divergence (MACD)
MACD is a trend-following momentum indicator that shows the relationship between two moving averages of a security's price. The MACD component displays the MACD line, signal line, and histogram.

### Average True Range (ATR)
ATR is a market volatility indicator. The ATR component includes the ATR line along with Keltner Channels and Bollinger Bands for a comprehensive view of price volatility and potential breakout levels.

### Fibonacci Retracement
Fibonacci retracement levels are horizontal lines that indicate where support and resistance are likely to occur. This component combines Fibonacci levels with a 200-day Simple Moving Average (SMA) for additional trend context.

### Accumulation/Distribution
The Accumulation/Distribution indicator assesses the cumulative flow of money into and out of a security. It includes a 20-day Exponential Moving Average (EMA) for trend confirmation.

### Chaikin Money Flow (CMF)
CMF measures the amount of Money Flow Volume over a specific period. The component displays the CMF line along with a 7-day EMA for smoothing.

### Pivot Points
Pivot points are used to determine potential support and resistance levels in price charts. The component calculates pivot points using a 20-period timeframe and displays the last 99 pivot points on the chart.

## Performance Considerations

The volume profile calculation in the `HeikinAshiVolumeProfile` component can be computationally intensive for large datasets. Consider implementing pagination or data windowing for very large historical datasets to maintain optimal performance.

## Testing

Run the test suite with:

```
npm run test
```

For test coverage information:

```
npm run coverage
```

## Linting and Formatting

- Lint the project:
  ```
  npm run lint
  ```

- Format the code:
  ```
  npm run format
  ```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the BSD 3-Clause License. See the LICENSE file for details.

## Acknowledgements

- [Alpha Vantage](https://www.alphavantage.co/) for providing stock market data
- [TradingView](https://www.tradingview.com/lightweight-charts/) for their Lightweight Charts library
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework