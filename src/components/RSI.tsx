import React, { useEffect, useRef } from 'react';
import { createChart, IChartApi, LineStyle } from 'lightweight-charts';

// Define the props interface for the RSI component
interface RSIProps {
  historicalData: { 
    time: string;   // Date/time of the data point
    open: number;   // Opening price
    high: number;   // Highest price
    low: number;    // Lowest price
    close: number;  // Closing price
    volume: number; // Trading volume
  }[];
}

// Define the RSI functional component
const RSI: React.FC<RSIProps> = ({ historicalData }) => {
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

      // Calculate RSI data
      const rsiData = calculateRSI(historicalData, 14); // 14 is the typical period for RSI

      // Add RSI line series to the chart
      const rsiSeries = chartRef.current.addLineSeries({
        color: '#2962FF',
        lineWidth: 2,
      });
      rsiSeries.setData(rsiData);

      // Add overbought and oversold lines
      const overboughtLine = chartRef.current.addLineSeries({
        color: '#FF0000',
        lineWidth: 1,
        lineStyle: LineStyle.Dashed,
      });
      const oversoldLine = chartRef.current.addLineSeries({
        color: '#00FF00',
        lineWidth: 1,
        lineStyle: LineStyle.Dashed,
      });

      overboughtLine.setData(rsiData.map(d => ({ time: d.time, value: 70 })));
      oversoldLine.setData(rsiData.map(d => ({ time: d.time, value: 30 })));

      // Set the visible range of values
      chartRef.current.priceScale('right').applyOptions({
        autoScale: false,
        scaleMargins: {
          top: 0.1,
          bottom: 0.1,
        },
        minValue: 0,
        maxValue: 100,
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

  // Function to calculate Relative Strength Index (RSI)
  const calculateRSI = (data: typeof historicalData, period: number) => {
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
        Relative Strength Index (RSI)
      </h2>
      {/* Chart container div, referenced by chartContainerRef */}
      <div ref={chartContainerRef} className="w-full h-[400px]" />
    </div>
  );
};

export default RSI;