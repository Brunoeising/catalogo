'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, PackageX, ImageIcon } from 'lucide-react';
import type { Product } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { useCart } from '@/context/CartContext';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();

  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 flex flex-col h-full">
      <Link href={`/produto/${product.id}`} className="relative aspect-square overflow-hidden bg-gray-100 block">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-50">
            <ImageIcon className="w-10 h-10 text-gray-200" />
          </div>
        )}
        {!product.available && (
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-[2px] flex items-center justify-center">
            <span className="flex items-center gap-1.5 bg-white/95 text-gray-700 text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm">
              <PackageX className="w-3.5 h-3.5" />
              Indisponivel
            </span>
          </div>
        )}
        {product.featured && product.available && (
          <span className="absolute top-2 left-2 bg-gradient-to-r from-sky-500 to-cyan-500 text-white text-[10px] sm:text-xs font-bold px-2 py-0.5 sm:py-1 rounded-full shadow-sm">
            Destaque
          </span>
        )}
      </Link>

      <div className="p-3 sm:p-4 flex flex-col flex-1 gap-2 sm:gap-3">
        <div className="flex-1 min-h-0">
          <Link href={`/produto/${product.id}`} className="hover:text-sky-600 transition-colors">
            <h3 className="font-semibold text-gray-900 text-xs sm:text-sm leading-snug line-clamp-2">
              {product.name}
            </h3>
          </Link>
          {product.description && (
            <p className="mt-1 text-gray-400 text-[11px] sm:text-xs line-clamp-2 leading-relaxed hidden sm:block">
              {product.description}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between gap-1 sm:gap-2 mt-auto">
          <span className="font-bold text-gray-900 text-sm sm:text-base">
            {formatCurrency(product.price)}
          </span>

          <button
            disabled={!product.available}
            onClick={() => addToCart(product)}
            className="flex items-center gap-1 sm:gap-1.5 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white text-[11px] sm:text-xs font-semibold px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg transition-all duration-200 active:scale-95 hover:shadow-md"
          >
            <ShoppingCart className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
            <span className="hidden xs:inline sm:inline">Adicionar</span>
            <span className="xs:hidden sm:hidden">+</span>
          </button>
        </div>
      </div>
    </div>
  );
}
