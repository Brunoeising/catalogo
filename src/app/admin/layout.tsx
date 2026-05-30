import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin — CatalogoPro',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
