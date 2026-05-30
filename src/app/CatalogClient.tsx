'use client';

import { useState, useMemo } from 'react';
import { Cpu, Sparkles, Tag, Search, X, Star, ArrowRight } from 'lucide-react';
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

  const productCountByCategory = useMemo(() => {
    const counts: Record<string, number> = { all: products.length };
    categories.forEach((cat) => {
      counts[cat.slug] = products.filter((p) => p.category_id === cat.id).length;
    });
    return counts;
  }, [products, categories]);

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Banner */}
      <section className="relative bg-gray-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(14,165,233,0.15),_transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(6,182,212,0.1),_transparent_60%)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 lg:py-24">
          <div className="max-w-2xl animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/10 text-sky-300 text-xs font-semibold tracking-wide uppercase px-3 py-1.5 rounded-full mb-4 sm:mb-6">
              <Star className="w-3 h-3" fill="currentColor" />
              Catalogo Digital
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-[1.1] tracking-tight mb-3 sm:mb-5">
              Eletronicos &<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-300">Perfumes Premium</span>
            </h1>
            <p className="text-gray-400 text-base sm:text-lg leading-relaxed max-w-lg">
              Encontre os melhores produtos e faca seu pedido em segundos pelo WhatsApp.
            </p>
            <div className="flex flex-wrap gap-2 sm:gap-3 mt-6 sm:mt-8">
              {categories.map((cat) => {
                const Icon = ICON_MAP[cat.icon] ?? Tag;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveSlug(cat.slug)}
                    className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-gray-300 hover:text-white text-sm font-medium px-3.5 py-2 rounded-xl transition-all duration-200"
                  >
                    <Icon className="w-4 h-4" />
                    {cat.name}
                    <ArrowRight className="w-3 h-3 opacity-50" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && !query && activeSlug === 'all' && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 pb-4">
          <div className="flex items-center gap-3 mb-5 sm:mb-6">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-7 bg-gradient-to-b from-sky-500 to-cyan-500 rounded-full" />
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">Destaques</h2>
            </div>
            <div className="h-px flex-1 bg-gradient-to-r from-gray-200 to-transparent" />
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory sm:grid sm:grid-cols-3 lg:grid-cols-4 sm:overflow-visible sm:pb-0">
            {featuredProducts.map((product) => (
              <div key={product.id} className="min-w-[260px] sm:min-w-0 snap-start">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Category Filter + Search + All Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="flex items-center gap-3 mb-5 sm:mb-6">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-7 bg-gradient-to-b from-sky-500 to-cyan-500 rounded-full" />
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Todos os Produtos</h2>
          </div>
          <div className="h-px flex-1 bg-gradient-to-r from-gray-200 to-transparent" />
        </div>

        {/* Search */}
        <div className="relative mb-5">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar produto..."
            className="w-full sm:w-96 bg-white border border-gray-200 rounded-2xl pl-11 pr-10 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-400 transition-all placeholder:text-gray-400"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6 sm:mb-8 overflow-x-auto pb-2 scrollbar-hide">
          <FilterTab
            label="Tudo"
            count={productCountByCategory['all']}
            icon={<Tag className="w-3.5 h-3.5" />}
            active={activeSlug === 'all'}
            onClick={() => setActiveSlug('all')}
          />
          {categories.map((cat) => {
            const Icon = ICON_MAP[cat.icon] ?? Tag;
            return (
              <FilterTab
                key={cat.id}
                label={cat.name}
                count={productCountByCategory[cat.slug] ?? 0}
                icon={<Icon className="w-3.5 h-3.5" />}
                active={activeSlug === cat.slug}
                onClick={() => setActiveSlug(cat.slug)}
              />
            );
          })}
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 text-gray-400 animate-fade-in">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Search className="w-7 h-7 text-gray-300" />
            </div>
            <p className="text-lg font-medium text-gray-500">Nenhum produto encontrado</p>
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
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
              {filteredProducts.map((product, i) => (
                <div key={product.id} className="animate-slide-up" style={{ animationDelay: `${Math.min(i * 50, 300)}ms`, opacity: 0 }}>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200/60 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-br from-sky-500 to-cyan-600 rounded-md flex items-center justify-center">
                <Star className="w-3 h-3 text-white" fill="white" />
              </div>
              <span className="font-semibold text-gray-700 text-sm">CatalogoPro</span>
            </div>
            <p className="text-gray-400 text-sm">
              {new Date().getFullYear()} CatalogoPro. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}

function FilterTab({
  label,
  count,
  icon,
  active,
  onClick,
}: {
  label: string;
  count: number;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 flex-shrink-0 ${
        active
          ? 'bg-gray-900 text-white shadow-md'
          : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-gray-50'
      }`}
    >
      {icon}
      {label}
      <span className={`text-xs font-semibold rounded-full px-1.5 py-0.5 ${active ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
        {count}
      </span>
    </button>
  );
}
