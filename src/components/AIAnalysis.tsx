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
        3. Potential future movements or trends
        4. Any notable patterns or divergences
        5. Whether there's evidence of bullish or bearish momentum
        6. How a trader could potentially use this information
        7. Relevant economic or industry-specific factors that might influence the stock's performance

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