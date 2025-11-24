import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom'
import ServiceOrderList from './components/ServiceOrderList'
import CreateOrderModal from './components/CreateOrderModal'
import Inventory from './pages/Inventory'
import POS from './pages/POS'
import SalesHistory from './pages/SalesHistory'
import Settings from './pages/Settings'
import ManualInvoice from './pages/ManualInvoice';
import { Financial } from './pages/Financial';
import { mockServiceOrders, mockClients, mockDevices } from './data/mockData'
import type { ServiceOrder, Client, Device, ServiceOrderStatus, Sale } from './types'
import './App.css'
import { FilePlus, DollarSign } from 'lucide-react';

const STORAGE_KEY = 'erp-service-orders';
const SALES_STORAGE_KEY = 'erp-sales-history';

function ServiceOrdersPage({
  serviceOrders,
  clients,
  devices,
  isModalOpen,
  setIsModalOpen,
  handleCreateOrder,
  handleStatusChange
}: {
  serviceOrders: ServiceOrder[];
  clients: Client[];
  devices: Device[];
  isModalOpen: boolean;
  setIsModalOpen: (value: boolean) => void;
  handleCreateOrder: (data: { clientName: string; deviceModel: string; description: string }) => void;
  handleStatusChange: (id: string, newStatus: ServiceOrderStatus) => void;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Button */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-gray-800">Ordens de Serviço</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all font-semibold shadow-md hover:shadow-lg"
          >
            + Nova Ordem de Serviço
          </button>
        </div>
      </div>

      {/* Service Order List */}
      <ServiceOrderList
        orders={serviceOrders}
        clients={clients}
        devices={devices}
        onStatusChange={handleStatusChange}
      />

      {/* Create Order Modal */}
      <CreateOrderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateOrder}
      />
    </div>
  );
}

function Navigation() {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-white shadow-md border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex space-x-8">
          <Link
            to="/"
            className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${isActive('/')
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-blue-600 hover:border-blue-300'
              }`}
          >
            Ordens de Serviço
          </Link>
          <Link
            to="/inventory"
            className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${isActive('/inventory')
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-blue-600 hover:border-blue-300'
              }`}
          >
            Estoque
          </Link>
          <Link
            to="/pos"
            className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${isActive('/pos')
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-blue-600 hover:border-blue-300'
              }`}
          >
            PDV
          </Link>
          <Link
            to="/sales"
            className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${isActive('/sales')
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-blue-600 hover:border-blue-300'
              }`}
          >
            Vendas Realizadas
          </Link>
          <Link
            to="/financial"
            className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${isActive('/financial')
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-blue-600 hover:border-blue-300'
              }`}
          >
            <DollarSign size={16} className="mr-1" /> Financeiro
          </Link>
          <Link
            to="/manual-invoice"
            className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${isActive('/manual-invoice')
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-blue-600 hover:border-blue-300'
              }`}
          >
            <FilePlus size={16} className="mr-1" /> Nota Avulsa
          </Link>
          <Link
            to="/settings"
            className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${isActive('/settings')
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-blue-600 hover:border-blue-300'
              }`}
          >
            ⚙️ Configurações
          </Link>
        </div>
      </div>
    </nav>
  );
}

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [serviceOrders, setServiceOrders] = useState<ServiceOrder[]>([]);
  const [clients, setClients] = useState<Client[]>(mockClients);
  const [devices, setDevices] = useState<Device[]>(mockDevices);
  const [salesHistory, setSalesHistory] = useState<Sale[]>([]);

  // Load data from localStorage on mount
  useEffect(() => {
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (storedData) {
      try {
        const parsed = JSON.parse(storedData);
        setServiceOrders(parsed);
      } catch (error) {
        console.error('Error parsing stored data:', error);
        setServiceOrders(mockServiceOrders);
      }
    } else {
      // If no data in localStorage, use mock data
      setServiceOrders(mockServiceOrders);
    }
  }, []);

  // Save to localStorage whenever serviceOrders changes
  useEffect(() => {
    if (serviceOrders.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(serviceOrders));
    }
  }, [serviceOrders]);

  // Load sales history from localStorage on mount
  useEffect(() => {
    const storedSales = localStorage.getItem(SALES_STORAGE_KEY);
    if (storedSales) {
      try {
        const parsed = JSON.parse(storedSales);
        setSalesHistory(parsed);
      } catch (error) {
        console.error('Error parsing sales data:', error);
      }
    }
  }, []);

  // Save to localStorage whenever salesHistory changes
  useEffect(() => {
    if (salesHistory.length > 0) {
      localStorage.setItem(SALES_STORAGE_KEY, JSON.stringify(salesHistory));
    }
  }, [salesHistory]);

  const handleCreateOrder = (data: { clientName: string; deviceModel: string; description: string }) => {
    // Generate IDs for client and device
    const clientId = `cli-${Date.now()}`;
    const deviceId = `dev-${Date.now()}`;

    // Create new client
    const newClient: Client = {
      id: clientId,
      name: data.clientName,
      phone: '', // Can be added later
      cpf: '', // Can be added later
    };

    // Create new device
    const newDevice: Device = {
      id: deviceId,
      brand: '', // Extract from model if needed
      model: data.deviceModel,
      imei: '', // Can be added later
      condition_notes: data.description,
    };

    // Create new service order
    const newOrder: ServiceOrder = {
      id: `so-${Date.now()}`,
      client_id: clientId,
      device_id: deviceId,
      status: 'pending',
      price: 0,
      description: data.description,
      created_at: new Date().toISOString(),
    };

    // Update state
    setClients(prev => [...prev, newClient]);
    setDevices(prev => [...prev, newDevice]);
    setServiceOrders(prev => [...prev, newOrder]);

    // Close modal
    setIsModalOpen(false);
  };

  const handleStatusChange = (id: string, newStatus: ServiceOrderStatus) => {
    setServiceOrders(prev =>
      prev.map(order =>
        order.id === id ? { ...order, status: newStatus } : order
      )
    );
  };

  const addSale = (sale: Sale) => {
    setSalesHistory(prev => [sale, ...prev]);
  };

  const updateSaleStatus = (saleId: string, fiscalStatus: 'Pendente' | 'Emitida') => {
    setSalesHistory(prev =>
      prev.map(sale =>
        sale.id === saleId ? { ...sale, fiscalStatus } : sale
      )
    );
  };

  return (
    <BrowserRouter>
      <Navigation />
      <Routes>
        <Route
          path="/"
          element={
            <ServiceOrdersPage
              serviceOrders={serviceOrders}
              clients={clients}
              devices={devices}
              isModalOpen={isModalOpen}
              setIsModalOpen={setIsModalOpen}
              handleCreateOrder={handleCreateOrder}
              handleStatusChange={handleStatusChange}
            />
          }
        />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/pos" element={<POS onSaleComplete={addSale} />} />
        <Route path="/sales" element={<SalesHistory sales={salesHistory} onUpdateStatus={updateSaleStatus} />} />
        <Route path="/financial" element={<Financial />} />
        <Route path="/manual-invoice" element={<ManualInvoice />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
