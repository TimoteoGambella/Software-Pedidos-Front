import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  FiHome, 
  FiUsers, 
  FiShoppingCart, 
  FiUser, 
  FiLogOut,
  FiMenu,
  FiX
} from 'react-icons/fi';
import { useState } from 'react';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { path: '/', icon: FiHome, label: 'Inicio' },
    { path: '/clients', icon: FiUsers, label: 'Clientes' },
    { path: '/orders', icon: FiShoppingCart, label: 'Pedidos' },
    { path: '/profile', icon: FiUser, label: 'Perfil' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 bg-white shadow-md z-40 h-16">
        <div className="flex items-center justify-between h-full px-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-600 p-2 -ml-2"
          >
            <FiMenu size={24} />
          </button>
          
          <h1 className="text-lg font-bold text-primary-600">Sistema Pedidos</h1>
          
          <button
            onClick={handleLogout}
            className="text-red-600 p-2 -mr-2"
          >
            <FiLogOut size={20} />
          </button>
        </div>
      </header>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        <div className="flex items-center justify-between h-16 px-6 bg-primary-600">
          <h1 className="text-xl font-bold text-white">Sistema Pedidos</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* User Info - Mobile */}
        <div className="lg:hidden p-4 bg-gray-50 border-b">
          <p className="text-sm text-gray-600">Bienvenido,</p>
          <p className="font-semibold text-gray-800">{user?.name}</p>
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
                  flex items-center px-6 py-4 text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors
                  ${isActive ? 'bg-primary-50 text-primary-600 border-r-4 border-primary-600' : ''}
                `}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon className="mr-3" size={22} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 w-full p-6 lg:block hidden">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <FiLogOut className="mr-3" size={20} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:ml-64 pt-16 lg:pt-0">
        {/* Desktop Top Bar */}
        <header className="hidden lg:flex bg-white shadow-sm h-16 items-center justify-between px-6">
          <div className="flex items-center">
            <span className="text-gray-600 mr-2">Bienvenido,</span>
            <span className="font-semibold text-gray-800">{user?.name}</span>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6">
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
