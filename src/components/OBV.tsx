import React, { useEffect, useRef } from 'react';
import { createChart, IChartApi } from 'lightweight-charts';

// Define the props interface for the OBV component
interface OBVProps {
  historicalData: { 
    time: string;   // Date/time of the data point
    open: number;   // Opening price
    high: number;   // Highest price
    low: number;    // Lowest price
    close: number;  // Closing price
    volume: number; // Trading volume
  }[];
}

// Define the OBV functional component
const OBV: React.FC<OBVProps> = ({ historicalData }) => {
  // Create refs for the chart container and chart instance
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

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
            vertLines: { color: '#f0f0f0' },
            horzLines: { color: '#f0f0f0' },
          },
        });
      }

      // Calculate OBV data
      const obvData = calculateOBV(historicalData);

      // Add OBV line series to the chart
      const obvSeries = chartRef.current.addLineSeries({
        color: '#2962FF',
        lineWidth: 2,
      });
      obvSeries.setData(obvData);

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

  // Function to calculate On-Balance Volume (OBV)
  const calculateOBV = (data: typeof historicalData) => {
    let obv = 0;
    return data.map((d, i) => {
      if (i === 0) {
        return { time: d.time, value: 0 };
      }
      const previousClose = data[i - 1].close;
      if (d.close > previousClose) {
        obv += d.volume;
      } else if (d.close < previousClose) {
        obv -= d.volume;
      }
      // If close is equal to previousClose, OBV doesn't change
      return { time: d.time, value: obv };
    });
  };

  // Render the component
  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        On-Balance Volume (OBV)
      </h2>
      {/* Chart container div, referenced by chartContainerRef */}
      <div ref={chartContainerRef} className="w-full h-[400px]" />
    </div>
  );
};

export default OBV;