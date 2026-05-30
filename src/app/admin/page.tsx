'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Package,
  ClipboardList,
  LogOut,
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Star,
  StarOff,
  X,
  Save,
  Zap,
  Tag,
  Upload,
  ImageIcon,
  Loader2,
} from 'lucide-react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import type { Category, Order, Product } from '@/lib/types';
import { formatCurrency, ORDER_STATUS_COLORS, ORDER_STATUS_LABELS } from '@/lib/utils';
import type { User } from '@supabase/supabase-js';

type AdminTab = 'products' | 'categories' | 'orders';

const inputCls =
  'w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all bg-white';

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const [user, setUser] = useState<User | null | undefined>(undefined); // undefined = loading

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (user === undefined) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  return <AdminDashboard user={user} onLogout={async () => { await supabase.auth.signOut(); }} />;
}

// ─── Login ────────────────────────────────────────────────────────────────────

function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) {
      setError('Email ou senha incorretos.');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-sky-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Zap className="w-6 h-6 text-white" fill="white" />
          </div>
          <h1 className="text-white font-bold text-2xl">Painel Admin</h1>
          <p className="text-gray-400 text-sm mt-1">CatalogoPro</p>
        </div>
        <form onSubmit={handleLogin} className="bg-gray-900 rounded-2xl p-6 border border-gray-800 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              placeholder="admin@sualoja.com"
              required
              className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              placeholder="••••••••"
              required
              className={`w-full bg-gray-800 border text-white placeholder-gray-500 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all ${
                error ? 'border-rose-500' : 'border-gray-700'
              }`}
            />
            {error && <p className="text-rose-400 text-xs mt-1.5">{error}</p>}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-sky-600 hover:bg-sky-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg transition-all text-sm flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

function AdminDashboard({ user, onLogout }: { user: User; onLogout: () => void }) {
  const [tab, setTab] = useState<AdminTab>('products');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-56 bg-gray-900 flex-col z-30 hidden lg:flex">
        <div className="flex items-center gap-2 px-5 py-5 border-b border-gray-800">
          <div className="w-7 h-7 bg-sky-600 rounded-lg flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-white" fill="white" />
          </div>
          <span className="text-white font-semibold text-sm">
            Catalogo<span className="text-sky-400">Pro</span>
          </span>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          <SidebarButton icon={<Package className="w-4 h-4" />} label="Produtos" active={tab === 'products'} onClick={() => setTab('products')} />
          <SidebarButton icon={<Tag className="w-4 h-4" />} label="Categorias" active={tab === 'categories'} onClick={() => setTab('categories')} />
          <SidebarButton icon={<ClipboardList className="w-4 h-4" />} label="Pedidos" active={tab === 'orders'} onClick={() => setTab('orders')} />
        </nav>
        <div className="mx-3 mb-4 px-3 py-2 border-t border-gray-800 pt-3">
          <p className="text-gray-500 text-xs truncate mb-2">{user.email}</p>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 text-gray-400 hover:text-white hover:bg-gray-800 w-full px-2 py-1.5 rounded-lg text-sm transition-all"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>
      </div>

      {/* Mobile header */}
      <div className="lg:hidden bg-gray-900 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-sky-600 rounded-lg flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-white" fill="white" />
          </div>
          <span className="text-white font-semibold text-sm">CatalogoPro Admin</span>
        </div>
        <button onClick={onLogout} className="text-gray-400 hover:text-white">
          <LogOut className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile tabs */}
      <div className="lg:hidden bg-white border-b border-gray-200 flex">
        <MobileTab label="Produtos" active={tab === 'products'} onClick={() => setTab('products')} />
        <MobileTab label="Categorias" active={tab === 'categories'} onClick={() => setTab('categories')} />
        <MobileTab label="Pedidos" active={tab === 'orders'} onClick={() => setTab('orders')} />
      </div>

      {/* Main content */}
      <div className="lg:pl-56">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {tab === 'products' && <ProductsTab />}
          {tab === 'categories' && <CategoriesTab />}
          {tab === 'orders' && <OrdersTab />}
        </div>
      </div>
    </div>
  );
}

function SidebarButton({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${active ? 'bg-sky-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>
      {icon}{label}
    </button>
  );
}

function MobileTab({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`flex-1 py-3 text-sm font-medium border-b-2 transition-all ${active ? 'border-sky-600 text-sky-600' : 'border-transparent text-gray-500'}`}>
      {label}
    </button>
  );
}

// ─── Products Tab ─────────────────────────────────────────────────────────────

function ProductsTab() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);

  const load = useCallback(async () => {
    const [pRes, cRes] = await Promise.all([
      supabase.from('products').select('*').order('sort_order'),
      supabase.from('categories').select('*').order('sort_order'),
    ]);
    setProducts(pRes.data ?? []);
    setCategories(cRes.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function toggleAvailable(product: Product) {
    const newVal = !product.available;
    await supabase.from('products').update({ available: newVal }).eq('id', product.id);
    setProducts((prev) => prev.map((p) => p.id === product.id ? { ...p, available: newVal } : p));
  }

  async function toggleFeatured(product: Product) {
    const newVal = !product.featured;
    await supabase.from('products').update({ featured: newVal }).eq('id', product.id);
    setProducts((prev) => prev.map((p) => p.id === product.id ? { ...p, featured: newVal } : p));
  }

  async function deleteProduct(id: string) {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;
    await supabase.from('products').delete().eq('id', id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Produtos</h1>
          <p className="text-gray-500 text-sm mt-0.5">{products.length} produto{products.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => { setEditing(null); setShowModal(true); }} className="flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white font-medium px-4 py-2.5 rounded-xl text-sm transition-all hover:shadow-md">
          <Plus className="w-4 h-4" />Novo Produto
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="bg-white rounded-2xl border border-gray-100 h-36 animate-pulse" />)}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">Nenhum produto cadastrado</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => {
            const cat = categories.find((c) => c.id === product.category_id);
            return (
              <div key={product.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                <div className="relative h-36 bg-gray-100">
                  {product.image_url ? (
                    <Image src={product.image_url} alt={product.name} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <ImageIcon className="w-8 h-8 text-gray-300" />
                    </div>
                  )}
                  {!product.available && (
                    <div className="absolute inset-0 bg-gray-900/50 flex items-center justify-center">
                      <span className="text-white text-xs font-semibold bg-gray-800/80 px-2 py-1 rounded-full">Indisponível</span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate">{product.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{cat?.name}</p>
                    </div>
                    <span className="font-bold text-sky-600 text-sm flex-shrink-0">{formatCurrency(product.price)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-3">
                    <ActionButton title={product.available ? 'Desativar' : 'Ativar'} onClick={() => toggleAvailable(product)} className={product.available ? 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100' : 'text-gray-400 bg-gray-100 hover:bg-gray-200'}>
                      {product.available ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </ActionButton>
                    <ActionButton title={product.featured ? 'Remover destaque' : 'Destacar'} onClick={() => toggleFeatured(product)} className={product.featured ? 'text-amber-600 bg-amber-50 hover:bg-amber-100' : 'text-gray-400 bg-gray-100 hover:bg-gray-200'}>
                      {product.featured ? <Star className="w-3.5 h-3.5" fill="currentColor" /> : <StarOff className="w-3.5 h-3.5" />}
                    </ActionButton>
                    <ActionButton title="Editar" onClick={() => { setEditing(product); setShowModal(true); }} className="text-sky-600 bg-sky-50 hover:bg-sky-100">
                      <Edit2 className="w-3.5 h-3.5" />
                    </ActionButton>
                    <ActionButton title="Excluir" onClick={() => deleteProduct(product.id)} className="text-rose-500 bg-rose-50 hover:bg-rose-100 ml-auto">
                      <Trash2 className="w-3.5 h-3.5" />
                    </ActionButton>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <ProductModal product={editing} categories={categories} onClose={() => setShowModal(false)} onSaved={load} />
      )}
    </div>
  );
}

function ActionButton({ children, onClick, title, className }: { children: React.ReactNode; onClick: () => void; title: string; className?: string }) {
  return (
    <button title={title} onClick={onClick} className={`p-2 rounded-lg transition-all ${className}`}>
      {children}
    </button>
  );
}

// ─── Product Modal ────────────────────────────────────────────────────────────

function ProductModal({ product, categories, onClose, onSaved }: { product: Product | null; categories: Category[]; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    name: product?.name ?? '',
    description: product?.description ?? '',
    price: product?.price?.toString() ?? '',
    image_url: product?.image_url ?? '',
    category_id: product?.category_id ?? categories[0]?.id ?? '',
    available: product?.available ?? true,
    featured: product?.featured ?? false,
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Arquivo muito grande. Máximo 5MB.');
      return;
    }
    setUploadError('');
    setUploading(true);

    const ext = file.name.split('.').pop();
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error, data } = await supabase.storage
      .from('product-images')
      .upload(filename, file, { upsert: false });

    if (error) {
      setUploadError('Falha no upload. Tente novamente.');
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(data.path);
    set('image_url', urlData.publicUrl);
    setUploading(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: parseFloat(form.price),
      image_url: form.image_url.trim(),
      category_id: form.category_id,
      available: form.available,
      featured: form.featured,
    };
    if (product) {
      await supabase.from('products').update(payload).eq('id', product.id);
    } else {
      await supabase.from('products').insert(payload);
    }
    setSaving(false);
    onSaved();
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">{product ? 'Editar Produto' : 'Novo Produto'}</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-4">
          <Field label="Nome do Produto" required>
            <input type="text" value={form.name} onChange={(e) => set('name', e.target.value)} required placeholder="Ex: iPhone 15 Pro" className={inputCls} />
          </Field>

          <Field label="Categoria" required>
            <select value={form.category_id} onChange={(e) => set('category_id', e.target.value)} className={inputCls}>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </Field>

          <Field label="Preço (R$)" required>
            <input type="number" value={form.price} onChange={(e) => set('price', e.target.value)} required min="0" step="0.01" placeholder="199.90" className={inputCls} />
          </Field>

          {/* Image field */}
          <Field label="Imagem do Produto">
            <div className="space-y-3">
              {/* Upload area */}
              <div
                onClick={() => !uploading && fileRef.current?.click()}
                className={`relative border-2 border-dashed rounded-xl transition-all cursor-pointer ${uploading ? 'border-sky-300 bg-sky-50 cursor-wait' : 'border-gray-200 hover:border-sky-400 hover:bg-sky-50/50'}`}
              >
                {form.image_url ? (
                  <div className="relative h-40 overflow-hidden rounded-xl">
                    <Image src={form.image_url} alt="Preview" fill className="object-cover" sizes="400px" />
                    <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <span className="text-white text-sm font-medium flex items-center gap-1.5">
                        <Upload className="w-4 h-4" />Trocar imagem
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="py-8 flex flex-col items-center gap-2 text-gray-400">
                    {uploading ? (
                      <>
                        <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
                        <p className="text-sm text-sky-600 font-medium">Enviando imagem...</p>
                      </>
                    ) : (
                      <>
                        <Upload className="w-8 h-8" />
                        <p className="text-sm font-medium text-gray-600">Clique para fazer upload</p>
                        <p className="text-xs">JPG, PNG, WebP — máx. 5MB</p>
                      </>
                    )}
                  </div>
                )}
              </div>

              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={handleUpload} />

              {uploadError && <p className="text-rose-500 text-xs">{uploadError}</p>}

              {/* Or use URL */}
              <div className="relative flex items-center gap-2">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400 whitespace-nowrap">ou use uma URL</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>
              <input
                type="url"
                value={form.image_url}
                onChange={(e) => set('image_url', e.target.value)}
                placeholder="https://images.pexels.com/..."
                className={inputCls}
              />
            </div>
          </Field>

          <Field label="Descrição">
            <textarea value={form.description} onChange={(e) => set('description', e.target.value)} rows={3} placeholder="Descrição do produto..." className={`${inputCls} resize-none`} />
          </Field>

          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.available} onChange={(e) => set('available', e.target.checked)} className="w-4 h-4 accent-sky-600" />
              <span className="text-sm text-gray-700">Disponível</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.featured} onChange={(e) => set('featured', e.target.checked)} className="w-4 h-4 accent-amber-500" />
              <span className="text-sm text-gray-700">Destaque</span>
            </label>
          </div>

          <button type="submit" disabled={saving || uploading} className="w-full flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-all text-sm mt-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Salvando...' : 'Salvar Produto'}
          </button>
        </form>
      </div>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      {children}
    </div>
  );
}

// ─── Categories Tab ───────────────────────────────────────────────────────────

function CategoriesTab() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);

  const load = useCallback(async () => {
    const { data } = await supabase.from('categories').select('*').order('sort_order');
    setCategories(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function deleteCategory(id: string) {
    if (!confirm('Tem certeza? Os produtos desta categoria ficarão sem categoria.')) return;
    await supabase.from('categories').delete().eq('id', id);
    setCategories((prev) => prev.filter((c) => c.id !== id));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categorias</h1>
          <p className="text-gray-500 text-sm mt-0.5">{categories.length} categoria{categories.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => { setEditing(null); setShowModal(true); }} className="flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white font-medium px-4 py-2.5 rounded-xl text-sm transition-all hover:shadow-md">
          <Plus className="w-4 h-4" />Nova Categoria
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="bg-white rounded-2xl border border-gray-100 h-20 animate-pulse" />)}</div>
      ) : categories.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Tag className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">Nenhuma categoria cadastrada</p>
        </div>
      ) : (
        <div className="space-y-3">
          {categories.map((cat) => (
            <div key={cat.id} className="bg-white rounded-2xl border border-gray-100 px-5 py-4 flex items-center justify-between hover:shadow-sm transition-shadow">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-sky-50 rounded-xl flex items-center justify-center">
                  <Tag className="w-5 h-5 text-sky-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{cat.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">slug: <span className="font-mono">{cat.slug}</span> · ordem: {cat.sort_order}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <ActionButton title="Editar" onClick={() => { setEditing(cat); setShowModal(true); }} className="text-sky-600 bg-sky-50 hover:bg-sky-100">
                  <Edit2 className="w-3.5 h-3.5" />
                </ActionButton>
                <ActionButton title="Excluir" onClick={() => deleteCategory(cat.id)} className="text-rose-500 bg-rose-50 hover:bg-rose-100">
                  <Trash2 className="w-3.5 h-3.5" />
                </ActionButton>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && <CategoryModal category={editing} onClose={() => setShowModal(false)} onSaved={load} />}
    </div>
  );
}

function CategoryModal({ category, onClose, onSaved }: { category: Category | null; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({ name: category?.name ?? '', slug: category?.slug ?? '', icon: category?.icon ?? 'Tag', sort_order: category?.sort_order?.toString() ?? '0' });
  const [saving, setSaving] = useState(false);

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleNameChange(name: string) {
    const slug = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    setForm((prev) => ({ ...prev, name, slug: category ? prev.slug : slug }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload = { name: form.name.trim(), slug: form.slug.trim(), icon: form.icon.trim() || 'Tag', sort_order: parseInt(form.sort_order) || 0 };
    if (category) {
      await supabase.from('categories').update(payload).eq('id', category.id);
    } else {
      await supabase.from('categories').insert(payload);
    }
    setSaving(false);
    onSaved();
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">{category ? 'Editar Categoria' : 'Nova Categoria'}</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"><X className="w-5 h-5 text-gray-400" /></button>
        </div>
        <form onSubmit={handleSave} className="p-6 space-y-4">
          <Field label="Nome" required>
            <input type="text" value={form.name} onChange={(e) => handleNameChange(e.target.value)} required placeholder="Ex: Eletrônicos" className={inputCls} />
          </Field>
          <Field label="Slug (URL)" required>
            <input type="text" value={form.slug} onChange={(e) => set('slug', e.target.value)} required placeholder="eletronicos" className={`${inputCls} font-mono`} />
          </Field>
          <Field label="Ícone (nome Lucide)">
            <input type="text" value={form.icon} onChange={(e) => set('icon', e.target.value)} placeholder="Tag, Cpu, Sparkles..." className={inputCls} />
          </Field>
          <Field label="Ordem de exibição">
            <input type="number" value={form.sort_order} onChange={(e) => set('sort_order', e.target.value)} min="0" placeholder="0" className={inputCls} />
          </Field>
          <button type="submit" disabled={saving} className="w-full flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-all text-sm">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Salvando...' : 'Salvar Categoria'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Orders Tab ───────────────────────────────────────────────────────────────

function OrdersTab() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (error) console.error('Orders error:', error);
    setOrders((data as Order[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function updateStatus(id: string, status: string) {
    await supabase.from('orders').update({ status }).eq('id', id);
    setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status: status as Order['status'] } : o));
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Pedidos</h1>
        <p className="text-gray-500 text-sm mt-0.5">{orders.length} pedido{orders.length !== 1 ? 's' : ''} recebido{orders.length !== 1 ? 's' : ''}</p>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="bg-white rounded-2xl border border-gray-100 h-20 animate-pulse" />)}</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">Nenhum pedido ainda</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-sm transition-shadow">
              <button onClick={() => setExpanded(expanded === order.id ? null : order.id)} className="w-full flex items-center justify-between px-5 py-4 text-left">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{order.customer_name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{order.customer_phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${ORDER_STATUS_COLORS[order.status]}`}>
                    {ORDER_STATUS_LABELS[order.status]}
                  </span>
                  <span className="font-bold text-gray-900 text-sm">{formatCurrency(order.total)}</span>
                  <span className="text-gray-400 text-xs hidden sm:block">
                    {new Date(order.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </button>

              {expanded === order.id && (
                <div className="border-t border-gray-100 px-5 py-4 bg-gray-50 space-y-4">
                  <div className="space-y-1.5">
                    {(order.items as { name: string; price: number; quantity: number }[]).map((item, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-gray-600">{item.quantity}x {item.name}</span>
                        <span className="font-medium text-gray-900">{formatCurrency(item.price * item.quantity)}</span>
                      </div>
                    ))}
                    <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-sm">
                      <span>Total</span>
                      <span className="text-sky-600">{formatCurrency(order.total)}</span>
                    </div>
                  </div>

                  {order.notes && (
                    <p className="text-sm text-gray-500 bg-white rounded-lg px-3 py-2 border border-gray-200">
                      <span className="font-medium text-gray-700">Obs:</span> {order.notes}
                    </p>
                  )}

                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-2">Atualizar Status</p>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => (
                        <button key={value} onClick={() => updateStatus(order.id, value)} className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${order.status === value ? ORDER_STATUS_COLORS[value] + ' border-current' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'}`}>
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
