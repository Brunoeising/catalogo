'use client';

import { useState, useMemo } from 'react';
import { Cpu, Sparkles, Tag, Search, X } from 'lucide-react';
import type { Category, Product } from '@/lib/types';
import ProductCard from '@/components/ProductCard';

const ICON_MAP: Record<string, React.ElementType> = {
  Cpu,
  Sparkles,
  Tag,
};

interface CatalogClientProps {
  categories: Category[];
  products: Product[];
}

export default function CatalogClient({ categories, products }: CatalogClientProps) {
  const [activeSlug, setActiveSlug] = useState<string>('all');
  const [query, setQuery] = useState('');

  const featuredProducts = products.filter((p) => p.featured && p.available);

  const filteredProducts = useMemo(() => {
    let list = products;

    if (activeSlug !== 'all') {
      list = list.filter((p) => {
        const cat = categories.find((c) => c.id === p.category_id);
        return cat?.slug === activeSlug;
      });
    }

    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }

    return list;
  }, [products, categories, activeSlug, query]);

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Banner */}
      <section className="bg-gradient-to-br from-sky-600 via-sky-700 to-sky-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="max-w-2xl">
            <p className="text-sky-200 text-sm font-medium tracking-widest uppercase mb-3">
              Catálogo Digital
            </p>
            <h1 className="text-3xl sm:text-5xl font-bold leading-tight mb-4">
              Eletrônicos &<br />
              Perfumes Arabes
            </h1>
            <p className="text-sky-100 text-lg leading-relaxed max-w-md">
              Encontre os melhores produtos, adicione ao carrinho e finalize seu pedido em
              segundos pelo WhatsApp.
            </p>
            <div className="flex flex-wrap gap-3 mt-8">
              {categories.map((cat) => {
                const Icon = ICON_MAP[cat.icon] ?? Tag;
                return (
                  <div
                    key={cat.id}
                    className="flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 text-white text-sm font-medium px-4 py-2 rounded-full"
                  >
                    <Icon className="w-4 h-4" />
                    {cat.name}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && !query && activeSlug === 'all' && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-1 h-6 bg-sky-600 rounded-full" />
            <h2 className="text-xl font-bold text-gray-900">Destaques</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Category Filter + Search + All Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-1 h-6 bg-sky-600 rounded-full" />
          <h2 className="text-xl font-bold text-gray-900">Todos os Produtos</h2>
        </div>

        {/* Search */}
        <div className="relative mb-5">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar produto..."
            className="w-full sm:w-80 bg-white border border-gray-200 rounded-xl pl-10 pr-9 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          <FilterTab
            label="Tudo"
            icon={<Tag className="w-4 h-4" />}
            active={activeSlug === 'all'}
            onClick={() => setActiveSlug('all')}
          />
          {categories.map((cat) => {
            const Icon = ICON_MAP[cat.icon] ?? Tag;
            return (
              <FilterTab
                key={cat.id}
                label={cat.name}
                icon={<Icon className="w-4 h-4" />}
                active={activeSlug === cat.slug}
                onClick={() => setActiveSlug(cat.slug)}
              />
            );
          })}
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-lg font-medium">Nenhum produto encontrado</p>
            {query && (
              <button
                onClick={() => setQuery('')}
                className="mt-3 text-sky-600 text-sm font-medium hover:underline"
              >
                Limpar busca
              </button>
            )}
          </div>
        ) : (
          <>
            {query && (
              <p className="text-sm text-gray-500 mb-4">
                {filteredProducts.length} resultado{filteredProducts.length !== 1 ? 's' : ''} para{' '}
                <span className="font-semibold text-gray-700">&ldquo;{query}&rdquo;</span>
              </p>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} CatalogoPro · Todos os direitos reservados
          </p>
        </div>
      </footer>
    </main>
  );
}

function FilterTab({
  label,
  icon,
  active,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 flex-shrink-0 ${
        active
          ? 'bg-sky-600 text-white shadow-md shadow-sky-200'
          : 'bg-white text-gray-600 border border-gray-200 hover:border-sky-300 hover:text-sky-600'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
