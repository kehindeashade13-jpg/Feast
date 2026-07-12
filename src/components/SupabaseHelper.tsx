import React, { useState } from "react";
import { Terminal, Copy, Check, ExternalLink, Database } from "lucide-react";

export function SupabaseHelper() {
  const [copied, setCopied] = useState(false);

  const sqlCode = `-- 0. CLEANUP OVERRIDE: Remove any previous table version safely if it already exists
drop table if exists public.products cascade;

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

-- 2. Optional: Insert some premium sample seed data with Naira pricing
insert into public.products (name, description, price, category, image_url, stock)
values 
  ('Minimalist Mechanical Keyboard', 'A tenkeyless layout mechanical keyboard with tactile brown switches, sturdy aluminum frame, and warm-white LED backlighting.', 150000.00, 'Electronics', 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&q=80&w=800', 15),
  ('Classic Leather Journal', 'Handcrafted genuine full-grain leather journal with 200 cream-colored lined pages, perfect for writing and planning.', 25000.00, 'Stationery', 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=800', 45),
  ('Ceramic Pour-Over Coffee Dripper', 'Artisanal speckled ceramic coffee dripper designed to hold temperature and brew the perfect balanced, flavorful cup of coffee.', 35000.00, 'Kitchen', 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=800', 20),
  ('Matte Black Travel Tumbler', 'Double-wall vacuum-insulated stainless steel travel mug that keeps your hot drinks hot for 12 hours and cold drinks cold for 24 hours.', 30000.00, 'Lifestyle', 'https://images.unsplash.com/photo-1577937927133-66ef06acdf18?auto=format&fit=crop&q=80&w=800', 60);

-- 3. Enable Row Level Security (RLS) & establish explicit policies for development & admin access
alter table public.products enable row level security;

-- Create policy to allow open read queries for shop catalog rendering
create policy "Allow public select" on public.products for select using (true);

-- Create policy to allow public inserts
create policy "Allow public insert" on public.products for insert with check (true);

-- Create policy to allow public updates
create policy "Allow public update" on public.products for update using (true) with check (true);

-- Create policy to allow public deletes
create policy "Allow public delete" on public.products for delete using (true);`;

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
