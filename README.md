# Stock Price and Trading Volume Analysis Dashboard

## Overview

This project is a React-based web application that provides a comprehensive dashboard for stock price and trading volume analysis. It allows users to fetch and display stock quotes and visualize various technical indicators for a given stock symbol. The application uses TypeScript for type safety and Tailwind CSS for styling.

## Features

- Fetch real-time stock quotes
- Display detailed stock information including price, change, volume, etc.
- Visualize multiple technical indicators using TradingView's Lightweight Charts:
  - Heikin-Ashi candlestick chart with price data
  - On-Balance Volume (OBV)
  - Relative Strength Index (RSI)
  - Moving Average Convergence Divergence (MACD)
  - Average True Range (ATR) with Bollinger Bands and Keltner Channels
  - Fibonacci Retracement with 200-day Simple Moving Average (SMA)
  - Accumulation/Distribution
  - Chaikin Money Flow (CMF)
  - Linear Regression Channel
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
│   ├── AccumulationDistribution.tsx
│   ├── OBV.tsx
│   ├── RSI.tsx
│   ├── MACD.tsx
│   ├── ATR.tsx
│   ├── FibonacciRetracement.tsx
│   ├── ChaikinMoneyFlow.tsx
│   └── LinearRegressionChannel.tsx
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

## Building for Production

To create a production build, run:

```
npm run build
```

This will generate optimized files in the `dist/` directory.

## Technical Indicators

### Heikin-Ashi Candlestick Chart
This chart uses a modified candlestick formula to filter out market noise. Heikin-Ashi candles are calculated using the open, high, low, and close values from the current and previous standard candlesticks. This chart helps identify trending periods more easily than standard candlesticks.

### On-Balance Volume (OBV)
OBV is a momentum indicator that uses volume flow to predict changes in stock price. It adds volume on up days and subtracts volume on down days. The chart includes a 50-day EMA of the OBV for trend confirmation. Divergences between OBV and price can signal potential reversals.

### Relative Strength Index (RSI)
RSI measures the speed and change of price movements, oscillating between 0 and 100. Values above 70 generally indicate overbought conditions, while values below 30 indicate oversold conditions. The chart includes a 7-day EMA of the RSI to smooth out short-term fluctuations.

### Moving Average Convergence Divergence (MACD)
MACD is a trend-following momentum indicator that shows the relationship between two moving averages of a security's price. The MACD line is the 12-day EMA minus the 26-day EMA. The signal line is a 9-day EMA of the MACD line. The histogram represents the difference between the MACD and signal lines. Crossovers, divergences, and rapid rises/falls are used to generate trading signals.

### Average True Range (ATR) with Bollinger Bands and Keltner Channels
ATR measures market volatility by decomposing the entire range of an asset price for that period. Bollinger Bands (orange) and Keltner Channels (grey) are overlaid on the ATR. This combination helps identify periods of high volatility and potential breakouts. Bollinger Bands use standard deviation, while Keltner Channels use ATR, providing different perspectives on volatility.

### Fibonacci Retracement with 200-day SMA
This chart overlays Fibonacci retracement levels on the price chart along with a 200-day Simple Moving Average (SMA). Fibonacci retracement levels (23.6%, 38.2%, 50%, 61.8%, 78.6%) are used to identify potential support and resistance levels. The 200-day SMA helps identify the long-term trend.

### Accumulation/Distribution
This indicator attempts to measure the cumulative flow of money into and out of a security. It assesses whether a stock is being accumulated or distributed based on the close price relative to the high-low range and the trading volume. Divergences with price can signal potential reversals.

### Chaikin Money Flow (CMF)
CMF measures the buying and selling pressure over a chosen period, typically 20 or 21 days. It oscillates above and below zero, with positive values indicating buying pressure and negative values indicating selling pressure. The chart includes a 7-day EMA of the CMF for trend smoothing.

#### CMF vs. Money Flow Index (MFI)
While both CMF and MFI are volume-based indicators, CMF is often preferred when monitoring volume is crucial and sensitivity is paramount:

1. Calculation Method: CMF uses a more straightforward calculation that directly incorporates volume into its formula. This makes it more responsive to volume changes compared to MFI.

2. Sensitivity to Volume: CMF is more sensitive to changes in volume, making it better suited for detecting subtle shifts in buying or selling pressure.

3. Overbought/Oversold Conditions: Unlike MFI, CMF doesn't have fixed overbought/oversold levels. This allows for more nuanced interpretation based on the specific security and market conditions.

4. Trend Confirmation: CMF can be used more effectively to confirm price trends, as it shows a clearer picture of money flow in relation to price movements.

5. Divergence Detection: Due to its higher sensitivity, CMF can often show divergences from price action earlier than MFI, potentially providing earlier signals for trend reversals.

6. Volume Emphasis: CMF places a stronger emphasis on volume in its calculation, making it particularly useful for volume-focused trading strategies.

For traders and analysts who prioritize volume analysis and require a highly sensitive indicator to detect subtle changes in buying and selling pressure, CMF often proves to be a more valuable tool than MFI.

### Linear Regression Channel
This chart displays a linear regression line with parallel channel lines set at a specific distance. It helps identify the overall trend and potential support/resistance levels. Price movements toward the upper or lower channel lines may indicate overbought or oversold conditions, respectively.

## Components

### App.tsx
The main component that:
- Manages the overall state of the application
- Handles user input for stock symbols
- Fetches stock data from the Alpha Vantage API
- Renders the various indicator components based on user selection

### StockQuote.tsx
Displays detailed stock information and a Heikin-Ashi candlestick chart.

### AccumulationDistribution.tsx
Renders a chart showing the accumulation/distribution indicator.

### OBV.tsx
Renders a chart showing the On-Balance Volume indicator with a 50-day EMA.

### RSI.tsx
Renders a chart showing the Relative Strength Index with a 7-day EMA.

### MACD.tsx
Renders a chart showing the Moving Average Convergence Divergence.

### ATR.tsx
Renders a chart showing the Average True Range with Bollinger Bands and Keltner Channels.

### FibonacciRetracement.tsx
Renders Fibonacci retracement levels on the price chart with a 200-day SMA.

### ChaikinMoneyFlow.tsx
Renders a chart showing the Chaikin Money Flow with a 7-day EMA.

### LinearRegressionChannel.tsx
Renders a Heikin-Ashi candlestick chart with a 100-day linear regression channel.

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