import type { Product, CompanySettings } from '../types';

const BASE_URL = 'http://localhost:8000';

export const api = {
  getProducts: async (): Promise<Product[]> => {
    const response = await fetch(`${BASE_URL}/products/`);
    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }
    return response.json();
  },

  createProduct: async (data: { name: string; quantity: number; price: number; ncm: string }): Promise<Product> => {
    const response = await fetch(`${BASE_URL}/products/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to create product');
    }
    return response.json();
  },

  getCompanySettings: async (): Promise<CompanySettings> => {
    const response = await fetch(`${BASE_URL}/settings/company`);
    if (response.status === 404) {
      // Return empty default if not found
      return {
        cnpj: '', ie: '', razao_social: '', nome_fantasia: '',
        logradouro: '', numero: '', bairro: '', municipio: '', uf: '', cep: '',
        regime_tributario: 1
      };
    }
    if (!response.ok) throw new Error('Failed to fetch settings');
    return response.json();
  },

  saveCompanySettings: async (data: CompanySettings): Promise<CompanySettings> => {
    const response = await fetch(`${BASE_URL}/settings/company`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to save settings');
    return response.json();
  },

  processSale: async (items: { product_id: number; quantity: number }[]): Promise<void> => {
    const response = await fetch(`${BASE_URL}/sales`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to process sale');
    }
  },

  emitFiscalDocument: async (sale: any): Promise<any> => {
    const response = await fetch(`${BASE_URL}/fiscal/emit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sale),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Failed to emit fiscal document');
    }
    return response.json();
  },

  issueManualInvoice: async (data: any): Promise<any> => {
    const response = await fetch(`${BASE_URL}/fiscal/issue-manual`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to issue manual invoice');
    }
    return response.json();
  },
};
