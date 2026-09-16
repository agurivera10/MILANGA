-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Businesses
create table businesses (
    id uuid primary key default uuid_generate_v4(),
    name text not null,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- 2. Profiles (Extends auth.users)
create table profiles (
    id uuid primary key references auth.users on delete cascade,
    email text not null,
    full_name text,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- 3. Business Members
create table business_members (
    business_id uuid references businesses on delete cascade,
    profile_id uuid references profiles on delete cascade,
    role text not null default 'member',
    created_at timestamptz default now(),
    primary key (business_id, profile_id)
);

-- 4. Suppliers
create table suppliers (
    id uuid primary key default uuid_generate_v4(),
    business_id uuid references businesses on delete cascade not null,
    name text not null,
    contact_info text,
    payment_terms text,
    active boolean default true,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- 5. Materials
create table materials (
    id uuid primary key default uuid_generate_v4(),
    business_id uuid references businesses on delete cascade not null,
    name text not null,
    category text,
    base_unit text not null,
    presentation_unit text not null,
    presentation_quantity numeric not null,
    preferred_supplier_id uuid references suppliers on delete set null,
    current_price numeric not null default 0,
    expected_yield numeric not null default 1,
    active boolean default true,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- 6. Supplier Materials (Prices)
create table supplier_materials (
    supplier_id uuid references suppliers on delete cascade,
    material_id uuid references materials on delete cascade,
    price numeric not null,
    presentation_quantity numeric not null,
    unit text not null,
    is_preferred boolean default false,
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    primary key (supplier_id, material_id)
);

-- 7. Material Price History
create table material_price_history (
    id uuid primary key default uuid_generate_v4(),
    material_id uuid references materials on delete cascade not null,
    supplier_id uuid references suppliers on delete set null,
    old_price numeric,
    new_price numeric not null,
    date timestamptz default now(),
    user_id uuid references auth.users on delete set null
);

-- 8. Recipes
create table recipes (
    id uuid primary key default uuid_generate_v4(),
    business_id uuid references businesses on delete cascade not null,
    name text not null,
    expected_yield_factor numeric not null default 1,
    expected_final_weight numeric not null default 1,
    labor_hours numeric default 0,
    labor_people numeric default 0,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- 9. Recipe Items
create table recipe_items (
    id uuid primary key default uuid_generate_v4(),
    recipe_id uuid references recipes on delete cascade not null,
    material_id uuid references materials on delete restrict not null,
    quantity numeric not null,
    unit text not null,
    created_at timestamptz default now()
);

-- 10. Products
create table products (
    id uuid primary key default uuid_generate_v4(),
    business_id uuid references businesses on delete cascade not null,
    recipe_id uuid references recipes on delete restrict,
    name text not null,
    net_weight numeric not null,
    sku text,
    active boolean default true,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- 11. Product Packaging
create table product_packaging (
    id uuid primary key default uuid_generate_v4(),
    product_id uuid references products on delete cascade not null,
    material_id uuid references materials on delete restrict not null, -- material category = 'packaging'
    quantity numeric not null,
    created_at timestamptz default now()
);

-- 12. Fixed Costs
create table fixed_costs (
    id uuid primary key default uuid_generate_v4(),
    business_id uuid references businesses on delete cascade not null,
    name text not null,
    amount numeric not null,
    periodicity text default 'monthly',
    active boolean default true,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- 13. Variable Costs
create table variable_costs (
    id uuid primary key default uuid_generate_v4(),
    business_id uuid references businesses on delete cascade not null,
    name text not null,
    type text not null, -- 'per_kg', 'per_unit', 'percentage'
    amount numeric not null,
    active boolean default true,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- 14. Sales Channels
create table sales_channels (
    id uuid primary key default uuid_generate_v4(),
    business_id uuid references businesses on delete cascade not null,
    name text not null,
    fee_pct numeric default 0,
    fee_fixed numeric default 0,
    active boolean default true,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- 15. Product Channel Prices
create table product_channel_prices (
    product_id uuid references products on delete cascade,
    channel_id uuid references sales_channels on delete cascade,
    price numeric not null,
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    primary key (product_id, channel_id)
);

-- RLS POLICIES

-- Habilitar RLS en todas las tablas
alter table businesses enable row level security;
alter table profiles enable row level security;
alter table business_members enable row level security;
alter table suppliers enable row level security;
alter table materials enable row level security;
alter table supplier_materials enable row level security;
alter table material_price_history enable row level security;
alter table recipes enable row level security;
alter table recipe_items enable row level security;
alter table products enable row level security;
alter table product_packaging enable row level security;
alter table fixed_costs enable row level security;
alter table variable_costs enable row level security;
alter table sales_channels enable row level security;
alter table product_channel_prices enable row level security;

-- Function para verificar si el usuario es miembro del negocio
create or replace function public.is_business_member(business_id uuid)
returns boolean as $$
begin
  return exists (
    select 1 from business_members bm
    where bm.business_id = $1 and bm.profile_id = auth.uid()
  );
end;
$$ language plpgsql security definer;

-- Profiles: usuario solo ve el suyo
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

-- Businesses: usuario solo ve y edita sus negocios
create policy "View businesses" on businesses for select using (is_business_member(id));
create policy "Update businesses" on businesses for update using (is_business_member(id));

-- Helpers para el resto de las tablas usando is_business_member()
create policy "Members view" on business_members for select using (is_business_member(business_id));
create policy "Members view suppliers" on suppliers for all using (is_business_member(business_id));
create policy "Members view materials" on materials for all using (is_business_member(business_id));
create policy "Members view recipes" on recipes for all using (is_business_member(business_id));
create policy "Members view products" on products for all using (is_business_member(business_id));
create policy "Members view fixed_costs" on fixed_costs for all using (is_business_member(business_id));
create policy "Members view variable_costs" on variable_costs for all using (is_business_member(business_id));
create policy "Members view sales_channels" on sales_channels for all using (is_business_member(business_id));

create policy "Members view recipe_items" on recipe_items for all using (
    exists (select 1 from recipes r where r.id = recipe_items.recipe_id and is_business_member(r.business_id))
);

create policy "Members view product_packaging" on product_packaging for all using (
    exists (select 1 from products p where p.id = product_packaging.product_id and is_business_member(p.business_id))
);

create policy "Members view product_channel_prices" on product_channel_prices for all using (
    exists (select 1 from products p where p.id = product_channel_prices.product_id and is_business_member(p.business_id))
);

create policy "Members view supplier_materials" on supplier_materials for all using (
    exists (select 1 from suppliers s where s.id = supplier_materials.supplier_id and is_business_member(s.business_id))
);

create policy "Members view price history" on material_price_history for all using (
    exists (select 1 from materials m where m.id = material_price_history.material_id and is_business_member(m.business_id))
);
