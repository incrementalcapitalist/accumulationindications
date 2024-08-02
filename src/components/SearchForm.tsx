/**
 * SearchForm.tsx
 * This component renders a form for searching stock symbols and initiating data fetching.
 */

import React from 'react';

/**
 * Props interface for the SearchForm component
 * @interface SearchFormProps
 */
interface SearchFormProps {
  /** The current stock symbol value */
  symbol: string;
  /** Function to update the stock symbol */
  setSymbol: (symbol: string) => void;
  /** Function to handle form submission */
  handleSubmit: (e: React.FormEvent) => void;
  /** Boolean indicating whether data is currently being loaded */
  loading: boolean;
}

/**
 * SearchForm Component
 * 
 * @param {SearchFormProps} props - The props for this component
 * @returns {JSX.Element} The rendered SearchForm component
 */
const SearchForm: React.FC<SearchFormProps> = ({ symbol, setSymbol, handleSubmit, loading }) => (
  // Form container with margin and maximum width
  <form onSubmit={handleSubmit} className="mb-6 max-w-md mx-auto">
    {/* Flex container for input and button */}
    <div className="flex items-center">
      {/* Input field for stock symbol */}
      <input
        type="text"
        value={symbol}
        onChange={(e) => setSymbol(e.target.value.toUpperCase())}
        placeholder="Enter stock symbol (e.g., AAPL)"
        className="flex-grow p-2 border border-blue-500 rounded-bl-md rounded-tl-none focus:ring-2 focus:ring-blue-500 focus:border-transparent h-10"
        aria-label="Stock Symbol"
      />
      {/* Submit button */}
      <button
        type="submit"
        disabled={loading}
        className="bg-blue-500 text-white p-2 rounded-tr-md rounded-br-none hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-200 ease-in-out disabled:opacity-50 h-10 w-28"
      >
        {/* Button text changes based on loading state */}
        {loading ? 'Loading...' : 'Fetch Data'}
      </button>
    </div>
  </form>
);

// Export the SearchForm component as the default export
export default SearchForm;