import React, { useState } from "react";
import StockQuote from "./components/StockQuote";
import AccumulationIndications from "./components/AccumulationIndications";

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'stocks' | 'accumulation'>('stocks');

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col sm:py-12">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-8">
            Stock Market Analysis Dashboard
          </h1>
          
          {/* Tab navigation */}
          <div className="flex justify-center mb-6">
            <button
              className={`px-4 py-2 mr-2 rounded-t-lg ${activeTab === 'stocks' ? 'bg-white text-blue-600' : 'bg-gray-200 text-gray-700'}`}
              onClick={() => setActiveTab('stocks')}
            >
              Stock Quotes
            </button>
            <button
              className={`px-4 py-2 rounded-t-lg ${activeTab === 'accumulation' ? 'bg-white text-blue-600' : 'bg-gray-200 text-gray-700'}`}
              onClick={() => setActiveTab('accumulation')}
            >
              Accumulation/Distribution
            </button>
          </div>
          
          {/* Content area */}
          <div className="bg-white shadow-md rounded-lg p-6">
            {activeTab === 'stocks' ? <StockQuote /> : <AccumulationIndications />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;