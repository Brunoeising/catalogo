'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ShoppingBag, PackageX, ImageIcon, Sparkles } from 'lucide-react';
import type { Product } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { useCart } from '@/context/CartContext';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();

  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-surface-100 hover:border-surface-200 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col h-full">
      <Link href={`/produto/${product.id}`} className="relative aspect-[4/3] overflow-hidden bg-surface-100 block">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-surface-50">
            <ImageIcon className="w-10 h-10 text-surface-200" />
          </div>
        )}
        {!product.available && (
          <div className="absolute inset-0 bg-surface-900/60 backdrop-blur-[2px] flex items-center justify-center">
            <span className="flex items-center gap-1.5 bg-white/95 text-surface-700 text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm">
              <PackageX className="w-3.5 h-3.5" />
              Indisponivel
            </span>
          </div>
        )}
        {product.featured && product.available && (
          <span className="absolute top-2 left-2 bg-gradient-to-r from-accent-500 to-accent-600 text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-sm flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            <span className="hidden xs:inline">Destaque</span>
          </span>
        )}
      </Link>

      <div className="p-3 sm:p-4 flex flex-col flex-1 gap-2">
        <div className="flex-1 min-h-0">
          <Link href={`/produto/${product.id}`} className="hover:text-brand-600 transition-colors">
            <h3 className="font-semibold text-surface-900 text-xs sm:text-sm leading-snug line-clamp-2">
              {product.name}
            </h3>
          </Link>
          {product.description && (
            <p className="mt-1 text-surface-400 text-[11px] sm:text-xs line-clamp-2 leading-relaxed hidden sm:block">
              {product.description}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2 mt-auto pt-1">
          <span className="font-bold text-surface-900 text-sm sm:text-base tracking-tight">
            {formatCurrency(product.price)}
          </span>

          <button
            disabled={!product.available}
            onClick={() => addToCart(product)}
            className="flex items-center justify-center gap-1.5 bg-brand-600 hover:bg-brand-700 disabled:bg-surface-200 disabled:text-surface-400 disabled:cursor-not-allowed text-white text-xs font-semibold w-full py-2.5 rounded-lg transition-all duration-200 active:scale-95 hover:shadow-md hover:shadow-brand-600/20 min-h-[36px]"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            Adicionar
          </button>
        </div>
      </div>
    </div>
  );
}
