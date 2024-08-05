// Import the API module from aws-amplify
import { API } from 'aws-amplify';

/**
 * Fetches the top tickers in the same industry as the given symbol using a Lambda function
 * 
 * @param {string} symbol - The stock symbol to base the industry search on
 * @returns {Promise<string[]>} A promise that resolves to an array of ticker symbols
 */
export async function fetchTopTickersGroq(symbol: string): Promise<string[]> {
  try {
    // Make a POST request to the Lambda function via API Gateway
    // 'fetchTopTickersApi' is the name of the API in Amplify
    // '/fetchTopTickers' is the path of the Lambda function
    const response = await API.post('fetchTopTickersApi', '/fetchTopTickers', {
      // The request body containing the symbol
      body: { symbol }
    });

    // Return the tickers from the response
    return response.tickers;
  } catch (error) {
    // Log any errors that occur during the API call
    console.error('Error fetching top tickers:', error);
    
    // Return a default array with just the input symbol if an error occurs
    // This ensures the component using this function always receives an array
    return [`NASDAQ:${symbol}`];
  }
}