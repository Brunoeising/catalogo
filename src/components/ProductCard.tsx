'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, PackageX, Eye } from 'lucide-react';
import type { Product } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { useCart } from '@/context/CartContext';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();

  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col">
      <Link href={`/produto/${product.id}`} className="relative aspect-square overflow-hidden bg-gray-100 block">
        <Image
          src={product.image_url}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
        {!product.available && (
          <div className="absolute inset-0 bg-gray-900/60 flex items-center justify-center">
            <span className="flex items-center gap-1.5 bg-white text-gray-700 text-xs font-semibold px-3 py-1.5 rounded-full">
              <PackageX className="w-3.5 h-3.5" />
              Indisponível
            </span>
          </div>
        )}
        {product.featured && product.available && (
          <span className="absolute top-2 left-2 bg-sky-600 text-white text-xs font-semibold px-2 py-1 rounded-full">
            Destaque
          </span>
        )}
        <span className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 text-white text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1">
          <Eye className="w-3 h-3" />
          Ver
        </span>
      </Link>

      <div className="p-4 flex flex-col flex-1 gap-3">
        <div className="flex-1">
          <Link href={`/produto/${product.id}`} className="hover:text-sky-600 transition-colors">
            <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2">
              {product.name}
            </h3>
          </Link>
          <p className="mt-1 text-gray-500 text-xs line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        <div className="flex items-center justify-between gap-2">
          <span className="font-bold text-gray-900 text-base">
            {formatCurrency(product.price)}
          </span>

          <button
            disabled={!product.available}
            onClick={() => addToCart(product)}
            className="flex items-center gap-1.5 bg-sky-600 hover:bg-sky-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white text-xs font-semibold px-3 py-2 rounded-lg transition-all duration-200 active:scale-95 hover:shadow-md"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            {/* Adicionar */}
          </button>
        </div>
      </div>
    </div>
  );
}
