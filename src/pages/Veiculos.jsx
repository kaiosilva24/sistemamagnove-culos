import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Trash2, Search, Calendar, DollarSign } from 'lucide-react';
import { veiculosAPI } from '../lib/api';

function Veiculos() {
  const [veiculos, setVeiculos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');
  const navigate = useNavigate();

  useEffect(() => {
    fetchVeiculos();
  }, []);

  const fetchVeiculos = async () => {
    try {
      console.log('🔄 Carregando veículos com autenticação...');
      const data = await veiculosAPI.getAll();
      console.log('✅ Veículos carregados:', data);
      setVeiculos(data);
    } catch (error) {
      console.error('❌ Erro ao carregar veículos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja deletar este veículo?')) return;
    
    try {
      console.log('🗑️ Deletando veículo:', id);
      await veiculosAPI.delete(id);
      console.log('✅ Veículo deletado');
      fetchVeiculos();
    } catch (error) {
      console.error('❌ Erro ao deletar veículo:', error);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const filteredVeiculos = veiculos.filter(veiculo => {
    const matchesSearch = 
      veiculo.marca.toLowerCase().includes(searchTerm.toLowerCase()) ||
      veiculo.modelo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      veiculo.placa?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      filterStatus === 'todos' || veiculo.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 text-lg">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Veículos</h1>
          <p className="text-gray-600 mt-2">Gerencie seu estoque de veículos</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por marca, modelo ou placa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filtro de Status */}
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="todos">Todos os Status</option>
              <option value="estoque">Em Estoque</option>
              <option value="vendido">Vendidos</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Veículos */}
      {filteredVeiculos.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <p className="text-gray-500 text-lg">Nenhum veículo encontrado</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredVeiculos.map(veiculo => (
            <div key={veiculo.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex justify-between items-start">
                  {/* Informações do Veículo */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h3 className="text-2xl font-bold text-gray-900">
                        {veiculo.marca} {veiculo.modelo}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        veiculo.status === 'vendido' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {veiculo.status === 'vendido' ? 'Vendido' : 'Em Estoque'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-500">Ano</p>
                        <p className="font-semibold text-gray-900">{veiculo.ano}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Placa</p>
                        <p className="font-semibold text-gray-900">{veiculo.placa || '-'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Cor</p>
                        <p className="font-semibold text-gray-900">{veiculo.cor || '-'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">KM</p>
                        <p className="font-semibold text-gray-900">
                          {veiculo.km ? veiculo.km.toLocaleString('pt-BR') : '-'}
                        </p>
                      </div>
                    </div>

                    {/* Informações Financeiras */}
                    <div className="flex flex-wrap gap-6 pt-4 border-t border-gray-200">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Preço de Compra</p>
                        <p className="text-lg font-bold text-red-600">{formatCurrency(veiculo.preco_compra)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Total em Gastos</p>
                        <p className="text-lg font-bold text-orange-600">{formatCurrency(veiculo.total_gastos)}</p>
                      </div>
                      {veiculo.preco_venda && (
                        <>
                          <div>
                            <p className="text-sm text-gray-500 mb-1">Preço de Venda</p>
                            <p className="text-lg font-bold text-green-600">{formatCurrency(veiculo.preco_venda)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 mb-1">Lucro</p>
                            <p className={`text-lg font-bold ${veiculo.lucro >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {formatCurrency(veiculo.lucro)}
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="flex flex-col space-y-2 ml-4">
                    <button
                      onClick={() => navigate(`/veiculos/${veiculo.id}`)}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Ver Detalhes</span>
                    </button>
                    <button
                      onClick={() => handleDelete(veiculo.id)}
                      className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Deletar</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Veiculos;
