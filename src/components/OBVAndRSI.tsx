// Import necessary dependencies from React and lightweight-charts
import React, { useEffect, useRef } from 'react';
import { createChart, IChartApi } from 'lightweight-charts';

// Define the props interface for the OBVAndRSI component
interface OBVAndRSIProps {
  historicalData: { 
    time: string; 
    open: number; 
    high: number; 
    low: number; 
    close: number; 
    volume: number 
  }[];
}

// Define the structure for data points (used for both OBV and RSI)
interface DataPoint {
  time: string;
  value: number;
}

// Define the OBVAndRSI functional component
const OBVAndRSI: React.FC<OBVAndRSIProps> = ({ historicalData }) => {
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
          height: 600,
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

      // Calculate OBV and RSI data
      const obvData = calculateOBV(historicalData);
      const rsiData = calculateRSI(historicalData, 14);

      // Add OBV line series
      const obvSeries = chartRef.current.addLineSeries({ 
        color: '#2962FF',
        lineWidth: 2,
        priceScaleId: 'left',
      });
      obvSeries.setData(obvData);

      // Add RSI line series
      const rsiSeries = chartRef.current.addLineSeries({
        color: '#8E24AA',
        lineWidth: 2,
        priceScaleId: 'right',
      });
      rsiSeries.setData(rsiData);

      // Add RSI overbought and oversold level lines
      const overBoughtLine = chartRef.current.addLineSeries({
        color: '#FF0000',
        lineWidth: 1,
        lineStyle: 2, // Dashed line
        priceScaleId: 'right',
      });
      const overSoldLine = chartRef.current.addLineSeries({
        color: '#00FF00',
        lineWidth: 1,
        lineStyle: 2, // Dashed line
        priceScaleId: 'right',
      });

      overBoughtLine.setData(rsiData.map(d => ({ time: d.time, value: 70 })));
      overSoldLine.setData(rsiData.map(d => ({ time: d.time, value: 30 })));

      // Set up price scales
      chartRef.current.priceScale('left').applyOptions({
        scaleMargins: {
          top: 0.3,
          bottom: 0.3,
        },
      });
      chartRef.current.priceScale('right').applyOptions({
        scaleMargins: {
          top: 0.3,
          bottom: 0.3,
        },
      });

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
  const calculateOBV = (data: typeof historicalData): DataPoint[] => {
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
      return { time: d.time, value: obv };
    });
  };

  // Function to calculate Relative Strength Index (RSI)
  const calculateRSI = (data: typeof historicalData, period: number): DataPoint[] => {
    let gains: number[] = [];
    let losses: number[] = [];

    // Calculate price changes and separate into gains and losses
    for (let i = 1; i < data.length; i++) {
      const change = data[i].close - data[i - 1].close;
      gains.push(Math.max(change, 0));
      losses.push(Math.max(-change, 0));
    }

    // Function to calculate Relative Strength
    const calculateRS = (index: number) => {
      const avgGain = gains.slice(index - period, index).reduce((sum, gain) => sum + gain, 0) / period;
      const avgLoss = losses.slice(index - period, index).reduce((sum, loss) => sum + loss, 0) / period;
      return avgLoss !== 0 ? avgGain / avgLoss : 0;
    };

    // Calculate RSI for each data point
    return data.slice(period).map((d, i) => {
      const rs = calculateRS(i + period);
      const rsi = 100 - (100 / (1 + rs));
      return { time: d.time, value: rsi };
    });
  };

  // Render the component
  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        On-Balance Volume (OBV) and RSI
      </h2>
      {/* Chart container div, referenced by chartContainerRef */}
      <div ref={chartContainerRef} className="w-full h-[600px]" />
    </div>
  );
};

// Export the OBVAndRSI component
export default OBVAndRSI;