import React, { useEffect, useRef } from 'react';
import { createChart, IChartApi, CandlestickData, LineData } from 'lightweight-charts';

interface HeikinAshiPivotPointsProps {
  historicalData: {
    time: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }[];
}

const HeikinAshiPivotPoints: React.FC<HeikinAshiPivotPointsProps> = ({ historicalData }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (historicalData.length > 0 && chartContainerRef.current) {
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

      const heikinAshiData = calculateHeikinAshi(historicalData);

      const candlestickSeries = chartRef.current.addCandlestickSeries({
        upColor: '#8A2BE2',
        downColor: '#FFA500',
        borderVisible: false,
        wickUpColor: '#8A2BE2',
        wickDownColor: '#FFA500',
      });
      candlestickSeries.setData(heikinAshiData);

      const pivotPoints = calculatePivotPoints(historicalData, 20, 99);
      const pivotSeries = chartRef.current.addLineSeries({
        color: 'rgba(211, 211, 211, 1)',
        lineWidth: 1,
        title: 'Pivot Points',
      });
      pivotSeries.setData(pivotPoints);

      chartRef.current.timeScale().fitContent();
    }

    return () => {
      if (chartRef.current) {
        chartRef.current.remove();
      }
    };
  }, [historicalData]);

  const calculateHeikinAshi = (data: typeof historicalData): CandlestickData[] => {
    return data.map((d, i) => {
      const haClose = (d.open + d.high + d.low + d.close) / 4;
      const haOpen = i === 0 ? d.open : (data[i - 1].open + data[i - 1].close) / 2;
      const haHigh = Math.max(d.high, haOpen, haClose);
      const haLow = Math.min(d.low, haOpen, haClose);
      return { time: d.time, open: haOpen, high: haHigh, low: haLow, close: haClose };
    });
  };

  const calculatePivotPoints = (
    data: typeof historicalData,
    timeframe: number,
    numPivotsBack: number
  ): LineData[] => {
    const pivots: LineData[] = [];
    for (let i = timeframe; i < data.length; i++) {
      const periodData = data.slice(i - timeframe, i);
      const high = Math.max(...periodData.map(d => d.high));
      const low = Math.min(...periodData.map(d => d.low));
      const close = periodData[periodData.length - 1].close;
      
      const pivot = (high + low + close) / 3;
      pivots.push({ time: data[i].time, value: pivot });
    }

    // Only return the last 'numPivotsBack' pivot points
    return pivots.slice(-numPivotsBack);
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        Heikin-Ashi with Pivot Points
      </h2>
      <div ref={chartContainerRef} className="w-full h-[400px]" />
    </div>
  );
};

export default HeikinAshiPivotPoints;