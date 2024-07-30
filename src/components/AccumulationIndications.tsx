// Import necessary dependencies from React and lightweight-charts
import React, { useEffect, useRef } from 'react';
import { createChart, IChartApi, ISeriesApi } from 'lightweight-charts';

// Define the structure of historical price and volume data
interface HistoricalData {
  time: string;   // Date of the data point
  open: number;   // Opening price
  high: number;   // Highest price
  low: number;    // Lowest price
  close: number;  // Closing price
  volume: number; // Trading volume
}

// Define the structure of Accumulation/Distribution data points
interface AccumulationDistributionPoint {
  time: string; // Date of the data point
  value: number; // Accumulation/Distribution value
}

// Define the props interface for the AccumulationIndications component
interface AccumulationIndicationsProps {
  historicalData: HistoricalData[]; // Array of historical price and volume data
}

// Define the AccumulationIndications functional component
const AccumulationIndications: React.FC<AccumulationIndicationsProps> = ({ historicalData }) => {
  // Create refs for the chart container, chart instance, and A/D series
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const adSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);

  // useEffect hook to create and update the chart when historicalData changes
  useEffect(() => {
    // Check if we have historical data and a valid chart container
    if (historicalData.length > 0 && chartContainerRef.current) {
      // Calculate Accumulation/Distribution data
      const adData = calculateAccumulationDistribution(historicalData);

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
            vertLines: { visible: false }, // Hide vertical grid lines
            horzLines: { visible: false }, // Hide horizontal grid lines
          },
        });

        // Add the Accumulation/Distribution line series to the chart
        adSeriesRef.current = chartRef.current.addLineSeries({
          color: '#2962FF',
          lineWidth: 2,
        });
      }

      // Set the Accumulation/Distribution data on the series
      if (adSeriesRef.current) {
        adSeriesRef.current.setData(adData);
      }

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

  // Function to calculate Accumulation/Distribution values
  const calculateAccumulationDistribution = (data: HistoricalData[]): AccumulationDistributionPoint[] => {
    let ad = 0; // Initialize Accumulation/Distribution
    return data.map(d => {
      // Calculate the Money Flow Multiplier
      const mfm = ((d.close - d.low) - (d.high - d.close)) / (d.high - d.low);
      // Calculate the Money Flow Volume
      const mfv = mfm * d.volume;
      // Add to the running A/D total
      ad += mfv;
      // Return the A/D data point
      return {
        time: d.time,
        value: ad
      };
    });
  };

  // Render the component
  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        Accumulation/Distribution Indicator
      </h2>
      {/* Chart container div */}
      <div ref={chartContainerRef} className="w-full h-96" />
      {/* Additional information or legend could be added here */}
    </div>
  );
};

// Export the component as the default export
export default AccumulationIndications;