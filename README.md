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
  - Linear Regression Channel
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
│   ├── LinearRegressionChannel.tsx
│   └── PivotPoints.tsx
├── types.ts
├── App.tsx
├── main.tsx
└── index.css
```

- `App.tsx`: The main component that handles routing, data fetching, and state management.
- Other components render their respective technical indicators and charts.

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

To use the `HeikinAshiVolumeProfile` component within your application:

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

[... Other indicator descriptions remain the same ...]

### Pivot Points
Pivot points are used to determine potential support and resistance levels in price charts. Our implementation differs slightly from TradingView's built-in pivot point indicator:

- We calculate pivot points for the entire dataset using a 20-period timeframe.
- We display the last 99 pivot points on the chart.

Key parameters:
- "Pivots Timeframe" (20 periods): Determines the sensitivity of the pivot points. A smaller timeframe creates more frequent pivot points, while a larger timeframe creates fewer, more significant pivot points.
- "Number of Pivots Back" (99 pivots): Controls how many historical pivot points are displayed on the chart, providing historical context without overcrowding.

This approach ensures that we always have the most recent 99 pivot points, regardless of the amount of historical data provided. You can easily adjust these values in the `calculatePivotPoints(historicalData, 20, 99)` call within the `useEffect` hook of the `PivotPoints` component.

## Components

### App.tsx
The main component that:
- Manages the overall state of the application
- Handles user input for stock symbols
- Fetches stock data from the Alpha Vantage API
- Renders the various indicator components based on user selection

### HeikinAshiVolumeProfile.tsx
Renders a Heikin-Ashi candlestick chart with a volume profile overlay. This component provides a comprehensive view of price action and volume distribution.

[... Other component descriptions remain the same ...]

## API Integration

This project uses the Alpha Vantage API to fetch stock data. You need to sign up for a free API key at [Alpha Vantage](https://www.alphavantage.co/) and add it to your `.env` file.

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

This project is licensed under the BSD License. See the LICENSE file for details.

## Acknowledgements

- [Alpha Vantage](https://www.alphavantage.co/) for providing stock market data
- [TradingView](https://www.tradingview.com/lightweight-charts/) for their Lightweight Charts library
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework