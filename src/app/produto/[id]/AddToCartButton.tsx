'use client';

import { ShoppingCart, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import type { Product } from '@/lib/types';
import { useCart } from '@/context/CartContext';

export default function AddToCartButton({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  function handleAdd() {
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  if (!product.available) {
    return (
      <button
        disabled
        className="w-full flex items-center justify-center gap-2 bg-gray-200 text-gray-400 font-semibold py-4 rounded-2xl text-base cursor-not-allowed"
      >
        Produto indisponível
      </button>
    );
  }

  return (
    <button
      onClick={handleAdd}
      className={`w-full flex items-center justify-center gap-2 font-semibold py-4 rounded-2xl text-base transition-all duration-300 ${
        added
          ? 'bg-emerald-500 text-white scale-[0.99]'
          : 'bg-sky-600 hover:bg-sky-700 text-white hover:shadow-lg active:scale-[0.99]'
      }`}
    >
      {added ? (
        <>
          <CheckCircle className="w-5 h-5" />
          Adicionado ao carrinho!
        </>
      ) : (
        <>
          <ShoppingCart className="w-5 h-5" />
          Adicionar ao Carrinho
        </>
      )}
    </button>
  );
}
