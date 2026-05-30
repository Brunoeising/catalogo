export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function buildWhatsAppMessage(
  customerName: string,
  items: { name: string; price: number; quantity: number }[],
  total: number
): string {
  const lines = [
    `*Novo Pedido - CatalogoPro*`,
    ``,
    `*Cliente:* ${customerName}`,
    ``,
    `*Itens do Pedido:*`,
    ...items.map(
      (item) =>
        `• ${item.quantity}x ${item.name} — ${formatCurrency(item.price * item.quantity)}`
    ),
    ``,
    `*Total: ${formatCurrency(total)}*`,
    ``,
    `Aguardando confirmação. Obrigado! 🛒`,
  ];
  return lines.join('\n');
}

export function buildWhatsAppUrl(phone: string, message: string): string {
  const encoded = encodeURIComponent(message);
  const cleanPhone = phone.replace(/\D/g, '');
  return `https://wa.me/${cleanPhone}?text=${encoded}`;
}

export const ORDER_STATUS_LABELS: Record<string, string> = {
  new: 'Novo',
  preparing: 'Em Preparo',
  shipped: 'Enviado',
  delivered: 'Entregue',
};

export const ORDER_STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-100 text-blue-700',
  preparing: 'bg-amber-100 text-amber-700',
  shipped: 'bg-sky-100 text-sky-700',
  delivered: 'bg-emerald-100 text-emerald-700',
};
