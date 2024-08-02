# Stock Price and Trading Volume Analysis Dashboard

## Table of Contents
1. [Overview](#overview)
2. [Features](#features)
3. [Technologies Used](#technologies-used)
4. [Project Structure](#project-structure)
5. [Setup and Installation](#setup-and-installation)
6. [Usage](#usage)
7. [Components](#components)
8. [Hooks](#hooks)
9. [API Integration](#api-integration)
10. [Data Flow](#data-flow)
11. [Styling](#styling)
12. [Performance Considerations](#performance-considerations)
13. [Testing](#testing)
14. [Deployment](#deployment)
15. [Contributing](#contributing)
16. [License](#license)

## Overview

This project is a React-based web application that provides a comprehensive dashboard for stock price and trading volume analysis. It allows users to fetch and display stock quotes, visualize various technical indicators, and perform AI-powered analysis on stock data.

## Features

- Fetch real-time stock quotes
- Display detailed stock information including price, change, volume, etc.
- Visualize multiple technical indicators:
  - Heikin-Ashi candlestick chart with Volume Profile overlay
  - On-Balance Volume (OBV)
  - Relative Strength Index (RSI)
  - Moving Average Convergence Divergence (MACD)
  - Average True Range (ATR) with Bollinger Bands and Keltner Channels
  - Fibonacci Retracement with 200-day Simple Moving Average (SMA)
  - Accumulation/Distribution
  - Chaikin Money Flow (CMF)
  - Historical Volatility
- AI-powered analysis of stock trends and patterns
- Download historical and latest price data as CSV
- Responsive design for various screen sizes
- Centralized data fetching to minimize API calls

## Technologies Used

- React 18
- TypeScript 4
- Vite 4 (for fast development and building)
- TradingView Lightweight Charts
- Tailwind CSS
- Polygon.io API (for stock data)
- OpenAI API (for AI-powered analysis)
- date-fns (for date manipulation)

## Project Structure

```
src/
├── api/
│   └── stockApi.ts
├── components/
│   ├── Header.tsx
│   ├── SearchForm.tsx
│   ├── TabNavigation.tsx
│   ├── ControlButtons.tsx
│   ├── ContentArea.tsx
│   ├── AIAnalysisArea.tsx
│   ├── StockQuote.tsx
│   ├── AccumulationDistribution.tsx
│   ├── OBV.tsx
│   ├── RSI.tsx
│   ├── MACD.tsx
│   ├── ATR.tsx
│   ├── ChaikinMoneyFlow.tsx
│   ├── FibonacciRetracement.tsx
│   ├── HeikinAshiVolumeProfile.tsx
│   ├── HeikinAshiDarvas.tsx
│   └── HistoricalVolatility.tsx
├── hooks/
│   ├── useStockData.ts
│   └── useCSVDownload.ts
├── types.ts
├── App.tsx
└── main.tsx
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

3. Create a `.env` file in the root directory and add your API keys:
   ```
   VITE_POLYGON_API_KEY=your_polygon_api_key_here
   VITE_OPENAI_API_KEY=your_openai_api_key_here
   ```

4. Start the development server:
   ```
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:5173` (or the port specified by Vite).

## Usage

1. Enter a stock symbol (e.g., AAPL for Apple Inc.) in the search bar and click "Fetch Data".
2. The dashboard will display the current stock quote and various technical indicators.
3. Use the tab navigation to switch between different analysis views.
4. Click the "Analyze" button to get AI-powered insights about the stock.
5. Use the "Download" buttons to export data as CSV files.

## Components

### App.tsx
The main component that manages the overall state of the application and composes smaller components to create the full user interface.

### Header.tsx
Renders the main header for the dashboard.

### SearchForm.tsx
Provides an input field for users to enter a stock symbol and initiate data fetching.

### TabNavigation.tsx
Renders a set of tabs for navigating between different analysis views.

### ControlButtons.tsx
Renders buttons for initiating AI analysis and downloading CSV data.

### ContentArea.tsx
Manages the rendering of different analysis components based on the selected tab.

### AIAnalysisArea.tsx
Displays AI-generated insights about the stock data.

... (descriptions for other analysis components)

## Hooks

### useStockData.ts
Custom hook for fetching and managing stock data state.

### useCSVDownload.ts
Custom hook for generating and downloading CSV files of stock data.

## API Integration

The application uses the Polygon.io API to fetch real-time and historical stock data. The `stockApi.ts` file in the `api` folder handles all API calls.

## Data Flow

1. User enters a stock symbol in `SearchForm`.
2. `App` component calls `fetchData` from `useStockData` hook.
3. `stockApi.ts` makes API calls to Polygon.io.
4. Fetched data is stored in `App` component's state.
5. Data is passed down to various child components for rendering and analysis.

## Styling

The project uses Tailwind CSS for styling. Styles are applied using utility classes directly in the JSX.

## Performance Considerations

- The application uses React.memo and useCallback where appropriate to prevent unnecessary re-renders.
- API responses are cached to reduce the number of API calls.
- Large datasets (e.g., for charts) are optimized to maintain smooth performance.

## Testing

Run the test suite with:

```
npm run test
```

For test coverage information:

```
npm run coverage
```

## Deployment

The project is set up for easy deployment on platforms like Vercel, Netlify, or AWS Amplify. Make sure to set the environment variables (API keys) in your deployment platform's settings.

## Linting and Formatting

- Lint the project:
  ```
  npm run lint
  ```

- Format the code:
  ```
  npm run format
  ```

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

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the BSD License. See the [LICENSE](LICENSE) file for details.

## Acknowledgements

- [Alpha Vantage](https://www.alphavantage.co/) for providing stock market data
- [TradingView](https://www.tradingview.com/lightweight-charts/) for their Lightweight Charts library
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework