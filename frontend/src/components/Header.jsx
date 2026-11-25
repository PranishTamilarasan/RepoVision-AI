import React from 'react';
import { Container } from '../components/Container';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <Container className="flex items-center justify-between py-4">
        <div className="flex items-center space-x-6">
          <Link className="text-xl font-bold text-gray-800 hover:text-brand-600 transition-colors">
            RepoVision AI
          </Link>
        </div>
        <nav className="flex items-center space-x-6">
          <Link className="text-gray-600 hover:text-gray-900 transition-colors hover:text-brand-600">
            Home
          </Link>
          <Link className="text-gray-600 hover:text-gray-900 transition-colors hover:text-brand-600">
            Search
          </Link>
          <Link className="text-gray-600 hover:text-gray-900 transition-colors hover:text-brand-600">
            Properties
          </Link>
          <Link className="text-gray-600 hover:text-gray-900 transition-colors hover:text-brand-600">
            About
          </Link>
        </nav>
      </Container>
    </header>
  );
};

export default Header;