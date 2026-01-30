import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Calendar, Users, Settings, BarChart, LogOut, Wallet, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar = ({ isOpen = true, onClose }: SidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const handleNavClick = () => {
    // Close sidebar on mobile after navigation
    if (onClose) {
      onClose();
    }
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
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed md:static inset-y-0 left-0 z-50
        w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="h-16 flex items-center justify-between px-4 font-bold text-2xl text-primary">
          <span>Setor G VIP</span>
          {/* Close button for mobile */}
          <button 
            onClick={onClose}
            className="md:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <nav className="flex-1 px-4 py-4">
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.href}
              onClick={handleNavClick}
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
    </>
  );
};

export default Sidebar;
