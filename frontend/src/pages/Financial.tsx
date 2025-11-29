import { useState, useEffect } from 'react';
import { FileText, Trash2, AlertCircle, X } from 'lucide-react';

interface Invoice {
  ref: string;
  status: string;
  number: string;
  series: string;
  access_key: string;
  pdf_url: string;
  xml_url: string;
  issued_at: string;
  recipient_name: string;
  total_value: number;
}

export function Financial() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [justification, setJustification] = useState('');
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const response = await fetch('/api/invoices');
      const data = await response.json();
      setInvoices(data);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelClick = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setJustification('');
    setCancelModalOpen(true);
  };

  const confirmCancel = async () => {
    if (!selectedInvoice) return;

    setCancelling(true);
    try {
      const response = await fetch(`/api/invoices/${selectedInvoice.ref}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ justification }),
      });

      if (response.ok) {
        setCancelModalOpen(false);
        fetchInvoices(); // Refresh list
      } else {
        const error = await response.json();
        alert(`Erro ao cancelar: ${error.detail}`);
      }
    } catch (error) {
      console.error('Error cancelling invoice:', error);
      alert('Erro ao cancelar nota fiscal');
    } finally {
      setCancelling(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      autorizado: 'bg-green-100 text-green-800',
      cancelado: 'bg-red-100 text-red-800',
      processando: 'bg-yellow-100 text-yellow-800',
      erro_autorizacao: 'bg-red-100 text-red-800',
    };

    const labels = {
      autorizado: 'Autorizada',
      cancelado: 'Cancelada',
      processando: 'Processando',
      erro_autorizacao: 'Erro',
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800'}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Financeiro / Fiscal</h1>
        <p className="text-gray-600">Gerenciamento de Notas Fiscais emitidas</p>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Número</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Destinatário</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">Carregando...</td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">Nenhuma nota fiscal encontrada</td>
                </tr>
              ) : (
                invoices.map((invoice) => (
                  <tr key={invoice.ref} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(invoice.issued_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {invoice.number ? `${invoice.number}/${invoice.series}` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {invoice.recipient_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(invoice.total_value)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(invoice.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-3">
                        {invoice.pdf_url && (
                          <a
                            href={invoice.pdf_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-900"
                            title="Visualizar PDF"
                          >
                            <FileText size={18} />
                          </a>
                        )}

                        {invoice.status === 'autorizado' && (
                          <button
                            onClick={() => handleCancelClick(invoice)}
                            className="text-red-600 hover:text-red-900"
                            title="Cancelar Nota"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Cancelamento */}
      {cancelModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                <AlertCircle className="text-red-500" size={20} />
                Cancelar Nota Fiscal
              </h3>
              <button onClick={() => setCancelModalOpen(false)} className="text-gray-400 hover:text-gray-500">
                <X size={20} />
              </button>
            </div>

            <p className="text-sm text-gray-500 mb-4">
              Você está prestes a cancelar a nota fiscal <strong>{selectedInvoice?.number}</strong>.
              Esta ação é irreversível e deve ser feita apenas se a mercadoria não circulou.
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Motivo do Cancelamento (Mínimo 15 caracteres)
              </label>
              <textarea
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                placeholder="Ex: Erro na emissão dos dados do destinatário..."
              />
              <p className="text-xs text-gray-500 mt-1 text-right">
                {justification.length}/15 caracteres
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setCancelModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                disabled={cancelling}
              >
                Voltar
              </button>
              <button
                onClick={confirmCancel}
                disabled={justification.length < 15 || cancelling}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {cancelling ? 'Cancelando...' : 'Confirmar Cancelamento'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
