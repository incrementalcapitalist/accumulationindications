/**
 * AIAnalysis.tsx
 * This component provides AI-powered analysis for various stock indicators.
 */

import React, { useState } from 'react';
import OpenAI from 'openai';
import { marked } from 'marked';

/**
 * Props for the AIAnalysis component
 * @interface AIAnalysisProps
 */
interface AIAnalysisProps {
  /** The stock symbol */
  symbol: string;
  /** The type of analysis to perform */
  analysisType: string;
  /** The data to be analyzed */
  data: any;
}

/**
 * AIAnalysis Component
 * @param {AIAnalysisProps} props - The props for this component
 * @returns {JSX.Element} A React functional component
 */
const AIAnalysis: React.FC<AIAnalysisProps> = ({ symbol, analysisType, data }) => {
  // State for AI analysis
  const [analysis, setAnalysis] = useState<string>('');
  // State for loading indicator
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  /**
   * Analyzes the data using GPT-4
   */
  const analyzeData = async () => {
    setIsAnalyzing(true);
    const openai = new OpenAI({
      apiKey: import.meta.env.VITE_OPENAI_API_KEY,
      dangerouslyAllowBrowser: true
    });

    try {
      // Prepare a comprehensive prompt based on the analysis type
      const prompt = `
        Analyze the following ${analysisType} data for ${symbol}:

        ${JSON.stringify(data, null, 2)}

        Based on this data, please provide:
        
        1. A brief overview of the stock's recent performance
        2. An analysis of the ${analysisType} indicator
        3. Forecast potential future price movements and trends based on the ${analysisType} data and other factors
        4. Estimate confidence levels for predictions and compare the stock's performance to its sector and the overall market
        5. Identify and interpret any patterns or divergences between the price and the ${analysisType} indicator
        6. Assess evidence of bullish or bearish momentum, or mean reversion opportunities and discuss how they matter to a trend or momentum trader
        7. Propose an options trading strategy using the latest available options data (include sources used), with risk management considerations
        8. Identify potential pair trading candidates, analyze their relationship, and suggest strategies
        9. Discuss relevant economic and industry factors impacting the stock's performance and their potential effects
        10. Determine the best option expiration for a trend or momentum strategy and explain your choice
        11. Provide any other relevant observations or findings
        12. Present compelling and convincing arguments against making any trade whatsoever        

        Please format your response using markdown, including headers for each section.
      `;

      const chatCompletion = await openai.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "gpt-4",
      });

      // Set analysis state with AI response
      setAnalysis(chatCompletion.choices[0].message.content || 'No analysis available.');
    } catch (error) {
      console.error('Error analyzing data:', error);
      setAnalysis('Error analyzing data. Please try again later.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="mt-4">
      <button 
        onClick={analyzeData}
        disabled={isAnalyzing}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
      >
        {isAnalyzing ? 'Analyzing...' : 'Analyze Data'}
      </button>

      {isAnalyzing && (
        <div className="mt-4 bg-gray-100 p-4 rounded-md animate-pulse">
          <p>Analyzing data, please wait...</p>
        </div>
      )}

      {analysis && !isAnalyzing && (
        <div className="mt-4 bg-gray-100 p-4 rounded-md">
          <h3 className="text-xl font-semibold mb-2">AI Analysis</h3>
          <div 
            dangerouslySetInnerHTML={{ __html: marked.parse(analysis) }} 
            className="prose max-w-none"
          />
        </div>
      )}
    </div>
  );
};

export default AIAnalysis;