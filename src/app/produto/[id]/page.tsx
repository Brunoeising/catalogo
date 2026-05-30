export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';
import { supabase } from '@/lib/supabase';
import type { Category, Product } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import Header from '@/components/Header';
import CartDrawer from '@/components/CartDrawer';
import AddToCartButton from './AddToCartButton';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const { data } = await supabase.from('products').select('name, description').eq('id', id).maybeSingle();
  if (!data) return { title: 'Produto não encontrado' };
  return {
    title: `${data.name} — CatalogoPro`,
    description: data.description,
  };
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;

  const { data: productData } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  const product = productData as Product | null;
  if (!product) notFound();

  const { data: category } = await supabase
    .from('categories')
    .select('*')
    .eq('id', product.category_id)
    .maybeSingle();

  const { data: related } = await supabase
    .from('products')
    .select('*')
    .eq('category_id', product.category_id)
    .eq('available', true)
    .neq('id', product.id)
    .order('sort_order')
    .limit(4);

  const cat = category as Category | null;
  const relatedProducts = (related as Product[]) ?? [];

  return (
    <>
      <Header />
      <CartDrawer />
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 text-sm font-medium mb-8 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Voltar ao catálogo
          </Link>

          {/* Product */}
          <div className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              {/* Image */}
              <div className="relative aspect-square lg:aspect-auto lg:min-h-[480px] bg-gray-100">
                <Image
                  src={product.image_url}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
                {!product.available && (
                  <div className="absolute inset-0 bg-gray-900/60 flex items-center justify-center">
                    <span className="bg-white text-gray-700 font-semibold px-5 py-2 rounded-full text-sm">
                      Produto indisponível
                    </span>
                  </div>
                )}
                {product.featured && product.available && (
                  <span className="absolute top-4 left-4 bg-sky-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow">
                    Destaque
                  </span>
                )}
              </div>

              {/* Info */}
              <div className="p-8 lg:p-12 flex flex-col justify-center">
                {cat && (
                  <Link
                    href={`/?categoria=${cat.slug}`}
                    className="inline-block text-sky-600 text-xs font-semibold tracking-widest uppercase mb-3 hover:underline"
                  >
                    {cat.name}
                  </Link>
                )}

                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight mb-4">
                  {product.name}
                </h1>

                <p className="text-gray-500 text-base leading-relaxed mb-8">
                  {product.description}
                </p>

                <div className="flex items-end gap-2 mb-8">
                  <span className="text-4xl font-bold text-gray-900">
                    {formatCurrency(product.price)}
                  </span>
                </div>

                <AddToCartButton product={product} />

                <p className="mt-4 text-xs text-gray-400 text-center">
                  Finalize seu pedido com segurança via WhatsApp
                </p>
              </div>
            </div>
          </div>

          {/* Related products */}
          {relatedProducts.length > 0 && (
            <section className="mt-14">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-1 h-6 bg-sky-600 rounded-full" />
                <h2 className="text-xl font-bold text-gray-900">
                  Mais em {cat?.name ?? 'esta categoria'}
                </h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {relatedProducts.map((p) => (
                  <RelatedCard key={p.id} product={p} />
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Footer */}
        <footer className="border-t border-gray-200 bg-white mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} CatalogoPro · Todos os direitos reservados
            </p>
          </div>
        </footer>
      </main>
    </>
  );
}

function RelatedCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/produto/${product.id}`}
      className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col"
    >
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <Image
          src={product.image_url}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 640px) 50vw, 25vw"
        />
      </div>
      <div className="p-3">
        <p className="font-semibold text-gray-900 text-sm line-clamp-2 leading-snug">
          {product.name}
        </p>
        <p className="font-bold text-sky-600 text-sm mt-1">{formatCurrency(product.price)}</p>
      </div>
    </Link>
  );
}
