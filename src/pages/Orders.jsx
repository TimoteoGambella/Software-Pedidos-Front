import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../config/api';
import { toast } from 'react-toastify';
import { FiPlus, FiTrash2, FiEye, FiDownload, FiEdit2 } from 'react-icons/fi';
import { ClipLoader } from 'react-spinners';
import { formatCurrency } from '../utils/formatters';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [clients, setClients] = useState([]);
  const [vendedores, setVendedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list'); // 'list', 'create', 'view', 'edit'
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [editingOrderId, setEditingOrderId] = useState(null);
  
  // Filtros y paginación
  const [filters, setFilters] = useState({
    client: '',
    vendedor: '',
    tipoPlanilla: '',
    search: '',
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  
  // Form state
  const [selectedClient, setSelectedClient] = useState('');
  const [vendedor, setVendedor] = useState('');
  const [vendedorData, setVendedorData] = useState(null); // Datos completos del vendedor
  const [tipoPlanilla, setTipoPlanilla] = useState('');
  const [items, setItems] = useState([]);
  const [observaciones, setObservaciones] = useState('');
  const [comisiones, setComisiones] = useState('');
  const [fechaPlanilla, setFechaPlanilla] = useState('');
  const [editingItemIndex, setEditingItemIndex] = useState(null);
  
  // Current item being edited
  const [currentItem, setCurrentItem] = useState({
    nombreCliente: '',
    facturaNumero: '',
    importe: '',
    descuento: '',
    neto: '',
    chequeNumero: '',
    banco: '',
    plaza: '',
    importeCheque: '',
    fecha: '',
    efectivo: '',
  });

  useEffect(() => {
    fetchData();
  }, [filters, pagination.page, sortBy, sortOrder]);

  useEffect(() => {
    // Fetch clientes y vendedores solo una vez
    fetchClientsAndVendedores();
    // Set fecha actual por defecto
    const today = new Date().toLocaleDateString('es-AR');
    setFechaPlanilla(today);
  }, []);

  const fetchClientsAndVendedores = async () => {
    try {
      const [clientsRes, vendedoresRes] = await Promise.all([
        api.get('/clients'),
        api.get('/vendedores'),
      ]);
      setClients(clientsRes.data);
      setVendedores(vendedoresRes.data);
      
      // Set primer vendedor por defecto si existe
      if (vendedoresRes.data.length > 0) {
        setVendedor(vendedoresRes.data[0]._id);
        setVendedorData(vendedoresRes.data[0]);
      }
    } catch (error) {
      toast.error('Error al cargar datos');
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        sortBy,
        sortOrder,
        ...filters,
      });

      // Remover parámetros vacíos
      Object.keys(filters).forEach(key => {
        if (!filters[key]) params.delete(key);
      });

      const response = await api.get(`/orders?${params.toString()}`);
      setOrders(response.data.orders || []);
      setPagination(prev => ({
        ...prev,
        ...response.data.pagination
      }));
      setLoading(false);
    } catch (error) {
      toast.error('Error al cargar pedidos');
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset a página 1 cuando cambian filtros
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleClientChange = (clientId) => {
    setSelectedClient(clientId);
    const client = clients.find(c => c._id === clientId);
    if (client && client.vendedor) {
      const vendedorId = typeof client.vendedor === 'string' ? client.vendedor : client.vendedor._id;
      setVendedor(vendedorId);
      const vData = vendedores.find(v => v._id === vendedorId);
      if (vData) {
        setVendedorData(vData);
      }
    }
  };

  const handleVendedorChange = (vendedorId) => {
    setVendedor(vendedorId);
    const vData = vendedores.find(v => v._id === vendedorId);
    if (vData) {
      setVendedorData(vData);
    }
  };

  const handleItemChange = (field, value) => {
    const updatedItem = { ...currentItem, [field]: value };
    
    // Auto-calcular neto si cambia importe o descuento
    if (field === 'importe' || field === 'descuento') {
      const importe = parseFloat(field === 'importe' ? value : updatedItem.importe) || 0;
      const descuento = parseFloat(field === 'descuento' ? value : updatedItem.descuento) || 0;
      updatedItem.neto = importe - descuento;
    }
    
    setCurrentItem(updatedItem);
  };

  const handleAddItem = () => {
    if (!currentItem.nombreCliente.trim()) {
      toast.warning('Por favor ingresa el nombre del cliente');
      return;
    }

    if (editingItemIndex !== null) {
      // Modo edición: actualizar item existente
      const updatedItems = [...items];
      updatedItems[editingItemIndex] = { ...currentItem };
      setItems(updatedItems);
      setEditingItemIndex(null);
      toast.success('Item actualizado');
    } else {
      // Modo agregar: nuevo item
      setItems([...items, { ...currentItem }]);
      toast.success('Item agregado');
    }

    setCurrentItem({
      nombreCliente: '',
      facturaNumero: '',
      importe: '',
      descuento: '',
      neto: '',
      chequeNumero: '',
      banco: '',
      plaza: '',
      importeCheque: '',
      fecha: '',
      efectivo: '',
    });
  };

  const handleEditItem = (index) => {
    setCurrentItem(items[index]);
    setEditingItemIndex(index);
    toast.info('Editando item');
  };

  const handleRemoveItem = (index) => {
    if (window.confirm('¿Estás seguro de eliminar este item?')) {
      setItems(items.filter((_, i) => i !== index));
      // Si estábamos editando este item, cancelar edición
      if (editingItemIndex === index) {
        setEditingItemIndex(null);
        setCurrentItem({
          nombreCliente: '',
          facturaNumero: '',
          importe: '',
          descuento: '',
          neto: '',
          chequeNumero: '',
          banco: '',
          plaza: '',
          importeCheque: '',
          fecha: '',
          efectivo: '',
        });
      }
      toast.info('Item eliminado');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedClient) {
      toast.error('Selecciona un cliente');
      return;
    }
    
    if (!tipoPlanilla) {
      toast.error('Selecciona el tipo de planilla');
      return;
    }
    
    if (items.length === 0) {
      toast.error('Agrega al menos un item');
      return;
    }

    try {
      const orderData = {
        client: selectedClient,
        vendedor,
        tipoPlanilla,
        items,
        observaciones,
        comisiones: parseFloat(comisiones) || 0,
        fechaPlanilla,
      };

      if (editingOrderId) {
        // Actualizar pedido existente
        await api.put(`/orders/${editingOrderId}`, orderData);
        toast.success('Pedido actualizado exitosamente');
      } else {
        // Crear nuevo pedido
        await api.post('/orders', orderData);
        toast.success('Pedido creado exitosamente');
      }
      
      resetForm();
      setViewMode('list');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || `Error al ${editingOrderId ? 'actualizar' : 'crear'} pedido`);
    }
  };

  const resetForm = () => {
    setEditingOrderId(null);
    setSelectedClient('');
    if (vendedores.length > 0) {
      setVendedor(vendedores[0]._id);
      setVendedorData(vendedores[0]);
    }
    setTipoPlanilla('');
    setItems([]);
    setObservaciones('');
    setComisiones('');
    const today = new Date().toLocaleDateString('es-AR');
    setFechaPlanilla(today);
    setEditingItemIndex(null);
    setCurrentItem({
      nombreCliente: '',
      facturaNumero: '',
      importe: '',
      descuento: '',
      neto: '',
      chequeNumero: '',
      banco: '',
      plaza: '',
      importeCheque: '',
      fecha: '',
      efectivo: '',
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este pedido?')) {
      try {
        await api.delete(`/orders/${id}`);
        toast.success('Pedido eliminado');
        fetchData();
      } catch (error) {
        toast.error('Error al eliminar pedido');
      }
    }
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setViewMode('view');
  };

  const handleEditOrder = (order) => {
    setEditingOrderId(order._id);
    setSelectedClient(order.client?._id || order.client);
    
    const vendedorId = typeof order.vendedor === 'string' ? order.vendedor : order.vendedor?._id;
    setVendedor(vendedorId);
    const vData = vendedores.find(v => v._id === vendedorId);
    if (vData) {
      setVendedorData(vData);
    }
    
    setTipoPlanilla(order.tipoPlanilla);
    setItems(order.items || []);
    setObservaciones(order.observaciones || '');
    setComisiones(order.comisiones?.toString() || '');
    setFechaPlanilla(order.fechaPlanilla || '');
    setViewMode('create'); // Usar el mismo formulario
    toast.info('Editando pedido');
  };

  const handleDownloadExcel = async (order) => {
    try {
      const response = await api.get(`/orders/${order._id}/excel`, {
        responseType: 'blob',
      });
      
      // Generar nombre de archivo: Planilla - ClientName - Fecha
      const clientName = order.client?.name || order.client?.company || 'Cliente';
      const fecha = order.fechaPlanilla || new Date(order.createdAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' });
      const fileName = `Planilla - ${clientName} - ${fecha}.xlsx`;
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Excel descargado');
    } catch (error) {
      toast.error('Error al descargar Excel');
      console.error(error);
    }
  };

  // Componente de Vista Previa del Excel
  const ExcelPreview = () => {
    const client = clients.find(c => c._id === selectedClient);
    const clientName = client?.name || client?.company || 'Cliente';
    
    // Calcular totales
    const totalImporte = items.reduce((sum, item) => sum + (parseFloat(item.importe) || 0), 0);
    const totalDescuento = items.reduce((sum, item) => sum + (parseFloat(item.descuento) || 0), 0);
    const totalNeto = items.reduce((sum, item) => sum + (parseFloat(item.neto) || 0), 0);
    const totalImporteCheque = items.reduce((sum, item) => sum + (parseFloat(item.importeCheque) || 0), 0);
    const totalEfectivo = items.reduce((sum, item) => sum + (parseFloat(item.efectivo) || 0), 0);

    return (
      <div className="card bg-gray-50 border-2 border-blue-300">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            📄 Vista Previa del Excel - Planilla {tipoPlanilla}
          </h3>
          <span className="text-sm text-gray-600">
            {items.length} item{items.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="overflow-x-auto bg-white rounded-lg shadow-sm">
          <div className="p-4 space-y-2 border-b-2 border-gray-300">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-bold text-base">{vendedorData?.razonSocial || 'Razón Social'}</h4>
                <p className="text-sm font-bold mt-1">de {vendedorData?.nombre || 'Vendedor'}</p>
                <p className="text-sm text-gray-700">{vendedorData?.direccion || ''}</p>
                <p className="text-sm text-gray-700">{vendedorData?.localidad || ''}</p>
              </div>
              <div className="text-right">
                <h4 className="font-bold text-base">PLANILLA DE COBRANZAS</h4>
                <p className="text-sm mt-2"><span className="font-bold">PROVEEDOR:</span> {clientName}</p>
              </div>
            </div>
          </div>

          <div className="p-2">
            <p className="font-bold text-sm mb-2 text-center">DETALLE DE VALORES</p>
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border border-gray-400 p-1 text-center">NOMBRE DEL CLIENTE</th>
                  <th className="border border-gray-400 p-1 text-center">FACTURA Nº</th>
                  <th className="border border-gray-400 p-1 text-center">IMPORTE</th>
                  <th className="border border-gray-400 p-1 text-center">DESCUENTO</th>
                  <th className="border border-gray-400 p-1 text-center">NETO</th>
                  <th className="border border-gray-400 p-1 text-center">CHEQUE Nº</th>
                  <th className="border border-gray-400 p-1 text-center">C/BANCO</th>
                  <th className="border border-gray-400 p-1 text-center">PLAZA</th>
                  <th className="border border-gray-400 p-1 text-center">IMPORTE</th>
                  <th className="border border-gray-400 p-1 text-center">FECHA</th>
                  <th className="border border-gray-400 p-1 text-center">EFECTIVO</th>
                </tr>
              </thead>
              <tbody>
                {items.length > 0 ? (
                  items.map((item, index) => (
                    <tr key={index}>
                      <td className="border border-gray-300 p-1">{item.nombreCliente}</td>
                      <td className="border border-gray-300 p-1 text-center">{item.facturaNumero}</td>
                      <td className="border border-gray-300 p-1 text-right">{formatCurrency(item.importe)}</td>
                      <td className="border border-gray-300 p-1 text-right">{formatCurrency(item.descuento)}</td>
                      <td className="border border-gray-300 p-1 text-right">{formatCurrency(item.neto)}</td>
                      <td className="border border-gray-300 p-1 text-center">{item.chequeNumero}</td>
                      <td className="border border-gray-300 p-1">{item.banco}</td>
                      <td className="border border-gray-300 p-1">{item.plaza}</td>
                      <td className="border border-gray-300 p-1 text-right">{formatCurrency(item.importeCheque)}</td>
                      <td className="border border-gray-300 p-1 text-center">{item.fecha}</td>
                      <td className="border border-gray-300 p-1 text-right">{formatCurrency(item.efectivo)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="11" className="border border-gray-300 p-4 text-center text-gray-500 italic">
                      No hay items agregados. Agrega items en el paso 2 para ver la vista previa.
                    </td>
                  </tr>
                )}
                <tr className="bg-yellow-100 font-bold">
                  <td className="border border-gray-400 p-1">TOTALES</td>
                  <td className="border border-gray-400 p-1"></td>
                  <td className="border border-gray-400 p-1 text-right">{formatCurrency(totalImporte)}</td>
                  <td className="border border-gray-400 p-1 text-right">{formatCurrency(totalDescuento)}</td>
                  <td className="border border-gray-400 p-1 text-right">{formatCurrency(totalNeto)}</td>
                  <td className="border border-gray-400 p-1"></td>
                  <td className="border border-gray-400 p-1"></td>
                  <td className="border border-gray-400 p-1"></td>
                  <td className="border border-gray-400 p-1 text-right">{formatCurrency(totalImporteCheque)}</td>
                  <td className="border border-gray-400 p-1"></td>
                  <td className="border border-gray-400 p-1 text-right">{formatCurrency(totalEfectivo)}</td>
                </tr>
              </tbody>
            </table>

            <div className="mt-3 space-y-1">
              <div className="bg-green-200 p-2 rounded">
                <p className="text-sm">
                  <span className="font-bold">OBSERVACIONES:</span> {observaciones || '(ninguna)'}
                </p>
                <p className="text-sm">
                  <span className="font-bold">FECHA:</span> {fechaPlanilla}
                </p>
              </div>
              {tipoPlanilla === 'A' && (
                <div className="bg-yellow-200 p-2 rounded">
                  <p className="text-sm">
                    <span className="font-bold">COMISIONES $:</span> {formatCurrency(comisiones)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <p className="text-xs text-gray-500 mt-2 italic text-center">
          Esta es una vista previa aproximada. El Excel final puede tener diferencias de formato.
        </p>
      </div>
    );
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <ClipLoader color="#3b82f6" size={50} />
        </div>
      </Layout>
    );
  }

  // Vista detalle de pedido
  if (viewMode === 'view' && selectedOrder) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">Detalle del Pedido</h1>
            <div className="flex gap-2">
              <button
                onClick={() => handleDownloadExcel(selectedOrder)}
                className="bg-green-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <FiDownload size={18} /> Descargar Excel
              </button>
              <button
                onClick={() => {
                  setSelectedOrder(null);
                  setViewMode('list');
                }}
                className="btn btn-secondary text-sm"
              >
                Volver
              </button>
            </div>
          </div>

          <div className="card space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">Información General</h3>
                <div className="space-y-2 text-base">
                  <p><span className="font-medium">Número:</span> {selectedOrder.orderNumber}</p>
                  <p><span className="font-medium">Proveedor:</span> {selectedOrder.client?.name}</p>
                  <p><span className="font-medium">Vendedor:</span> {selectedOrder.vendedor?.nombre || selectedOrder.vendedor}</p>
                  <p><span className="font-medium">Planilla:</span> {selectedOrder.tipoPlanilla}</p>
                  <p><span className="font-medium">Fecha Planilla:</span> {selectedOrder.fechaPlanilla || new Date(selectedOrder.createdAt).toLocaleDateString('es-AR')}</p>
                  <p className="text-sm text-gray-500"><span className="font-medium">Creado:</span> {new Date(selectedOrder.createdAt).toLocaleString('es-AR')}</p>
                  <p className="text-sm text-gray-500"><span className="font-medium">Actualizado:</span> {new Date(selectedOrder.updatedAt).toLocaleString('es-AR')}</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">Resumen</h3>
                <div className="space-y-2 text-base">
                  <p><span className="font-medium">Total Items:</span> {selectedOrder.items?.length || 0}</p>
                  <p><span className="font-medium">Comisiones:</span> ${formatCurrency(selectedOrder.comisiones || 0)}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Items</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="text-left p-2">Cliente</th>
                      <th className="text-left p-2">Factura</th>
                      <th className="text-right p-2">Importe</th>
                      <th className="text-right p-2">Descuento</th>
                      <th className="text-right p-2">Neto</th>
                      <th className="text-right p-2">Efectivo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items?.map((item, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-3">{item.nombreCliente}</td>
                        <td className="p-3">{item.facturaNumero}</td>
                        <td className="text-right p-3">${formatCurrency(item.importe)}</td>
                        <td className="text-right p-3">${formatCurrency(item.descuento)}</td>
                        <td className="text-right p-3">${formatCurrency(item.neto)}</td>
                        <td className="text-right p-3">${formatCurrency(item.efectivo)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {selectedOrder.observaciones && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Observaciones</h3>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedOrder.observaciones}</p>
              </div>
            )}
          </div>
        </div>
      </Layout>
    );
  }

  // Vista de creación de pedido
  if (viewMode === 'create') {
    return (
      <Layout>
        <div className="space-y-4 max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">
              {editingOrderId ? 'Editar Pedido' : 'Nuevo Pedido'}
            </h1>
            <button
              onClick={() => {
                resetForm();
                setViewMode('list');
              }}
              className="btn btn-secondary text-sm"
            >
              Cancelar
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Paso 1: Información básica */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">1. Información del Pedido</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Proveedor (Cliente) *</label>
                  <select
                    value={selectedClient}
                    onChange={(e) => handleClientChange(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base"
                    required
                  >
                    <option value="">-- Selecciona --</option>
                    {clients.map((client) => (
                      <option key={client._id} value={client._id}>
                        {client.name} {client.company ? `(${client.company})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vendedor *</label>
                  <select
                    value={vendedor}
                    onChange={(e) => handleVendedorChange(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base"
                    required
                  >
                    <option value="">-- Selecciona --</option>
                    {vendedores.map((v) => (
                      <option key={v._id} value={v._id}>
                        {v.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Planilla *</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setTipoPlanilla('A')}
                      className={`py-3 px-4 rounded-xl font-semibold text-base border-2 transition-all ${
                        tipoPlanilla === 'A'
                          ? 'bg-primary-600 text-white border-primary-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-primary-400'
                      }`}
                    >
                      Planilla A
                    </button>
                    <button
                      type="button"
                      onClick={() => setTipoPlanilla('B')}
                      className={`py-3 px-4 rounded-xl font-semibold text-base border-2 transition-all ${
                        tipoPlanilla === 'B'
                          ? 'bg-primary-600 text-white border-primary-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-primary-400'
                      }`}
                    >
                      Planilla B
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Vista Previa del Excel */}
            {selectedClient && vendedor && tipoPlanilla && (
              <ExcelPreview />
            )}

            {/* Paso 2: Agregar Items */}
            {selectedClient && tipoPlanilla && (
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">2. Agregar Items</h3>
                
                <div className="grid md:grid-cols-4 gap-3 mb-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Cliente *</label>
                    <input
                      type="text"
                      value={currentItem.nombreCliente}
                      onChange={(e) => handleItemChange('nombreCliente', e.target.value)}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                      placeholder="Nombre del cliente"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Factura Nº</label>
                    <input
                      type="text"
                      value={currentItem.facturaNumero}
                      onChange={(e) => handleItemChange('facturaNumero', e.target.value)}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                      placeholder="Nº Factura"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Importe</label>
                    <input
                      type="number"
                      step="0.01"
                      value={currentItem.importe}
                      onChange={(e) => handleItemChange('importe', e.target.value)}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Descuento</label>
                    <input
                      type="number"
                      step="0.01"
                      value={currentItem.descuento}
                      onChange={(e) => handleItemChange('descuento', e.target.value)}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Neto</label>
                    <input
                      type="number"
                      step="0.01"
                      value={currentItem.neto}
                      readOnly
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg bg-gray-50 text-sm"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cheque Nº</label>
                    <input
                      type="text"
                      value={currentItem.chequeNumero}
                      onChange={(e) => handleItemChange('chequeNumero', e.target.value)}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                      placeholder="Nº Cheque"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Banco</label>
                    <input
                      type="text"
                      value={currentItem.banco}
                      onChange={(e) => handleItemChange('banco', e.target.value)}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                      placeholder="Nombre del banco"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Plaza</label>
                    <input
                      type="text"
                      value={currentItem.plaza}
                      onChange={(e) => handleItemChange('plaza', e.target.value)}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                      placeholder="Plaza"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Importe Cheque</label>
                    <input
                      type="number"
                      step="0.01"
                      value={currentItem.importeCheque}
                      onChange={(e) => handleItemChange('importeCheque', e.target.value)}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                    <input
                      type="text"
                      value={currentItem.fecha}
                      onChange={(e) => handleItemChange('fecha', e.target.value)}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                      placeholder="DD/MM/YYYY"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Efectivo</label>
                    <input
                      type="number"
                      step="0.01"
                      value={currentItem.efectivo}
                      onChange={(e) => handleItemChange('efectivo', e.target.value)}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="flex-1 bg-primary-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
                  >
                    {editingItemIndex !== null ? (
                      <>
                        <FiEdit2 size={20} /> Actualizar Item
                      </>
                    ) : (
                      <>
                        <FiPlus size={20} /> Agregar Item
                      </>
                    )}
                  </button>
                  {editingItemIndex !== null && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingItemIndex(null);
                        setCurrentItem({
                          nombreCliente: '',
                          facturaNumero: '',
                          importe: '',
                          descuento: '',
                          neto: '',
                          chequeNumero: '',
                          banco: '',
                          plaza: '',
                          importeCheque: '',
                          fecha: '',
                          efectivo: '',
                        });
                      }}
                      className="px-4 py-3 bg-gray-500 text-white rounded-xl font-semibold hover:bg-gray-600 transition-colors"
                    >
                      Cancelar
                    </button>
                  )}
                </div>

                {/* Lista de items agregados */}
                {items.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-semibold text-gray-700 mb-2">Items Agregados ({items.length})</h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="text-left p-2">Cliente</th>
                            <th className="text-left p-2">Factura</th>
                            <th className="text-right p-2">Importe</th>
                            <th className="text-right p-2">Desc.</th>
                            <th className="text-right p-2">Neto</th>
                            <th className="text-right p-2">Efectivo</th>
                            <th className="text-center p-2">Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {items.map((item, index) => (
                            <tr key={index} className={`border-b hover:bg-gray-50 ${editingItemIndex === index ? 'bg-blue-50' : ''}`}>
                              <td className="p-3">{item.nombreCliente}</td>
                              <td className="p-3">{item.facturaNumero}</td>
                              <td className="text-right p-3">${formatCurrency(item.importe)}</td>
                              <td className="text-right p-3">${formatCurrency(item.descuento)}</td>
                              <td className="text-right p-3">${formatCurrency(item.neto)}</td>
                              <td className="text-right p-3">${formatCurrency(item.efectivo)}</td>
                              <td className="text-center p-3">
                                <div className="flex gap-2 justify-center">
                                  <button
                                    type="button"
                                    onClick={() => handleEditItem(index)}
                                    className="text-blue-600 hover:text-blue-800"
                                    title="Editar"
                                  >
                                    <FiEdit2 size={20} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveItem(index)}
                                    className="text-red-600 hover:text-red-800"
                                    title="Eliminar"
                                  >
                                    <FiTrash2 size={20} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Paso 3: Información adicional */}
            {items.length > 0 && (
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">3. Información Adicional</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
                    <textarea
                      value={observaciones}
                      onChange={(e) => setObservaciones(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base"
                      rows="3"
                      placeholder="Observaciones adicionales..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Comisiones $</label>
                    <input
                      type="number"
                      step="0.01"
                      value={comisiones}
                      onChange={(e) => setComisiones(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                    <input
                      type="text"
                      value={fechaPlanilla}
                      onChange={(e) => setFechaPlanilla(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base"
                      placeholder="DD/MM/YYYY"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Botón de envío */}
            {items.length > 0 && (
              <button
                type="submit"
                className="w-full bg-green-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:bg-green-700 transition-colors"
              >
                {editingOrderId ? 'Actualizar Pedido' : 'Crear Pedido'}
              </button>
            )}
          </form>
        </div>
      </Layout>
    );
  }

  // Vista de lista de pedidos
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">Pedidos</h1>
          <button
            onClick={() => setViewMode('create')}
            className="bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-700 transition-colors flex items-center gap-2 text-lg"
          >
            <FiPlus size={22} /> Nuevo Pedido
          </button>
        </div>

        {/* Filtros */}
        <div className="card">
          <h3 className="text-xl font-semibold mb-4">Filtros</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Buscar por N°</label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="ORD-000001"
                className="input"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Proveedor</label>
              <select
                value={filters.client}
                onChange={(e) => handleFilterChange('client', e.target.value)}
                className="input"
              >
                <option value="">Todos</option>
                {clients.map((client) => (
                  <option key={client._id} value={client._id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Vendedor</label>
              <select
                value={filters.vendedor}
                onChange={(e) => handleFilterChange('vendedor', e.target.value)}
                className="input"
              >
                <option value="">Todos</option>
                {vendedores.map((v) => (
                  <option key={v._id} value={v._id}>
                    {v.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipo Planilla</label>
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

          <div className="flex justify-between items-center mt-4">
            <div className="flex gap-4 items-center">
              <label className="text-sm font-medium text-gray-700">Ordenar por:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-base"
              >
                <option value="createdAt">Fecha Creación</option>
                <option value="updatedAt">Última Actualización</option>
                <option value="orderNumber">Número</option>
                <option value="fechaPlanilla">Fecha Planilla</option>
              </select>
              
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-base"
              >
                <option value="desc">Más reciente</option>
                <option value="asc">Más antiguo</option>
              </select>
            </div>

            <button
              onClick={() => {
                setFilters({ client: '', vendedor: '', tipoPlanilla: '', search: '' });
                setSortBy('createdAt');
                setSortOrder('desc');
              }}
              className="text-primary-600 font-medium hover:text-primary-700"
            >
              Limpiar filtros
            </button>
          </div>
        </div>

        {/* Lista de pedidos */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <ClipLoader color="#3b82f6" size={50} />
            </div>
          ) : orders.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-gray-500 text-lg">No hay pedidos que coincidan con los filtros</p>
              <button
                onClick={() => setViewMode('create')}
                className="mt-4 text-primary-600 font-semibold text-lg"
              >
                Crear un pedido
              </button>
            </div>
          ) : (
            <>
              {orders.map((order) => {
                const fechaPlanilla = order.fechaPlanilla || new Date(order.createdAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' });
                return (
                  <div key={order._id} className="card hover:shadow-lg transition-shadow">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <h3 className="font-bold text-2xl text-gray-800 mb-3">
                          Planilla - {order.client?.name} - {fechaPlanilla}
                        </h3>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <p className="text-gray-600">
                            <span className="font-bold text-base">Creado:</span> {new Date(order.createdAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </p>
                          <p className="text-gray-600">
                            <span className="font-bold text-base">Editado:</span> {new Date(order.updatedAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </p>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                          <span className="font-medium">Número:</span> {order.orderNumber} | <span className="font-medium">Vendedor:</span> {order.vendedor?.nombre || order.vendedor} | <span className="font-medium">Items:</span> {order.items?.length || 0}
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleDownloadExcel(order)}
                          className="text-green-600 hover:text-green-800 p-2"
                          title="Descargar Excel"
                        >
                          <FiDownload size={22} />
                        </button>
                        <button
                          onClick={() => handleViewOrder(order)}
                          className="text-blue-600 hover:text-blue-800 p-2"
                          title="Ver detalle"
                        >
                          <FiEye size={22} />
                        </button>
                        <button
                          onClick={() => handleEditOrder(order)}
                          className="text-orange-600 hover:text-orange-800 p-2"
                          title="Editar"
                        >
                          <FiEdit2 size={22} />
                        </button>
                        <button
                          onClick={() => handleDelete(order._id)}
                          className="text-red-600 hover:text-red-800 p-2"
                          title="Eliminar"
                        >
                          <FiTrash2 size={22} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Paginación */}
              {pagination.pages > 1 && (
                <div className="card">
                  <div className="flex justify-between items-center">
                    <div className="text-base text-gray-600">
                      Mostrando {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total} pedidos
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page === 1}
                        className="px-4 py-2 border border-gray-300 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 text-base"
                      >
                        Anterior
                      </button>
                      
                      <div className="flex gap-1">
                        {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`px-4 py-2 rounded-lg font-medium text-base ${
                              page === pagination.page
                                ? 'bg-primary-600 text-white'
                                : 'border border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        ))}
                      </div>
                      
                      <button
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page === pagination.pages}
                        className="px-4 py-2 border border-gray-300 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 text-base"
                      >
                        Siguiente
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Orders;
