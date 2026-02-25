import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../config/api';
import { toast } from 'react-toastify';
import { FiEdit2, FiTrash2, FiPlus, FiSearch } from 'react-icons/fi';
import { ClipLoader } from 'react-spinners';

const Clientes = () => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCliente, setEditingCliente] = useState(null);
  const [formData, setFormData] = useState({ nombre: '' });

  useEffect(() => {
    fetchClientes();
  }, [searchTerm]);

  const fetchClientes = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      
      const response = await api.get(`/clientes?${params.toString()}`);
      setClientes(response.data.clientes);
    } catch (error) {
      toast.error('Error al cargar clientes');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.nombre.trim()) {
      toast.error('El nombre es requerido');
      return;
    }

    try {
      if (editingCliente) {
        await api.put(`/clientes/${editingCliente._id}`, formData);
        toast.success('Cliente actualizado correctamente');
      } else {
        await api.post('/clientes', formData);
        toast.success('Cliente creado correctamente');
      }
      
      setShowModal(false);
      setFormData({ nombre: '' });
      setEditingCliente(null);
      fetchClientes();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al guardar el cliente');
    }
  };

  const handleEdit = (cliente) => {
    setEditingCliente(cliente);
    setFormData({ nombre: cliente.nombre });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este cliente?')) return;

    try {
      await api.delete(`/clientes/${id}`);
      toast.success('Cliente eliminado correctamente');
      fetchClientes();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al eliminar el cliente');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCliente(null);
    setFormData({ nombre: '' });
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

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100">
              Clientes
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Gestión de clientes del sistema
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="btn bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-2"
          >
            <FiPlus /> Nuevo Cliente
          </button>
        </div>

        {/* Buscador */}
        <div className="card">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar clientes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>
        </div>

        {/* Lista de Clientes */}
        <div className="card">
          {clientes.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">
                No se encontraron clientes
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Nombre
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Fecha Creación
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {clientes.map((cliente) => (
                    <tr key={cliente._id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {cliente.nombre}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(cliente.createdAt).toLocaleDateString('es-AR')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(cliente)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-4"
                        >
                          <FiEdit2 className="inline" />
                        </button>
                        <button
                          onClick={() => handleDelete(cliente._id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <FiTrash2 className="inline" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Crear/Editar */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">
                {editingCliente ? 'Editar Cliente' : 'Nuevo Cliente'}
              </h2>
              
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nombre del Cliente
                  </label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="input"
                    placeholder="Ingrese el nombre del cliente"
                    autoFocus
                  />
                </div>

                <div className="flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="btn bg-gray-300 hover:bg-gray-400 text-gray-800"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    {editingCliente ? 'Actualizar' : 'Crear'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Clientes;
