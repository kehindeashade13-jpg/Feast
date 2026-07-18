import React, { useState } from "react";
import { Terminal, Copy, Check, ExternalLink, Database } from "lucide-react";

export function SupabaseHelper() {
  const [copied, setCopied] = useState(false);

  const sqlCode = `-- 0. CLEANUP OVERRIDE: Remove previous table versions safely if they already exist
drop table if exists public.products cascade;
drop table if exists public.orders cascade;

-- 1. Create the 'products' table in Supabase
create table public.products (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  price numeric not null,
  category text default 'General',
  image_url text,
  stock integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create the 'orders' table in Supabase
create table public.orders (
  id uuid default gen_random_uuid() primary key,
  order_number text not null,
  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  delivery_address text not null,
  delivery_instructions text,
  items jsonb not null,
  total_price numeric not null,
  status text default 'Pending',
  payment_method text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Insert some premium sample seed data with Naira pricing
insert into public.products (name, description, price, category, image_url, stock)
values 
  ('Double Grilled Chicken Burger', 'Juicy double-stacked grilled chicken breast patties, melted cheddar cheese, fresh lettuce, sliced tomatoes, caramelized onions, and our signature burger sauce on a toasted brioche bun.', 10500.00, 'Burgers', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=800', 25),
  ('Spicy Beef Shawarma Wrap', 'Premium sliced flank beef slow-roasted and marinated in authentic Middle Eastern spices, wrapped in toasted pita with French fries, pickled cucumbers, cabbage salad, and rich garlic tahini sauce.', 8500.00, 'Shawarma', 'https://images.unsplash.com/photo-1608897013039-887f21d8c804?auto=format&fit=crop&q=80&w=800', 50),
  ('Authentic Smoked Chicken Suya', 'Tender boneless chicken thigh pieces seasoned in spicy roasted peanut rub (yaji spice) and smoked over red-hot charcoal, served with fresh sliced red onions, cabbage, and extra yaji.', 9000.00, 'Chicken', 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=800', 30),
  ('Jumbo Chicken Suya Wrap', 'Toasted flatbread filled with juicy chopped chicken suya, shredded lettuce, tomatoes, sliced onions, and a splash of spicy yaji mayo dressing.', 7500.00, 'Shawarma', 'https://images.unsplash.com/photo-1642d8d3f63c800888?auto=format&fit=crop&q=80&w=800', 20),
  ('Crispy Chicken Burger with Fries', 'Crispy golden buttermilk fried chicken breast, pickles, spicy coleslaw, and herb mayo in a toasted bun, served with a side of crispy French fries.', 11000.00, 'Burgers', 'https://images.unsplash.com/photo-1525059696034-4967a8e1dca2?auto=format&fit=crop&q=80&w=800', 15);

-- 4. Enable Row Level Security (RLS) & establish explicit policies for products
alter table public.products enable row level security;
create policy "Allow everyone to read products" on public.products for select using (true);
create policy "Allow admin to insert products" on public.products for insert to authenticated with check (auth.jwt() ->> 'email' = 'kehindeashade13@gmail.com');
create policy "Allow admin to update products" on public.products for update to authenticated using (auth.jwt() ->> 'email' = 'kehindeashade13@gmail.com') with check (auth.jwt() ->> 'email' = 'kehindeashade13@gmail.com');
create policy "Allow admin to delete products" on public.products for delete to authenticated using (auth.jwt() ->> 'email' = 'kehindeashade13@gmail.com');

-- 5. Enable Row Level Security (RLS) & establish explicit policies for orders
alter table public.orders enable row level security;
create policy "Allow public select orders" on public.orders for select using (true);
create policy "Allow public insert orders" on public.orders for insert with check (true);
create policy "Allow public update orders" on public.orders for update using (true) with check (true);
create policy "Allow public delete orders" on public.orders for delete using (true);`;

  const handleCopy = () => {
    navigator.clipboard.writeText(sqlCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 text-white overflow-hidden max-w-3xl mx-auto shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-emerald-400" />
          <h3 className="font-sans font-semibold text-base text-neutral-100">
            Supabase Table Setup Instructions
          </h3>
        </div>
        <a 
          href="https://supabase.com" 
          target="_blank" 
          rel="noreferrer"
          className="text-xs text-neutral-400 hover:text-white flex items-center gap-1 bg-neutral-800 px-2 py-1 rounded border border-neutral-700 transition"
        >
          Open Supabase <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      <p className="text-sm text-neutral-300 mb-4 leading-relaxed font-sans">
        To use your live Supabase project database instead of the local storage demo, execute the SQL script below inside your Supabase <strong>SQL Editor</strong>, then set your secrets.
      </p>

      <div className="relative">
        <div className="absolute right-3 top-3 z-10">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-xs font-mono bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-300 hover:text-white py-1.5 px-3 rounded-lg transition"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                Copy SQL
              </>
            )}
          </button>
        </div>
        <div className="flex items-center gap-2 bg-neutral-950 px-4 py-2 border border-neutral-800 border-b-0 rounded-t-lg text-xs font-mono text-neutral-400">
          <Terminal className="w-3.5 h-3.5 text-emerald-400" />
          schema.sql
        </div>
        <pre className="bg-neutral-950 p-4 rounded-b-lg border border-neutral-800 text-xs font-mono text-neutral-300 overflow-x-auto max-h-72 leading-relaxed">
          <code>{sqlCode}</code>
        </pre>
      </div>

      <div className="mt-5 border-t border-neutral-850 pt-4 flex flex-col gap-2">
        <h4 className="text-xs font-semibold text-neutral-400 tracking-wider uppercase font-sans">
          Configuring Your Secrets
        </h4>
        <p className="text-xs text-neutral-400 font-sans leading-normal">
          Go to your project's <strong>Secrets Panel</strong> in AI Studio and define:
        </p>
        <ul className="text-xs text-neutral-300 font-mono list-disc pl-5 space-y-1">
          <li><span className="text-emerald-400">SUPABASE_URL</span> = <span className="text-neutral-400">"https://your-project-id.supabase.co"</span></li>
          <li><span className="text-emerald-400">SUPABASE_ANON_KEY</span> = <span className="text-neutral-400">"your-project-anon-or-service-role-key"</span></li>
        </ul>
      </div>
    </div>
  );
}
