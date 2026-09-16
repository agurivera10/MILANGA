import Link from 'next/link'
import {
  LayoutDashboard,
  Package,
  Truck,
  BookOpen,
  Tag,
  LineChart,
  DollarSign,
  Briefcase,
  Factory,
  ShoppingBag,
  LogOut
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Materias Primas', href: '/materials', icon: Package },
  { name: 'Proveedores', href: '/suppliers', icon: Truck },
  { name: 'Recetas', href: '/recipes', icon: BookOpen },
  { name: 'Productos', href: '/products', icon: Tag },
  { name: 'Producción', href: '/production', icon: Factory },
  { name: 'Pricing', href: '/pricing', icon: DollarSign },
  { name: 'Laboratorio', href: '/lab', icon: LineChart },
  { name: 'Costos', href: '/costs', icon: Briefcase },
  { name: 'Canales', href: '/channels', icon: ShoppingBag },
]

export function Sidebar() {
  return (
    <div className="flex h-full w-64 flex-col border-r border-zinc-200 bg-white/50 backdrop-blur-xl">
      <div className="flex h-16 items-center px-6 border-b border-zinc-100">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="font-bold text-xl tracking-tight text-zinc-900">MILANGA</span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600">Cost Lab</span>
        </Link>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-3">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="group flex items-center rounded-md px-3 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 transition-colors"
            >
              <item.icon
                className="mr-3 h-5 w-5 flex-shrink-0 text-zinc-400 group-hover:text-zinc-600 transition-colors"
                aria-hidden="true"
              />
              {item.name}
            </Link>
          ))}
        </nav>
      </div>

      <div className="border-t border-zinc-100 p-3">
        <form action="/api/logout" method="post">
          <button
            type="submit"
            className="group flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 transition-colors"
          >
            <LogOut className="mr-3 h-5 w-5 flex-shrink-0 text-zinc-400 group-hover:text-zinc-600 transition-colors" />
            Cerrar Sesión
          </button>
        </form>
      </div>
    </div>
  )
}
