'use client';

import Link from 'next/link';
import { ShoppingCart, Zap, Settings } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function Header() {
  const { itemCount, openCart } = useCart();

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-gray-100/80 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-gradient-to-br from-sky-500 to-cyan-600 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform shadow-sm">
              <Zap className="w-4 h-4 text-white" fill="white" />
            </div>
            <span className="font-bold text-gray-900 text-lg tracking-tight">
              Catalogo<span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-cyan-600">José</span>
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/admin"
              className="flex items-center gap-1.5 text-gray-400 hover:text-gray-700 px-2.5 py-2 rounded-lg hover:bg-gray-100 transition-all text-sm"
              title="Painel Admin"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline text-xs font-medium">Admin</span>
            </Link>

            <button
              onClick={openCart}
            className="relative flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 hover:shadow-md active:scale-95"
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">Carrinho</span>
              {itemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-sky-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center ring-2 ring-white">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
