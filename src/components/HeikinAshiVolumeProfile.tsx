import React, { useEffect, useRef } from 'react';
import { createChart, IChartApi, CandlestickData, Time, ISeriesApi, SeriesType, DataChangedScope, SeriesAttachedParameter } from 'lightweight-charts';

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

abstract class PluginBase {
  protected _chart: IChartApi | undefined = undefined;
  protected _series: ISeriesApi<SeriesType> | undefined = undefined;
  protected dataUpdated?(scope: DataChangedScope): void;
  protected requestUpdate(): void {
    if (this._requestUpdate) this._requestUpdate();
  }
  private _requestUpdate?: () => void;

  public attached({ chart, series, requestUpdate }: SeriesAttachedParameter<Time>) {
    this._chart = chart;
    this._series = series;
    this._series.subscribeDataChanged(this._fireDataUpdated);
    this._requestUpdate = requestUpdate;
    this.requestUpdate();
  }

  public detached() {
    this._series?.unsubscribeDataChanged(this._fireDataUpdated);
    this._chart = undefined;
    this._series = undefined;
    this._requestUpdate = undefined;
  }

  private _fireDataUpdated = (scope: DataChangedScope) => {
    if (this.dataUpdated) {
      this.dataUpdated(scope);
    }
  }

  public abstract updateAllViews(): void;
  public abstract draw(ctx: CanvasRenderingContext2D): void;
}

class VolumeProfile extends PluginBase {
  private _data: VolumeProfileData;

  constructor(data: VolumeProfileData) {
    super();
    this._data = data;
  }

  public updateAllViews(): void {
    this.requestUpdate();
  }

  public draw(ctx: CanvasRenderingContext2D): void {
    if (!this._chart || !this._series) return;

    const timeScale = this._chart.timeScale();
    const visibleRange = timeScale.getVisibleLogicalRange();
    if (visibleRange === null) return;

    const coordinate = timeScale.timeToCoordinate(this._data.time);
    if (coordinate === null) return;

    const maxVolume = Math.max(...this._data.profile.map(d => d.vol));
    const width = this._data.width * (timeScale.width() / (visibleRange.to - visibleRange.from));

    const topPrice = this._series.coordinateToPrice(0);
    const bottomPrice = this._series.coordinateToPrice(ctx.canvas.height);

    if (topPrice === null || bottomPrice === null) return;

    ctx.fillStyle = 'rgba(76, 175, 80, 0.5)';
    this._data.profile.forEach(item => {
      const priceRatio = (item.price - bottomPrice) / (topPrice - bottomPrice);
      const y = ctx.canvas.height - ctx.canvas.height * priceRatio;
      const barHeight = 1; // 1 pixel height for each price level
      const barWidth = (item.vol / maxVolume) * width;
      ctx.fillRect(coordinate, y, barWidth, barHeight);
    });
  }

  public updateData(data: VolumeProfileData): void {
    this._data = data;
    this.updateAllViews();
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
      const volumeProfile = new VolumeProfile(vpData);
      candlestickSeries.attachPrimitive(volumeProfile);

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