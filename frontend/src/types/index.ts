// Core Entities for CellPhoneRepairERP

export interface Client {
  id: string;
  name: string;
  phone: string;
  cpf: string;
}

export interface Device {
  id: string;
  brand: string;
  model: string;
  imei: string;
  condition_notes: string;
}

export type ServiceOrderStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

export interface ServiceOrder {
  id: string;
  client_id: string;
  device_id: string;
  status: ServiceOrderStatus;
  price: number;
  description: string;
  created_at: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  costPrice: number;
  sellPrice: number;
}

export interface CartItem extends InventoryItem {
  quantityInCart: number;
}

export interface CashRegisterState {
  isOpen: boolean;
  balance: number;
}

export type FiscalStatus = 'Pendente' | 'Emitida';

export interface SaleItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Sale {
  id: string;
  date: string;
  items: SaleItem[];
  total: number;
  fiscalStatus: FiscalStatus;
}

export interface Product {
  id: number;
  name: string;
  quantity: number;
  price: number;
  ncm: string;
  cfop: string;
  unit: string;
}

export interface CompanySettings {
  id?: number;
  cnpj: string;
  ie: string;
  razao_social: string;
  nome_fantasia: string;
  logradouro: string;
  numero: string;
  bairro: string;
  municipio: string;
  uf: string;
  cep: string;
  regime_tributario: number;
}
