import React, { useState, useEffect, useRef } from 'react';
import { createChart, IChartApi, ISeriesApi } from 'lightweight-charts';

interface PriceVolumeData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface AccumulationDistributionPoint {
  time: string;
  value: number;
}

const AccumulationIndications: React.FC = () => {
  const [symbol, setSymbol] = useState<string>('');
  const [data, setData] = useState<PriceVolumeData[]>([]);
  const [accDistData, setAccDistData] = useState<AccumulationDistributionPoint[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const accDistSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);

  const fetchData = async () => {
    if (!symbol.trim()) {
      setError('Please enter a stock symbol');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${import.meta.env.VITE_ALPHA_VANTAGE_API_KEY}`);
      const result = await response.json();

      if (result['Error Message']) {
        throw new Error(result['Error Message']);
      }

      const timeSeries = result['Time Series (Daily)'];
      if (!timeSeries) {
        throw new Error('No data found for this symbol');
      }

      const formattedData: PriceVolumeData[] = Object.entries(timeSeries).map(([date, values]: [string, any]) => ({
        time: date,
        open: parseFloat(values['1. open']),
        high: parseFloat(values['2. high']),
        low: parseFloat(values['3. low']),
        close: parseFloat(values['4. close']),
        volume: parseFloat(values['5. volume']),
      })).reverse();

      setData(formattedData);
      calculateAccumulationDistribution(formattedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const calculateAccumulationDistribution = (priceVolumeData: PriceVolumeData[]) => {
    let accDist = 0;
    const accDistData: AccumulationDistributionPoint[] = [];

    priceVolumeData.forEach((d) => {
      const moneyFlowMultiplier = ((d.close - d.low) - (d.high - d.close)) / (d.high - d.low);
      const moneyFlowVolume = moneyFlowMultiplier * d.volume;
      accDist += moneyFlowVolume;

      accDistData.push({
        time: d.time,
        value: accDist,
      });
    });

    setAccDistData(accDistData);
  };

  useEffect(() => {
    if (accDistData.length > 0 && chartContainerRef.current) {
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

      if (!accDistSeriesRef.current) {
        accDistSeriesRef.current = chartRef.current.addLineSeries({
          color: '#2962FF',
          lineWidth: 2,
        });
      }

      accDistSeriesRef.current.setData(accDistData);

      chartRef.current.timeScale().fitContent();
    }
  }, [accDistData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData();
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        Accumulation/Distribution Indicator
      </h2>
      <form onSubmit={handleSubmit} className="mb-4">
        <input
          type="text"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value.toUpperCase())}
          placeholder="Enter stock symbol (e.g., AAPL)"
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          aria-label="Stock Symbol"
        />
        <button
          type="submit"
          disabled={loading}
          className="mt-2 w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-200 ease-in-out disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Fetch Data'}
        </button>
      </form>
      {error && (
        <p className="text-red-500 mb-4" role="alert">{error}</p>
      )}
      <div ref={chartContainerRef} className="w-full h-96" />
    </div>
  );
};

export default AccumulationIndications;