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
  ChevronDown,
  Phone,
  Calendar,
  Hash,
  Share2,
} from 'lucide-react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import type { Category, Order, Product } from '@/lib/types';
import { formatCurrency, ORDER_STATUS_COLORS, ORDER_STATUS_LABELS } from '@/lib/utils';
import type { User } from '@supabase/supabase-js';

type AdminTab = 'products' | 'categories' | 'orders';

const inputCls =
  'w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all bg-white placeholder:text-gray-400';

export default function AdminPage() {
  const [user, setUser] = useState<User | null | undefined>(undefined);

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
      <div className="min-h-screen bg-surface-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
          <p className="text-surface-500 text-sm">Carregando...</p>
        </div>
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
    try {
      const { error: err } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
      if (err) {
        setError(err.message || 'Email ou senha incorretos.');
        setLoading(false);
      }
    } catch (networkErr: unknown) {
      const msg = networkErr instanceof Error ? networkErr.message : 'Erro de rede';
      setError(`Falha na conexão: ${msg}`);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-surface-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm animate-fade-in">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-brand-500 to-brand-700 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-brand-500/20">
            <Zap className="w-7 h-7 text-white" fill="white" />
          </div>
          <h1 className="text-white font-bold text-2xl tracking-tight">Painel Admin</h1>
          <p className="text-surface-500 text-sm mt-1">CatalogoPro</p>
        </div>
        <form onSubmit={handleLogin} className="bg-surface-900/80 backdrop-blur-sm rounded-2xl p-6 border border-surface-800/50 space-y-4 shadow-2xl">
          <div>
            <label className="block text-sm font-medium text-surface-300 mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              placeholder="admin@catalogopro.com"
              required
              autoCapitalize="none"
              autoCorrect="off"
              autoComplete="email"
              spellCheck={false}
              className="w-full bg-surface-800/50 border border-surface-700/50 text-white placeholder-surface-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500/50 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-300 mb-1.5">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              placeholder="Digite sua senha"
              required
              autoComplete="current-password"
              className={`w-full bg-surface-800/50 border text-white placeholder-surface-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 transition-all ${
                error ? 'border-rose-500/60' : 'border-surface-700/50 focus:border-brand-500/50'
              }`}
            />
            {error && <p className="text-rose-400 text-xs mt-2 flex items-center gap-1">{error}</p>}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-brand-500 to-brand-700 hover:from-brand-600 hover:to-brand-800 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-all text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg mt-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
          <p className="text-center text-surface-600 text-xs mt-3">
            Credenciais: admin@catalogopro.com / Admin@2024
          </p>
        </form>
      </div>
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

function AdminDashboard({ user, onLogout }: { user: User; onLogout: () => void }) {
  const [tab, setTab] = useState<AdminTab>('products');

  return (
    <div className="min-h-screen bg-surface-50 pb-20 lg:pb-0">
      {/* Desktop Sidebar */}
      <div className="fixed inset-y-0 left-0 w-60 bg-surface-900 flex-col z-30 hidden lg:flex">
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-surface-800/60">
          <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-brand-700 rounded-lg flex items-center justify-center shadow-sm">
            <Zap className="w-4 h-4 text-white" fill="white" />
          </div>
          <span className="text-white font-bold text-sm tracking-tight">
            Catalogo<span className="text-brand-400">Pro</span>
          </span>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          <SidebarButton icon={<Package className="w-4 h-4" />} label="Produtos" active={tab === 'products'} onClick={() => setTab('products')} />
          <SidebarButton icon={<Tag className="w-4 h-4" />} label="Categorias" active={tab === 'categories'} onClick={() => setTab('categories')} />
          <SidebarButton icon={<ClipboardList className="w-4 h-4" />} label="Pedidos" active={tab === 'orders'} onClick={() => setTab('orders')} />
        </nav>
        <div className="mx-3 mb-4 p-3 bg-surface-800/40 rounded-xl border border-surface-800/50">
          <p className="text-surface-400 text-xs truncate mb-2">{user.email}</p>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 text-surface-400 hover:text-white w-full px-2 py-1.5 rounded-lg text-sm transition-all hover:bg-surface-700/50"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden bg-surface-900 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-gradient-to-br from-brand-500 to-brand-700 rounded-lg flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-white" fill="white" />
          </div>
          <span className="text-white font-bold text-sm">CatalogoPro</span>
        </div>
        <button onClick={onLogout} className="text-surface-400 hover:text-white p-2 rounded-lg hover:bg-surface-800 transition-colors">
          <LogOut className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-surface-200 z-30 px-2 py-1.5 flex items-center justify-around safe-bottom">
        <BottomNavButton icon={<Package className="w-5 h-5" />} label="Produtos" active={tab === 'products'} onClick={() => setTab('products')} />
        <BottomNavButton icon={<Tag className="w-5 h-5" />} label="Categorias" active={tab === 'categories'} onClick={() => setTab('categories')} />
        <BottomNavButton icon={<ClipboardList className="w-5 h-5" />} label="Pedidos" active={tab === 'orders'} onClick={() => setTab('orders')} />
      </div>

      {/* Main content */}
      <div className="lg:pl-60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
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
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${active ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20' : 'text-surface-400 hover:text-white hover:bg-surface-800/60'}`}>
      {icon}{label}
    </button>
  );
}

function BottomNavButton({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl transition-all ${active ? 'text-brand-600' : 'text-surface-400'}`}>
      {icon}
      <span className="text-[10px] font-medium">{label}</span>
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
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Produtos</h1>
          <p className="text-gray-500 text-sm mt-0.5">{products.length} produto{products.length !== 1 ? 's' : ''} cadastrado{products.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => { setEditing(null); setShowModal(true); }} className="flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-medium px-4 py-2.5 rounded-xl text-sm transition-all hover:shadow-lg active:scale-[0.98]">
          <Plus className="w-4 h-4" />Novo Produto
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="bg-white rounded-2xl border border-gray-100 h-44 animate-pulse" />)}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-gray-300" />
          </div>
          <p className="font-medium text-gray-500">Nenhum produto cadastrado</p>
          <p className="text-sm mt-1">Clique em &quot;Novo Produto&quot; para comecar</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => {
            const cat = categories.find((c) => c.id === product.category_id);
            return (
              <div key={product.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:border-gray-200 transition-all duration-200">
                <div className="relative h-32 sm:h-36 bg-gray-100">
                  {product.image_url ? (
                    <Image src={product.image_url} alt={product.name} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <ImageIcon className="w-8 h-8 text-gray-200" />
                    </div>
                  )}
                  {!product.available && (
                    <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-[1px] flex items-center justify-center">
                      <span className="text-white text-xs font-semibold bg-gray-800/80 px-2.5 py-1 rounded-full">Indisponivel</span>
                    </div>
                  )}
                  {product.featured && (
                    <span className="absolute top-2 left-2 bg-amber-400 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Star className="w-2.5 h-2.5" fill="currentColor" />
                      Destaque
                    </span>
                  )}
                </div>
                <div className="p-3 sm:p-4">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate">{product.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{cat?.name ?? 'Sem categoria'}</p>
                    </div>
                    <span className="font-bold text-brand-600 text-sm flex-shrink-0">{formatCurrency(product.price)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <ActionButton title={product.available ? 'Desativar' : 'Ativar'} onClick={() => toggleAvailable(product)} className={product.available ? 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100' : 'text-gray-400 bg-gray-100 hover:bg-gray-200'}>
                      {product.available ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </ActionButton>
                    <ActionButton title={product.featured ? 'Remover destaque' : 'Destacar'} onClick={() => toggleFeatured(product)} className={product.featured ? 'text-amber-600 bg-amber-50 hover:bg-amber-100' : 'text-gray-400 bg-gray-100 hover:bg-gray-200'}>
                      {product.featured ? <Star className="w-3.5 h-3.5" fill="currentColor" /> : <StarOff className="w-3.5 h-3.5" />}
                    </ActionButton>
                    <ActionButton title="Editar" onClick={() => { setEditing(product); setShowModal(true); }} className="text-brand-600 bg-brand-50 hover:bg-brand-100">
                      <Edit2 className="w-3.5 h-3.5" />
                    </ActionButton>
                    <ShareDropdown product={product} />
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
    <button title={title} onClick={onClick} className={`p-2 rounded-lg transition-all active:scale-90 ${className}`}>
      {children}
    </button>
  );
}

function ShareDropdown({ product }: { product: Product }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const productUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/produto/${product.id}`
    : `/produto/${product.id}`;

  function shareWhatsApp() {
    const text = `${product.name}\n${formatCurrency(product.price)}\n\nVeja mais: ${productUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    setOpen(false);
  }

  function shareInstagram() {
    const text = `${product.name} - ${formatCurrency(product.price)}\n${productUrl}`;
    navigator.clipboard.writeText(text);
    alert('Texto copiado! Cole no Instagram Stories ou Direct.');
    setOpen(false);
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <ActionButton title="Compartilhar" onClick={() => setOpen(!open)} className="text-teal-600 bg-teal-50 hover:bg-teal-100">
        <Share2 className="w-3.5 h-3.5" />
      </ActionButton>
      {open && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-20 py-1 min-w-[160px] animate-scale-in">
          <button
            onClick={shareWhatsApp}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <span className="w-6 h-6 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-white" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.955 9.955 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18a8 8 0 01-4.072-1.108l-.292-.174-2.868.852.852-2.868-.174-.292A8 8 0 1112 20z"/>
              </svg>
            </span>
            WhatsApp
          </button>
          <button
            onClick={shareInstagram}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <span className="w-6 h-6 bg-gradient-to-br from-pink-500 via-rose-500 to-amber-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-white" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
              </svg>
            </span>
            Instagram
          </button>
        </div>
      )}
    </div>
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
      setUploadError('Arquivo muito grande. Maximo 5MB.');
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md shadow-2xl max-h-[100dvh] sm:max-h-[90vh] flex flex-col animate-slide-up">
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-gray-100 flex-shrink-0 rounded-t-3xl sm:rounded-t-2xl">
          <h3 className="font-bold text-gray-900 text-base">{product ? 'Editar Produto' : 'Novo Produto'}</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 overscroll-contain">
          <form onSubmit={handleSave} className="p-5 sm:p-6 space-y-4">
            <Field label="Nome do Produto" required>
              <input type="text" value={form.name} onChange={(e) => set('name', e.target.value)} required placeholder="Ex: iPhone 15 Pro" className={inputCls} />
            </Field>

            <Field label="Categoria" required>
              <div className="relative">
                <select value={form.category_id} onChange={(e) => set('category_id', e.target.value)} className={`${inputCls} appearance-none pr-10`}>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </Field>

            <Field label="Preco (R$)" required>
              <input type="number" value={form.price} onChange={(e) => set('price', e.target.value)} required min="0" step="0.01" placeholder="199.90" className={inputCls} />
            </Field>

            <Field label="Imagem do Produto">
              <div className="space-y-3">
                <div
                  onClick={() => !uploading && fileRef.current?.click()}
                  className={`relative border-2 border-dashed rounded-xl transition-all cursor-pointer overflow-hidden ${uploading ? 'border-brand-300 bg-brand-50 cursor-wait' : 'border-gray-200 hover:border-brand-400 hover:bg-brand-50/30'}`}
                >
                  {form.image_url ? (
                    <div className="relative h-36 sm:h-40">
                      <Image src={form.image_url} alt="Preview" fill className="object-cover" sizes="400px" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <span className="text-white text-sm font-medium flex items-center gap-1.5 bg-black/30 px-3 py-1.5 rounded-lg">
                          <Upload className="w-4 h-4" />Trocar imagem
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="py-6 flex flex-col items-center gap-2 text-gray-400">
                      {uploading ? (
                        <>
                          <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
                          <p className="text-sm text-brand-600 font-medium">Enviando imagem...</p>
                        </>
                      ) : (
                        <>
                          <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                            <Upload className="w-5 h-5 text-gray-400" />
                          </div>
                          <p className="text-sm font-medium text-gray-600">Clique para fazer upload</p>
                          <p className="text-xs text-gray-400">JPG, PNG, WebP — max. 5MB</p>
                        </>
                      )}
                    </div>
                  )}
                </div>

                <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={handleUpload} />

                {uploadError && <p className="text-rose-500 text-xs">{uploadError}</p>}

                <div className="relative flex items-center gap-2">
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="text-[11px] text-gray-400 whitespace-nowrap">ou cole uma URL</span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>
                <input
                  type="url"
                  value={form.image_url}
                  onChange={(e) => set('image_url', e.target.value)}
                  placeholder="https://..."
                  className={inputCls}
                />
              </div>
            </Field>

            <Field label="Descricao">
              <textarea value={form.description} onChange={(e) => set('description', e.target.value)} rows={2} placeholder="Descricao do produto..." className={`${inputCls} resize-none`} />
            </Field>

            <div className="flex gap-5">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" checked={form.available} onChange={(e) => set('available', e.target.checked)} className="w-4 h-4 accent-brand-600 rounded" />
                <span className="text-sm text-gray-700 font-medium">Disponivel</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" checked={form.featured} onChange={(e) => set('featured', e.target.checked)} className="w-4 h-4 accent-amber-500 rounded" />
                <span className="text-sm text-gray-700 font-medium">Destaque</span>
              </label>
            </div>

            <div className="pb-6 sm:pb-0">
              <button type="submit" disabled={saving || uploading} className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-all text-sm mt-2 active:scale-[0.98]">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? 'Salvando...' : 'Salvar Produto'}
              </button>
            </div>
          </form>
        </div>
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
    if (!confirm('Tem certeza? Os produtos desta categoria ficarao sem categoria.')) return;
    await supabase.from('categories').delete().eq('id', id);
    setCategories((prev) => prev.filter((c) => c.id !== id));
  }

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Categorias</h1>
          <p className="text-gray-500 text-sm mt-0.5">{categories.length} categoria{categories.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => { setEditing(null); setShowModal(true); }} className="flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-medium px-4 py-2.5 rounded-xl text-sm transition-all hover:shadow-lg active:scale-[0.98]">
          <Plus className="w-4 h-4" />Nova Categoria
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="bg-white rounded-2xl border border-gray-100 h-20 animate-pulse" />)}</div>
      ) : categories.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Tag className="w-8 h-8 text-gray-300" />
          </div>
          <p className="font-medium text-gray-500">Nenhuma categoria cadastrada</p>
        </div>
      ) : (
        <div className="space-y-3">
          {categories.map((cat) => (
            <div key={cat.id} className="bg-white rounded-2xl border border-gray-100 px-4 sm:px-5 py-4 flex items-center justify-between hover:shadow-md hover:border-gray-200 transition-all duration-200">
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                <div className="w-10 h-10 bg-gradient-to-br from-brand-50 to-brand-100 rounded-xl flex items-center justify-center border border-brand-100 flex-shrink-0">
                  <Tag className="w-5 h-5 text-brand-600" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 text-sm truncate">{cat.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5 truncate"><span className="font-mono">{cat.slug}</span> · ordem {cat.sort_order}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                <ActionButton title="Editar" onClick={() => { setEditing(cat); setShowModal(true); }} className="text-brand-600 bg-brand-50 hover:bg-brand-100">
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-sm shadow-2xl animate-slide-up">
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900 text-base">{category ? 'Editar Categoria' : 'Nova Categoria'}</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors"><X className="w-5 h-5 text-gray-400" /></button>
        </div>
        <form onSubmit={handleSave} className="p-5 sm:p-6 space-y-4">
          <Field label="Nome" required>
            <input type="text" value={form.name} onChange={(e) => handleNameChange(e.target.value)} required placeholder="Ex: Eletronicos" className={inputCls} />
          </Field>
          <Field label="Slug (URL)" required>
            <input type="text" value={form.slug} onChange={(e) => set('slug', e.target.value)} required placeholder="eletronicos" className={`${inputCls} font-mono`} />
          </Field>
          <Field label="Icone (nome Lucide)">
            <input type="text" value={form.icon} onChange={(e) => set('icon', e.target.value)} placeholder="Tag, Cpu, Sparkles..." className={inputCls} />
          </Field>
          <Field label="Ordem de exibicao">
            <input type="number" value={form.sort_order} onChange={(e) => set('sort_order', e.target.value)} min="0" placeholder="0" className={inputCls} />
          </Field>
          <button type="submit" disabled={saving} className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-all text-sm active:scale-[0.98]">
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
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Pedidos</h1>
        <p className="text-gray-500 text-sm mt-0.5">{orders.length} pedido{orders.length !== 1 ? 's' : ''} recebido{orders.length !== 1 ? 's' : ''}</p>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="bg-white rounded-2xl border border-gray-100 h-20 animate-pulse" />)}</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ClipboardList className="w-8 h-8 text-gray-300" />
          </div>
          <p className="font-medium text-gray-500">Nenhum pedido ainda</p>
          <p className="text-sm mt-1">Os pedidos aparecerão aqui quando clientes comprarem</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md hover:border-gray-200 transition-all duration-200">
              <button onClick={() => setExpanded(expanded === order.id ? null : order.id)} className="w-full flex items-center justify-between px-4 sm:px-5 py-4 text-left gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Hash className="w-4 h-4 text-gray-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">{order.customer_name}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                      <Phone className="w-3 h-3" />
                      <span className="truncate">{order.customer_phone}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1.5 sm:gap-3 flex-shrink-0">
                  <span className={`text-[11px] sm:text-xs font-semibold px-2 sm:px-2.5 py-1 rounded-full whitespace-nowrap ${ORDER_STATUS_COLORS[order.status]}`}>
                    {ORDER_STATUS_LABELS[order.status]}
                  </span>
                  <span className="font-bold text-gray-900 text-sm">{formatCurrency(order.total)}</span>
                  <div className="hidden sm:flex items-center gap-1 text-gray-400 text-xs">
                    <Calendar className="w-3 h-3" />
                    {new Date(order.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </button>

              {expanded === order.id && (
                <div className="border-t border-gray-100 px-4 sm:px-5 py-4 bg-gray-50/50 space-y-4 animate-fade-in">
                  <div className="sm:hidden flex items-center gap-1 text-gray-400 text-xs mb-2">
                    <Calendar className="w-3 h-3" />
                    {new Date(order.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </div>

                  <div className="bg-white rounded-xl border border-gray-200 p-3 space-y-2">
                    {(order.items as { name: string; price: number; quantity: number }[]).map((item, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-gray-600">{item.quantity}x {item.name}</span>
                        <span className="font-medium text-gray-900">{formatCurrency(item.price * item.quantity)}</span>
                      </div>
                    ))}
                    <div className="border-t border-gray-100 pt-2 flex justify-between font-bold text-sm">
                      <span>Total</span>
                      <span className="text-brand-600">{formatCurrency(order.total)}</span>
                    </div>
                  </div>

                  {order.notes && (
                    <p className="text-sm text-gray-500 bg-white rounded-xl px-3 py-2.5 border border-gray-200">
                      <span className="font-medium text-gray-700">Obs:</span> {order.notes}
                    </p>
                  )}

                  <div>
                    <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Atualizar Status</p>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => (
                        <button key={value} onClick={() => updateStatus(order.id, value)} className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all active:scale-95 ${order.status === value ? ORDER_STATUS_COLORS[value] + ' border-current ring-2 ring-current/20' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}>
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
