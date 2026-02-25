import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  FiHome, 
  FiUsers, 
  FiShoppingCart, 
  FiUser, 
  FiLogOut,
  FiMenu,
  FiX,
  FiMoon,
  FiSun,
  FiTrendingUp,
  FiBarChart2
} from 'react-icons/fi';
import { useState } from 'react';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { path: '/', icon: FiHome, label: 'Inicio' },
    { path: '/clients', icon: FiUsers, label: 'Proveedores' },
    { path: '/clientes', icon: FiUsers, label: 'Clientes' },
    { path: '/orders', icon: FiShoppingCart, label: 'Planillas de Cobranza' },
    { path: '/sales-by-seller', icon: FiTrendingUp, label: 'Ventas por Vendedor' },
    { path: '/analysis', icon: FiBarChart2, label: 'Panel de Análisis' },
    { path: '/profile', icon: FiUser, label: 'Perfil' },
  ];

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 bg-white dark:bg-gray-800 shadow-md z-40 h-16">
        <div className="flex items-center justify-between h-full px-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-600 dark:text-gray-300 p-2 -ml-2"
          >
            <FiMenu size={24} />
          </button>
          
          <h1 className="text-lg font-bold text-primary-600 dark:text-primary-400">Sistema de Cobranzas</h1>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleTheme}
              className="text-gray-600 dark:text-gray-300 p-2"
              title={darkMode ? 'Modo claro' : 'Modo oscuro'}
            >
              {darkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
            </button>
            <button
              onClick={handleLogout}
              className="text-red-600 dark:text-red-400 p-2 -mr-2"
            >
              <FiLogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        <div className="flex items-center justify-between h-16 px-6 bg-primary-600 dark:bg-primary-700">
          <h1 className="text-xl font-bold text-white">Sistema de Cobranzas</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* User Info - Mobile */}
        <div className="lg:hidden p-4 bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600">
          <p className="text-sm text-gray-600 dark:text-gray-400">Bienvenido,</p>
          <p className="font-semibold text-gray-800 dark:text-gray-200">{user?.name}</p>
        </div>

        <nav className="mt-6">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex items-center px-6 py-4 text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-gray-700 hover:text-primary-600 dark:hover:text-primary-400 transition-colors
                  ${isActive ? 'bg-primary-50 dark:bg-gray-700 text-primary-600 dark:text-primary-400 border-r-4 border-primary-600 dark:border-primary-400' : ''}
                `}
                onClick={(e) => {
                  setSidebarOpen(false);
                  // Navegar incluso si ya estamos en la misma ruta
                  if (location.pathname === item.path) {
                    e.preventDefault();
                    navigate(item.path, { replace: true });
                    window.scrollTo(0, 0);
                  }
                }}
              >
                <Icon className="mr-3" size={22} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 w-full p-6 lg:block hidden space-y-2">
          {/* <button
            onClick={toggleTheme}
            className="flex items-center w-full px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            {darkMode ? <FiSun className="mr-3" size={20} /> : <FiMoon className="mr-3" size={20} />}
            <span>{darkMode ? 'Modo Claro' : 'Modo Oscuro'}</span>
          </button> */}
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <FiLogOut className="mr-3" size={20} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:ml-64 pt-16 lg:pt-0">
        {/* Desktop Top Bar */}
        <header className="hidden lg:flex bg-white dark:bg-gray-800 shadow-sm h-16 items-center justify-between px-6">
          <div className="flex items-center">
            <span className="text-gray-600 dark:text-gray-400 mr-2">Bienvenido,</span>
            <span className="font-semibold text-gray-800 dark:text-gray-200">{user?.name}</span>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6 sm:p-8 lg:p-10">
          {children}
        </main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;
