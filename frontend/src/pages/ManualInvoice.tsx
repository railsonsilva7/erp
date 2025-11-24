import { useState } from 'react';
import { api } from '../services/api';

const ManualInvoice = () => {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null); // Added success state

  const [recipient, setRecipient] = useState<{
    cpf_cnpj: string;
    name: string;
    logradouro: string;
    numero: string;
    bairro: string;
    municipio: string;
    uf: string;
    cep: string;
    inscricao_estadual: string;
    indicador_inscricao_estadual: string;
    email: string;
    telefone: string;
    codigo_municipio: string;
    codigo_pais: string;
    pais: string;
    numero_nfe?: string; // Added optional field to interface
  }>({
    cpf_cnpj: '',
    name: '',
    logradouro: '',
    numero: '',
    bairro: '',
    municipio: '',
    uf: '',
    cep: '',
    // Novos campos para PJ
    inscricao_estadual: '',
    indicador_inscricao_estadual: '9', // Default: Não Contribuinte
    email: '',
    telefone: '',
    codigo_municipio: '',
    codigo_pais: '1058',
    pais: 'BRASIL',
    numero_nfe: '',
  });

  const [item, setItem] = useState({
    name: '',
    ncm: '',
    cfop: '5102',
    price: 0,
    quantity: 1,
  });

  const handleRecipientChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setRecipient(prev => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setItem(prev => ({ ...prev, [name]: value }));
  };

  const handleIssueInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResponse(null);
    setSuccess(null);

    try {
      // Build flat payload matching backend schema
      const payload = {
        cpf_cnpj: recipient.cpf_cnpj,
        nome: recipient.name,
        logradouro: recipient.logradouro,
        numero: recipient.numero,
        bairro: recipient.bairro,
        municipio: recipient.municipio,
        uf: recipient.uf,
        cep: recipient.cep,
        // Novos campos PJ
        inscricao_estadual: recipient.inscricao_estadual || undefined,
        indicador_inscricao_estadual: recipient.indicador_inscricao_estadual,
        email: recipient.email || undefined,
        telefone: recipient.telefone || undefined,
        codigo_municipio: recipient.codigo_municipio || undefined,
        codigo_pais: recipient.codigo_pais,
        pais: recipient.pais,
        // Manual Number Override
        numero_nfe: recipient.numero_nfe || undefined,
        // Item
        item_nome: item.name,
        item_ncm: item.ncm,
        item_cfop: item.cfop,
        item_price: parseFloat(item.price.toString()),
        item_quantity: parseInt(item.quantity.toString()),
      };

      console.log('Payload enviado para backend:', payload);
      console.log('='.repeat(80));
      console.log('PAYLOAD REACT (antes de enviar):', payload);
      console.log('Verificando campos críticos:');
      console.log('  logradouro:', payload.logradouro);
      console.log('  numero:', payload.numero);
      console.log('  bairro:', payload.bairro);
      console.log('  municipio:', payload.municipio);
      console.log('='.repeat(80));

      const result = await api.issueManualInvoice(payload);
      setResponse(result);
      setSuccess('Nota Fiscal emitida com sucesso!');
    } catch (err: any) {
      setError(err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Emissão de Nota Avulsa (Manual)</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form Column */}
          <div className="space-y-6">
            <form onSubmit={handleIssueInvoice} className="bg-white rounded-lg shadow-md p-6 space-y-6">

              {/* Section 1: Recipient */}
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">1. Destinatário</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">CPF / CNPJ</label>
                    <input name="cpf_cnpj" value={recipient.cpf_cnpj} onChange={handleRecipientChange} required className="w-full border rounded px-3 py-2" placeholder="000.000.000-00" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nome Completo</label>
                    <input name="name" value={recipient.name} onChange={handleRecipientChange} required className="w-full border rounded px-3 py-2" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">CEP</label>
                      <input name="cep" value={recipient.cep} onChange={handleRecipientChange} required className="w-full border rounded px-3 py-2" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">UF</label>
                      <input name="uf" value={recipient.uf} onChange={handleRecipientChange} required maxLength={2} className="w-full border rounded px-3 py-2" placeholder="SP" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Município</label>
                      <input name="municipio" value={recipient.municipio} onChange={handleRecipientChange} required className="w-full border rounded px-3 py-2" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Código IBGE</label>
                      <input name="codigo_municipio" value={recipient.codigo_municipio} onChange={handleRecipientChange} className="w-full border rounded px-3 py-2" placeholder="Ex: 4205407" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Bairro</label>
                    <input name="bairro" value={recipient.bairro} onChange={handleRecipientChange} required className="w-full border rounded px-3 py-2" />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700">Logradouro</label>
                      <input name="logradouro" value={recipient.logradouro} onChange={handleRecipientChange} required className="w-full border rounded px-3 py-2" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Número</label>
                      <input name="numero" value={recipient.numero} onChange={handleRecipientChange} required className="w-full border rounded px-3 py-2" />
                    </div>
                  </div>

                  {/* Seção de Campos Fiscais Opcionais (PJ) */}
                  <div className="border-t pt-4 mt-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">📋 Dados Fiscais (Opcional - Para PJ)</h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Inscrição Estadual (Opcional)
                        </label>
                        <input
                          type="text"
                          name="inscricao_estadual" // Added name attribute
                          value={recipient.inscricao_estadual}
                          onChange={handleRecipientChange} // Changed to use existing handler
                          className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Apenas números"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Indicador IE
                        </label>
                        <select
                          name="indicador_inscricao_estadual" // Added name attribute
                          value={recipient.indicador_inscricao_estadual}
                          onChange={handleRecipientChange} // Changed to use existing handler
                          className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="1">1 - Contribuinte ICMS</option>
                          <option value="2">2 - Contribuinte Isento</option>
                          <option value="9">9 - Não Contribuinte (PF)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Número Manual NFe (Opcional)
                        </label>
                        <input
                          type="text"
                          name="numero_nfe" // Added name attribute
                          value={recipient.numero_nfe || ''}
                          onChange={handleRecipientChange} // Changed to use existing handler
                          className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Ex: 10 (Para corrigir duplicidade)"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4"> {/* Added mt-4 for spacing */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input type="email" name="email" value={recipient.email} onChange={handleRecipientChange} className="w-full border rounded px-3 py-2" placeholder="contato@empresa.com" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Telefone</label>
                        <input name="telefone" value={recipient.telefone} onChange={handleRecipientChange} className="w-full border rounded px-3 py-2" placeholder="(48) 99999-9999" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Product */}
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">2. Produto</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Descrição do Produto</label>
                    <input name="name" value={item.name} onChange={handleItemChange} required className="w-full border rounded px-3 py-2" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">NCM</label>
                      <input name="ncm" value={item.ncm} onChange={handleItemChange} required className="w-full border rounded px-3 py-2" placeholder="85171231" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">CFOP</label>
                      <input name="cfop" value={item.cfop} onChange={handleItemChange} required className="w-full border rounded px-3 py-2" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Preço Unit. (R$)</label>
                      <input type="number" name="price" value={item.price} onChange={handleItemChange} required step="0.01" className="w-full border rounded px-3 py-2" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Quantidade</label>
                      <input type="number" name="quantity" value={item.quantity} onChange={handleItemChange} required min="1" className="w-full border rounded px-3 py-2" />
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 rounded-lg font-bold text-white transition-all ${loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 shadow-md hover:shadow-lg'
                  }`}
              >
                {loading ? 'Emitindo...' : 'Emitir NF-e Avulsa'}
              </button>
            </form>
          </div>

          {/* Result Column */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6 h-full">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Resultado da API</h2>

              {success && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                  <strong>Sucesso:</strong> {success}
                </div>
              )}

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  <strong>Erro:</strong> {error}
                </div>
              )}

              {response ? (
                <div className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-auto max-h-[600px] font-mono text-sm">
                  <pre>{JSON.stringify(response, null, 2)}</pre>
                </div>
              ) : (
                <div className="text-gray-500 text-center py-12 border-2 border-dashed rounded-lg">
                  O resultado da emissão aparecerá aqui.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManualInvoice;
