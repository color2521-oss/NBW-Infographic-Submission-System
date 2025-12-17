import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-200 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <img 
          src="https://img5.pic.in.th/file/secure-sv1/nw_logo-removebg.png" 
          alt="Logo" 
          className="w-20 h-20 mx-auto mb-4 hover:scale-110 transition-transform duration-300 drop-shadow-sm" 
        />
        <p className="font-medium text-lg mb-1 text-nbw-900">CopyRight@ 2025 Kru Watcharin Mitreepan</p>
        <p className="text-sm text-gray-500">Use for educational purposes only.</p>
        <p className="text-xs text-gray-400 mt-4">Nong Bua Daeng Witthaya School</p>
      </div>
    </footer>
  );
};