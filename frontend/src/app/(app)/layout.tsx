'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';

const NAV_ITEMS = [
  { href: '/dashboard',     label: 'Dashboard',      icon: '◈' },
  { href: '/accounts',      label: 'Cuentas',         icon: '⬡' },
  { href: '/transactions',  label: 'Transacciones',   icon: '⇄' },
  { href: '/settings',      label: 'Configuración',   icon: '⚙' },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 flex flex-col bg-navy-800 text-white">
        {/* Logo */}
        <div className="px-6 py-5 border-b border-navy-700">
          <span className="text-lg font-bold tracking-tight">Mis Finanzas</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map(item => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-navy-600 text-white'
                    : 'text-navy-300 hover:bg-navy-700 hover:text-white'
                }`}
              >
                <span className="text-base leading-none">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User footer */}
        <div className="px-4 py-4 border-t border-navy-700">
          <p className="text-xs text-navy-400 truncate mb-2">{user?.email}</p>
          <button
            onClick={logout}
            className="w-full text-left text-xs text-navy-400 hover:text-white transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto bg-gray-50">
        {children}
      </main>
    </div>
  );
}
