import { useEffect, useState, useRef } from 'react';
import Layout from '../components/Layout';
import api from '../config/api';
import { toast } from 'react-toastify';
import { 
  FiUsers, 
  FiShoppingCart, 
  FiTrendingUp, 
  FiDollarSign,
  FiFilter,
  FiX,
  FiCalendar,
  FiPackage,
  FiDownload
} from 'react-icons/fi';
import { ClipLoader } from 'react-spinners';
import { formatCurrency } from '../utils/formatters';
import {
  PieChart,
  Pie,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#6366f1'];

const Dashboard = () => {
  const dashboardRef = useRef(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exportingPDF, setExportingPDF] = useState(false);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    client: '',
    vendedor: '',
    tipoPlanilla: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [clients, setClients] = useState([]);
  const [vendedores, setVendedores] = useState([]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [filters]);

  const fetchInitialData = async () => {
    try {
      const [clientsRes, vendedoresRes] = await Promise.all([
        api.get('/clients'),
        api.get('/vendedores')
      ]);
      setClients(clientsRes.data);
      setVendedores(vendedoresRes.data);
    } catch (error) {
      console.error('Error fetching initial data:', error);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.client) params.append('client', filters.client);
      if (filters.vendedor) params.append('vendedor', filters.vendedor);
      if (filters.tipoPlanilla) params.append('tipoPlanilla', filters.tipoPlanilla);

      const response = await api.get(`/stats/dashboard?${params.toString()}`);
      setStats(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      client: '',
      vendedor: '',
      tipoPlanilla: ''
    });
  };

  // Función para exportar a PDF
  const exportToPDF = async () => {
    setExportingPDF(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).default;
      
      const element = dashboardRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#f9fafb'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      const fecha = new Date().toLocaleDateString('es-AR').replace(/\//g, '-');
      pdf.save(`estadisticas-${fecha}.pdf`);
      toast.success('PDF generado correctamente');
    } catch (error) {
      console.error('Error generando PDF:', error);
      toast.error('Error al generar PDF');
    } finally {
      setExportingPDF(false);
    }
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

  const statCards = [
    {
      title: 'Total Pedidos',
      value: stats.general.totalOrders,
      icon: FiShoppingCart,
      color: 'bg-blue-500',
    },
    {
      title: 'Total Clientes',
      value: stats.general.totalClients,
      icon: FiUsers,
      color: 'bg-green-500',
    },
    {
      title: 'Total Items',
      value: stats.general.totalItems,
      icon: FiPackage,
      color: 'bg-purple-500',
    },
    {
      title: 'Total Neto',
      value: `$${formatCurrency(stats.general.totalNeto)}`,
      icon: FiDollarSign,
      color: 'bg-yellow-500',
    },
  ];

  // Preparar datos para el gráfico de torta (órdenes por tipo)
  const pieData = Object.entries(stats.ordersByType).map(([type, count]) => ({
    name: `Planilla ${type}`,
    value: count
  }));

  // Preparar datos para el gráfico de barras (top clientes por órdenes)
  const barData = stats.topClientsByOrders.slice(0, 10).map(item => ({
    name: item.name.length > 20 ? item.name.substring(0, 20) + '...' : item.name,
    pedidos: item.count
  }));

  // Preparar datos para el gráfico de barras (top clientes por revenue)
  const revenueBarData = stats.topClientsByRevenue.slice(0, 10).map(item => ({
    name: item.name.length > 20 ? item.name.substring(0, 20) + '...' : item.name,
    revenue: item.revenue
  }));

  // Preparar datos para el gráfico de línea (órdenes por día)
  const lineData = stats.dailyStats.slice(-30).map(item => ({
    fecha: item.date,
    pedidos: item.count,
    revenue: item.revenue
  }));

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header con filtros */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100">Estadísticas Avanzadas</h1>
          <div className="flex gap-3">
            <button
              onClick={exportToPDF}
              disabled={exportingPDF}
              className="btn bg-green-500 hover:bg-green-600 text-white flex items-center gap-2"
            >
              {exportingPDF ? (
                <ClipLoader size={16} color="#ffffff" />
              ) : (
                <FiDownload />
              )}
              {exportingPDF ? 'Generando...' : 'Exportar PDF'}
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-2"
            >
              <FiFilter />
              {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
            </button>
          </div>
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
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
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
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Cliente
                </label>
                <select
                  value={filters.client}
                  onChange={(e) => handleFilterChange('client', e.target.value)}
                  className="input"
                >
                  <option value="">Todos</option>
                  {clients.map(client => (
                    <option key={client._id} value={client._id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Vendedor
                </label>
                <select
                  value={filters.vendedor}
                  onChange={(e) => handleFilterChange('vendedor', e.target.value)}
                  className="input"
                >
                  <option value="">Todos</option>
                  {vendedores.map(vendedor => (
                    <option key={vendedor._id} value={vendedor._id}>
                      {vendedor.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Planilla
                </label>
                <select
                  value={filters.tipoPlanilla}
                  onChange={(e) => handleFilterChange('tipoPlanilla', e.target.value)}
                  className="input"
                >
                  <option value="">Todas</option>
                  <option value="A">Planilla A</option>
                  <option value="B">Planilla B</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Contenedor para exportar a PDF */}
        <div ref={dashboardRef} className="space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {statCards.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-800 dark:text-gray-100 mt-1">{stat.value}</p>
                    </div>
                    <div className={`${stat.color} p-3 rounded-lg`}>
                      <Icon className="text-white" size={24} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        {/* Estadísticas adicionales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="card">
            <p className="text-gray-500 dark:text-gray-400 text-sm">Total Importe</p>
            <p className="text-xl font-bold text-gray-800 dark:text-gray-100">${formatCurrency(stats.general.totalImporte)}</p>
          </div>
          <div className="card">
            <p className="text-gray-500 dark:text-gray-400 text-sm">Total Descuento</p>
            <p className="text-xl font-bold text-red-600 dark:text-red-400">${formatCurrency(stats.general.totalDescuento)}</p>
          </div>
          <div className="card">
            <p className="text-gray-500 dark:text-gray-400 text-sm">Total Efectivo</p>
            <p className="text-xl font-bold text-green-600 dark:text-green-400">${formatCurrency(stats.general.totalEfectivo)}</p>
          </div>
          <div className="card">
            <p className="text-gray-500 dark:text-gray-400 text-sm">Total Cheques</p>
            <p className="text-xl font-bold text-blue-600 dark:text-blue-400">${formatCurrency(stats.general.totalCheques)}</p>
          </div>
          <div className="card">
            <p className="text-gray-500 dark:text-gray-400 text-sm">Promedio Items/Orden</p>
            <p className="text-xl font-bold text-purple-600 dark:text-purple-400">{stats.general.avgItemsPerOrder}</p>
          </div>
          <div className="card">
            <p className="text-gray-500 dark:text-gray-400 text-sm">Valor Promedio Orden</p>
            <p className="text-xl font-bold text-yellow-600 dark:text-yellow-400">${formatCurrency(stats.general.avgOrderValue)}</p>
          </div>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Gráfico de Torta - Órdenes por Tipo */}
          <div className="card">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Distribución por Tipo de Planilla</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Gráfico de Barras - Top Clientes por Pedidos */}
          <div className="card">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Top Clientes por Cantidad de Pedidos</h2>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 70 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  interval={0}
                  tick={{ fontSize: 12 }}
                  height={60}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="pedidos" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Gráfico de Barras - Top Clientes por Revenue */}
          <div className="card">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Top Clientes por Facturación</h2>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={revenueBarData} margin={{ top: 20, right: 30, left: 20, bottom: 70 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  interval={0}
                  tick={{ fontSize: 12 }}
                  height={60}
                />
                <YAxis />
                <Tooltip formatter={(value) => `$${formatCurrency(value)}`} />
                <Bar dataKey="revenue" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Gráfico de Línea - Tendencia de Pedidos */}
          <div className="card">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Tendencia de Pedidos (Últimos 30 Días)</h2>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={lineData} margin={{ top: 20, right: 30, left: 20, bottom: 70 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="fecha" 
                  interval={0}
                  tick={{ fontSize: 12 }}
                  height={60}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="pedidos" stroke="#8b5cf6" name="Pedidos" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tabla de Vendedores */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Rendimiento por Vendedor</h2>
          {stats.vendedorStats.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">No hay datos de vendedores</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Vendedor</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Pedidos</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Facturación</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.vendedorStats.map((vendedor, index) => (
                    <tr key={index} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="py-3 px-4 text-gray-900 dark:text-gray-100">{vendedor.name}</td>
                      <td className="py-3 px-4 text-gray-900 dark:text-gray-100">{vendedor.count}</td>
                      <td className="py-3 px-4 font-semibold text-green-600 dark:text-green-400">
                        ${formatCurrency(vendedor.revenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        {/* Fin del contenedor para exportar a PDF */}
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
