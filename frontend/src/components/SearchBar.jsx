import React, { useState } from 'react';

const SearchBar = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  return (
    <div className="max-w-lg mx-auto bg-white rounded-xl shadow-lg p-8">
      <div className="flex flex-col items-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Find a Home to Suit Your Lifestyle
        </h2>
        <form onSubmit={handleSubmit} className="w-full">
          <div className="relative mb-4">
            <input
              type="text"
              placeholder="Location, Address, or Agent Name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-6 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              aria-label="Search homes or agents"
            />
            <div className="absolute right-0 top-0 mt-3 mr-4">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            disabled={!searchQuery}
          >
            Search
          </button>
        </form>
      </div>
    </div>
  );
};

export default SearchBar;