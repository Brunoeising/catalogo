export const dynamic = 'force-dynamic';

import { supabase } from '@/lib/supabase';
import type { Category, Product } from '@/lib/types';
import Header from '@/components/Header';
import CartDrawer from '@/components/CartDrawer';
import CatalogClient from './CatalogClient';

async function getData(): Promise<{ categories: Category[]; products: Product[] }> {
  const [categoriesRes, productsRes] = await Promise.all([
    supabase.from('categories').select('*').order('sort_order'),
    supabase.from('products').select('*').order('sort_order'),
  ]);

  return {
    categories: categoriesRes.data ?? [],
    products: productsRes.data ?? [],
  };
}

export default async function HomePage() {
  const { categories, products } = await getData();

  return (
    <>
      <Header />
      <CartDrawer />
      <CatalogClient categories={categories} products={products} />
    </>
  );
}
