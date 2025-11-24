import type { ServiceOrder, Client, Device, ServiceOrderStatus } from '../types';

interface ServiceOrderListProps {
  orders: ServiceOrder[];
  clients: Client[];
  devices: Device[];
  onStatusChange: (id: string, newStatus: ServiceOrderStatus) => void;
}

const ServiceOrderList = ({ orders, clients, devices, onStatusChange }: ServiceOrderListProps) => {
  // Helper function to get client name by ID
  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client?.name || 'N/A';
  };

  // Helper function to get device model by ID
  const getDeviceModel = (deviceId: string) => {
    const device = devices.find(d => d.id === deviceId);
    return device ? `${device.brand} ${device.model}`.trim() || device.model : 'N/A';
  };

  // Helper function to get status configuration
  const getStatusConfig = (status: string) => {
    const statusConfig = {
      pending: { label: 'Pendente', className: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
      in_progress: { label: 'Em Andamento', className: 'bg-blue-100 text-blue-800 border-blue-300' },
      completed: { label: 'Concluído', className: 'bg-green-100 text-green-800 border-green-300' },
      cancelled: { label: 'Cancelado', className: 'bg-red-100 text-red-800 border-red-300' },
    };

    return statusConfig[status as keyof typeof statusConfig] || {
      label: status,
      className: 'bg-gray-100 text-gray-800 border-gray-300'
    };
  };

  // Helper function to render status dropdown
  const getStatusDropdown = (order: ServiceOrder) => {
    const config = getStatusConfig(order.status);

    return (
      <select
        value={order.status}
        onChange={(e) => onStatusChange(order.id, e.target.value as ServiceOrderStatus)}
        className={`px-3 py-1 rounded-full text-xs font-semibold border cursor-pointer transition-all hover:opacity-80 focus:ring-2 focus:ring-blue-500 focus:outline-none ${config.className}`}
      >
        <option value="pending">Pendente</option>
        <option value="in_progress">Em Andamento</option>
        <option value="completed">Concluído</option>
        <option value="cancelled">Cancelado</option>
      </select>
    );
  };

  // Helper function to format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  return (
    <div className="container mx-auto px-4 pb-8">
      {/* Table for larger screens */}
      <div className="hidden md:block overflow-x-auto shadow-md rounded-lg">
        <table className="min-w-full bg-white">
          <thead className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
            <tr>
              <th className="py-3 px-6 text-left text-sm font-semibold">Cliente</th>
              <th className="py-3 px-6 text-left text-sm font-semibold">Modelo</th>
              <th className="py-3 px-6 text-left text-sm font-semibold">Status</th>
              <th className="py-3 px-6 text-right text-sm font-semibold">Preço</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {orders.map((order) => (
              <tr
                key={order.id}
                className="hover:bg-gray-50 transition-colors duration-150"
              >
                <td className="py-4 px-6 text-sm text-gray-900">
                  {getClientName(order.client_id)}
                </td>
                <td className="py-4 px-6 text-sm text-gray-700">
                  {getDeviceModel(order.device_id)}
                </td>
                <td className="py-4 px-6 text-sm">
                  {getStatusDropdown(order)}
                </td>
                <td className="py-4 px-6 text-sm text-gray-900 font-semibold text-right">
                  {formatPrice(order.price)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Card layout for mobile screens */}
      <div className="md:hidden space-y-4">
        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-white rounded-lg shadow-md p-5 border border-gray-200"
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-bold text-gray-900 text-lg">
                  {getClientName(order.client_id)}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {getDeviceModel(order.device_id)}
                </p>
              </div>
              <div>
                {getStatusDropdown(order)}
              </div>
            </div>
            <div className="pt-3 border-t border-gray-100">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Preço</span>
                <span className="text-lg font-bold text-gray-900">
                  {formatPrice(order.price)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServiceOrderList;
