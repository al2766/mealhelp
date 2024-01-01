import React from 'react';

export default function Footer() {
  return (
    <footer className="w-full bg-gray-800 text-white py-6 px-10">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        {/* Copyright */}
        <div>
          <p className="text-sm md:text-md text-center md:text-left">Copyright © 2023 Torjo. All Rights Reserved.</p>
        </div>

        {/* Legal Links */}
        <div className="flex flex-col md:flex-row md:items-center mt-4 md:mt-0">
          <a href="#terms" className="text-sm md:text-md mx-2 hover:text-gray-400">Terms of Use</a>
          <a href="#privacy" className="text-sm md:text-md mx-2 hover:text-gray-400">Privacy Policy</a>
        </div>
      </div>
    </footer>
  );
}
