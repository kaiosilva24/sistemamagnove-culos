import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit2, Trash2, Plus, DollarSign, Calendar, Wrench } from 'lucide-react';
import { supabase } from '../lib/supabase';

function DetalhesVeiculo() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [veiculo, setVeiculo] = useState(null);
  const [gastos, setGastos] = useState([]);
  const [totalGastos, setTotalGastos] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showGastoModal, setShowGastoModal] = useState(false);
  const [showVendaModal, setShowVendaModal] = useState(false);

  useEffect(() => {
    fetchVeiculo();
    fetchGastos();
  }, [id]);

  const fetchVeiculo = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(`/api/veiculos/${id}`, {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      });
      const data = await response.json();
      setVeiculo(data);
    } catch (error) {
      console.error('Erro ao carregar veículo:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGastos = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(`/api/veiculos/${id}/gastos`, {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      });
      const data = await response.json();
      // A API agora retorna {gastos: [], total: 0}
      setGastos(data.gastos || []);
      setTotalGastos(data.total || 0);
    } catch (error) {
      console.error('Erro ao carregar gastos:', error);
      setGastos([]);
      setTotalGastos(0);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 text-lg">Carregando...</div>
      </div>
    );
  }

  if (!veiculo) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">Veículo não encontrado</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/veiculos')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {veiculo.marca} {veiculo.modelo}
            </h1>
            <p className="text-gray-600 mt-1">{veiculo.ano} • {veiculo.placa || 'Sem placa'}</p>
          </div>
        </div>
        <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
          veiculo.status === 'vendido' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-blue-100 text-blue-800'
        }`}>
          {veiculo.status === 'vendido' ? 'Vendido' : 'Em Estoque'}
        </span>
      </div>

      {/* Cards de Informações */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card de Compra */}
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-red-500">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-red-100 rounded-full p-2">
              <DollarSign className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Compra</h3>
          </div>
          <p className="text-2xl font-bold text-red-600 mb-2">
            {formatCurrency(veiculo.preco_compra)}
          </p>
          <p className="text-sm text-gray-600">
            <Calendar className="w-4 h-4 inline mr-1" />
            {formatDate(veiculo.data_compra)}
          </p>
        </div>

        {/* Card de Gastos */}
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-orange-500">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-orange-100 rounded-full p-2">
              <Wrench className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Gastos</h3>
          </div>
          <p className="text-2xl font-bold text-orange-600 mb-2">
            {formatCurrency(totalGastos)}
          </p>
          <p className="text-sm text-gray-600">{gastos.length} lançamento(s)</p>
        </div>

        {/* Card de Venda/Lucro */}
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-green-100 rounded-full p-2">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              {veiculo.preco_venda ? 'Lucro' : 'Venda'}
            </h3>
          </div>
          {veiculo.preco_venda ? (
            <>
              <p className={`text-2xl font-bold mb-2 ${veiculo.lucro >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(veiculo.lucro)}
              </p>
              <p className="text-sm text-gray-600">
                Vendido por {formatCurrency(veiculo.preco_venda)}
              </p>
            </>
          ) : (
            <>
              <p className="text-2xl font-bold text-gray-400 mb-2">-</p>
              <button
                onClick={() => setShowVendaModal(true)}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Registrar venda
              </button>
            </>
          )}
        </div>
      </div>

      {/* Detalhes do Veículo */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Detalhes do Veículo</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-sm text-gray-500 mb-1">Marca</p>
            <p className="font-semibold text-gray-900">{veiculo.marca}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Modelo</p>
            <p className="font-semibold text-gray-900">{veiculo.modelo}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Ano</p>
            <p className="font-semibold text-gray-900">{veiculo.ano}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Placa</p>
            <p className="font-semibold text-gray-900">{veiculo.placa || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Cor</p>
            <p className="font-semibold text-gray-900">{veiculo.cor || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Quilometragem</p>
            <p className="font-semibold text-gray-900">
              {veiculo.km ? veiculo.km.toLocaleString('pt-BR') + ' km' : '-'}
            </p>
          </div>
        </div>
        {veiculo.observacoes && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-2">Observações</p>
            <p className="text-gray-900">{veiculo.observacoes}</p>
          </div>
        )}
      </div>

      {/* Gastos */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Gastos e Serviços</h2>
          <button
            onClick={() => setShowGastoModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Gasto</span>
          </button>
        </div>

        {gastos.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Nenhum gasto registrado</p>
        ) : (
          <div className="space-y-3">
            {gastos.map(gasto => (
              <div key={gasto.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                      {gasto.tipo}
                    </span>
                    <h4 className="font-semibold text-gray-900">{gasto.descricao}</h4>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{formatDate(gasto.data)}</p>
                </div>
                <div className="flex items-center space-x-4">
                  <p className="text-lg font-bold text-orange-600">{formatCurrency(gasto.valor)}</p>
                  <button
                    onClick={async () => {
                      if (confirm('Deseja deletar este gasto?')) {
                        try {
                          const { data: { session } } = await supabase.auth.getSession();
                          const response = await fetch(`/api/veiculos/${id}/gastos/${gasto.id}`, { 
                            method: 'DELETE',
                            headers: {
                              'Authorization': `Bearer ${session?.access_token}`
                            }
                          });
                          if (response.ok) {
                            fetchGastos();
                            fetchVeiculo();
                          } else {
                            alert('Erro ao deletar gasto');
                          }
                        } catch (error) {
                          console.error('Erro ao deletar:', error);
                          alert('Erro ao deletar gasto');
                        }
                      }
                    }}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Adicionar Gasto */}
      {showGastoModal && (
        <ModalGasto
          veiculoId={id}
          onClose={() => setShowGastoModal(false)}
          onSuccess={() => {
            fetchGastos();
            fetchVeiculo();
            setShowGastoModal(false);
          }}
        />
      )}

      {/* Modal de Registrar Venda */}
      {showVendaModal && (
        <ModalVenda
          veiculo={veiculo}
          onClose={() => setShowVendaModal(false)}
          onSuccess={() => {
            fetchVeiculo();
            setShowVendaModal(false);
          }}
        />
      )}
    </div>
  );
}

// Modal para adicionar gasto
function ModalGasto({ veiculoId, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    descricao: '',
    tipo: 'Peça',
    valor: '',
    data: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data: { session } } = await supabase.auth.getSession();
      await fetch(`/api/veiculos/${veiculoId}/gastos`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          ...formData,
          valor: parseFloat(formData.valor)
        })
      });
      onSuccess();
    } catch (error) {
      console.error('Erro ao adicionar gasto:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full mx-4">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Adicionar Gasto</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
            <input
              type="text"
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: Troca de óleo"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
            <select
              value={formData.tipo}
              onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option>Peça</option>
              <option>Serviço</option>
              <option>Manutenção</option>
              <option>Documentação</option>
              <option>Outro</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Valor (R$)</label>
            <input
              type="number"
              value={formData.valor}
              onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
              required
              min="0"
              step="0.01"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Data</label>
            <input
              type="date"
              value={formData.data}
              onChange={(e) => setFormData({ ...formData, data: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Adicionar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Modal para registrar venda
function ModalVenda({ veiculo, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    preco_venda: '',
    data_venda: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetch(`/api/veiculos/${veiculo.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...veiculo,
          preco_venda: parseFloat(formData.preco_venda),
          data_venda: formData.data_venda,
          status: 'vendido'
        })
      });
      onSuccess();
    } catch (error) {
      console.error('Erro ao registrar venda:', error);
    }
  };

  const precoVenda = parseFloat(formData.preco_venda) || 0;
  const lucroEstimado = precoVenda - veiculo.preco_compra - veiculo.total_gastos;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full mx-4">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Registrar Venda</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Preço de Venda (R$)</label>
            <input
              type="number"
              value={formData.preco_venda}
              onChange={(e) => setFormData({ ...formData, preco_venda: e.target.value })}
              required
              min="0"
              step="0.01"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Data da Venda</label>
            <input
              type="date"
              value={formData.data_venda}
              onChange={(e) => setFormData({ ...formData, data_venda: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          {formData.preco_venda && (
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-2">Lucro Estimado:</p>
              <p className={`text-2xl font-bold ${lucroEstimado >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(lucroEstimado)}
              </p>
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Registrar Venda
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default DetalhesVeiculo;
