# Milanga Cost Lab

Sistema de gestión económica, costos, pricing y rentabilidad para negocios de alimentos.

---

## Stack Tecnológico

- **Next.js 14+** (App Router, TypeScript)
- **Tailwind CSS**
- **Supabase** (PostgreSQL + Auth + RLS)
- **React Hook Form + Zod** (validaciones)
- **Recharts** (gráficos)
- **Lucide Icons**

---

## Primeros Pasos

### 1. Configurar Supabase

1. Crear un proyecto en [supabase.com](https://supabase.com)
2. En el editor SQL, ejecutar el script completo de `supabase_schema.sql` que está en la raíz del proyecto.
3. Copiar las credenciales del proyecto.

### 2. Variables de Entorno

Renombrar `.env.example` a `.env.local` y completar los valores:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxxx
```

### 3. Instalar Dependencias

```bash
npm install
```

### 4. Correr en Desarrollo

```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000).

---

## Estructura del Proyecto

```
src/
├── app/
│   ├── (dashboard)/       # Layout con Sidebar
│   │   ├── dashboard/     # KPIs, alertas
│   │   ├── materials/     # CRUD Materias Primas
│   │   ├── suppliers/     # CRUD Proveedores
│   │   ├── recipes/       # Constructor de Recetas
│   │   ├── products/      # Presentaciones Comerciales
│   │   ├── pricing/       # Módulo de Pricing Interactivo
│   │   ├── lab/           # Laboratorio de Escenarios
│   │   ├── costs/         # Costos Fijos y Variables
│   │   └── channels/      # Canales de Venta
│   └── page.tsx           # Redirige al dashboard
├── components/
│   ├── layout/            # Sidebar, Header
│   ├── pricing/           # Calculadora de pricing
│   └── lab/               # Simulador de escenarios
├── lib/
│   ├── cost-engine/       # Funciones puras de cálculo económico
│   ├── db/                # Cliente Supabase
│   └── formatters/        # Formatos ARS, %, números
├── actions/               # Server Actions (mutaciones de BD)
└── types/                 # Tipos TypeScript de dominio
```

---

## Motor de Costos (`src/lib/cost-engine/`)

Todas las fórmulas económicas están centralizadas aquí. Ningún componente de UI implementa fórmulas por su cuenta:

| Función | Descripción |
|---|---|
| `calculateNominalUnitCost` | Precio / Cant. presentación |
| `calculateUsableCost` | Costo nominal / Rendimiento |
| `calculateRecipeYield` | Peso final / Peso ingredientes |
| `calculateGrossMargin` | (Precio - Costo) / Precio |
| `calculateMarkup` | (Precio - Costo) / Costo |
| `calculateTargetPriceForMargin` | P = Costo / (1 - Margen - Fee%) |
| `calculateContributionMargin` | Precio neto - Costo variable |
| `calculateBreakEvenPoint` | Costos fijos / Contribución |
| `calculateTargetVolumeForProfit` | (Ganancia + CF) / Contribución |

---

## Deploy en Vercel

1. Push al repositorio de GitHub.
2. Conectar el repo en [vercel.com](https://vercel.com).
3. Agregar las variables de entorno (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
4. Deploy automático en cada push a `main`.

---

## Roadmap

- **Fase 0 ✅** Setup, DB, Auth base
- **Fase 1 ✅** Materias Primas, Proveedores, Recetas, Productos, Cost Engine
- **Fase 2 ✅** Pricing, Laboratorio de Escenarios, Costos, Canales de Venta
- **Fase 3** Producción real, alertas inteligentes, comparador de proveedores
- **Fase 4** Stock, Flujo de caja, Clientes, Ventas
