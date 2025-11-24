import type { Sale, FiscalStatus } from '../types';
import { api } from '../services/api';

interface SalesHistoryProps {
  sales: Sale[];
  onUpdateStatus: (saleId: string, fiscalStatus: FiscalStatus) => void;
}

const SalesHistory = ({ sales, onUpdateStatus }: SalesHistoryProps) => {
  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  // Print receipt
  const printReceipt = (sale: Sale) => {
    const receiptWindow = window.open('', '_blank', 'width=300,height=600');
    if (!receiptWindow) return;

    const receiptHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Recibo - ${sale.id}</title>
        <style>
          @media print {
            body { margin: 0; padding: 0; }
          }
          body {
            font-family: 'Courier New', monospace;
            font-size: 12px;
            width: 80mm;
            margin: 0 auto;
            padding: 10px;
          }
          .center { text-align: center; }
          .bold { font-weight: bold; }
          .divider { border-top: 1px dashed #000; margin: 10px 0; }
          .item-row { display: flex; justify-between; margin: 5px 0; }
          .total-row { font-size: 14px; font-weight: bold; margin-top: 10px; }
        </style>
      </head>
      <body>
        <div class="center bold">
          <div>CELLPHONE REPAIR ERP</div>
          <div style="font-size: 10px;">RECIBO NÃO FISCAL</div>
        </div>
        
        <div class="divider"></div>
        
        <div>
          <div>Data: ${formatDate(sale.date)}</div>
          <div>Venda: ${sale.id}</div>
        </div>
        
        <div class="divider"></div>
        
        <div class="bold">ITENS:</div>
        ${sale.items.map(item => `
          <div class="item-row">
            <div>${item.quantity}x ${item.name}</div>
            <div>${formatPrice(item.subtotal)}</div>
          </div>
          <div style="font-size: 10px; color: #666;">${formatPrice(item.unitPrice)} cada</div>
        `).join('')}
        
        <div class="divider"></div>
        
        <div class="item-row total-row">
          <div>TOTAL:</div>
          <div>${formatPrice(sale.total)}</div>
        </div>
        
        <div class="divider"></div>
        
        <div class="center" style="font-size: 10px; margin-top: 20px;">
          Obrigado pela preferência!
        </div>
      </body>
      <script>
        window.onload = function() {
          window.print();
        };
      </script>
      </html>
    `;

    receiptWindow.document.write(receiptHTML);
    receiptWindow.document.close();
  };

  // Issue invoice
  const issueInvoice = async (sale: Sale) => {
    try {
      const confirm = window.confirm(`Deseja emitir a NF-e para a venda ${sale.id}?`);
      if (!confirm) return;

      // Show loading state (optional: could add a loading state to the component)
      const btn = document.getElementById(`btn-emit-${sale.id}`);
      if (btn) {
        btn.innerText = '⏳ Emitindo...';
        (btn as HTMLButtonElement).disabled = true;
      }

      await api.emitFiscalDocument(sale);

      onUpdateStatus(sale.id, 'Emitida');
      alert('Nota Fiscal enviada para processamento com sucesso!');
    } catch (error: any) {
      console.error('Erro ao emitir NF-e:', error);
      alert(`Erro ao emitir NF-e: ${error.message || 'Erro desconhecido'}`);

      // Reset button
      const btn = document.getElementById(`btn-emit-${sale.id}`);
      if (btn) {
        btn.innerText = '📝 Emitir NF-e';
        (btn as HTMLButtonElement).disabled = false;
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Vendas Realizadas</h1>

        {sales.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-500">Nenhuma venda registrada</p>
          </div>
        ) : (
          <div className="overflow-x-auto shadow-md rounded-lg">
            <table className="min-w-full bg-white">
              <thead className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                <tr>
                  <th className="py-3 px-6 text-left text-sm font-semibold">Data</th>
                  <th className="py-3 px-6 text-right text-sm font-semibold">Valor</th>
                  <th className="py-3 px-6 text-center text-sm font-semibold">Qtd Itens</th>
                  <th className="py-3 px-6 text-center text-sm font-semibold">Status Fiscal</th>
                  <th className="py-3 px-6 text-center text-sm font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="py-4 px-6 text-sm text-gray-900">
                      {formatDate(sale.date)}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-900 font-semibold text-right">
                      {formatPrice(sale.total)}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-700 text-center">
                      {sale.items.reduce((sum, item) => sum + item.quantity, 0)}
                    </td>
                    <td className="py-4 px-6 text-sm text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${sale.fiscalStatus === 'Emitida'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                          }`}
                      >
                        {sale.fiscalStatus}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => {
                            const items = sale.items.map(item =>
                              `${item.quantity}x ${item.name} - ${formatPrice(item.subtotal)}`
                            ).join('\\n');
                            alert(`Venda ${sale.id}\\n\\nItens:\\n${items}\\n\\nTotal: ${formatPrice(sale.total)}`);
                          }}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors text-xs font-medium"
                          title="Ver Detalhes"
                        >
                          📄 Detalhes
                        </button>
                        <button
                          onClick={() => printReceipt(sale)}
                          className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors text-xs font-medium"
                          title="Imprimir Recibo"
                        >
                          🖨️ Recibo
                        </button>
                        {sale.fiscalStatus === 'Pendente' && (
                          <button
                            id={`btn-emit-${sale.id}`}
                            onClick={() => issueInvoice(sale)}
                            className="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Emitir NF-e"
                          >
                            📝 Emitir NF-e
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesHistory;
