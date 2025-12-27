import React, { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  CalendarIcon,
  BanknotesIcon,
  ArrowTrendingUpIcon,   // Corregido
  ArrowTrendingDownIcon, // Corregido
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
  LineChart,
  Line,
  Legend,
} from 'recharts';
import axios from '../utils/axios';
import LoadingSpinner from '../components/LoadingSpinner';
// AGREGADO formatDate AQUÍ:
import { formatCurrency, getMonthName, formatDate } from '../utils/formatters';
import toast from 'react-hot-toast';

const Reportes = () => {
  const [activeTab, setActiveTab] = useState('mensual');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const years = Array.from({ length: 5 }, (_, i) => ({
    value: new Date().getFullYear() - i,
    label: (new Date().getFullYear() - i).toString(),
  }));

  useEffect(() => {
    fetchReportData();
  }, [activeTab, selectedYear]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      let endpoint = '';
      
      if (activeTab === 'mensual') {
        const mes = new Date().getMonth() + 1;
        endpoint = `/dashboard/mensual?mes=${mes}&anio=${new Date().getFullYear()}`;
      } else if (activeTab === 'anual') {
        endpoint = `/dashboard/anual?anio=${selectedYear}`;
      } else {
        endpoint = '/dashboard/estadisticas';
      }
      
      const response = await axios.get(endpoint);
      setData(response.data);
    } catch (error) {
      console.error('Error fetching report data:', error);
      toast.error('Error al cargar los reportes');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'mensual', name: 'Mensual', icon: ChartBarIcon },
    { id: 'anual', name: 'Anual', icon: CalendarIcon },
    { id: 'estadisticas', name: 'Estadísticas', icon: ArrowTrendingUpIcon },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-neutral-800">Reportes</h1>
          <p className="text-neutral-600 mt-1">
            Análisis detallado de tus finanzas personales
          </p>
        </div>
        
        {activeTab === 'anual' && (
          <div className="flex items-center space-x-3">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="form-input py-2"
            >
              {years.map(year => (
                <option key={year.value} value={year.value}>
                  {year.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-neutral-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Contenido según tab activa */}
      {activeTab === 'mensual' && <ReporteMensual data={data} />}
      {activeTab === 'anual' && <ReporteAnual data={data} />}
      {activeTab === 'estadisticas' && <EstadisticasGenerales data={data} />}
    </div>
  );
};

const ReporteMensual = ({ data }) => {
  const { totalGastos, totalIngresos, balanceMes, gastosPorCategoria } = data || {};

  // Datos para gráfico de barras
  const barChartData = [
    { name: 'Ingresos', value: totalIngresos || 0, color: '#2E865F' },
    { name: 'Gastos', value: totalGastos || 0, color: '#FF6B35' },
    { name: 'Balance', value: balanceMes || 0, color: balanceMes >= 0 ? '#2E865F' : '#E57373' },
  ];

  // Datos para gráfico de pastel
  const pieChartData = (gastosPorCategoria || [])
    .filter(cat => cat.total > 0)
    .map(cat => ({
      name: cat.categoria_nombre,
      value: parseFloat(cat.total),
      color: cat.categoria_color,
    }));

  const COLORS = ['#FF6B35', '#8D6E63', '#2E865F', '#E57373', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'];

  return (
    <div className="space-y-8">
      {/* Resumen mensual */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card text-center">
          <ArrowTrendingUpIcon className="w-8 h-8 text-success-600 mx-auto mb-2" />
          <p className="text-sm text-neutral-600">Ingresos del mes</p>
          <p className="text-2xl font-bold text-success-600">
            {formatCurrency(totalIngresos || 0)}
          </p>
        </div>
        
        <div className="card text-center">
          <ArrowTrendingDownIcon className="w-8 h-8 text-danger-600 mx-auto mb-2" />
          <p className="text-sm text-neutral-600">Gastos del mes</p>
          <p className="text-2xl font-bold text-danger-600">
            {formatCurrency(totalGastos || 0)}
          </p>
        </div>
        
        <div className="card text-center">
          <BanknotesIcon className="w-8 h-8 text-primary-600 mx-auto mb-2" />
          <p className="text-sm text-neutral-600">Balance del mes</p>
          <p className={`text-2xl font-bold ${balanceMes >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
            {formatCurrency(balanceMes || 0)}
          </p>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Gráfico de barras */}
        <div className="card">
          <h3 className="text-lg font-semibold text-neutral-800 mb-4">Comparación Mensual</h3>
          <div className="h-80">
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
          <h3 className="text-lg font-semibold text-neutral-800 mb-4">Distribución por Categoría</h3>
          <div className="h-80">
            {pieChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
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
                <p>No hay datos para mostrar</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabla de categorías */}
      <div className="card">
        <h3 className="text-lg font-semibold text-neutral-800 mb-4">Detalle por Categoría</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-200">
                <th className="text-left py-3 px-4 font-medium text-neutral-600">Categoría</th>
                <th className="text-right py-3 px-4 font-medium text-neutral-600">Monto</th>
                <th className="text-right py-3 px-4 font-medium text-neutral-600">% del total</th>
              </tr>
            </thead>
            <tbody>
              {gastosPorCategoria && gastosPorCategoria.length > 0 ? (
                gastosPorCategoria.map((cat) => (
                  <tr key={cat.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{cat.categoria_icono}</span>
                        <span className="font-medium">{cat.categoria_nombre}</span>
                      </div>
                    </td>
                    <td className="text-right py-3 px-4 font-semibold text-danger-600">
                      {formatCurrency(cat.total || 0)}
                    </td>
                    <td className="text-right py-3 px-4 text-neutral-600">
                      {totalGastos > 0 ? ((cat.total / totalGastos) * 100).toFixed(1) : 0}%
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="text-center py-8 text-neutral-500">
                    No hay gastos registrados en este período
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const ReporteAnual = ({ data }) => {
  const { resumenPorMes, topCategorias, totalIngresosAnual, totalGastosAnual, balanceAnual } = data || {};

  // Preparar datos para gráfico de línea
  const lineChartData = (resumenPorMes || []).map(mes => ({
    mes: getMonthName(mes.mes),
    ingresos: mes.ingresos,
    gastos: mes.gastos,
    balance: mes.ingresos - mes.gastos,
  }));

  return (
    <div className="space-y-8">
      {/* Resumen anual */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card text-center">
          <ArrowTrendingUpIcon className="w-8 h-8 text-success-600 mx-auto mb-2" />
          <p className="text-sm text-neutral-600">Ingresos anuales</p>
          <p className="text-2xl font-bold text-success-600">
            {formatCurrency(totalIngresosAnual || 0)}
          </p>
        </div>
        
        <div className="card text-center">
          <ArrowTrendingDownIcon className="w-8 h-8 text-danger-600 mx-auto mb-2" />
          <p className="text-sm text-neutral-600">Gastos anuales</p>
          <p className="text-2xl font-bold text-danger-600">
            {formatCurrency(totalGastosAnual || 0)}
          </p>
        </div>
        
        <div className="card text-center">
          <BanknotesIcon className="w-8 h-8 text-primary-600 mx-auto mb-2" />
          <p className="text-sm text-neutral-600">Balance anual</p>
          <p className={`text-2xl font-bold ${balanceAnual >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
            {formatCurrency(balanceAnual || 0)}
          </p>
        </div>
      </div>

      {/* Gráfico de línea mensual */}
      <div className="card">
        <h3 className="text-lg font-semibold text-neutral-800 mb-4">Evolución Mensual</h3>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={lineChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="mes" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                formatter={(value) => [formatCurrency(value), 'Monto']}
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="ingresos" stroke="#2E865F" strokeWidth={3} name="Ingresos" />
              <Line type="monotone" dataKey="gastos" stroke="#FF6B35" strokeWidth={3} name="Gastos" />
              <Line type="monotone" dataKey="balance" stroke="#8D6E63" strokeWidth={3} name="Balance" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top categorías del año */}
      <div className="card">
        <h3 className="text-lg font-semibold text-neutral-800 mb-4">Top 5 Categorías con Mayor Gasto</h3>
        <div className="space-y-4">
          {topCategorias && topCategorias.length > 0 ? (
            topCategorias.map((cat, index) => (
              <div key={cat.id} className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-neutral-800">{cat.categoria_nombre}</p>
                    <p className="text-sm text-neutral-500">{cat.cantidad} transacciones</p>
                  </div>
                </div>
                <p className="font-semibold text-danger-600">
                  {formatCurrency(cat.total)}
                </p>
              </div>
            ))
          ) : (
            <p className="text-center py-8 text-neutral-500">No hay datos disponibles</p>
          )}
        </div>
      </div>
    </div>
  );
};

const EstadisticasGenerales = ({ data }) => {
  const { promedioGastoDiario, diaMayorGasto, categoriaMayorGasto } = data || {};

  return (
    <div className="space-y-8">
      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-neutral-800 mb-4">Promedio de Gasto Diario</h3>
          <div className="text-center">
            <p className="text-4xl font-bold text-danger-600">
              {formatCurrency(promedioGastoDiario || 0)}
            </p>
            <p className="text-neutral-600 mt-2">Por día</p>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-neutral-800 mb-4">Día con Mayor Gasto</h3>
          {diaMayorGasto ? (
            <div className="text-center">
              <p className="text-2xl font-bold text-danger-600">
                {formatCurrency(diaMayorGasto.total)}
              </p>
              <p className="text-neutral-600 mt-2">
                {formatDate(diaMayorGasto.fecha)}
              </p>
            </div>
          ) : (
            <p className="text-center text-neutral-500">No hay datos disponibles</p>
          )}
        </div>
      </div>

      {/* Categoría más gastada */}
      <div className="card">
        <h3 className="text-lg font-semibold text-neutral-800 mb-4">Categoría con Mayor Gasto</h3>
        {categoriaMayorGasto ? (
          <div className="flex items-center justify-between p-6 bg-gradient-to-r from-danger-50 to-primary-50 rounded-xl">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-danger-100 rounded-2xl flex items-center justify-center text-3xl">
                {categoriaMayorGasto.categoria_icono}
              </div>
              <div>
                <p className="text-xl font-bold text-neutral-800">
                  {categoriaMayorGasto.categoria_nombre}
                </p>
                <p className="text-neutral-600">
                  Total gastado: {formatCurrency(categoriaMayorGasto.total)}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-danger-600">
                {categoriaMayorGasto.cantidad}
              </p>
              <p className="text-neutral-600">transacciones</p>
            </div>
          </div>
        ) : (
          <p className="text-center py-8 text-neutral-500">No hay datos disponibles</p>
        )}
      </div>

      {/* Consejos financieros */}
      <div className="card">
        <h3 className="text-lg font-semibold text-neutral-800 mb-4">💡 Consejos Financieros</h3>
        <div className="space-y-4">
          <div className="p-4 bg-primary-50 rounded-lg border border-primary-200">
            <h4 className="font-medium text-primary-800 mb-2">Registra todos tus gastos</h4>
            <p className="text-primary-700 text-sm">
              Llevar un registro detallado de cada gasto te ayudará a identificar patrones de consumo y áreas de mejora.
            </p>
          </div>
          
          <div className="p-4 bg-success-50 rounded-lg border border-success-200">
            <h4 className="font-medium text-success-800 mb-2">Establece un presupuesto</h4>
            <p className="text-success-700 text-sm">
              Define límites de gasto por categoría para mantener tus finanzas bajo control y alcanzar tus metas.
            </p>
          </div>
          
          <div className="p-4 bg-info-50 rounded-lg border border-info-200">
            <h4 className="font-medium text-info-800 mb-2">Revisa tus finanzas regularmente</h4>
            <p className="text-info-700 text-sm">
              Analiza tus reportes mensuales para tomar decisiones informadas sobre tus gastos e inversiones.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reportes;