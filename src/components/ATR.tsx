import React, { useEffect, useRef } from 'react';
import { createChart, IChartApi } from 'lightweight-charts';

interface ATRProps {
  historicalData: { 
    time: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }[];
}

type DataPoint = { time: string; value: number };

const ATR: React.FC<ATRProps> = ({ historicalData }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (historicalData.length > 0 && chartContainerRef.current) {
      if (!chartRef.current) {
        chartRef.current = createChart(chartContainerRef.current, {
          width: chartContainerRef.current.clientWidth,
          height: 400,
          layout: { background: { color: '#ffffff' }, textColor: '#333' },
          grid: { vertLines: { visible: false }, horzLines: { visible: false } },
        });
      }

      try {
        const atrData = calculateATR(historicalData, 14);
        if (atrData.length === 0) {
          console.error("ATR data is empty");
          return;
        }

        const keltnerChannels = calculateKeltnerChannels(atrData, 20, 2);
        const bollingerBands = calculateBollingerBands(atrData, 20, 2);

        const atrSeries = chartRef.current.addLineSeries({ color: '#2962FF', lineWidth: 2 });
        atrSeries.setData(atrData);

        const upperKeltnerSeries = chartRef.current.addLineSeries({ color: 'rgba(128, 128, 128, 0.5)', lineWidth: 1 });
        upperKeltnerSeries.setData(keltnerChannels.upper);

        const lowerKeltnerSeries = chartRef.current.addLineSeries({ color: 'rgba(128, 128, 128, 0.5)', lineWidth: 1 });
        lowerKeltnerSeries.setData(keltnerChannels.lower);

        const upperBollingerSeries = chartRef.current.addLineSeries({ color: 'rgba(255, 165, 0, 0.5)', lineWidth: 1 });
        upperBollingerSeries.setData(bollingerBands.map(d => ({ time: d.time, value: d.upper })));

        const lowerBollingerSeries = chartRef.current.addLineSeries({ color: 'rgba(255, 165, 0, 0.5)', lineWidth: 1 });
        lowerBollingerSeries.setData(bollingerBands.map(d => ({ time: d.time, value: d.lower })));

        chartRef.current.timeScale().fitContent();
      } catch (error) {
        console.error("Error processing ATR data:", error);
      }
    }

    return () => {
      if (chartRef.current) {
        chartRef.current.remove();
      }
    };
  }, [historicalData]);

  const calculateATR = (data: ATRProps['historicalData'], period: number): DataPoint[] => {
    if (data.length < period) {
      console.warn("Not enough data points for ATR calculation");
      return [];
    }

    const trueRanges = data.map((d, i) => {
      if (i === 0) return d.high - d.low;
      const previousClose = data[i - 1].close;
      return Math.max(d.high - d.low, Math.abs(d.high - previousClose), Math.abs(d.low - previousClose));
    });

    let atr = trueRanges.slice(0, period).reduce((sum, tr) => sum + tr, 0) / period;
    return data.slice(period).map((d, i) => {
      atr = ((atr * (period - 1)) + trueRanges[i + period]) / period;
      return { time: d.time, value: atr };
    });
  };

  const calculateEMA = (data: DataPoint[], period: number): DataPoint[] => {
    if (data.length < period) {
      console.warn("Not enough data points for EMA calculation");
      return [];
    }

    const k = 2 / (period + 1);
    let ema = data[0].value;
    return data.map((d, i) => {
      if (i === 0) return d;
      ema = d.value * k + ema * (1 - k);
      return { time: d.time, value: ema };
    });
  };

  const calculateKeltnerChannels = (data: DataPoint[], emaPeriod: number, atrMultiplier: number) => {
    const ema = calculateEMA(data, emaPeriod);
    const atr = calculateATR(data.map(d => ({ ...d, open: d.value, high: d.value, low: d.value, close: d.value, volume: 0 })), emaPeriod);

    if (ema.length === 0 || atr.length === 0) {
      console.warn("Unable to calculate Keltner Channels");
      return { upper: [], lower: [] };
    }

    const upper = ema.map((e, i) => ({
      time: e.time,
      value: e.value + atrMultiplier * (atr[i] ? atr[i].value : 0),
    }));

    const lower = ema.map((e, i) => ({
      time: e.time,
      value: e.value - atrMultiplier * (atr[i] ? atr[i].value : 0),
    }));

    return { upper, lower };
  };

  const calculateBollingerBands = (data: DataPoint[], period: number, stdDev: number) => {
    if (data.length < period) {
      console.warn("Not enough data points for Bollinger Bands calculation");
      return [];
    }

    const sma = data.slice(period - 1).map((d, i) => {
      const sum = data.slice(i, i + period).reduce((acc, cur) => acc + cur.value, 0);
      return { time: d.time, value: sum / period };
    });

    const stdDevData = sma.map((s, i) => {
      const squareDiffs = data.slice(i, i + period).map(d => Math.pow(d.value - s.value, 2));
      const variance = squareDiffs.reduce((acc, cur) => acc + cur, 0) / period;
      return { time: s.time, value: Math.sqrt(variance) };
    });

    return sma.map((s, i) => {
      const deviation = stdDevData[i].value * stdDev;
      return {
        time: s.time,
        upper: s.value + deviation,
        lower: s.value - deviation,
      };
    });
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        ATR with Keltner Channels and Bollinger Bands
      </h2>
      <div ref={chartContainerRef} className="w-full h-[400px]" />
    </div>
  );
};

export default ATR;