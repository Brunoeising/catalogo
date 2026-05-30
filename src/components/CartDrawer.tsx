'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { X, Minus, Plus, Trash2, ShoppingBag, Send, ArrowLeft, CheckCircle } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { supabase } from '@/lib/supabase';
import { buildWhatsAppMessage, buildWhatsAppUrl, formatCurrency } from '@/lib/utils';

type Step = 'cart' | 'checkout' | 'success';

export default function CartDrawer() {
  const { items, isOpen, closeCart, total, increment, decrement, removeFromCart, clearCart } = useCart();
  const [step, setStep] = useState<Step>('cart');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => setStep('cart'), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  async function handlePlaceOrder(e: React.FormEvent) {
    e.preventDefault();
    if (items.length === 0 || !name.trim() || !phone.trim()) return;
    setLoading(true);

    const orderItems = items.map((i) => ({
      product_id: i.product.id,
      name: i.product.name,
      price: i.product.price,
      quantity: i.quantity,
    }));

    const { error } = await supabase.from('orders').insert({
      customer_name: name.trim(),
      customer_phone: phone.trim(),
      items: orderItems,
      total,
      notes: notes.trim(),
    });

    setLoading(false);

    if (error) {
      console.error('Error saving order:', error);
    }

    const message = buildWhatsAppMessage(name.trim(), orderItems, total);
    const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '5511999999999';
    const url = buildWhatsAppUrl(whatsappNumber, message);

    window.open(url, '_blank');
    clearCart();
    setName('');
    setPhone('');
    setNotes('');
    setStep('success');
  }

  function formatPhone(value: string) {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 2) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }

  return (
    <>
      {/* Overlay */}
      <div
        ref={overlayRef}
        onClick={closeCart}
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[420px] bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            {step === 'checkout' && (
              <button
                onClick={() => setStep('cart')}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-4 h-4 text-gray-600" />
              </button>
            )}
            <h2 className="font-semibold text-gray-900 text-lg">
              {step === 'cart' && 'Seu Carrinho'}
              {step === 'checkout' && 'Finalizar Pedido'}
              {step === 'success' && 'Pedido Enviado!'}
            </h2>
          </div>
          <button
            onClick={closeCart}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {step === 'cart' && (
            <>
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-6">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                    <ShoppingBag className="w-9 h-9 text-gray-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-700">Carrinho vazio</p>
                    <p className="text-sm text-gray-400 mt-1">Adicione produtos para fazer seu pedido</p>
                  </div>
                  <button
                    onClick={closeCart}
                    className="mt-2 text-sky-600 text-sm font-medium hover:underline"
                  >
                    Continuar comprando
                  </button>
                </div>
              ) : (
                <div className="p-4 space-y-3">
                  {items.map((item) => (
                    <div key={item.product.id} className="flex gap-3 bg-gray-50 rounded-xl p-3">
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-200">
                        <Image
                          src={item.product.image_url}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 line-clamp-2 leading-snug">
                          {item.product.name}
                        </p>
                        <p className="text-sm font-bold text-sky-600 mt-1">
                          {formatCurrency(item.product.price * item.quantity)}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => decrement(item.product.id)}
                            className="w-6 h-6 bg-white border border-gray-200 rounded-md flex items-center justify-center hover:bg-gray-100 transition-colors"
                          >
                            <Minus className="w-3 h-3 text-gray-600" />
                          </button>
                          <span className="text-sm font-semibold w-5 text-center">{item.quantity}</span>
                          <button
                            onClick={() => increment(item.product.id)}
                            className="w-6 h-6 bg-white border border-gray-200 rounded-md flex items-center justify-center hover:bg-gray-100 transition-colors"
                          >
                            <Plus className="w-3 h-3 text-gray-600" />
                          </button>
                          <button
                            onClick={() => removeFromCart(item.product.id)}
                            className="ml-auto p-1 hover:bg-rose-50 rounded-md transition-colors group"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-gray-400 group-hover:text-rose-500" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {step === 'checkout' && (
            <form onSubmit={handlePlaceOrder} id="checkout-form" className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Seu Nome <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Digite seu nome completo"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  WhatsApp <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(formatPhone(e.target.value))}
                  required
                  placeholder="(11) 99999-9999"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Observações <span className="text-gray-400">(opcional)</span>
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Endereço de entrega, forma de pagamento..."
                  rows={3}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all resize-none"
                />
              </div>

              {/* Order summary */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <p className="text-sm font-semibold text-gray-700 mb-3">Resumo do Pedido</p>
                {items.map((item) => (
                  <div key={item.product.id} className="flex justify-between text-sm">
                    <span className="text-gray-600 line-clamp-1">
                      {item.quantity}x {item.product.name}
                    </span>
                    <span className="font-medium text-gray-900 ml-2 flex-shrink-0">
                      {formatCurrency(item.product.price * item.quantity)}
                    </span>
                  </div>
                ))}
                <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between font-bold text-base">
                  <span>Total</span>
                  <span className="text-sky-600">{formatCurrency(total)}</span>
                </div>
              </div>
            </form>
          )}

          {step === 'success' && (
            <div className="flex flex-col items-center justify-center h-full gap-5 text-center px-6">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-emerald-500" />
              </div>
              <div>
                <p className="font-bold text-gray-900 text-xl">Pedido enviado!</p>
                <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                  Seu pedido foi aberto no WhatsApp. Aguarde a confirmação do vendedor.
                </p>
              </div>
              <button
                onClick={closeCart}
                className="mt-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 text-sm"
              >
                Continuar comprando
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        {step === 'cart' && items.length > 0 && (
          <div className="border-t border-gray-100 p-5 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 font-medium">Total</span>
              <span className="font-bold text-xl text-gray-900">{formatCurrency(total)}</span>
            </div>
            <button
              onClick={() => setStep('checkout')}
              className="w-full bg-sky-600 hover:bg-sky-700 text-white font-semibold py-3.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 hover:shadow-lg active:scale-[0.99]"
            >
              <Send className="w-4 h-4" />
              Fazer Pedido via WhatsApp
            </button>
          </div>
        )}

        {step === 'checkout' && (
          <div className="border-t border-gray-100 p-5">
            <button
              type="submit"
              form="checkout-form"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-semibold py-3.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 hover:shadow-lg active:scale-[0.99]"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Enviando...
                </span>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Confirmar e Abrir WhatsApp
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
