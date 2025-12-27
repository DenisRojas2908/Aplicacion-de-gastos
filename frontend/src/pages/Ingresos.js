import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  BanknotesIcon,
} from '@heroicons/react/24/outline';
import axios from '../utils/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import IngresoModal from '../components/IngresoModal';
import { formatCurrency, formatDate } from '../utils/formatters';
import toast from 'react-hot-toast';

const Ingresos = () => {
  const [ingresos, setIngresos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingIngreso, setEditingIngreso] = useState(null);
  const [filters, setFilters] = useState({
    mes: new Date().getMonth() + 1,
    anio: new Date().getFullYear(),
  });

  useEffect(() => {
    fetchIngresos();
  }, [filters]);

  const fetchIngresos = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.mes) params.append('mes', filters.mes);
      if (filters.anio) params.append('anio', filters.anio);
      
      const response = await axios.get(`/ingresos?${params}`);
      setIngresos(response.data);
    } catch (error) {
      console.error('Error fetching ingresos:', error);
      toast.error('Error al cargar los ingresos');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este ingreso?')) {
      try {
        await axios.delete(`/ingresos/${id}`);
        toast.success('Ingreso eliminado exitosamente');
        fetchIngresos();
      } catch (error) {
        console.error('Error deleting ingreso:', error);
        toast.error('Error al eliminar el ingreso');
      }
    }
  };

  const handleEdit = (ingreso) => {
    setEditingIngreso(ingreso);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setEditingIngreso(null);
  };

  const handleSave = () => {
    fetchIngresos();
    handleModalClose();
  };

  const totalIngresos = ingresos.reduce((sum, ingreso) => sum + parseFloat(ingreso.monto), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-neutral-800">Ingresos</h1>
          <p className="text-neutral-600 mt-1">
            Total del mes: <span className="font-semibold text-success-600">{formatCurrency(totalIngresos)}</span>
          </p>
        </div>
        
        <button
          onClick={() => setModalOpen(true)}
          className="btn-success flex items-center space-x-2"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Nuevo Ingreso</span>
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
        </div>
      </div>

      {/* Lista de ingresos */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="large" />
        </div>
      ) : ingresos.length === 0 ? (
        <div className="card text-center py-12">
          <BanknotesIcon className="w-16 h-16 mx-auto mb-4 text-neutral-300" />
          <h3 className="text-lg font-medium text-neutral-800 mb-2">No hay ingresos registrados</h3>
          <p className="text-neutral-600 mb-6">
            {filters.mes && filters.anio 
              ? `No se encontraron ingresos en ${new Date(0, filters.mes - 1).toLocaleDateString('es-PE', { month: 'long' })} ${filters.anio}`
              : 'Comienza registrando tu primer ingreso'
            }
          </p>
          <button
            onClick={() => setModalOpen(true)}
            className="btn-success"
          >
            <PlusIcon className="w-5 h-5 inline-block mr-2" />
            Agregar Ingreso
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {ingresos.map((ingreso) => (
            <div key={ingreso.id} className="card hover:shadow-card-hover transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-success-100 rounded-xl flex items-center justify-center">
                    <BanknotesIcon className="w-6 h-6 text-success-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-neutral-800">{ingreso.descripcion}</h3>
                    <p className="text-sm text-neutral-500">
                      {formatDate(ingreso.fecha)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <p className="text-lg font-semibold text-success-600">
                    {formatCurrency(ingreso.monto)}
                  </p>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleEdit(ingreso)}
                      className="p-2 text-neutral-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(ingreso.id)}
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
      <IngresoModal
        isOpen={modalOpen}
        onClose={handleModalClose}
        onSave={handleSave}
        ingreso={editingIngreso}
      />
    </div>
  );
};

export default Ingresos;