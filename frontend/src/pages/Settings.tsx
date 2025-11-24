import { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { CompanySettings } from '../types';

type TabType = 'company' | 'fiscal' | 'integrations';

const CompanyForm = () => {
  const [formData, setFormData] = useState<CompanySettings>({
    cnpj: '', ie: '', razao_social: '', nome_fantasia: '',
    logradouro: '', numero: '', bairro: '', municipio: '', uf: '', cep: '',
    regime_tributario: 1
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await api.getCompanySettings();
      if (data.cnpj) setFormData(data);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.saveCompanySettings(formData);
      alert('Dados da empresa salvos com sucesso!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Erro ao salvar dados.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Dados da Empresa</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Razão Social</label>
          <input name="razao_social" value={formData.razao_social} onChange={handleChange} type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Nome Fantasia</label>
          <input name="nome_fantasia" value={formData.nome_fantasia} onChange={handleChange} type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">CNPJ</label>
          <input name="cnpj" value={formData.cnpj} onChange={handleChange} type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Inscrição Estadual</label>
          <input name="ie" value={formData.ie} onChange={handleChange} type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Logradouro</label>
          <input name="logradouro" value={formData.logradouro} onChange={handleChange} type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Número</label>
          <input name="numero" value={formData.numero} onChange={handleChange} type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Bairro</label>
          <input name="bairro" value={formData.bairro} onChange={handleChange} type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Município</label>
          <input name="municipio" value={formData.municipio} onChange={handleChange} type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">UF</label>
          <input name="uf" value={formData.uf} onChange={handleChange} type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" maxLength={2} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">CEP</label>
          <input name="cep" value={formData.cep} onChange={handleChange} type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button disabled={loading} className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all font-semibold shadow-md hover:shadow-lg disabled:opacity-50">
          {loading ? 'Salvando...' : 'Salvar Dados da Empresa'}
        </button>
      </div>
    </form>
  );
};

const Settings = () => {
  const [activeTab, setActiveTab] = useState<TabType>('company');
  const [integrations, setIntegrations] = useState({
    mercadoPago: false,
    cielo: false,
    correios: false,
  });

  const toggleIntegration = (key: keyof typeof integrations) => {
    setIntegrations(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="container mx-auto max-w-5xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Configurações</h1>

        {/* Tabs Navigation */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('company')}
              className={`flex-1 py-4 px-6 text-sm font-medium transition-colors ${activeTab === 'company'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-blue-600'
                }`}
            >
              📊 Dados da Empresa
            </button>
            <button
              onClick={() => setActiveTab('fiscal')}
              className={`flex-1 py-4 px-6 text-sm font-medium transition-colors ${activeTab === 'fiscal'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-blue-600'
                }`}
            >
              📝 Fiscal (NFe/NFCe)
            </button>
            <button
              onClick={() => setActiveTab('integrations')}
              className={`flex-1 py-4 px-6 text-sm font-medium transition-colors ${activeTab === 'integrations'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-blue-600'
                }`}
            >
              💳 Pagamentos & Integrações
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-md p-6">
          {/* Company Data Tab */}
          {activeTab === 'company' && (
            <CompanyForm />
          )}

          {/* Fiscal Tab */}
          {activeTab === 'fiscal' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">Configurações Fiscais</h2>
                <div className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
                  ⚠️ Integração Fiscal Inativa (Aguardando API)
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Certificado Digital (.pfx)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-400 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="text-gray-400">🔐</span>
                      <input
                        type="file"
                        accept=".pfx"
                        className="flex-1 text-sm text-gray-600"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Arquivo de certificado digital A1 ou A3
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Senha do Certificado
                  </label>
                  <input
                    type="password"
                    placeholder="Digite a senha do certificado"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ambiente
                  </label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="homologacao">Homologação (Testes)</option>
                    <option value="producao">Produção (Real)</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Use Homologação para testes antes de emitir notas reais
                  </p>
                </div>

                <div className="border-t pt-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div>
                      <div className="text-sm font-medium text-gray-700">
                        Emitir nota automaticamente após venda
                      </div>
                      <div className="text-xs text-gray-500">
                        A nota fiscal será emitida automaticamente quando finalizar uma venda no PDV
                      </div>
                    </div>
                  </label>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex gap-3">
                    <span className="text-blue-600">ℹ️</span>
                    <div className="text-sm text-blue-800">
                      <strong>Importante:</strong> Para emitir notas fiscais, você precisará contratar um serviço de API fiscal (como Focus NFe, TecnoSpeed, etc.) e configurar as credenciais aqui.
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all font-semibold shadow-md hover:shadow-lg">
                  Salvar Configurações Fiscais
                </button>
              </div>
            </div>
          )}

          {/* Integrations Tab */}
          {activeTab === 'integrations' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Pagamentos & Integrações</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Mercado Pago */}
                <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">💳</span>
                    </div>
                    <button
                      onClick={() => toggleIntegration('mercadoPago')}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${integrations.mercadoPago ? 'bg-blue-600' : 'bg-gray-300'
                        }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${integrations.mercadoPago ? 'translate-x-6' : 'translate-x-1'
                          }`}
                      />
                    </button>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1">Mercado Pago</h3>
                  <p className="text-xs text-gray-500 mb-3">
                    Aceite pagamentos via PIX, cartão e boleto
                  </p>
                  <div className={`text-xs font-semibold ${integrations.mercadoPago ? 'text-green-600' : 'text-gray-400'
                    }`}>
                    {integrations.mercadoPago ? '✓ Ativo' : '○ Inativo'}
                  </div>
                </div>

                {/* Cielo */}
                <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">💰</span>
                    </div>
                    <button
                      onClick={() => toggleIntegration('cielo')}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${integrations.cielo ? 'bg-blue-600' : 'bg-gray-300'
                        }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${integrations.cielo ? 'translate-x-6' : 'translate-x-1'
                          }`}
                      />
                    </button>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1">Cielo</h3>
                  <p className="text-xs text-gray-500 mb-3">
                    Máquina de cartão e gateway de pagamento
                  </p>
                  <div className={`text-xs font-semibold ${integrations.cielo ? 'text-green-600' : 'text-gray-400'
                    }`}>
                    {integrations.cielo ? '✓ Ativo' : '○ Inativo'}
                  </div>
                </div>

                {/* Correios */}
                <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">📦</span>
                    </div>
                    <button
                      onClick={() => toggleIntegration('correios')}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${integrations.correios ? 'bg-blue-600' : 'bg-gray-300'
                        }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${integrations.correios ? 'translate-x-6' : 'translate-x-1'
                          }`}
                      />
                    </button>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1">Correios</h3>
                  <p className="text-xs text-gray-500 mb-3">
                    Cálculo de frete e rastreamento de entregas
                  </p>
                  <div className={`text-xs font-semibold ${integrations.correios ? 'text-green-600' : 'text-gray-400'
                    }`}>
                    {integrations.correios ? '✓ Ativo' : '○ Inativo'}
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-6">
                <div className="flex gap-3">
                  <span className="text-gray-600">💡</span>
                  <div className="text-sm text-gray-700">
                    <strong>Dica:</strong> Ative as integrações que você utiliza para habilitar funcionalidades específicas em todo o sistema.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
