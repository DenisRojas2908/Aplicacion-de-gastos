import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import axios from '../utils/axios';
import toast from 'react-hot-toast';

const IngresoModal = ({ isOpen, onClose, onSave, ingreso }) => {
  const [formData, setFormData] = useState({
    monto: '',
    descripcion: '',
    fecha: new Date().toISOString().split('T')[0],
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (ingreso) {
      setFormData({
        monto: ingreso.monto,
        descripcion: ingreso.descripcion,
        fecha: ingreso.fecha,
      });
    } else {
      setFormData({
        monto: '',
        descripcion: '',
        fecha: new Date().toISOString().split('T')[0],
      });
    }
    setErrors({});
  }, [ingreso, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.monto) {
      newErrors.monto = 'El monto es requerido';
    } else if (parseFloat(formData.monto) <= 0) {
      newErrors.monto = 'El monto debe ser mayor a 0';
    }
    
    if (!formData.descripcion.trim()) {
      newErrors.descripcion = 'La descripción es requerida';
    }
    
    if (!formData.fecha) {
      newErrors.fecha = 'La fecha es requerida';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    
    try {
      if (ingreso) {
        // Update existing ingreso
        await axios.put(`/ingresos/${ingreso.id}`, {
          monto: parseFloat(formData.monto),
          descripcion: formData.descripcion.trim(),
          fecha: formData.fecha,
        });
        toast.success('Ingreso actualizado exitosamente');
      } else {
        // Create new ingreso
        await axios.post('/ingresos', {
          monto: parseFloat(formData.monto),
          descripcion: formData.descripcion.trim(),
          fecha: formData.fecha,
        });
        toast.success('Ingreso creado exitosamente');
      }
      
      onSave();
    } catch (error) {
      console.error('Error saving ingreso:', error);
      const message = error.response?.data?.error || 'Error al guardar el ingreso';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-30" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-semibold leading-6 text-neutral-900 flex items-center justify-between"
                >
                  {ingreso ? 'Editar Ingreso' : 'Nuevo Ingreso'}
                  <button
                    onClick={onClose}
                    className="p-1 rounded-lg hover:bg-neutral-100 transition-colors"
                  >
                    <XMarkIcon className="w-5 h-5 text-neutral-500" />
                  </button>
                </Dialog.Title>

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                  {/* Monto */}
                  <div>
                    <label className="form-label">Monto</label>
                    <input
                      type="number"
                      name="monto"
                      value={formData.monto}
                      onChange={handleChange}
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      className={`form-input ${errors.monto ? 'border-danger-500' : ''}`}
                    />
                    {errors.monto && (
                      <p className="mt-1 text-sm text-danger-600">{errors.monto}</p>
                    )}
                  </div>

                  {/* Descripción */}
                  <div>
                    <label className="form-label">Descripción</label>
                    <input
                      type="text"
                      name="descripcion"
                      value={formData.descripcion}
                      onChange={handleChange}
                      placeholder="Ej: Sueldo mensual"
                      className={`form-input ${errors.descripcion ? 'border-danger-500' : ''}`}
                    />
                    {errors.descripcion && (
                      <p className="mt-1 text-sm text-danger-600">{errors.descripcion}</p>
                    )}
                  </div>

                  {/* Fecha */}
                  <div>
                    <label className="form-label">Fecha</label>
                    <input
                      type="date"
                      name="fecha"
                      value={formData.fecha}
                      onChange={handleChange}
                      className={`form-input ${errors.fecha ? 'border-danger-500' : ''}`}
                    />
                    {errors.fecha && (
                      <p className="mt-1 text-sm text-danger-600">{errors.fecha}</p>
                    )}
                  </div>

                  {/* Botones */}
                  <div className="flex space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 btn-outline py-2"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 btn-success py-2"
                    >
                      {loading ? (
                        <div className="flex items-center justify-center">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        </div>
                      ) : (
                        ingreso ? 'Actualizar' : 'Guardar'
                      )}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default IngresoModal;