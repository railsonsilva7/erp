import type { Client, Device, ServiceOrder, InventoryItem } from '../types';

// Mock Clients
export const mockClients: Client[] = [
  {
    id: 'cli-001',
    name: 'João Silva',
    phone: '(11) 98765-4321',
    cpf: '123.456.789-00',
  },
  {
    id: 'cli-002',
    name: 'Maria Oliveira',
    phone: '(21) 99876-5432',
    cpf: '987.654.321-00',
  },
  {
    id: 'cli-003',
    name: 'Carlos Santos',
    phone: '(31) 91234-5678',
    cpf: '456.789.123-00',
  },
];

// Mock Devices
export const mockDevices: Device[] = [
  {
    id: 'dev-001',
    brand: 'Samsung',
    model: 'Galaxy S21',
    imei: '123456789012345',
    condition_notes: 'Tela trincada no canto superior direito',
  },
  {
    id: 'dev-002',
    brand: 'Apple',
    model: 'iPhone 13',
    imei: '987654321098765',
    condition_notes: 'Bateria inchada, necessita troca urgente',
  },
  {
    id: 'dev-003',
    brand: 'Xiaomi',
    model: 'Redmi Note 10',
    imei: '456789123456789',
    condition_notes: 'Conector de carga não funciona',
  },
];

// Mock Service Orders
export const mockServiceOrders: ServiceOrder[] = [
  {
    id: 'so-001',
    client_id: 'cli-001',
    device_id: 'dev-001',
    status: 'in_progress',
    price: 350.00,
    description: 'Troca de tela LCD + proteção',
    created_at: '2025-11-18T10:30:00-03:00',
  },
  {
    id: 'so-002',
    client_id: 'cli-002',
    device_id: 'dev-002',
    status: 'pending',
    price: 450.00,
    description: 'Substituição de bateria original',
    created_at: '2025-11-19T14:15:00-03:00',
  },
  {
    id: 'so-003',
    client_id: 'cli-003',
    device_id: 'dev-003',
    status: 'completed',
    price: 120.00,
    description: 'Reparo do conector USB-C',
    created_at: '2025-11-15T09:00:00-03:00',
  },
];

// Mock Inventory Items
export const mockInventoryItems: InventoryItem[] = [
  {
    id: 'inv-001',
    name: 'Tela iPhone 11',
    category: 'Tela',
    quantity: 15,
    costPrice: 250.00,
    sellPrice: 450.00,
  },
  {
    id: 'inv-002',
    name: 'Bateria Samsung Galaxy S21',
    category: 'Bateria',
    quantity: 2, // Low stock alert
    costPrice: 80.00,
    sellPrice: 150.00,
  },
  {
    id: 'inv-003',
    name: 'Película de Vidro Universal',
    category: 'Película',
    quantity: 50,
    costPrice: 5.00,
    sellPrice: 25.00,
  },
  {
    id: 'inv-004',
    name: 'Conector USB-C Xiaomi',
    category: 'Conector',
    quantity: 8,
    costPrice: 15.00,
    sellPrice: 40.00,
  },
  {
    id: 'inv-005',
    name: 'Tela iPhone 13 Pro',
    category: 'Tela',
    quantity: 5,
    costPrice: 450.00,
    sellPrice: 800.00,
  },
];
