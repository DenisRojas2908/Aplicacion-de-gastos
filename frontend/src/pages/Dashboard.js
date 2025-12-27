import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  BanknotesIcon,
  CreditCardIcon,
  ChartBarIcon,
  PlusIcon, // Importamos el ícono Plus
} from '@heroicons/react/24/outline';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import axios from '../utils/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatCurrency, getMonthName, formatDate } from '../utils/formatters';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const navigate = useNavigate(); // Hook para navegar

  const months = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: getMonthName(i + 1),
  }));

  const years = Array.from({ length: 5 }, (_, i) => ({
    value: new Date().getFullYear() - i,
    label: (new Date().getFullYear() - i).toString(),
  }));

  useEffect(() => {
    fetchDashboardData();
  }, [selectedMonth, selectedYear]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `/dashboard/mensual?mes=${selectedMonth}&anio=${selectedYear}`
      );
      setData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Error al cargar los datos del dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  const { totalGastos, totalIngresos, balanceActual, balanceMes, gastosPorCategoria, ultimosGastos } = data || {};

  // Preparar datos para el gráfico de barras
  const barChartData = [
    { name: 'Ingresos', value: totalIngresos || 0, color: '#2E865F' },
    { name: 'Gastos', value: totalGastos || 0, color: '#FF6B35' },
    { name: 'Balance', value: balanceMes || 0, color: balanceMes >= 0 ? '#2E865F' : '#E57373' },
  ];

  // Preparar datos para el gráfico de pastel
  const pieChartData = (gastosPorCategoria || [])
    .filter(cat => cat.total > 0)
    .map(cat => ({
      name: cat.categoria_nombre || cat.nombre,
      value: parseFloat(cat.total),
      color: cat.categoria_color || cat.color,
    }));

  const COLORS = ['#FF6B35', '#8D6E63', '#2E865F', '#E57373', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header con filtros y botón */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-800">Dashboard</h1>
          <p className="text-neutral-600 mt-1">
            Resumen de tus finanzas - {getMonthName(selectedMonth)} {selectedYear}
          </p>
        </div>
        
        {/* Controles: Filtros y Botón Nuevo Gasto */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="form-input py-2 pl-3 pr-8"
            >
              {months.map(month => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
            
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="form-input py-2 pl-3 pr-8"
            >
              {years.map(year => (
                <option key={year.value} value={year.value}>
                  {year.label}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => navigate('/gastos?action=new')}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors shadow-warm whitespace-nowrap"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Nuevo Gasto</span>
          </button>
        </div>
      </div>

      {/* Cards de resumen */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Balance Actual */}
        <div className="card-warm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Balance Actual</p>
              <p className={`number-highlight ${balanceActual >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
                {formatCurrency(balanceActual || 0)}
              </p>
            </div>
            <div className="w-12 h-12 bg-white/50 rounded-xl flex items-center justify-center">
              <BanknotesIcon className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </div>

        {/* Ingresos del mes */}
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Ingresos del mes</p>
              <p className="number-highlight currency-positive">
                {formatCurrency(totalIngresos || 0)}
              </p>
            </div>
            <div className="w-12 h-12 bg-success-100 rounded-xl flex items-center justify-center">
              <ArrowTrendingUpIcon className="w-6 h-6 text-success-600" />
            </div>
          </div>
        </div>

        {/* Gastos del mes */}
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Gastos del mes</p>
              <p className="number-highlight currency-negative">
                {formatCurrency(totalGastos || 0)}
              </p>
            </div>
            <div className="w-12 h-12 bg-danger-100 rounded-xl flex items-center justify-center">
              <ArrowTrendingDownIcon className="w-6 h-6 text-danger-600" />
            </div>
          </div>
        </div>

        {/* Balance del mes */}
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Balance del mes</p>
              <p className={`number-highlight ${balanceMes >= 0 ? 'currency-positive' : 'currency-negative'}`}>
                {formatCurrency(balanceMes || 0)}
              </p>
            </div>
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
              <ChartBarIcon className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Gráfico de barras */}
        <div className="card">
          <h3 className="text-lg font-semibold text-neutral-800 mb-4">Resumen Mensual</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  formatter={(value) => [formatCurrency(value), 'Monto']}
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                  }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {barChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico de pastel */}
        <div className="card">
          <h3 className="text-lg font-semibold text-neutral-800 mb-4">Gastos por Categoría</h3>
          <div className="h-64">
            {pieChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${formatCurrency(entry.value)}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [formatCurrency(value), 'Total']} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-neutral-500">
                <p>No hay gastos en este período</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Últimos gastos y acciones rápidas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Últimos gastos */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-neutral-800">Últimos Gastos</h3>
            <Link to="/gastos" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              Ver todos
            </Link>
          </div>
          
          <div className="space-y-3">
            {ultimosGastos && ultimosGastos.length > 0 ? (
              ultimosGastos.slice(0, 5).map((gasto) => (
                <div key={gasto.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                      style={{ backgroundColor: gasto.categoria_color + '20' }}
                    >
                      {gasto.categoria_icono}
                    </div>
                    <div>
                      <p className="font-medium text-neutral-800">{gasto.descripcion}</p>
                      <p className="text-sm text-neutral-500">
                        {gasto.categoria_nombre} • {formatDate(gasto.fecha)}
                      </p>
                    </div>
                  </div>
                  <p className="font-semibold text-danger-600">
                    {formatCurrency(gasto.monto)}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-neutral-500">
                <CreditCardIcon className="w-12 h-12 mx-auto mb-3 text-neutral-300" />
                <p>No hay gastos registrados</p>
              </div>
            )}
          </div>
        </div>

        {/* Acciones rápidas */}
        <div className="card">
          <h3 className="text-lg font-semibold text-neutral-800 mb-4">Acciones Rápidas</h3>
          
          <div className="space-y-3">
            <Link
              to="/gastos?action=new"
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-danger-500 text-white rounded-lg hover:bg-danger-600 transition-colors"
            >
              <CreditCardIcon className="w-5 h-5" />
              <span>Registrar Gasto</span>
            </Link>
            
            <Link
              to="/ingresos?action=new"
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-success-500 text-white rounded-lg hover:bg-success-600 transition-colors"
            >
              <ArrowTrendingUpIcon className="w-5 h-5" />
              <span>Registrar Ingreso</span>
            </Link>
            
            <Link
              to="/reportes"
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-neutral-500 text-white rounded-lg hover:bg-neutral-600 transition-colors"
            >
              <ChartBarIcon className="w-5 h-5" />
              <span>Ver Reportes</span>
            </Link>
          </div>

          {/* Tips */}
          <div className="mt-6 p-4 bg-primary-50 rounded-lg border border-primary-200">
            <h4 className="font-medium text-primary-800 mb-2">💡 Consejo</h4>
            <p className="text-sm text-primary-700">
              Registra tus gastos diarios para mantener un mejor control de tus finanzas.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;