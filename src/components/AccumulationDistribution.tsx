// Import necessary dependencies from React and lightweight-charts
import React, { useEffect, useRef } from 'react';
import { createChart, IChartApi, LineStyle } from 'lightweight-charts';

// Define the props interface for the AccumulationIndications component
interface AccumulationIndicationsProps {
  historicalData: { 
    time: string; 
    open: number; 
    high: number; 
    low: number; 
    close: number; 
    volume: number 
  }[];
}

// Define the structure for Accumulation/Distribution data points
interface ADDataPoint {
  time: string;
  value: number;
}

// Define the AccumulationIndications functional component
const AccumulationIndications: React.FC<AccumulationIndicationsProps> = ({ historicalData }) => {
  // Create refs for the chart container and chart instance
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  // useEffect hook to create and update the chart when historicalData changes
  useEffect(() => {
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
        });
      }

      // Create the Accumulation/Distribution line series
      const adSeries = chartRef.current.addLineSeries({ 
        color: '#2962FF',
        lineWidth: 2,
      });

      // Calculate and set the A/D data
      const adData = calculateAccumulationDistribution(historicalData);
      adSeries.setData(adData);

      // Create the 20-day EMA line series
      const emaSeries = chartRef.current.addLineSeries({
        color: '#FF0000',
        lineWidth: 2,
        lineStyle: LineStyle.Dashed,
      });

      // Calculate and set the EMA data
      const emaData = calculateEMA(adData, 20);
      emaSeries.setData(emaData);

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
  const calculateAccumulationDistribution = (data: typeof historicalData): ADDataPoint[] => {
    let ad = 0; // Initialize Accumulation/Distribution
    return data.map(d => {
      // Calculate the Money Flow Multiplier
      const mfm = ((d.close - d.low) - (d.high - d.close)) / (d.high - d.low);
      // Calculate the Money Flow Volume
      const mfv = mfm * d.volume;
      // Add to the running A/D total
      ad += mfv;
      // Return the A/D data point
      return { time: d.time, value: ad };
    });
  };

  // Function to calculate Exponential Moving Average (EMA)
  const calculateEMA = (data: ADDataPoint[], period: number): ADDataPoint[] => {
    const k = 2 / (period + 1); // Smoothing factor
    let ema = data[0].value; // Initialize EMA with first data point
    
    return data.map((point, i) => {
      if (i < period) {
        // For the first 'period' points, use Simple Moving Average (SMA)
        const sma = data.slice(0, i + 1).reduce((sum, p) => sum + p.value, 0) / (i + 1);
        return { time: point.time, value: sma };
      } else {
        // EMA calculation: (Close - EMA(previous day)) x multiplier + EMA(previous day)
        ema = (point.value * k) + (ema * (1 - k));
        return { time: point.time, value: ema };
      }
    });
  };

  // Render the component
  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        Accumulation/Distribution Indicator with 20-day EMA
      </h2>
      {/* Chart container div, referenced by chartContainerRef */}
      <div ref={chartContainerRef} className="w-full h-[400px]" />
    </div>
  );
};

// Export the AccumulationIndications component
export default AccumulationIndications;