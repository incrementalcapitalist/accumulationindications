import React, { useEffect, useRef } from 'react';
import { createChart, IChartApi } from 'lightweight-charts';

// Define the props interface for the MoneyFlow component
interface MoneyFlowProps {
  historicalData: { 
    time: string;   // Date/time of the data point
    open: number;   // Opening price
    high: number;   // Highest price
    low: number;    // Lowest price
    close: number;  // Closing price
    volume: number; // Trading volume
  }[];
}

// Define the MoneyFlow functional component
const MoneyFlow: React.FC<MoneyFlowProps> = ({ historicalData }) => {
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

      // Calculate Money Flow Index (MFI) data
      const mfiData = calculateMFI(historicalData, 14); // 14 is a common period for MFI

      // Add MFI line series to the chart
      const mfiSeries = chartRef.current.addLineSeries({
        color: '#2962FF',
        lineWidth: 2,
        priceScaleId: 'right',
      });
      mfiSeries.setData(mfiData);

      // Add overbought and oversold lines
      const overboughtLine = chartRef.current.addLineSeries({
        color: '#FF0000',
        lineWidth: 1,
        lineStyle: 2, // Dashed line
        priceScaleId: 'right',
      });
      const oversoldLine = chartRef.current.addLineSeries({
        color: '#00FF00',
        lineWidth: 1,
        lineStyle: 2, // Dashed line
        priceScaleId: 'right',
      });

      overboughtLine.setData(mfiData.map(d => ({ time: d.time, value: 80 })));
      oversoldLine.setData(mfiData.map(d => ({ time: d.time, value: 20 })));

      // Set the visible range of values
      chartRef.current.priceScale('right').applyOptions({
        autoScale: false,
        scaleMargins: {
          top: 0.1,
          bottom: 0.1,
        },
      });

      // Manually set the price range to 0-100
      mfiSeries.applyOptions({
        autoscaleInfoProvider: () => ({
          priceRange: {
            minValue: 0,
            maxValue: 100,
          },
        }),
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

  // Function to calculate Money Flow Index (MFI)
  const calculateMFI = (data: typeof historicalData, period: number) => {
    const typicalPrices = data.map(d => (d.high + d.low + d.close) / 3);
    const moneyFlows = typicalPrices.map((tp, i) => tp * data[i].volume);

    let positiveFlow = 0;
    let negativeFlow = 0;
    const mfiData = [];

    for (let i = 1; i < data.length; i++) {
      if (typicalPrices[i] > typicalPrices[i - 1]) {
        positiveFlow += moneyFlows[i];
      } else {
        negativeFlow += moneyFlows[i];
      }

      if (i >= period) {
        if (i > period) {
          const removeIndex = i - period;
          if (typicalPrices[removeIndex] > typicalPrices[removeIndex - 1]) {
            positiveFlow -= moneyFlows[removeIndex];
          } else {
            negativeFlow -= moneyFlows[removeIndex];
          }
        }

        const moneyFlowRatio = positiveFlow / negativeFlow;
        const mfi = 100 - (100 / (1 + moneyFlowRatio));

        mfiData.push({
          time: data[i].time,
          value: mfi
        });
      }
    }

    return mfiData;
  };

  // Render the component
  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        Money Flow Index (MFI)
      </h2>
      {/* Chart container div, referenced by chartContainerRef */}
      <div ref={chartContainerRef} className="w-full h-[400px]" />
    </div>
  );
};

export default MoneyFlow;