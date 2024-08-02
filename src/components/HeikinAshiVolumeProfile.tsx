/**
 * HeikinAshiVolumeProfile.tsx
 * This component renders a Heikin-Ashi candlestick chart with a Volume Profile overlay.
 */

// Import necessary dependencies
import React, { useEffect, useRef } from 'react';
import { createChart, IChartApi, CandlestickData, Time, ISeriesApi, SeriesType } from 'lightweight-charts';

// ... [Previous interfaces remain the same] ...

// Define a custom series for Volume Profile
class VolumeProfileSeries {
  // The chart instance
  private _chart: IChartApi;
  // The data for the Volume Profile
  private _data: VolumeProfileData;
  // The width of the Volume Profile bars
  private _width: number;

  // Constructor for the VolumeProfileSeries
  constructor(chart: IChartApi, data: VolumeProfileData, width: number) {
    this._chart = chart;
    this._data = data;
    this._width = width;
    this._init();
  }

  // Initialize the series
  private _init() {
    // Subscribe to the chart's paint event
    this._chart.subscribeCrosshairMove(this._paintVolumeProfile);
  }

  // Paint the Volume Profile
  private _paintVolumeProfile = () => {
    // Get the chart's price range
    const paneHeight = this._chart.chartElement().clientHeight;
    const priceRange = this._chart.priceScale('right').priceRange();
    if (!priceRange) return;

    // Calculate the maximum volume
    const maxVolume = Math.max(...this._data.profile.map(d => d.vol));

    // Get the chart's canvas context
    const ctx = this._chart.chartElement().getContext('2d');
    if (!ctx) return;

    // Set the fill style for the Volume Profile bars
    ctx.fillStyle = 'rgba(76, 175, 80, 0.3)';  // Semi-transparent green

    // Draw each bar of the Volume Profile
    this._data.profile.forEach(point => {
      // Calculate the bar's position and dimensions
      const y = this._chart.priceToCoordinate(point.price);
      const barHeight = paneHeight / this._data.profile.length;
      const barWidth = (point.vol / maxVolume) * this._width;

      // Draw the bar
      if (y !== null) {
        ctx.fillRect(0, y - barHeight / 2, barWidth, barHeight);
      }
    });
  }

  // Update the data for the Volume Profile
  public updateData(data: VolumeProfileData) {
    this._data = data;
    this._chart.chartElement().requestAnimationFrame(this._paintVolumeProfile);
  }
}

// Define the HeikinAshiVolumeProfile functional component
const HeikinAshiVolumeProfile: React.FC<HeikinAshiVolumeProfileProps> = ({ historicalData }) => {
  // ... [Previous refs and useEffect setup remain the same] ...

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
      
      // Create and add the Volume Profile series
      new VolumeProfileSeries(chartRef.current, vpData, chartContainerRef.current.clientWidth * 0.15);

      chartRef.current.timeScale().fitContent();
    }

    return () => {
      if (chartRef.current) {
        chartRef.current.remove();
      }
    };
  }, [historicalData]);

  // ... [The rest of the component, including calculation functions and JSX, remains the same] ...

  return (
    // ... [The return statement remains the same] ...
  );
};

export default HeikinAshiVolumeProfile;