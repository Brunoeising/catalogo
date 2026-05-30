'use client';

import { useState, useMemo } from 'react';
import { Cpu, Sparkles, Tag, Search, X, ArrowRight, Zap, MessageCircle, ChevronLeft, ChevronRight } from 'lucide-react';
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

const PRODUCTS_PER_PAGE = 12;

export default function CatalogClient({ categories, products }: CatalogClientProps) {
  const [activeSlug, setActiveSlug] = useState<string>('all');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);

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

  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  const paginatedProducts = useMemo(() => {
    const start = (page - 1) * PRODUCTS_PER_PAGE;
    return filteredProducts.slice(start, start + PRODUCTS_PER_PAGE);
  }, [filteredProducts, page]);

  const productCountByCategory = useMemo(() => {
    const counts: Record<string, number> = { all: products.length };
    categories.forEach((cat) => {
      counts[cat.slug] = products.filter((p) => p.category_id === cat.id).length;
    });
    return counts;
  }, [products, categories]);

  function handleFilterChange(slug: string) {
    setActiveSlug(slug);
    setPage(1);
  }

  function handleSearch(value: string) {
    setQuery(value);
    setPage(1);
  }

  return (
    <main className="min-h-screen bg-surface-50">
      {/* Hero */}
      <section className="relative bg-surface-950 text-white overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-brand-600/8 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 text-brand-400 text-xs font-semibold tracking-widest uppercase px-3.5 py-2 rounded-full mb-5 sm:mb-6">
              <Zap className="w-3.5 h-3.5" fill="currentColor" />
              Catalogo Digital
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-[1.1] tracking-tight mb-4 sm:mb-5">
              Os melhores<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-brand-300">produtos do mercado</span>
            </h1>
            <p className="text-surface-400 text-base sm:text-lg leading-relaxed max-w-lg mb-8">
              Encontre eletronicos e perfumes premium. Escolha, adicione ao carrinho e finalize em segundos pelo WhatsApp.
            </p>

            <div className="flex flex-wrap gap-2 sm:gap-3">
              {categories.map((cat) => {
                const Icon = ICON_MAP[cat.icon] ?? Tag;
                return (
                  <button
                    key={cat.id}
                    onClick={() => handleFilterChange(cat.slug)}
                    className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-brand-500/30 text-surface-300 hover:text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-all duration-200"
                  >
                    <Icon className="w-4 h-4 text-brand-400" />
                    {cat.name}
                    <ArrowRight className="w-3 h-3 opacity-40" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Featured */}
      {featuredProducts.length > 0 && !query && activeSlug === 'all' && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 pb-4">
          <SectionHeader title="Destaques" subtitle="Produtos mais populares" />
          <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory touch-action-pan-x sm:grid sm:grid-cols-3 lg:grid-cols-4 sm:overflow-visible sm:pb-0">
            {featuredProducts.map((product) => (
              <div key={product.id} className="min-w-[220px] xs:min-w-[240px] sm:min-w-0 snap-start">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* All Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <SectionHeader title="Todos os Produtos" subtitle={`${products.length} itens disponiveis`} />

        {/* Search */}
        <div className="relative mb-5">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Buscar produto..."
            className="w-full sm:w-96 bg-white border border-surface-200 rounded-xl pl-11 pr-10 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all placeholder:text-surface-400"
          />
          {query && (
            <button
              onClick={() => handleSearch('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 transition-colors p-1 rounded-md hover:bg-surface-100"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6 sm:mb-8 overflow-x-auto pb-2 scrollbar-hide touch-action-pan-x">
          <FilterTab
            label="Tudo"
            count={productCountByCategory['all']}
            icon={<Tag className="w-3.5 h-3.5" />}
            active={activeSlug === 'all'}
            onClick={() => handleFilterChange('all')}
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
                onClick={() => handleFilterChange(cat.slug)}
              />
            );
          })}
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 text-surface-400 animate-fade-in">
            <div className="w-16 h-16 bg-surface-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Search className="w-7 h-7 text-surface-300" />
            </div>
            <p className="text-lg font-medium text-surface-500">Nenhum produto encontrado</p>
            {query && (
              <button
                onClick={() => handleSearch('')}
                className="mt-3 text-brand-600 text-sm font-medium hover:underline"
              >
                Limpar busca
              </button>
            )}
          </div>
        ) : (
          <>
            {query && (
              <p className="text-sm text-surface-500 mb-4">
                {filteredProducts.length} resultado{filteredProducts.length !== 1 ? 's' : ''} para{' '}
                <span className="font-semibold text-surface-700">&ldquo;{query}&rdquo;</span>
              </p>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
              {paginatedProducts.map((product, i) => (
                <div key={product.id} className="animate-fade-in-up" style={{ animationDelay: `${Math.min(i * 40, 300)}ms`, opacity: 0 }}>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            )}
          </>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-surface-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-brand-700 rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" fill="white" />
              </div>
              <div>
                <span className="font-bold text-surface-900 text-sm">CatalogoPro</span>
                <p className="text-xs text-surface-400">Eletronicos & Perfumes Premium</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="#"
                className="flex items-center gap-2 text-surface-500 hover:text-brand-600 text-sm font-medium transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                Fale Conosco
              </a>
            </div>
            <p className="text-surface-400 text-xs">
              {new Date().getFullYear()} CatalogoPro. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="flex items-center gap-3 mb-5 sm:mb-6">
      <div className="flex items-center gap-2.5">
        <div className="w-1 h-6 bg-gradient-to-b from-brand-500 to-brand-600 rounded-full" />
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-surface-900 leading-tight">{title}</h2>
          {subtitle && <p className="text-xs text-surface-400 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <div className="h-px flex-1 bg-gradient-to-r from-surface-200 to-transparent" />
    </div>
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
      className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 flex-shrink-0 ${
        active
          ? 'bg-surface-900 text-white shadow-lg shadow-surface-900/10'
          : 'bg-white text-surface-600 border border-surface-200 hover:border-surface-300 hover:bg-surface-50'
      }`}
    >
      {icon}
      {label}
      <span className={`text-[11px] font-semibold rounded-md px-1.5 py-0.5 ${active ? 'bg-white/15 text-white' : 'bg-surface-100 text-surface-500'}`}>
        {count}
      </span>
    </button>
  );
}

function Pagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
}) {
  function getVisiblePages(): (number | 'dots')[] {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (page <= 3) return [1, 2, 3, 4, 'dots', totalPages];
    if (page >= totalPages - 2) return [1, 'dots', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, 'dots', page - 1, page, page + 1, 'dots', totalPages];
  }

  function handleChange(p: number) {
    onPageChange(p);
    window.scrollTo({ top: 400, behavior: 'smooth' });
  }

  return (
    <div className="flex items-center justify-center gap-1.5 mt-8 sm:mt-10">
      <button
        onClick={() => handleChange(page - 1)}
        disabled={page === 1}
        className="flex items-center justify-center w-9 h-9 rounded-lg border border-surface-200 text-surface-500 hover:bg-surface-50 hover:border-surface-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {getVisiblePages().map((p, i) =>
        p === 'dots' ? (
          <span key={`dots-${i}`} className="w-9 h-9 flex items-center justify-center text-surface-400 text-sm">
            ...
          </span>
        ) : (
          <button
            key={p}
            onClick={() => handleChange(p)}
            className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
              p === page
                ? 'bg-surface-900 text-white shadow-md'
                : 'border border-surface-200 text-surface-600 hover:bg-surface-50 hover:border-surface-300'
            }`}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => handleChange(page + 1)}
        disabled={page === totalPages}
        className="flex items-center justify-center w-9 h-9 rounded-lg border border-surface-200 text-surface-500 hover:bg-surface-50 hover:border-surface-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
