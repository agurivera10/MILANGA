import { Bell, Menu, User } from 'lucide-react'

export function Header() {
  return (
    <header className="flex h-16 shrink-0 items-center gap-x-4 border-b border-zinc-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <div className="flex flex-1 items-center">
          {/* Mobile menu button could go here */}
          <button type="button" className="-m-2.5 p-2.5 text-zinc-700 lg:hidden">
            <span className="sr-only">Open sidebar</span>
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          <button type="button" className="-m-2.5 p-2.5 text-zinc-400 hover:text-zinc-500">
            <span className="sr-only">View notifications</span>
            <Bell className="h-5 w-5" aria-hidden="true" />
          </button>
          
          <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-zinc-200" aria-hidden="true" />
          
          <div className="flex items-center gap-x-4">
            <button type="button" className="flex items-center gap-x-2 text-sm font-semibold leading-6 text-zinc-900">
              <div className="h-8 w-8 rounded-full bg-zinc-100 flex items-center justify-center border border-zinc-200">
                <User className="h-4 w-4 text-zinc-500" />
              </div>
              <span className="hidden lg:block">Perfil</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
