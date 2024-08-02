/**
 * HeikinAshiVolumeProfile.tsx
 * This component renders a Heikin-Ashi candlestick chart with a Volume Profile overlay.
 */

// Import necessary dependencies from React and lightweight-charts
import React, { useEffect, useRef } from 'react';
import { createChart, IChartApi, CandlestickData, Time, IPriceScaleApi } from 'lightweight-charts';

// Define the props interface for the HeikinAshiVolumeProfile component
interface HeikinAshiVolumeProfileProps {
  // Historical data points for the stock
  historicalData: {
    time: string;   // Date/time of the data point
    open: number;   // Opening price
    high: number;   // Highest price
    low: number;    // Lowest price
    close: number;  // Closing price
    volume: number; // Trading volume
  }[];
}

// Define the interface for volume profile data points
interface VolumeProfileDataPoint {
  price: number;    // Price level
  vol: number;      // Volume at this price level
}

// Define the interface for volume profile data
interface VolumeProfileData {
  time: Time;                       // Time of the volume profile
  profile: VolumeProfileDataPoint[]; // Array of volume profile data points
  width: number;                    // Width of the volume profile display
}

// Define a custom series for Volume Profile
class VolumeProfileSeries {
  // The chart instance
  private _chart: IChartApi;
  // The data for the Volume Profile
  private _data: VolumeProfileData;
  // The width of the Volume Profile bars
  private _width: number;

  // Constructor for the VolumeProfileSeries
  constructor(chart: IChartApi, data: VolumeProfileData, width: number) {
    this._chart = chart;
    this._data = data;
    this._width = width;
    this._init();
  }

  // Initialize the series
  private _init() {
    // Subscribe to the chart's paint event
    this._chart.subscribeCrosshairMove(this._paintVolumeProfile);
  }

  // Paint the Volume Profile
  private _paintVolumeProfile = () => {
    const paneHeight = this._chart.size.height;
    const priceScale = this._chart.priceScale('right') as IPriceScaleApi;
    const priceRange = priceScale.priceRange();
    if (!priceRange) return;

    // Calculate the maximum volume
    const maxVolume = Math.max(...this._data.profile.map(d => d.vol));

    const ctx = (this._chart.chartElement() as unknown as HTMLCanvasElement).getContext('2d');
    if (!ctx) return;

    // Set the fill style for the Volume Profile bars
    ctx.fillStyle = 'rgba(76, 175, 80, 0.3)';  // Semi-transparent green

    // Draw each bar of the Volume Profile
    this._data.profile.forEach(point => {
      const y = priceScale.priceToCoordinate(point.price);
      const barHeight = paneHeight / this._data.profile.length;
      const barWidth = (point.vol / maxVolume) * this._width;

      // Draw the bar
      if (y !== null) {
        ctx.fillRect(0, y - barHeight / 2, barWidth, barHeight);
      }
    });
  }

  // Update the data for the Volume Profile
  public updateData(data: VolumeProfileData) {
    this._data = data;
    window.requestAnimationFrame(() => this._paintVolumeProfile());
  }
}

// Define the HeikinAshiVolumeProfile functional component
const HeikinAshiVolumeProfile: React.FC<HeikinAshiVolumeProfileProps> = ({ historicalData }) => {
  // Create a ref for the chart container DOM element
  const chartContainerRef = useRef<HTMLDivElement>(null);
  // Create a ref for the chart instance
  const chartRef = useRef<IChartApi | null>(null);

  // useEffect hook to create and update the chart when historicalData changes
  useEffect(() => {
    // Check if we have historical data and a valid chart container
    if (historicalData.length > 0 && chartContainerRef.current) {
      // If the chart doesn't exist, create it
      if (!chartRef.current) {
        // Create a new chart instance
        chartRef.current = createChart(chartContainerRef.current, {
          width: chartContainerRef.current.clientWidth,
          height: 400,
          layout: {
            background: { color: '#ffffff' },
            textColor: '#333',
          },
          grid: {
            vertLines: { visible: false },
            horzLines: { visible: false },
          },
        });
      }

      // Calculate Heikin-Ashi data
      const haData = calculateHeikinAshi(historicalData);

      // Add Heikin-Ashi candlestick series to the chart
      const candlestickSeries = chartRef.current.addCandlestickSeries({
        upColor: '#26a69a',
        downColor: '#ef5350',
        borderVisible: false,
        wickUpColor: '#26a69a',
        wickDownColor: '#ef5350',
      });

      // Set the Heikin-Ashi data
      candlestickSeries.setData(haData);

      // Calculate and add volume profile
      const vpData = calculateVolumeProfile(historicalData);

      // Create and add the Volume Profile series
      new VolumeProfileSeries(chartRef.current, vpData, chartContainerRef.current.clientWidth * 0.15);

      // Fit the chart content to the available space
      chartRef.current.timeScale().fitContent();
    }

    // Cleanup function to remove the chart when the component unmounts
    return () => {
      if (chartRef.current) {
        chartRef.current.remove();
      }
    };
  }, [historicalData]); // This effect runs when historicalData changes

  // Function to calculate Heikin-Ashi data from regular candlestick data
  const calculateHeikinAshi = (data: typeof historicalData): CandlestickData[] => {
    // Return an array of Heikin-Ashi data
    return data.map((d, i, arr) => {
      // Calculate Heikin-Ashi close (average of open, high, low, and close)
      const haClose = (d.open + d.high + d.low + d.close) / 4;
      // Calculate Heikin-Ashi open (average of previous open and close, or current open for first candle)
      const haOpen = i === 0 ? d.open : (arr[i-1].open + arr[i-1].close) / 2;
      // Calculate Heikin-Ashi high (maximum of current high, haOpen, and haClose)
      const haHigh = Math.max(d.high, haOpen, haClose);
      // Calculate Heikin-Ashi low (minimum of current low, haOpen, and haClose)
      const haLow = Math.min(d.low, haOpen, haClose);
      // Return the Heikin-Ashi data point
      return { time: d.time as Time, open: haOpen, high: haHigh, low: haLow, close: haClose };
    });
  };

  // Function to calculate Volume Profile data
  const calculateVolumeProfile = (data: typeof historicalData): VolumeProfileData => {
    // Define the number of price levels for the volume profile
    const pricePoints = 100;
    // Find the minimum and maximum prices in the data
    const minPrice = Math.min(...data.map(d => d.low));
    const maxPrice = Math.max(...data.map(d => d.high));
    // Calculate the price step for each level
    const priceStep = (maxPrice - minPrice) / pricePoints;

    // Initialize the profile array
    const profile: VolumeProfileDataPoint[] = [];
    // Create price levels and initialize volumes to 0
    for (let i = 0; i < pricePoints; i++) {
      profile.push({ price: minPrice + i * priceStep, vol: 0 });
    }

    // Aggregate volume for each price level
    data.forEach(d => {
      // Find the index of the price level for this candle's close price
      const index = Math.floor((d.close - minPrice) / priceStep);
      // If the index is valid, add the volume to that price level
      if (index >= 0 && index < pricePoints) {
        profile[index].vol += d.volume;
      }
    });

    // Return the Volume Profile data
    return {
      time: data[data.length - 1].time as Time, // Use the last data point's time
      profile: profile,
      width: 0.8, // Set the width of the volume profile (adjust as needed)
    };
  };

  // Render the component
  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        Heikin-Ashi with Volume Profile
      </h2>
      {/* Chart container div, referenced by chartContainerRef */}
      <div ref={chartContainerRef} className="w-full h-[400px]" />

      {/* Comprehensive description of Heikin-Ashi and Volume Profile */}
      <div className="mt-4 text-sm text-gray-600">
        <h3 className="text-lg font-semibold mb-2">Understanding Heikin-Ashi and Volume Profile</h3>
        <p>This chart combines Heikin-Ashi candlesticks with a Volume Profile overlay to provide insights into price action and volume distribution.</p>

        <h4 className="font-semibold mt-3 mb-1">Key Components:</h4>
        <ul className="list-disc pl-5">
          <li><span className="font-semibold">Heikin-Ashi Candlesticks:</span> Modified candlesticks that use average price data to filter out market noise.</li>
          <li><span className="font-semibold">Volume Profile:</span> A histogram showing the volume traded at each price level over a specified period.</li>
        </ul>

        <h4 className="font-semibold mt-3 mb-1">Why This Combination Matters:</h4>
        <ol className="list-decimal pl-5">
          <li><span className="font-semibold">Trend Clarity:</span> Heikin-Ashi candlesticks provide a clearer view of the prevailing trend.</li>
          <li><span className="font-semibold">Volume Context:</span> Volume Profile adds context to price movements by showing where most trading activity occurred.</li>
          <li><span className="font-semibold">Support/Resistance Identification:</span> High-volume nodes in the Volume Profile often act as support or resistance levels.</li>
          <li><span className="font-semibold">Breakout Confirmation:</span> Breaks above or below significant volume nodes can confirm breakouts.</li>
        </ol>

        <h4 className="font-semibold mt-3 mb-1">How to Interpret:</h4>
        <ul className="list-disc pl-5">
          <li><span className="font-semibold">Heikin-Ashi Trends:</span> Consecutive green candles suggest an uptrend, while consecutive red candles indicate a downtrend.</li>
          <li><span className="font-semibold">Potential Reversals:</span> Small bodies with long wicks in Heikin-Ashi candles might signal potential reversals.</li>
          <li><span className="font-semibold">Volume Nodes:</span> Areas of high volume in the Volume Profile indicate significant price levels.</li>
          <li><span className="font-semibold">Low Volume Areas:</span> Prices may move quickly through areas of low volume in the profile.</li>
        </ul>
      </div>
    </div>
  );
};

// Export the HeikinAshiVolumeProfile component
export default HeikinAshiVolumeProfile;