import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../config/api';
import { toast } from 'react-toastify';
import { FiCalendar, FiTrendingUp, FiFilter, FiX } from 'react-icons/fi';
import { ClipLoader } from 'react-spinners';
import { formatCurrency } from '../utils/formatters';
import {
  ResponsiveContainer,
  LineChart,
  Line,
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

const Analysis = () => {
  const [timeAnalysis, setTimeAnalysis] = useState(null);
  const [trending, setTrending] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    year: new Date().getFullYear().toString(),
    limit: '10'
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Time Analysis
      const timeParams = new URLSearchParams();
      if (filters.year) timeParams.append('year', filters.year);
      const timeResponse = await api.get(`/stats/time-analysis?${timeParams.toString()}`);
      setTimeAnalysis(timeResponse.data);

      // Trending
      const trendingParams = new URLSearchParams();
      if (filters.limit) trendingParams.append('limit', filters.limit);
      const trendingResponse = await api.get(`/stats/trending?${trendingParams.toString()}`);
      setTrending(trendingResponse.data);
      
      setLoading(false);
    } catch (error) {
      toast.error('Error al cargar análisis');
      console.error(error);
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      year: new Date().getFullYear().toString(),
      limit: '10'
    });
  };

  if (loading || !timeAnalysis || !trending) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <ClipLoader color="#3b82f6" size={50} />
        </div>
      </Layout>
    );
  }

  // Validar que los datos necesarios existan
  const months = timeAnalysis.months || [];
  const topClients = trending.topClients || [];
  const topProducts = trending.topProducts || [];

  // Datos para gráfico de línea (tendencia mensual)
  const lineData = months.map(month => ({
    mes: month.monthName,
    pedidos: month.orders || 0,
    neto: month.neto || 0
  }));

  // Datos para top clientes
  const topClientsData = topClients.map(client => ({
    name: client.name && client.name.length > 20 ? client.name.substring(0, 20) + '...' : (client.name || 'Sin nombre'),
    pedidos: client.orderCount || 0
  }));

  // Datos para top productos (pie chart)
  const topProductsData = topProducts.slice(0, 8).map(product => ({
    name: product.productName && product.productName.length > 30 ? product.productName.substring(0, 30) + '...' : (product.productName || 'Sin nombre'),
    value: product.orderCount || 0
  }));

  // Generar opciones de años (últimos 5 años)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - i);

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100">Panel de Análisis</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Análisis temporal y tendencias</p>
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
                  Año
                </label>
                <select
                  value={filters.year}
                  onChange={(e) => handleFilterChange('year', e.target.value)}
                  className="input"
                >
                  {yearOptions.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Top N (Clientes/Productos)
                </label>
                <select
                  value={filters.limit}
                  onChange={(e) => handleFilterChange('limit', e.target.value)}
                  className="input"
                >
                  <option value="5">Top 5</option>
                  <option value="10">Top 10</option>
                  <option value="15">Top 15</option>
                  <option value="20">Top 20</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Resumen Anual */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Total Pedidos {filters.year}</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-gray-100 mt-1">{timeAnalysis.summary?.totalOrders || 0}</p>
              </div>
              <div className="bg-blue-500 p-3 rounded-lg">
                <FiCalendar className="text-white" size={24} />
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Total Neto {filters.year}</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-gray-100 mt-1">${formatCurrency(timeAnalysis.summary?.totalNeto || 0)}</p>
              </div>
              <div className="bg-green-500 p-3 rounded-lg">
                <FiTrendingUp className="text-white" size={24} />
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Promedio Mensual</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-gray-100 mt-1">${formatCurrency(timeAnalysis.summary?.avgMonthlyNeto || 0)}</p>
              </div>
              <div className="bg-yellow-500 p-3 rounded-lg">
                <FiTrendingUp className="text-white" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Gráfico de Tendencia Mensual */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Tendencia Mensual {filters.year}</h2>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={lineData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip 
                formatter={(value, name) => {
                  if (name === 'neto') return [`$${formatCurrency(value)}`, 'Total Neto'];
                  return [value, 'Pedidos'];
                }}
              />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="pedidos" stroke="#3b82f6" name="Pedidos" strokeWidth={2} />
              <Line yAxisId="right" type="monotone" dataKey="neto" stroke="#10b981" name="Total Neto" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Gráficos de Trending */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Clientes por Pedidos */}
          <div className="card">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Top Clientes por Pedidos</h2>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={topClientsData} margin={{ top: 20, right: 30, left: 20, bottom: 90 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  interval={0}
                  angle={-45}
                  textAnchor="end"
                  tick={{ fontSize: 11 }}
                  height={110}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="pedidos" fill="#8b5cf6" name="Pedidos" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Top Productos */}
          <div className="card">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Productos Más Vendidos</h2>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={topProductsData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : ''}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {topProductsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend 
                  layout="vertical" 
                  align="right" 
                  verticalAlign="middle"
                  wrapperStyle={{ fontSize: '12px', maxWidth: '200px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tablas Detalladas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Tabla Top Clientes */}
          <div className="card">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Detalle Top Clientes</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">#</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Cliente</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Pedidos</th>
                  </tr>
                </thead>
                <tbody>
                  {topClients.map((client, index) => (
                    <tr key={index} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="py-3 px-4 text-gray-900 dark:text-gray-100">{index + 1}</td>
                      <td className="py-3 px-4 text-gray-900 dark:text-gray-100">{client.name}</td>
                      <td className="py-3 px-4 text-right font-semibold text-purple-600 dark:text-purple-400">
                        {client.orderCount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tabla Top Productos */}
          <div className="card">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Detalle Top Productos</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">#</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Producto</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Frecuencia</th>
                  </tr>
                </thead>
                <tbody>
                  {topProducts.map((product, index) => (
                    <tr key={index} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="py-3 px-4 text-gray-900 dark:text-gray-100">{index + 1}</td>
                      <td className="py-3 px-4 text-gray-900 dark:text-gray-100">{product.productName}</td>
                      <td className="py-3 px-4 text-right font-semibold text-green-600 dark:text-green-400">
                        {product.orderCount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Tabla Mensual Detallada */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Desglose Mensual {filters.year}</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Mes</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Pedidos</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Total Neto</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Promedio/Pedido</th>
                </tr>
              </thead>
              <tbody>
                {months.map((month, index) => (
                  <tr key={index} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="py-3 px-4 text-gray-900 dark:text-gray-100 font-medium">{month.monthName}</td>
                    <td className="py-3 px-4 text-right text-gray-900 dark:text-gray-100">{month.orders || 0}</td>
                    <td className="py-3 px-4 text-right font-semibold text-green-600 dark:text-green-400">
                      ${formatCurrency(month.neto || 0)}
                    </td>
                    <td className="py-3 px-4 text-right text-gray-900 dark:text-gray-100">
                      ${(month.orders || 0) > 0 ? formatCurrency((month.neto || 0) / (month.orders || 1)) : '0.00'}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 dark:border-gray-600 font-bold bg-gray-50 dark:bg-gray-700">
                  <td className="py-3 px-4 text-gray-900 dark:text-gray-100">TOTAL</td>
                  <td className="py-3 px-4 text-right text-gray-900 dark:text-gray-100">{timeAnalysis.summary?.totalOrders || 0}</td>
                  <td className="py-3 px-4 text-right text-green-600 dark:text-green-400">
                    ${formatCurrency(timeAnalysis.summary?.totalNeto || 0)}
                  </td>
                  <td className="py-3 px-4 text-right text-gray-900 dark:text-gray-100">
                    ${(timeAnalysis.summary?.totalOrders || 0) > 0 ? formatCurrency((timeAnalysis.summary?.totalNeto || 0) / (timeAnalysis.summary?.totalOrders || 1)) : '0.00'}
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

export default Analysis;
