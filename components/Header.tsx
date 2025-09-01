
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import Button from './common/Button';
import PricingModal from './PricingModal';

const Header: React.FC = () => {
  const { user, signOut } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [pricingModalOpen, setPricingModalOpen] = useState(false);

  return (
    <>
      <header className="bg-gray-900/50 backdrop-blur-sm sticky top-0 z-40 border-b border-gray-700">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex-shrink-0">
              <span className="text-2xl font-bold tracking-tight text-white">AI Photo Editor Pro</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button onClick={() => setPricingModalOpen(true)} variant="secondary">
                Buy Credits
              </Button>
              {user && (
                <div className="relative">
                  <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500">
                    <img className="h-8 w-8 rounded-full" src={user.picture ?? `https://picsum.photos/100`} alt="User avatar" />
                    <div className="text-white hidden sm:block font-medium">{user.name}</div>
                    <svg className={`w-5 h-5 text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
                  </button>
                  {dropdownOpen && (
                    <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-gray-800 ring-1 ring-black ring-opacity-5 z-50">
                      <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                        <div className="px-4 py-2 text-sm text-gray-300">
                          <p className="font-semibold">{user.name}</p>
                          <p className="text-gray-400 truncate">{user.email}</p>
                        </div>
                        <div className="border-t border-gray-700"></div>
                        <div className="px-4 py-2 text-sm text-gray-300">
                          Credits: <span className="font-bold text-indigo-400">{user.credits}</span>
                        </div>
                        <div className="border-t border-gray-700"></div>
                        <button onClick={signOut} className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700 hover:text-red-300" role="menuitem">
                          Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      <PricingModal isOpen={pricingModalOpen} onClose={() => setPricingModalOpen(false)} />
    </>
  );
};

export default Header;
