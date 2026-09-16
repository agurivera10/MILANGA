-- 1. Trigger para auto-crear un Business y Profile cuando un usuario se registra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  new_business_id uuid;
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');

  -- Insert business (we use the user id as the business id to match our current MVP logic where business_id = user.id)
  INSERT INTO public.businesses (id, name)
  VALUES (new.id, 'Mi Negocio');

  -- Link user to business
  INSERT INTO public.business_members (business_id, profile_id, role)
  VALUES (new.id, new.id, 'owner');

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger si existe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- 2. Tablas para Producción e Inventario (Lotes)

-- Production Lots
CREATE TABLE public.production_lots (
    id uuid primary key default uuid_generate_v4(),
    business_id uuid references businesses on delete cascade not null,
    recipe_id uuid references recipes on delete restrict not null,
    lot_number text,
    expected_weight_kg numeric not null,
    actual_weight_kg numeric not null,
    total_cost numeric not null, -- Costo guardado al momento de producción (snapshot)
    produced_at timestamptz default now(),
    notes text,
    created_at timestamptz default now()
);

-- Inventory Movements
CREATE TABLE public.inventory_movements (
    id uuid primary key default uuid_generate_v4(),
    business_id uuid references businesses on delete cascade not null,
    material_id uuid references materials on delete restrict not null,
    quantity_change numeric not null, -- negativo para consumos, positivo para ingresos
    reference_type text not null, -- 'production', 'purchase', 'adjustment'
    reference_id uuid, -- FK flexible (puede ser de production_lots, etc.)
    created_at timestamptz default now()
);

-- Enable RLS
ALTER TABLE production_lots ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_movements ENABLE ROW LEVEL SECURITY;

-- Policies for Production Lots
CREATE POLICY "Users can view their business production lots"
ON production_lots FOR SELECT
USING (public.is_business_member(business_id));

CREATE POLICY "Users can insert their business production lots"
ON production_lots FOR INSERT
WITH CHECK (public.is_business_member(business_id));

CREATE POLICY "Users can update their business production lots"
ON production_lots FOR UPDATE
USING (public.is_business_member(business_id));

-- Policies for Inventory Movements
CREATE POLICY "Users can view their business inventory movements"
ON inventory_movements FOR SELECT
USING (public.is_business_member(business_id));

CREATE POLICY "Users can insert their business inventory movements"
ON inventory_movements FOR INSERT
WITH CHECK (public.is_business_member(business_id));
