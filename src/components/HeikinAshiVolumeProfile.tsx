import React, { useEffect, useRef } from 'react';
import { createChart, IChartApi, CandlestickData, HistogramData } from 'lightweight-charts';

/**
 * Represents a data point in the historical price and volume data.
 */
interface HistoricalDataPoint {
  /** The timestamp of the data point */
  time: string;
  /** The opening price */
  open: number;
  /** The highest price */
  high: number;
  /** The lowest price */
  low: number;
  /** The closing price */
  close: number;
  /** The trading volume */
  volume: number;
}

/**
 * Props for the HeikinAshiVolumeProfile component.
 */
interface HeikinAshiVolumeProfileProps {
  /** An array of historical price and volume data */
  historicalData: HistoricalDataPoint[];
}

/**
 * A React component that renders a Heikin-Ashi candlestick chart with a volume profile overlay.
 * 
 * @param props - The component props
 * @returns A React functional component
 */
const HeikinAshiVolumeProfile: React.FC<HeikinAshiVolumeProfileProps> = ({ historicalData }) => {
  /** Reference to the chart container DOM element */
  const chartContainerRef = useRef<HTMLDivElement>(null);
  /** Reference to the chart instance */
  const chartRef = useRef<IChartApi | null>(null);

  // useEffect hook to create and update the chart when historicalData changes
  useEffect(() => {
    // Check if we have historical data and a valid chart container
    if (historicalData.length > 0 && chartContainerRef.current) {
      // If the chart doesn't exist, create it
      if (!chartRef.current) {
        // Create a new chart instance if it doesn't exist
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
          rightPriceScale: {
            borderVisible: false,
          },
          timeScale: {
            borderVisible: false,
          },
        });
      }

      // Calculate Heikin-Ashi data
      const heikinAshiData = calculateHeikinAshi(historicalData);

      // Add candlestick series to the chart
      const candlestickSeries = chartRef.current.addCandlestickSeries({
        upColor: '#8A2BE2',       // Purple color for up days
        downColor: '#FFA500',     // Orange color for down days
        borderVisible: false,
        wickUpColor: '#8A2BE2',   // Purple color for up wicks
        wickDownColor: '#FFA500', // Orange color for down wicks
      });
      candlestickSeries.setData(heikinAshiData);

      // Calculate and add volume profile to the chart
      const volumeProfile = calculateVolumeProfile(historicalData);
      const volumeProfileSeries = chartRef.current.addHistogramSeries({
        color: 'rgba(173, 216, 230, 0.5)',  // Semi-transparent light blue
        priceFormat: {
          type: 'volume',
        },
        priceScaleId: '',  // Set to empty string to overlay on the main price scale
      });
      volumeProfileSeries.setData(volumeProfile);

      // Adjust the chart layout to make room for the volume profile
      chartRef.current.applyOptions({
        rightPriceScale: {
          scaleMargins: {
            top: 0.2,  // This will push the price scale down
            bottom: 0.2,  // This will push the time scale to the right
          },
        },
      });

      // Fit the chart content
      chartRef.current.timeScale().fitContent();
    }

    // Cleanup function to remove the chart when the component unmounts
    return () => {
      if (chartRef.current) {
        chartRef.current.remove();
      }
    };
  }, [historicalData]);

  /**
   * Calculates Heikin-Ashi data from regular candlestick data.
   * 
   * @param data - Array of historical price data
   * @returns Array of Heikin-Ashi candlestick data
   */
  const calculateHeikinAshi = (data: HistoricalDataPoint[]): CandlestickData[] => {
    return data.map((d, i) => {
      const haClose = (d.open + d.high + d.low + d.close) / 4;
      const haOpen = i === 0 ? d.open : (data[i - 1].open + data[i - 1].close) / 2;
      const haHigh = Math.max(d.high, haOpen, haClose);
      const haLow = Math.min(d.low, haOpen, haClose);
      return { time: d.time, open: haOpen, high: haHigh, low: haLow, close: haClose };
    });
  };

  /**
   * Calculates the volume profile from historical price and volume data.
   * 
   * @param data - Array of historical price and volume data
   * @returns Array of histogram data representing the volume profile
   */
  const calculateVolumeProfile = (data: HistoricalDataPoint[]): HistogramData[] => {
    const volumeProfile: { [price: number]: number } = {};
    const priceStep = (Math.max(...data.map(d => d.high)) - Math.min(...data.map(d => d.low))) / 100;  // 100 rows
    data.forEach((d) => {
      const roundedPrice = Math.round(d.close / priceStep) * priceStep;
      volumeProfile[roundedPrice] = (volumeProfile[roundedPrice] || 0) + d.volume;
    });
    return Object.entries(volumeProfile).map(([price, volume]) => ({
      time: data[data.length - 1].time,
      value: volume,  // Changed from price to volume
      color: 'rgba(173, 216, 230, 0.5)',  // Semi-transparent light blue
    }));
  };

  // Render the component
  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        Heikin-Ashi with Volume Profile
      </h2>
      {/* Chart container div, referenced by chartContainerRef */}
      <div ref={chartContainerRef} className="w-full h-[400px]" />
    </div>
  );
};

// Export the HeikinAshiVolumeProfile component
export default HeikinAshiVolumeProfile;