import React, { useEffect, useRef } from 'react';
import { createChart, IChartApi, CandlestickData, Time, ISeriesApi, SeriesType, ColorType } from 'lightweight-charts';

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
  private _data: VolumeProfileData;

  constructor(chart: IChartApi, series: ISeriesApi<SeriesType>, data: VolumeProfileData) {
    this._chart = chart;
    this._series = series;
    this._data = data;
    this._drawVolumeProfile();
  }

  private _drawVolumeProfile() {
    const maxVolume = Math.max(...this._data.profile.map(d => d.vol));
    const volumeProfileSeries = this._chart.addHistogramSeries({
      color: 'rgba(76, 175, 80, 0.5)',
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: 'right',
    });

    const volumeProfileData = this._data.profile.map(item => ({
      time: this._data.time,
      value: item.vol,
      color: 'rgba(76, 175, 80, ' + (item.vol / maxVolume).toFixed(2) + ')' as ColorType,
    }));

    volumeProfileSeries.setData(volumeProfileData);
  }

  public updateData(data: VolumeProfileData) {
    this._data = data;
    this._drawVolumeProfile();
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
          rightPriceScale: {
            scaleMargins: {
              top: 0.1,
              bottom: 0.1,
            },
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
      new VolumeProfile(chartRef.current, candlestickSeries, vpData);

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
      width: 10, // This value is not used in the current implementation
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