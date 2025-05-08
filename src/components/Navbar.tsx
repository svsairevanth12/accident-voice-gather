
import React from 'react';
import { Link } from 'react-router-dom';

const Navbar: React.FC = () => {
  return (
    <nav className="w-full py-4 bg-white shadow-sm">
      <div className="container mx-auto flex items-center justify-between px-4">
        <div className="flex items-center">
          <Link to="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded bg-brand-600 flex items-center justify-center">
              <span className="text-white font-bold">A</span>
            </div>
            <span className="font-bold text-xl text-brand-800">AcciData</span>
          </Link>
        </div>
        
        <div className="hidden md:flex space-x-8 text-sm font-medium">
          <Link to="/" className="text-gray-700 hover:text-brand-600 transition-colors">
            Home
          </Link>
          <Link to="/voice-agent" className="text-gray-700 hover:text-brand-600 transition-colors">
            Voice Assistant
          </Link>
          <a href="#features" className="text-gray-700 hover:text-brand-600 transition-colors">
            Features
          </a>
          <a href="#how-it-works" className="text-gray-700 hover:text-brand-600 transition-colors">
            How It Works
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
