'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  TrendingUp, 
  UserPlus, 
  DollarSign, 
  Calculator,
  BarChart3,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  {
    name: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    name: 'Referidos',
    href: '/referrals',
    icon: Users,
  },
  {
    name: 'Análisis',
    href: '/analytics',
    icon: BarChart3,
  },
  {
    name: 'Contactos',
    href: '/leads',
    icon: UserPlus,
  },
  {
    name: 'Inversiones',
    href: '/investments',
    icon: DollarSign,
  },
  {
    name: 'Calculadoras',
    href: '/calculators',
    icon: Calculator,
  },
  {
    name: 'Configuración',
    href: '/settings',
    icon: Settings,
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col bg-white border-r border-gray-200">
      <div className="flex h-16 shrink-0 items-center px-6 border-b border-gray-200">
        <div className="flex items-center">
          <TrendingUp className="h-8 w-8 text-primary-600" />
          <span className="ml-2 text-xl font-bold text-gray-900">MLM Dashboard</span>
        </div>
      </div>
      <nav className="flex flex-1 flex-col overflow-y-auto p-4">
        <ul className="space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    'group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-primary-100 text-primary-700 shadow-sm'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  )}
                >
                  <item.icon
                    className={cn(
                      'mr-3 h-5 w-5 shrink-0 transition-colors',
                      isActive ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
                    )}
                  />
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="p-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 text-center">
          © 2024 MLM Dashboard
        </div>
      </div>
    </div>
  );
}