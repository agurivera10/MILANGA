-- ==============================================================================
-- MILANGA COST LAB - ESQUEMA COMPLETO Y CONSOLIDADO PARA SUPABASE
-- Copiar y pegar todo este script completo en el SQL Editor de Supabase y ejecutar (Run).
-- ==============================================================================

-- 0. Extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Businesses
CREATE TABLE IF NOT EXISTS public.businesses (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text NOT NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 2. Profiles (Extiende auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
    email text NOT NULL,
    full_name text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 3. Business Members
CREATE TABLE IF NOT EXISTS public.business_members (
    business_id uuid REFERENCES public.businesses ON DELETE CASCADE,
    profile_id uuid REFERENCES public.profiles ON DELETE CASCADE,
    role text NOT NULL DEFAULT 'member',
    created_at timestamptz DEFAULT now(),
    PRIMARY KEY (business_id, profile_id)
);

-- 4. Suppliers
CREATE TABLE IF NOT EXISTS public.suppliers (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id uuid REFERENCES public.businesses ON DELETE CASCADE NOT NULL,
    name text NOT NULL,
    contact_info text,
    payment_terms text,
    active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 5. Materials
CREATE TABLE IF NOT EXISTS public.materials (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id uuid REFERENCES public.businesses ON DELETE CASCADE NOT NULL,
    name text NOT NULL,
    category text,
    base_unit text NOT NULL,
    presentation_unit text NOT NULL,
    presentation_quantity numeric NOT NULL,
    preferred_supplier_id uuid REFERENCES public.suppliers ON DELETE SET NULL,
    current_price numeric NOT NULL DEFAULT 0,
    expected_yield numeric NOT NULL DEFAULT 1,
    active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 6. Supplier Materials (Precios por proveedor)
CREATE TABLE IF NOT EXISTS public.supplier_materials (
    supplier_id uuid REFERENCES public.suppliers ON DELETE CASCADE,
    material_id uuid REFERENCES public.materials ON DELETE CASCADE,
    price numeric NOT NULL,
    presentation_quantity numeric NOT NULL,
    unit text NOT NULL,
    is_preferred boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    PRIMARY KEY (supplier_id, material_id)
);

-- 7. Material Price History
CREATE TABLE IF NOT EXISTS public.material_price_history (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    material_id uuid REFERENCES public.materials ON DELETE CASCADE NOT NULL,
    supplier_id uuid REFERENCES public.suppliers ON DELETE SET NULL,
    old_price numeric,
    new_price numeric NOT NULL,
    date timestamptz DEFAULT now(),
    user_id uuid REFERENCES auth.users ON DELETE SET NULL
);

-- 8. Recipes
CREATE TABLE IF NOT EXISTS public.recipes (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id uuid REFERENCES public.businesses ON DELETE CASCADE NOT NULL,
    name text NOT NULL,
    expected_yield_factor numeric NOT NULL DEFAULT 1,
    expected_final_weight numeric NOT NULL DEFAULT 1,
    labor_hours numeric DEFAULT 0,
    labor_people numeric DEFAULT 0,
    active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 9. Recipe Items
CREATE TABLE IF NOT EXISTS public.recipe_items (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipe_id uuid REFERENCES public.recipes ON DELETE CASCADE NOT NULL,
    material_id uuid REFERENCES public.materials ON DELETE RESTRICT NOT NULL,
    quantity numeric NOT NULL,
    unit text NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- 10. Products
CREATE TABLE IF NOT EXISTS public.products (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id uuid REFERENCES public.businesses ON DELETE CASCADE NOT NULL,
    recipe_id uuid REFERENCES public.recipes ON DELETE RESTRICT,
    name text NOT NULL,
    net_weight numeric NOT NULL,
    sku text,
    active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 11. Product Packaging
CREATE TABLE IF NOT EXISTS public.product_packaging (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id uuid REFERENCES public.products ON DELETE CASCADE NOT NULL,
    material_id uuid REFERENCES public.materials ON DELETE RESTRICT NOT NULL,
    quantity numeric NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- 12. Fixed Costs
CREATE TABLE IF NOT EXISTS public.fixed_costs (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id uuid REFERENCES public.businesses ON DELETE CASCADE NOT NULL,
    name text NOT NULL,
    amount numeric NOT NULL,
    periodicity text DEFAULT 'monthly',
    active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 13. Variable Costs
CREATE TABLE IF NOT EXISTS public.variable_costs (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id uuid REFERENCES public.businesses ON DELETE CASCADE NOT NULL,
    name text NOT NULL,
    type text NOT NULL, -- 'per_kg', 'per_unit', 'percentage'
    amount numeric NOT NULL,
    active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 14. Sales Channels
CREATE TABLE IF NOT EXISTS public.sales_channels (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id uuid REFERENCES public.businesses ON DELETE CASCADE NOT NULL,
    name text NOT NULL,
    fee_pct numeric DEFAULT 0,
    fee_fixed numeric DEFAULT 0,
    active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 15. Product Channel Prices
CREATE TABLE IF NOT EXISTS public.product_channel_prices (
    product_id uuid REFERENCES public.products ON DELETE CASCADE,
    channel_id uuid REFERENCES public.sales_channels ON DELETE CASCADE,
    price numeric NOT NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    PRIMARY KEY (product_id, channel_id)
);

-- 16. Production Lots
CREATE TABLE IF NOT EXISTS public.production_lots (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id uuid REFERENCES public.businesses ON DELETE CASCADE NOT NULL,
    recipe_id uuid REFERENCES public.recipes ON DELETE RESTRICT NOT NULL,
    lot_number text,
    expected_weight_kg numeric NOT NULL,
    actual_weight_kg numeric NOT NULL,
    total_cost numeric NOT NULL,
    produced_at timestamptz DEFAULT now(),
    notes text,
    created_at timestamptz DEFAULT now()
);

-- 17. Inventory Movements
CREATE TABLE IF NOT EXISTS public.inventory_movements (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id uuid REFERENCES public.businesses ON DELETE CASCADE NOT NULL,
    material_id uuid REFERENCES public.materials ON DELETE RESTRICT NOT NULL,
    quantity_change numeric NOT NULL,
    reference_type text NOT NULL,
    reference_id uuid,
    created_at timestamptz DEFAULT now()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ==============================================================================

ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.material_price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_packaging ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fixed_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.variable_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_channel_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.production_lots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY;

-- Función helper para verificar membresía en el negocio
CREATE OR REPLACE FUNCTION public.is_business_member(business_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.business_members bm
    WHERE bm.business_id = $1 AND bm.profile_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Limpieza y recreación de políticas seguras
DO $$
BEGIN
    DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
    DROP POLICY IF EXISTS "View businesses" ON public.businesses;
    DROP POLICY IF EXISTS "Update businesses" ON public.businesses;
    DROP POLICY IF EXISTS "Members view" ON public.business_members;
    DROP POLICY IF EXISTS "Members manage suppliers" ON public.suppliers;
    DROP POLICY IF EXISTS "Members manage materials" ON public.materials;
    DROP POLICY IF EXISTS "Members manage recipes" ON public.recipes;
    DROP POLICY IF EXISTS "Members manage products" ON public.products;
    DROP POLICY IF EXISTS "Members manage fixed_costs" ON public.fixed_costs;
    DROP POLICY IF EXISTS "Members manage variable_costs" ON public.variable_costs;
    DROP POLICY IF EXISTS "Members manage sales_channels" ON public.sales_channels;
    DROP POLICY IF EXISTS "Members manage recipe_items" ON public.recipe_items;
    DROP POLICY IF EXISTS "Members manage product_packaging" ON public.product_packaging;
    DROP POLICY IF EXISTS "Members manage product_channel_prices" ON public.product_channel_prices;
    DROP POLICY IF EXISTS "Members manage supplier_materials" ON public.supplier_materials;
    DROP POLICY IF EXISTS "Members manage price history" ON public.material_price_history;
    DROP POLICY IF EXISTS "Members manage production_lots" ON public.production_lots;
    DROP POLICY IF EXISTS "Members manage inventory_movements" ON public.inventory_movements;
END $$;

-- Políticas Profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Políticas Businesses
CREATE POLICY "View businesses" ON public.businesses FOR SELECT USING (is_business_member(id));
CREATE POLICY "Update businesses" ON public.businesses FOR UPDATE USING (is_business_member(id));

-- Políticas Business Members
CREATE POLICY "Members view" ON public.business_members FOR SELECT USING (is_business_member(business_id));

-- Políticas de entidades por negocio
CREATE POLICY "Members manage suppliers" ON public.suppliers FOR ALL USING (is_business_member(business_id)) WITH CHECK (is_business_member(business_id));
CREATE POLICY "Members manage materials" ON public.materials FOR ALL USING (is_business_member(business_id)) WITH CHECK (is_business_member(business_id));
CREATE POLICY "Members manage recipes" ON public.recipes FOR ALL USING (is_business_member(business_id)) WITH CHECK (is_business_member(business_id));
CREATE POLICY "Members manage products" ON public.products FOR ALL USING (is_business_member(business_id)) WITH CHECK (is_business_member(business_id));
CREATE POLICY "Members manage fixed_costs" ON public.fixed_costs FOR ALL USING (is_business_member(business_id)) WITH CHECK (is_business_member(business_id));
CREATE POLICY "Members manage variable_costs" ON public.variable_costs FOR ALL USING (is_business_member(business_id)) WITH CHECK (is_business_member(business_id));
CREATE POLICY "Members manage sales_channels" ON public.sales_channels FOR ALL USING (is_business_member(business_id)) WITH CHECK (is_business_member(business_id));
CREATE POLICY "Members manage production_lots" ON public.production_lots FOR ALL USING (is_business_member(business_id)) WITH CHECK (is_business_member(business_id));
CREATE POLICY "Members manage inventory_movements" ON public.inventory_movements FOR ALL USING (is_business_member(business_id)) WITH CHECK (is_business_member(business_id));

CREATE POLICY "Members manage recipe_items" ON public.recipe_items FOR ALL USING (
    EXISTS (SELECT 1 FROM public.recipes r WHERE r.id = recipe_items.recipe_id AND is_business_member(r.business_id))
) WITH CHECK (
    EXISTS (SELECT 1 FROM public.recipes r WHERE r.id = recipe_items.recipe_id AND is_business_member(r.business_id))
);

CREATE POLICY "Members manage product_packaging" ON public.product_packaging FOR ALL USING (
    EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_packaging.product_id AND is_business_member(p.business_id))
) WITH CHECK (
    EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_packaging.product_id AND is_business_member(p.business_id))
);

CREATE POLICY "Members manage product_channel_prices" ON public.product_channel_prices FOR ALL USING (
    EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_channel_prices.product_id AND is_business_member(p.business_id))
) WITH CHECK (
    EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_channel_prices.product_id AND is_business_member(p.business_id))
);

CREATE POLICY "Members manage supplier_materials" ON public.supplier_materials FOR ALL USING (
    EXISTS (SELECT 1 FROM public.suppliers s WHERE s.id = supplier_materials.supplier_id AND is_business_member(s.business_id))
) WITH CHECK (
    EXISTS (SELECT 1 FROM public.suppliers s WHERE s.id = supplier_materials.supplier_id AND is_business_member(s.business_id))
);

CREATE POLICY "Members manage price history" ON public.material_price_history FOR ALL USING (
    EXISTS (SELECT 1 FROM public.materials m WHERE m.id = material_price_history.material_id AND is_business_member(m.business_id))
) WITH CHECK (
    EXISTS (SELECT 1 FROM public.materials m WHERE m.id = material_price_history.material_id AND is_business_member(m.business_id))
);

-- ==============================================================================
-- TRIGGER PARA REGISTRO AUTOMÁTICO DE USUARIOS Y NEGOCIOS
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- 1. Crear Perfil
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    new.id,
    COALESCE(new.email, ''),
    COALESCE(new.raw_user_meta_data->>'full_name', '')
  )
  ON CONFLICT (id) DO NOTHING;

  -- 2. Crear Negocio asociado (ID = ID de usuario)
  INSERT INTO public.businesses (id, name)
  VALUES (
    new.id,
    'Mi Negocio'
  )
  ON CONFLICT (id) DO NOTHING;

  -- 3. Asignar rol de dueño (Owner)
  INSERT INTO public.business_members (business_id, profile_id, role)
  VALUES (
    new.id,
    new.id,
    'owner'
  )
  ON CONFLICT (business_id, profile_id) DO NOTHING;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
