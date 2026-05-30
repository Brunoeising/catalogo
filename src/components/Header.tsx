'use client';

import Link from 'next/link';
import { ShoppingBag, Zap, Settings } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function Header() {
  const { itemCount, openCart } = useCart();

  return (
    <header className="sticky top-0 z-40 glass border-b border-surface-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-gradient-to-br from-brand-500 to-brand-700 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md shadow-brand-500/20">
              <Zap className="w-4 h-4 text-white" fill="white" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-surface-900 text-base sm:text-lg tracking-tight leading-none">
                Catalogo<span className="text-gradient">Pro</span>
              </span>
              <span className="text-[10px] text-surface-400 font-medium tracking-wide hidden sm:block">ELETRONICOS & PERFUMES</span>
            </div>
          </Link>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <Link
              href="/admin"
              className="flex items-center gap-1.5 text-surface-500 hover:text-surface-800 p-2.5 rounded-xl hover:bg-surface-100 transition-all duration-200 text-sm border border-surface-200 hover:border-surface-300"
              title="Painel Admin"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline text-xs font-medium">Admin</span>
            </Link>

            <button
              onClick={openCart}
            className="relative flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 hover:shadow-md active:scale-95"
            >
              <ShoppingBag className="w-[18px] h-[18px]" />
              <span className="hidden sm:inline">Carrinho</span>
              {itemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-brand-500 text-white text-[10px] font-bold min-w-[20px] h-5 px-1 rounded-full flex items-center justify-center ring-2 ring-white animate-bounce-subtle">
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
