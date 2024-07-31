import React, { useEffect, useRef, useState, useMemo } from 'react';
import { createChart, IChartApi, CandlestickData, LineStyle, ISeriesApi } from 'lightweight-charts';

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
  const [chart, setChart] = useState<IChartApi | null>(null);
  const [candlestickSeries, setCandlestickSeries] = useState<ISeriesApi<"Candlestick"> | null>(null);
  const [pivotLineSeries, setPivotLineSeries] = useState<ISeriesApi<"Line">[]>([]);

  const [chartDimensions, setChartDimensions] = useState({ width: 0, height: 400 });

  const heikinAshiData = useMemo(() => calculateHeikinAshi(historicalData), [historicalData]);
  const pivotPoints = useMemo(() => calculatePivotPoints(historicalData, 20, 99), [historicalData]);

  useEffect(() => {
    const handleResize = () => {
      if (chartContainerRef.current) {
        setChartDimensions({
          width: chartContainerRef.current.clientWidth,
          height: 400
        });
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    if (!chart) {
      const newChart = createChart(chartContainerRef.current, {
        width: chartDimensions.width,
        height: chartDimensions.height,
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

      setChart(newChart);

      const newCandlestickSeries = newChart.addCandlestickSeries({
        upColor: '#8A2BE2',
        downColor: '#FFA500',
        borderVisible: false,
        wickUpColor: '#8A2BE2',
        wickDownColor: '#FFA500',
      });

      setCandlestickSeries(newCandlestickSeries);
    }

    return () => {
      if (chart) {
        chart.remove();
        setChart(null);
        setCandlestickSeries(null);
        setPivotLineSeries([]);
      }
    };
  }, [chartDimensions]);

  useEffect(() => {
    if (!chart || !candlestickSeries) return;

    chart.applyOptions({ width: chartDimensions.width, height: chartDimensions.height });
    
    candlestickSeries.setData(heikinAshiData);

    // Remove existing pivot lines
    pivotLineSeries.forEach(line => chart.removeSeries(line));
    setPivotLineSeries([]);

    // Add new pivot lines
    const newPivotLines = pivotPoints.map((pivot, index) => {
      const pivotLine = chart.addLineSeries({
        color: `rgba(211, 211, 211, ${1 - index * 0.1})`,
        lineWidth: 1,
        lineStyle: LineStyle.Dotted,
        priceLineVisible: false,
        lastValueVisible: false,
      });

      pivotLine.setData([
        { time: heikinAshiData[0].time, value: pivot.value },
        { time: heikinAshiData[heikinAshiData.length - 1].time, value: pivot.value }
      ]);

      return pivotLine;
    });

    setPivotLineSeries(newPivotLines);

    chart.timeScale().fitContent();
  }, [chart, candlestickSeries, heikinAshiData, pivotPoints, chartDimensions]);

  const calculateHeikinAshi = (data: typeof historicalData): CandlestickData[] => {
    return data.map((d, i) => {
      const haClose = (d.open + d.high + d.low + d.close) / 4;
      const haOpen = i === 0 ? d.open : (data[i - 1].open + data[i - 1].close) / 2;
      const haHigh = Math.max(d.high, haOpen, haClose);
      const haLow = Math.min(d.low, haOpen, haClose);
      return { time: d.time, open: haOpen, high: haHigh, low: haLow, close: haClose };
    });
  };

  /**
   * Calculate Pivot Points
   *
   * @param {typeof historicalData} data - The historical price data
   * @param {number} timeframe - The number of periods used to calculate each pivot point
   * @param {number} numPivotsBack - The number of pivot points to display
   * @returns {LineData[]} The calculated pivot points
   * 
   * Differences between TradingView and Lightweight Charts:
   * TradingView:
   * - "Number of Pivots Back" (99 in this case) determines how many pivot points are displayed on the chart.
   * - "Pivots Timeframe" (20 in this case) determines the period used to calculate each pivot point.
   * Lightweight Charts:
   * - Doesn't have built-in pivot point calculations, so we implement this logic ourselves.
   * - We calculate pivot points for the entire dataset and then limit the displayed points to the last 99.
   * 
   * Why these values matter:
   * - "Pivots Timeframe" (20 periods): This value determines the sensitivity of the pivot points. 
   *   A smaller timeframe will create more frequent pivot points, while a larger timeframe will create fewer, 
   *   more significant pivot points. Using 20 periods provides a balance between short-term fluctuations and longer-term trends.
   * - "Number of Pivots Back" (99 pivots): This value controls how many historical pivot points are displayed on the chart. 
   *   Showing 99 pivot points allows traders to see a significant amount of historical context without overcrowding the chart. 
   *   It's especially useful for identifying longer-term support and resistance levels.
   * 
   * Implementation details:
   * - We calculate pivot points for the entire dataset using the 20-period timeframe.
   * - We then limit the displayed pivot points to the last 99 using the slice method.
   * - This approach ensures that we always have the most recent 99 pivot points, regardless of how much historical data is provided.
   * 
   * The main difference in implementation is that TradingView likely has built-in optimizations for calculating and displaying pivot points, 
   * while in our Lightweight Charts implementation, we're doing these calculations manually. This might be less efficient for very large datasets, 
   * but it gives us more control over the calculation and display of pivot points.
   * 
   * If you want to modify the number of pivot points displayed or the calculation timeframe, you can easily adjust these values 
   * in the calculatePivotPoints(historicalData, 20, 99) call within the useEffect hook.
   */
  const calculatePivotPoints = (
    data: typeof historicalData,
    timeframe: number,
    numPivotsBack: number
  ): { time: string; value: number }[] => {
    const pivots: { time: string; value: number }[] = [];
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
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Heikin-Ashi with Pivot Points</h2>
      <div ref={chartContainerRef} className="w-full h-[400px]" />
    </div>
  );
};

export default HeikinAshiPivotPoints;