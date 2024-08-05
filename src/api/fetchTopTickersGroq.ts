/**
 * This module contains the function to fetch top tickers in the same industry
 * using the Groq API.
 * 
 * @module fetchTopTickersGroq
 */

import { Groq } from 'groq-sdk';

/**
 * Fetches the top ten most active tickers in the same industry as the given symbol
 * 
 * @param {string} symbol - The stock symbol to base the industry on
 * @returns {Promise<string[]>} A promise that resolves to an array of ticker symbols with exchanges
 */
export async function fetchTopTickersGroq(symbol: string): Promise<string[]> {
  try {
    // Initialize Groq client
    const groq = new Groq({
      apiKey: import.meta.env.VITE_GROQ_API_KEY
    });

    // Ensure the API key is set
    if (!import.meta.env.VITE_GROQ_API_KEY) {
      throw new Error('Groq API key is not set');
    }

    // Make the API call to Groq
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "provide a comma separated list of the top ten most active tickers in the same industry as the ticker provided and their corresponding exchanges.\n\nprovide only the comma-separated list.\n\nuse the exchange symbol only. \n\nthe exchange symbol must be compatible with TradingView.\n\nmake sure that each pair is enclosed in quotes and there is no space between the exchange, the colon, and the ticker.\n\nfor example, \"NASDAQ:DDOG\",\"NASDDAQ:GERN\", ..."
        },
        {
          role: "user",
          content: symbol
        }
      ],
      model: "llama3-8b-8192",
      temperature: 1,
      max_tokens: 1024,
      top_p: 1,
      stream: false,
      stop: null
    });

    // Extract the content from the response
    const content = chatCompletion.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No content received from Groq');
    }

    // Parse the comma-separated list into an array
    const tickers = content.split(',').map(ticker => ticker.trim());

    // Ensure the original symbol is included
    if (!tickers.includes(symbol)) {
      tickers.unshift(`${symbol}`); // Assuming NASDAQ, adjust if needed
    }

    return tickers;
  } catch (error) {
    console.error('Error fetching top tickers with Groq:', error);
    // Return a default list including the original symbol in case of an error
    return [`NASDAQ:${symbol}`]; // Assuming NASDAQ, adjust if needed
  }
}