/**
 * Header.tsx
 * This component renders the main header for the Stock Price and Trading Volume Analysis Dashboard.
 */

import React from 'react';

/**
 * Header Component
 * Renders a heading for the dashboard.
 * 
 * @returns {JSX.Element} The rendered Header component
 */
const Header: React.FC = () => (
  // Render an h1 element with styling classes
  <h1 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-8">
    {/* The text content of the header */}
    Stock Price and Trading Volume Analysis Dashboard
  </h1>
);

// Export the Header component as the default export
export default Header;