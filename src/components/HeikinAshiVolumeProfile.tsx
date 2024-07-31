import React, { useEffect, useRef } from 'react';
import { createChart, IChartApi, CandlestickData, HistogramData } from 'lightweight-charts';

// Define the props interface for the HeikinAshiVolumeProfile component
interface HeikinAshiVolumeProfileProps {
  historicalData: {
    time: string;   // Date/time of the data point
    open: number;   // Opening price
    high: number;   // Highest price
    low: number;    // Lowest price
    close: number;  // Closing price
    volume: number; // Trading volume
  }[];
}

// Define the HeikinAshiVolumeProfile functional component
const HeikinAshiVolumeProfile: React.FC<HeikinAshiVolumeProfileProps> = ({ historicalData }) => {
  // Create refs for the chart container and chart instance
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  // useEffect hook to create and update the chart when historicalData changes
  useEffect(() => {
    // Check if we have historical data and a valid chart container
    if (historicalData.length > 0 && chartContainerRef.current) {
      // If the chart doesn't exist, create it
      if (!chartRef.current) {
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

      // Add Heikin-Ashi candlestick series to the chart
      const candlestickSeries = chartRef.current.addCandlestickSeries({
        upColor: '#26a69a',       // Green color for up days
        downColor: '#ef5350',     // Red color for down days
        borderVisible: false,
        wickUpColor: '#26a69a',   // Green color for up wicks
        wickDownColor: '#ef5350', // Red color for down wicks
      });
      // Set the Heikin-Ashi data
      candlestickSeries.setData(heikinAshiData);

      // Calculate and add volume profile
      const volumeProfile = calculateVolumeProfile(historicalData);
      const volumeProfileSeries = chartRef.current.addHistogramSeries({
        color: 'rgba(76, 175, 80, 0.5)',
        priceFormat: {
          type: 'volume',
        },
        priceScaleId: '', // Set to empty string to overlay on the main price scale
      });
      volumeProfileSeries.setData(volumeProfile);

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

  // Function to calculate Heikin-Ashi candles
  const calculateHeikinAshi = (data: typeof historicalData): CandlestickData[] => {
    return data.map((d, i) => {
      const haClose = (d.open + d.high + d.low + d.close) / 4;
      const haOpen = i === 0 ? d.open : (data[i - 1].open + data[i - 1].close) / 2;
      const haHigh = Math.max(d.high, haOpen, haClose);
      const haLow = Math.min(d.low, haOpen, haClose);
      return { time: d.time, open: haOpen, high: haHigh, low: haLow, close: haClose };
    });
  };

  // Function to calculate Volume Profile
  const calculateVolumeProfile = (data: typeof historicalData): HistogramData[] => {
    const volumeProfile: { [price: number]: number } = {};
    const priceStep = 1; // Adjust this value to change the granularity of the volume profile

    data.forEach((d) => {
      const roundedPrice = Math.round(d.close / priceStep) * priceStep;
      volumeProfile[roundedPrice] = (volumeProfile[roundedPrice] || 0) + d.volume;
    });

    return Object.entries(volumeProfile).map(([price, volume]) => ({
      time: data[data.length - 1].time,
      value: parseFloat(price),
      color: 'rgba(76, 175, 80, 0.5)',
      price: parseFloat(price),
      volume: volume,
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