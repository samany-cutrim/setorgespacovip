import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Calendar, Users, Settings, BarChart, LogOut, Wallet } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const navItems = [
    { href: '/admin', icon: Home, label: 'Dashboard' },
    { href: '/admin/reservations', icon: Calendar, label: 'Reservas' },
    { href: '/admin/guests', icon: Users, label: 'Hóspedes' },
    { href: '/admin/reports', icon: BarChart, label: 'Relatórios' },
    { href: '/admin/financial', icon: Wallet, label: 'Financeiro' },
    { href: '/admin/settings', icon: Settings, label: 'Configurações' },
  ];

  return (
    <div className="hidden lg:flex w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex-col">
      <div className="h-16 flex items-center justify-center font-bold text-2xl text-primary">
        Setor G VIP
      </div>
      <nav className="flex-1 px-4 py-4">
        {navItems.map((item) => (
          <Link
            key={item.label}
            to={item.href}
            className={`flex items-center px-4 py-2 mt-2 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 ${
              location.pathname === item.href ? 'bg-gray-200 dark:bg-gray-700' : ''
            }`}
          >
            <item.icon className="w-6 h-6" />
            <span className="mx-4 font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>
      <div className="px-4 py-4">
        <button
          onClick={handleLogout}
          className="flex items-center px-4 py-2 mt-2 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 w-full transition"
        >
          <LogOut className="w-6 h-6" />
          <span className="mx-4 font-medium">Sair</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
