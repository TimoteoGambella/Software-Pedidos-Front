import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../config/api';
import { toast } from 'react-toastify';
import { FiUsers, FiDollarSign, FiTrendingUp, FiFilter, FiX } from 'react-icons/fi';
import { ClipLoader } from 'react-spinners';
import { formatCurrency, formatYAxis, formatYAxisCurrency, formatTooltipCurrency, formatTooltipNumber } from '../utils/formatters';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#6366f1'];

const SalesBySeller = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const response = await api.get(`/stats/sales-by-seller?${params.toString()}`);
      setStats(response.data);
      setLoading(false);
    } catch (error) {
      toast.error('Error al cargar estadísticas de vendedores');
      console.error(error);
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({ startDate: '', endDate: '' });
  };

  if (loading || !stats) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <ClipLoader color="#3b82f6" size={50} />
        </div>
      </Layout>
    );
  }

  // Verificar que sellers existe y es un array
  const sellers = stats.sellers || [];

  if (sellers.length === 0) {
    return (
      <Layout>
        <div className="text-center py-12">
          <FiUsers className="mx-auto text-gray-400 mb-4" size={64} />
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">No hay datos de vendedores</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Intenta ajustar los filtros o agrega pedidos primero.</p>
        </div>
      </Layout>
    );
  }

  // Datos para gráfico de barras (Total Neto)
  const barDataNeto = sellers.map(seller => ({
    name: seller.name.length > 15 ? seller.name.substring(0, 15) + '...' : seller.name,
    totalNeto: seller.totalNeto
  }));

  // Datos para gráfico de torta (Distribución de ventas)
  const pieData = sellers.map(seller => ({
    name: seller.name,
    value: seller.totalNeto
  }));

  // Datos para gráfico de barras (Número de pedidos)
  const barDataOrders = sellers.map(seller => ({
    name: seller.name.length > 15 ? seller.name.substring(0, 15) + '...' : seller.name,
    planillas: seller.orderCount
  }));

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100">Ventas por Vendedor</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Análisis de rendimiento por vendedor</p>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-2"
          >
            <FiFilter />
            {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
          </button>
        </div>

        {/* Panel de filtros */}
        {showFilters && (
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">Filtros</h2>
              <button
                onClick={clearFilters}
                className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 flex items-center gap-1 text-sm"
              >
                <FiX /> Limpiar
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Desde
                </label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Hasta
                </label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  className="input"
                />
              </div>
            </div>
          </div>
        )}

        {/* Totales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Total Vendedores</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-gray-100 mt-1">{sellers.length}</p>
              </div>
              <div className="bg-blue-500 p-3 rounded-lg">
                <FiUsers className="text-white" size={24} />
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Total Planillas</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-gray-100 mt-1">{stats.summary?.totalOrders || 0}</p>
              </div>
              <div className="bg-green-500 p-3 rounded-lg">
                <FiTrendingUp className="text-white" size={24} />
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Total Neto</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-gray-100 mt-1">${formatCurrency(stats.summary?.totalNeto || 0)}</p>
              </div>
              <div className="bg-yellow-500 p-3 rounded-lg">
                <FiDollarSign className="text-white" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Gráfico de Barras - Total Neto */}
          <div className="card">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Total Neto por Vendedor</h2>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={barDataNeto} margin={{ top: 20, right: 30, left: 20, bottom: 70 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  interval={0}
                  textAnchor="end"
                  tick={{ fontSize: 12 }}
                  height={100}
                />
                <YAxis tickFormatter={formatYAxis} />
                <Tooltip formatter={(value) => formatTooltipCurrency(value)} />
                <Bar dataKey="totalNeto" fill="#3b82f6" name="Total Neto" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Gráfico de Torta - Distribución */}
          <div className="card">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Distribución de Ventas</h2>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `$${formatCurrency(value)}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Gráfico de Barras - Número de Pedidos */}
          <div className="card">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Cantidad de Planillas</h2>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={barDataOrders} margin={{ top: 20, right: 30, left: 20, bottom: 70 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  interval={0}
                  textAnchor="end"
                  tick={{ fontSize: 12 }}
                  height={100}
                />
                <YAxis tickFormatter={formatYAxis} />
                <Tooltip formatter={(value) => formatTooltipNumber(value)} />
                <Bar dataKey="planillas" fill="#10b981" name="Planillas" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tabla Detallada */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Detalle por Vendedor</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Vendedor</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Planillas</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Total Neto</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Total Importe</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Descuento</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Efectivo</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Cheques</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Comisiones</th>
                </tr>
              </thead>
              <tbody>
                {sellers.map((seller, index) => (
                  <tr key={index} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="py-3 px-4 text-gray-900 dark:text-gray-100 font-medium">{seller.name}</td>
                    <td className="py-3 px-4 text-right text-gray-900 dark:text-gray-100">{seller.orderCount}</td>
                    <td className="py-3 px-4 text-right font-semibold text-green-600 dark:text-green-400">
                      ${formatCurrency(seller.totalNeto)}
                    </td>
                    <td className="py-3 px-4 text-right text-gray-900 dark:text-gray-100">
                      ${formatCurrency(seller.totalImporte)}
                    </td>
                    <td className="py-3 px-4 text-right text-red-600 dark:text-red-400">
                      ${formatCurrency(seller.totalDescuento)}
                    </td>
                    <td className="py-3 px-4 text-right text-gray-900 dark:text-gray-100">
                      ${formatCurrency(seller.totalEfectivo)}
                    </td>
                    <td className="py-3 px-4 text-right text-blue-600 dark:text-blue-400">
                      ${formatCurrency(seller.totalCheques)}
                    </td>
                    <td className="py-3 px-4 text-right text-purple-600 dark:text-purple-400">
                      ${formatCurrency(seller.totalComisiones)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 dark:border-gray-600 font-bold bg-gray-50 dark:bg-gray-700">
                  <td className="py-3 px-4 text-gray-900 dark:text-gray-100">TOTAL</td>
                  <td className="py-3 px-4 text-right text-gray-900 dark:text-gray-100">{stats.summary?.totalOrders || 0}</td>
                  <td className="py-3 px-4 text-right text-green-600 dark:text-green-400">
                    ${formatCurrency(stats.summary?.totalNeto || 0)}
                  </td>
                  <td className="py-3 px-4 text-right text-gray-900 dark:text-gray-100">
                    ${formatCurrency(stats.summary?.totalImporte || 0)}
                  </td>
                  <td className="py-3 px-4 text-right text-red-600 dark:text-red-400">
                    ${formatCurrency(stats.summary?.totalDescuento || 0)}
                  </td>
                  <td className="py-3 px-4 text-right text-gray-900 dark:text-gray-100">
                    ${formatCurrency(stats.summary?.totalEfectivo || 0)}
                  </td>
                  <td className="py-3 px-4 text-right text-blue-600 dark:text-blue-400">
                    ${formatCurrency(stats.summary?.totalCheques || 0)}
                  </td>
                  <td className="py-3 px-4 text-right text-purple-600 dark:text-purple-400">
                    ${formatCurrency(stats.summary?.totalComisiones || 0)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SalesBySeller;
