import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Car, ShoppingCart, Wrench } from 'lucide-react';

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await fetch('/api/dashboard');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 text-lg">Carregando...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500 text-lg">Erro ao carregar dados. Tente recarregar a página.</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Visão geral do seu negócio de veículos</p>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total de Veículos */}
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Veículos</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.total_veiculos || 0}</p>
            </div>
            <div className="bg-blue-100 rounded-full p-3">
              <Car className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Em Estoque */}
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Em Estoque</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.em_estoque}</p>
            </div>
            <div className="bg-yellow-100 rounded-full p-3">
              <ShoppingCart className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
        </div>

        {/* Vendidos */}
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Vendidos</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.vendidos}</p>
            </div>
            <div className="bg-green-100 rounded-full p-3">
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        {/* Lucro Líquido */}
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Lucro Líquido</p>
              <p className={`text-3xl font-bold mt-2 ${stats.lucro_liquido >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(stats.lucro_liquido)}
              </p>
            </div>
            <div className="bg-purple-100 rounded-full p-3">
              <DollarSign className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Detalhamento Financeiro */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Investido */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-red-100 rounded-full p-2">
              <DollarSign className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Total Investido</h3>
          </div>
          <p className="text-2xl font-bold text-red-600">{formatCurrency(stats.total_investido)}</p>
          <p className="text-sm text-gray-600 mt-2">Valor total de compra dos veículos</p>
        </div>

        {/* Total em Gastos */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-orange-100 rounded-full p-2">
              <Wrench className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Total em Gastos</h3>
          </div>
          <p className="text-2xl font-bold text-orange-600">{formatCurrency(stats.total_gastos)}</p>
          <p className="text-sm text-gray-600 mt-2">Serviços, peças e manutenção</p>
        </div>

        {/* Total em Vendas */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-green-100 rounded-full p-2">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Total em Vendas</h3>
          </div>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.total_vendas)}</p>
          <p className="text-sm text-gray-600 mt-2">Receita total com vendas</p>
        </div>
      </div>

      {/* Resumo do Lucro */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-8 text-white">
        <h2 className="text-2xl font-bold mb-6">Resumo Financeiro</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <p className="text-blue-100 text-sm mb-1">Vendas</p>
            <p className="text-2xl font-bold">{formatCurrency(stats.total_vendas)}</p>
          </div>
          <div>
            <p className="text-blue-100 text-sm mb-1">Compras</p>
            <p className="text-2xl font-bold">- {formatCurrency(stats.total_investido)}</p>
          </div>
          <div>
            <p className="text-blue-100 text-sm mb-1">Gastos</p>
            <p className="text-2xl font-bold">- {formatCurrency(stats.total_gastos)}</p>
          </div>
          <div className="border-l-2 border-white/30 pl-6">
            <p className="text-blue-100 text-sm mb-1">Lucro Líquido</p>
            <p className="text-3xl font-bold">{formatCurrency(stats.lucro_liquido)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
