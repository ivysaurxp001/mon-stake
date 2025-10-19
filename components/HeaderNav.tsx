'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useMetaMask } from './MetaMaskProvider';

type NavLink = {
  href: string;
  label: string;
};

function formatAddress(address: string) {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export default function HeaderNav({ links }: { links: NavLink[] }) {
  const { account, isConnecting, connect, disconnect, error, clearError } = useMetaMask();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const connectHandler = async () => {
    clearError();
    await connect();
  };

  return (
    <>
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 no-underline text-gray-800">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl flex items-center justify-center text-xl shadow-lg shadow-purple-500/30">
              💎
            </div>
            <div>
              <div className="text-xl font-bold leading-tight">
                MON Stake
              </div>
              <div className="text-xs text-gray-500 leading-none">
                Monad Testnet
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <ul className="hidden md:flex gap-8 list-none m-0 p-0">
            {links.map((link) => (
              <li key={link.href}>
                <Link 
                  href={link.href}
                  className={`no-underline text-base font-medium transition-colors duration-200 pb-1 ${
                    pathname === link.href 
                      ? 'text-purple-600 font-semibold border-b-2 border-purple-600' 
                      : 'text-gray-600 hover:text-purple-600'
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Wallet Button */}
          <div>
            {account ? (
              <div className="flex items-center gap-4">
                <div className="px-4 py-2 bg-gray-50 rounded-lg text-sm font-medium text-gray-800">
                  {formatAddress(account)}
                </div>
                <button
                  onClick={disconnect}
                  className="px-4 py-2 bg-transparent border border-gray-200 rounded-lg text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 transition-all duration-200"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={connectHandler}
                disabled={isConnecting}
                className={`px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 border-none rounded-xl text-white text-base font-semibold transition-all duration-200 shadow-lg shadow-purple-500/30 hover:shadow-xl transform hover:-translate-y-0.5 ${
                  isConnecting ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'
                }`}
              >
                {isConnecting ? 'Connecting...' : 'Connect Wallet'}
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Error Banner */}
      {error && (
        <div className="px-4 py-4 bg-red-100 text-red-700 text-center text-sm">
          ⚠️ {error}
        </div>
      )}
    </>
  );
}
