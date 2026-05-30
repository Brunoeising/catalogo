/*
  # Catalog Schema for WhatsApp E-commerce

  ## Summary
  Creates all tables for a digital catalog with WhatsApp order flow.

  ## New Tables

  ### categories
  - `id` (uuid, primary key)
  - `name` (text) - Display name e.g. "Eletrônicos", "Perfumes"
  - `slug` (text, unique) - URL slug e.g. "eletronicos"
  - `icon` (text) - Lucide icon name
  - `sort_order` (int) - Display order
  - `created_at` (timestamptz)

  ### products
  - `id` (uuid, primary key)
  - `category_id` (uuid, FK to categories)
  - `name` (text)
  - `description` (text)
  - `price` (numeric, 2 decimal places)
  - `image_url` (text)
  - `available` (boolean, default true)
  - `featured` (boolean, default false)
  - `sort_order` (int, default 0)
  - `created_at` (timestamptz)

  ### orders
  - `id` (uuid, primary key)
  - `customer_name` (text)
  - `customer_phone` (text)
  - `items` (jsonb) - Array of {product_id, name, price, quantity}
  - `total` (numeric)
  - `status` (text) - 'new' | 'preparing' | 'shipped' | 'delivered'
  - `notes` (text)
  - `created_at` (timestamptz)

  ## Security
  - RLS enabled on all tables
  - categories: public SELECT only
  - products: public SELECT only
  - orders: public INSERT only; no SELECT for anon (admin uses service role)

  ## Seed Data
  - 2 categories: Eletrônicos, Perfumes
  - 8 products (4 per category) with Pexels images
*/

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  icon text NOT NULL DEFAULT 'tag',
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view categories"
  ON categories FOR SELECT
  TO anon, authenticated
  USING (true);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  price numeric(10, 2) NOT NULL DEFAULT 0,
  image_url text NOT NULL DEFAULT '',
  available boolean NOT NULL DEFAULT true,
  featured boolean NOT NULL DEFAULT false,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS products_category_id_idx ON products(category_id);
CREATE INDEX IF NOT EXISTS products_available_idx ON products(available);
CREATE INDEX IF NOT EXISTS products_featured_idx ON products(featured);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view products"
  ON products FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update products"
  ON products FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete products"
  ON products FOR DELETE
  TO authenticated
  USING (true);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  items jsonb NOT NULL DEFAULT '[]',
  total numeric(10, 2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'new',
  notes text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS orders_status_idx ON orders(status);
CREATE INDEX IF NOT EXISTS orders_created_at_idx ON orders(created_at DESC);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can place orders"
  ON orders FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view orders"
  ON orders FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Seed categories
INSERT INTO categories (name, slug, icon, sort_order) VALUES
  ('Eletrônicos', 'eletronicos', 'Cpu', 1),
  ('Perfumes', 'perfumes', 'Sparkles', 2)
ON CONFLICT (slug) DO NOTHING;

-- Seed products (Eletrônicos)
INSERT INTO products (category_id, name, description, price, image_url, available, featured, sort_order)
SELECT
  c.id,
  p.name,
  p.description,
  p.price,
  p.image_url,
  p.available,
  p.featured,
  p.sort_order
FROM categories c
CROSS JOIN (VALUES
  ('iPhone 15 Pro', 'Smartphone Apple com chip A17 Pro, câmera de 48MP e tela Super Retina XDR de 6.1".', 7499.00, 'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg?auto=compress&cs=tinysrgb&w=800', true, true, 1),
  ('Fone Bluetooth Premium', 'Fone de ouvido sem fio com cancelamento ativo de ruído, autonomia de 30h e qualidade sonora Hi-Fi.', 899.00, 'https://images.pexels.com/photos/3587478/pexels-photo-3587478.jpeg?auto=compress&cs=tinysrgb&w=800', true, true, 2),
  ('Smartwatch Serie 8', 'Relógio inteligente com monitor cardíaco, GPS integrado, resistência à água e tela AMOLED.', 1299.00, 'https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=800', true, false, 3),
  ('Carregador Turbo 65W', 'Carregador ultra rápido compatível com USB-C, carrega 0 a 100% em menos de 40 minutos.', 189.00, 'https://images.pexels.com/photos/4526407/pexels-photo-4526407.jpeg?auto=compress&cs=tinysrgb&w=800', true, false, 4)
) AS p(name, description, price, image_url, available, featured, sort_order)
WHERE c.slug = 'eletronicos'
ON CONFLICT DO NOTHING;

-- Seed products (Perfumes)
INSERT INTO products (category_id, name, description, price, image_url, available, featured, sort_order)
SELECT
  c.id,
  p.name,
  p.description,
  p.price,
  p.image_url,
  p.available,
  p.featured,
  p.sort_order
FROM categories c
CROSS JOIN (VALUES
  ('Sauvage Dior EDP', 'Fragrância masculina intensa com notas de bergamota, pimenta e âmbar. 100ml.', 649.00, 'https://images.pexels.com/photos/965989/pexels-photo-965989.jpeg?auto=compress&cs=tinysrgb&w=800', true, true, 1),
  ('Chanel N°5 EDP', 'O perfume feminino mais icônico do mundo. Floral, aldeídico e atemporal. 50ml.', 799.00, 'https://images.pexels.com/photos/1190829/pexels-photo-1190829.jpeg?auto=compress&cs=tinysrgb&w=800', true, true, 2),
  ('Lancôme La Vie Est Belle', 'Perfume feminino com notas de íris, pralinê e baunilha. Elegante e envolvente. 75ml.', 529.00, 'https://images.pexels.com/photos/2253834/pexels-photo-2253834.jpeg?auto=compress&cs=tinysrgb&w=800', true, false, 3),
  ('Bleu de Chanel EDP', 'Perfume masculino sofisticado com notas cítricas, amadeiradas e especiarias. 100ml.', 729.00, 'https://images.pexels.com/photos/3756166/pexels-photo-3756166.jpeg?auto=compress&cs=tinysrgb&w=800', true, false, 4)
) AS p(name, description, price, image_url, available, featured, sort_order)
WHERE c.slug = 'perfumes'
ON CONFLICT DO NOTHING;
