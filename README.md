# Stock Market Analysis Dashboard

## Overview

This project is a React-based web application that provides a comprehensive dashboard for stock market analysis. It allows users to fetch and display stock quotes and view various technical indicators for a given stock symbol. The application uses TypeScript for type safety and Tailwind CSS for styling.

## Features

- Fetch real-time stock quotes
- Display detailed stock information including price, change, volume, etc.
- Visualize multiple technical indicators using TradingView's Lightweight Charts:
  - On-Balance Volume (OBV)
  - Relative Strength Index (RSI)
  - Moving Average Convergence Divergence (MACD)
  - Average True Range (ATR)
  - Fibonacci Retracement
  - Accumulation/Distribution
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
│   ├── AccumulationIndications.tsx
│   ├── OBV.tsx
│   ├── RSI.tsx
│   ├── MACD.tsx
│   ├── ATR.tsx
│   └── FibonacciRetracement.tsx
├── App.tsx
├── main.tsx
└── index.css
```

- `App.tsx`: The main component that handles routing, data fetching, and state management.
- `StockQuote.tsx`: Displays detailed stock quote information.
- Other components render their respective technical indicators.

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

## Building for Production

To create a production build, run:

```
npm run build
```

This will generate optimized files in the `dist/` directory.

## Components

### App.tsx

The main component that:
- Manages the overall state of the application
- Handles user input for stock symbols
- Fetches stock data from the Alpha Vantage API
- Renders the various indicator components based on user selection

### StockQuote.tsx

Displays detailed stock information including:
- Current price
- Price change and percentage
- Opening price
- Previous close
- Day's high and low
- Trading volume
- Latest trading day

### OBV.tsx

Renders a chart showing the On-Balance Volume indicator:
- Calculates OBV values from historical data
- Provides a visual representation of buying/selling pressure over time

### RSI.tsx

Renders a chart showing the Relative Strength Index:
- Calculates RSI values from historical data
- Displays overbought and oversold levels

### MACD.tsx

Renders a chart showing the Moving Average Convergence Divergence:
- Calculates MACD line, signal line, and histogram
- Provides visual cues for potential buy/sell signals

### ATR.tsx

Renders a chart showing the Average True Range:
- Calculates ATR values from historical data
- Helps in assessing market volatility

### FibonacciRetracement.tsx

Renders Fibonacci retracement levels on the price chart:
- Calculates key Fibonacci levels
- Aids in identifying potential support and resistance levels

### AccumulationIndications.tsx

Renders a chart showing the accumulation/distribution indicator:
- Uses TradingView's Lightweight Charts
- Calculates accumulation/distribution values from historical data
- Provides a visual representation of buying/selling pressure over time

## API Integration

This project uses the Alpha Vantage API to fetch stock data. You need to sign up for a free API key at [Alpha Vantage](https://www.alphavantage.co/) and add it to your `.env` file.

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