import React, { useEffect, useRef } from 'react';
import { createChart, IChartApi, DeepPartial, ChartOptions, CandlestickData } from 'lightweight-charts';

interface AdvancedTechnicalAnalysisProps {
  historicalData: {
    time: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }[];
}

const AdvancedTechnicalAnalysis: React.FC<AdvancedTechnicalAnalysisProps> = ({ historicalData }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (historicalData.length > 0 && chartContainerRef.current) {
      const chartOptions: DeepPartial<ChartOptions> = {
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
      };

      if (!chartRef.current) {
        chartRef.current = createChart(chartContainerRef.current, chartOptions);
      }

      const heikinAshiData = calculateHeikinAshi(historicalData);
      const candlestickSeries = chartRef.current.addCandlestickSeries();
      candlestickSeries.setData(heikinAshiData);

      const ema21Data = calculateEMA(historicalData, 21);
      const emaSeries = chartRef.current.addLineSeries({ color: '#2962FF' });
      emaSeries.setData(ema21Data);

      const { bollingerUpper, bollingerLower } = calculateBollingerBands(historicalData, 20, 2);
      const bbUpperSeries = chartRef.current.addLineSeries({ color: 'rgba(38, 166, 154, 0.5)' });
      const bbLowerSeries = chartRef.current.addLineSeries({ color: 'rgba(239, 83, 80, 0.5)' });
      bbUpperSeries.setData(bollingerUpper);
      bbLowerSeries.setData(bollingerLower);

      const { keltnerUpper, keltnerLower } = calculateKeltnerChannels(historicalData, 20, 10, 1.5);
      const kcUpperSeries = chartRef.current.addLineSeries({ color: 'rgba(255, 152, 0, 0.5)' });
      const kcLowerSeries = chartRef.current.addLineSeries({ color: 'rgba(255, 152, 0, 0.5)' });
      kcUpperSeries.setData(keltnerUpper);
      kcLowerSeries.setData(keltnerLower);

      const { upperChannel, lowerChannel } = calculateLinearRegressionChannel(historicalData, 100);
      const lrUpperSeries = chartRef.current.addLineSeries({ color: 'rgba(156, 39, 176, 0.5)' });
      const lrLowerSeries = chartRef.current.addLineSeries({ color: 'rgba(156, 39, 176, 0.5)' });
      lrUpperSeries.setData(upperChannel);
      lrLowerSeries.setData(lowerChannel);

      chartRef.current.timeScale().fitContent();
    }

    return () => {
      if (chartRef.current) {
        chartRef.current.remove();
      }
    };
  }, [historicalData]);

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

  // Function to calculate EMA
  const calculateEMA = (data: typeof historicalData, period: number) => {
    const k = 2 / (period + 1);
    let ema = data[0].close;
    return data.map(d => {
      ema = d.close * k + ema * (1 - k);
      return { time: d.time, value: ema };
    });
  };

  // Function to calculate Bollinger Bands
  const calculateBollingerBands = (data: typeof historicalData, period: number, stdDev: number) => {
    const sma = data.map((d, i) => {
      if (i < period - 1) return null;
      const sum = data.slice(i - period + 1, i + 1).reduce((acc, cur) => acc + cur.close, 0);
      return sum / period;
    });

    const bollingerUpper = [];
    const bollingerLower = [];

    for (let i = period - 1; i < data.length; i++) {
      const slice = data.slice(i - period + 1, i + 1);
      const avg = sma[i]!;
      const squareDiffs = slice.map(d => Math.pow(d.close - avg, 2));
      const std = Math.sqrt(squareDiffs.reduce((a, b) => a + b) / period);
      bollingerUpper.push({ time: data[i].time, value: avg + stdDev * std });
      bollingerLower.push({ time: data[i].time, value: avg - stdDev * std });
    }

    return { bollingerUpper, bollingerLower };
  };

  // Function to calculate Keltner Channels
  const calculateKeltnerChannels = (data: typeof historicalData, emaPeriod: number, atrPeriod: number, multiplier: number) => {
    const ema = calculateEMA(data, emaPeriod);
    const atr = calculateATR(data, atrPeriod);
    const keltnerUpper = ema.map((d, i) => ({
      time: d.time,
      value: d.value + multiplier * atr[i],
    }));
    const keltnerLower = ema.map((d, i) => ({
      time: d.time,
      value: d.value - multiplier * atr[i],
    }));
    return { keltnerUpper, keltnerLower };
  };

  // Function to calculate ATR
  const calculateATR = (data: typeof historicalData, period: number) => {
    const trueRanges = data.map((d, i) => {
      if (i === 0) return d.high - d.low;
      const prevClose = data[i - 1].close;
      return Math.max(d.high - d.low, Math.abs(d.high - prevClose), Math.abs(d.low - prevClose));
    });

    let atr = trueRanges.slice(0, period).reduce((a, b) => a + b) / period;
    const atrValues = [atr];
    for (let i = period; i < data.length; i++) {
      atr = (atr * (period - 1) + trueRanges[i]) / period;
      atrValues.push(atr);
    }
    return atrValues;
  };

  // Function to calculate Linear Regression Channel
  const calculateLinearRegressionChannel = (data: typeof historicalData, period: number) => {
    const xValues = Array.from({ length: period }, (_, i) => i + 1);
    const xMean = (period + 1) / 2;
    const xSum = xValues.reduce((a, b) => a + b);
    const xSquaredSum = xValues.reduce((a, b) => a + b * b);

    const upperChannel = [];
    const lowerChannel = [];

    for (let i = period - 1; i < data.length; i++) {
      const slice = data.slice(i - period + 1, i + 1);
      const yValues = slice.map(d => d.close);
      const yMean = yValues.reduce((a, b) => a + b) / period;
      const xySum = xValues.reduce((sum, x, j) => sum + x * yValues[j], 0);

      const slope = (xySum - xSum * yMean) / (xSquaredSum - xSum * xMean);
      const intercept = yMean - slope * xMean;

      const prediction = intercept + slope * period;
      const deviations = yValues.map((y, j) => y - (intercept + slope * (j + 1)));
      const standardDeviation = Math.sqrt(deviations.reduce((a, b) => a + b * b) / period);

      upperChannel.push({ time: data[i].time, value: prediction + 2 * standardDeviation });
      lowerChannel.push({ time: data[i].time, value: prediction - 2 * standardDeviation });
    }

    return { upperChannel, lowerChannel };
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        Advanced Technical Analysis
      </h2>
      <div ref={chartContainerRef} className="w-full h-[600px]" />
    </div>
  );
};

export default AdvancedTechnicalAnalysis;