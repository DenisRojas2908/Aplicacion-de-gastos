import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  FunnelIcon,
  XMarkIcon,
  CreditCardIcon, // <--- AGREGADO: Esto faltaba
} from '@heroicons/react/24/outline';
import axios from '../utils/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import GastoModal from '../components/GastoModal';
import { formatCurrency, formatDate } from '../utils/formatters';
import toast from 'react-hot-toast';

const Gastos = () => {
  const [gastos, setGastos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [metodosPago, setMetodosPago] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGasto, setEditingGasto] = useState(null);
  const [filters, setFilters] = useState({
    mes: new Date().getMonth() + 1,
    anio: new Date().getFullYear(),
    categoriaId: '',
  });
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    fetchInitialData();
    
    // Check if we need to open the modal (from quick actions)
    if (searchParams.get('action') === 'new') {
      setModalOpen(true);
      setSearchParams({});
    }
  }, []);

  useEffect(() => {
    fetchGastos();
  }, [filters]);

  const fetchInitialData = async () => {
    try {
      const [categoriasRes, metodosRes] = await Promise.all([
        axios.get('/categorias'),
        axios.get('/metodos-pago'),
      ]);
      setCategorias(categoriasRes.data.filter(c => c.tipo === 'gasto'));
      setMetodosPago(metodosRes.data);
    } catch (error) {
      console.error('Error fetching initial data:', error);
      toast.error('Error al cargar datos iniciales');
    }
  };

  const fetchGastos = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.mes) params.append('mes', filters.mes);
      if (filters.anio) params.append('anio', filters.anio);
      if (filters.categoriaId) params.append('categoriaId', filters.categoriaId);
      
      const response = await axios.get(`/gastos?${params}`);
      setGastos(response.data);
    } catch (error) {
      console.error('Error fetching gastos:', error);
      toast.error('Error al cargar los gastos');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este gasto?')) {
      try {
        await axios.delete(`/gastos/${id}`);
        toast.success('Gasto eliminado exitosamente');
        fetchGastos();
      } catch (error) {
        console.error('Error deleting gasto:', error);
        toast.error('Error al eliminar el gasto');
      }
    }
  };

  const handleEdit = (gasto) => {
    setEditingGasto(gasto);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setEditingGasto(null);
  };

  const handleSave = () => {
    fetchGastos();
    handleModalClose();
  };

  const totalGastos = gastos.reduce((sum, gasto) => sum + parseFloat(gasto.monto), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-neutral-800">Gastos</h1>
          <p className="text-neutral-600 mt-1">
            Total del mes: <span className="font-semibold text-danger-600">{formatCurrency(totalGastos)}</span>
          </p>
        </div>
        
        <button
          onClick={() => setModalOpen(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Nuevo Gasto</span>
        </button>
      </div>

      {/* Filtros */}
      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-4 sm:space-y-0">
          <div className="flex-1">
            <label className="form-label">Mes</label>
            <select
              value={filters.mes}
              onChange={(e) => setFilters(prev => ({ ...prev, mes: parseInt(e.target.value) }))}
              className="form-input"
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(0, i).toLocaleDateString('es-PE', { month: 'long' })}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex-1">
            <label className="form-label">Año</label>
            <select
              value={filters.anio}
              onChange={(e) => setFilters(prev => ({ ...prev, anio: parseInt(e.target.value) }))}
              className="form-input"
            >
              {Array.from({ length: 5 }, (_, i) => (
                <option key={i} value={new Date().getFullYear() - i}>
                  {new Date().getFullYear() - i}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1">
            <label className="form-label">Categoría</label>
            <select
              value={filters.categoriaId}
              onChange={(e) => setFilters(prev => ({ ...prev, categoriaId: e.target.value }))}
              className="form-input"
            >
              <option value="">Todas las categorías</option>
              {categorias.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.icono} {cat.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Lista de gastos */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="large" />
        </div>
      ) : gastos.length === 0 ? (
        <div className="card text-center py-12">
          <CreditCardIcon className="w-16 h-16 mx-auto mb-4 text-neutral-300" />
          <h3 className="text-lg font-medium text-neutral-800 mb-2">No hay gastos registrados</h3>
          <p className="text-neutral-600 mb-6">
            {filters.mes && filters.anio 
              ? `No se encontraron gastos en ${new Date(0, filters.mes - 1).toLocaleDateString('es-PE', { month: 'long' })} ${filters.anio}`
              : 'Comienza registrando tu primer gasto'
            }
          </p>
          <button
            onClick={() => setModalOpen(true)}
            className="btn-primary"
          >
            <PlusIcon className="w-5 h-5 inline-block mr-2" />
            Agregar Gasto
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {gastos.map((gasto) => (
            <div key={gasto.id} className="card hover:shadow-card-hover transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
                    style={{ backgroundColor: gasto.categoria_color + '20' }}
                  >
                    {gasto.categoria_icono}
                  </div>
                  <div>
                    <h3 className="font-medium text-neutral-800">{gasto.descripcion}</h3>
                    <p className="text-sm text-neutral-500">
                      {gasto.categoria_nombre} • {formatDate(gasto.fecha)} • {gasto.metodo_pago_nombre}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <p className="text-lg font-semibold text-danger-600">
                    {formatCurrency(gasto.monto)}
                  </p>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleEdit(gasto)}
                      className="p-2 text-neutral-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(gasto.id)}
                      className="p-2 text-neutral-400 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <GastoModal
        isOpen={modalOpen}
        onClose={handleModalClose}
        onSave={handleSave}
        gasto={editingGasto}
        categorias={categorias}
        metodosPago={metodosPago}
      />
    </div>
  );
};

export default Gastos;