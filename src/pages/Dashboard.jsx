import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../config/api';
import { FiUsers, FiShoppingCart, FiTrendingUp, FiDollarSign } from 'react-icons/fi';
import { ClipLoader } from 'react-spinners';
import { formatCurrency } from '../utils/formatters';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalClients: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [clientsRes, ordersRes] = await Promise.all([
        api.get('/clients'),
        api.get('/orders?limit=100&sortBy=createdAt&sortOrder=desc'),
      ]);

      const clients = clientsRes.data;
      const orders = ordersRes.data.orders || ordersRes.data;

      // Calcular totales basados en los items de cada orden
      const totalRevenue = orders.reduce((acc, order) => {
        const orderTotal = order.items?.reduce((sum, item) => sum + (item.neto || 0), 0) || 0;
        return acc + orderTotal;
      }, 0);

      // Contar planillas A y B
      const planillasA = orders.filter(o => o.tipoPlanilla === 'A').length;

      setStats({
        totalClients: clients.length,
        totalOrders: orders.length,
        pendingOrders: planillasA,
        totalRevenue,
      });

      setRecentOrders(orders.slice(0, 5));
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Clientes',
      value: stats.totalClients,
      icon: FiUsers,
      color: 'bg-blue-500',
    },
    {
      title: 'Total Pedidos',
      value: stats.totalOrders,
      icon: FiShoppingCart,
      color: 'bg-green-500',
    },
    {
      title: 'Planillas A',
      value: stats.pendingOrders,
      icon: FiTrendingUp,
      color: 'bg-yellow-500',
    },
    {
      title: 'Total Neto',
      value: `$${formatCurrency(stats.totalRevenue)}`,
      icon: FiDollarSign,
      color: 'bg-purple-500',
    },
  ];

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <ClipLoader color="#3b82f6" size={50} />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Inicio</h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-800 mt-1">{stat.value}</p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <Icon className="text-white" size={24} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Recent Orders */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Pedidos Recientes</h2>
          {recentOrders.length === 0 ? (
            <p className="text-gray-500">No hay pedidos recientes</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Número</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Proveedor</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Vendedor</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Planilla</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Items</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => {
                    const orderTotal = order.items?.reduce((sum, item) => sum + (item.neto || 0), 0) || 0;
                    return (
                      <tr key={order._id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 text-base">{order.orderNumber || 'N/A'}</td>
                        <td className="py-3 px-4 text-base">{order.client?.name || 'N/A'}</td>
                        <td className="py-3 px-4 text-base">{order.vendedor?.nombre || order.vendedor || 'N/A'}</td>
                        <td className="py-3 px-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            order.tipoPlanilla === 'A' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-purple-100 text-purple-800'
                          }`}>
                            Planilla {order.tipoPlanilla || 'N/A'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-base">{order.items?.length || 0}</td>
                        <td className="py-3 px-4 text-base">
                          {order.fechaPlanilla || new Date(order.createdAt).toLocaleDateString('es-AR')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
