import React, { useEffect, useRef } from 'react';
import { createChart, IChartApi, CandlestickData, HistogramData, Time, ISeriesApi, SeriesType } from 'lightweight-charts';

interface HistoricalDataPoint {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface HeikinAshiVolumeProfileProps {
  historicalData: HistoricalDataPoint[];
}

interface VolumeProfileDataPoint {
  price: number;
  vol: number;
}

interface VolumeProfileData {
  time: Time;
  profile: VolumeProfileDataPoint[];
  width: number;
}

class VolumeProfile {
  private _chart: IChartApi;
  private _series: ISeriesApi<SeriesType>;
  private _vpData: VolumeProfileData;
  private _renderer: any;

  constructor(chart: IChartApi, series: ISeriesApi<SeriesType>, vpData: VolumeProfileData) {
    this._chart = chart;
    this._series = series;
    this._vpData = vpData;
    this._renderer = this.createRenderer();
  }

  private createRenderer() {
    return {
      draw: (ctx: CanvasRenderingContext2D) => {
        const timeScale = this._chart.timeScale();
        const priceScale = this._series.priceScale();
        if (!priceScale) return;

        const x = timeScale.timeToCoordinate(this._vpData.time);
        if (x === null) return;

        const maxVolume = Math.max(...this._vpData.profile.map(d => d.vol));
        const width = timeScale.width() * this._vpData.width;

        ctx.fillStyle = 'rgba(76, 175, 80, 0.5)';
        this._vpData.profile.forEach(item => {
          const y = priceScale.priceToCoordinate(item.price);
          if (y === null) return;
          const barHeight = priceScale.height() / this._vpData.profile.length;
          const barWidth = (item.vol / maxVolume) * width;
          ctx.fillRect(x, y - barHeight / 2, barWidth, barHeight);
        });
      }
    };
  }

  public applyOptions() {
    // You can add options here if needed
  }

  public renderer() {
    return this._renderer;
  }
}

const HeikinAshiVolumeProfile: React.FC<HeikinAshiVolumeProfileProps> = ({ historicalData }) => {
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
        });
      }

      const haData = calculateHeikinAshi(historicalData);

      const candlestickSeries = chartRef.current.addCandlestickSeries({
        upColor: '#26a69a',
        downColor: '#ef5350',
        borderVisible: false,
        wickUpColor: '#26a69a',
        wickDownColor: '#ef5350',
      });

      candlestickSeries.setData(haData);

      // Calculate and add volume profile
      const vpData = calculateVolumeProfile(historicalData);
      const volumeProfile = new VolumeProfile(chartRef.current, candlestickSeries, vpData);
      chartRef.current.addCustomSeriesPrimitive(volumeProfile);

      chartRef.current.timeScale().fitContent();
    }

    return () => {
      if (chartRef.current) {
        chartRef.current.remove();
      }
    };
  }, [historicalData]);

  const calculateHeikinAshi = (data: HistoricalDataPoint[]): CandlestickData[] => {
    return data.map((d, i) => {
      const haClose = (d.open + d.high + d.low + d.close) / 4;
      const haOpen = i === 0 ? d.open : (data[i - 1].open + data[i - 1].close) / 2;
      const haHigh = Math.max(d.high, haOpen, haClose);
      const haLow = Math.min(d.low, haOpen, haClose);
      return { time: d.time, open: haOpen, high: haHigh, low: haLow, close: haClose };
    });
  };

  const calculateVolumeProfile = (data: HistoricalDataPoint[]): VolumeProfileData => {
    const pricePoints = 100; // Number of price levels
    const minPrice = Math.min(...data.map(d => d.low));
    const maxPrice = Math.max(...data.map(d => d.high));
    const priceStep = (maxPrice - minPrice) / pricePoints;

    const profile: VolumeProfileDataPoint[] = [];
    for (let i = 0; i < pricePoints; i++) {
      profile.push({ price: minPrice + i * priceStep, vol: 0 });
    }

    data.forEach(d => {
      const index = Math.floor((d.close - minPrice) / priceStep);
      if (index >= 0 && index < pricePoints) {
        profile[index].vol += d.volume;
      }
    });

    return {
      time: data[data.length - 1].time as Time,
      profile: profile,
      width: 0.8, // Adjust this value to change the width of the volume profile
    };
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        Heikin-Ashi with Volume Profile
      </h2>
      <div ref={chartContainerRef} className="w-full h-[400px]" />
    </div>
  );
};

export default HeikinAshiVolumeProfile;