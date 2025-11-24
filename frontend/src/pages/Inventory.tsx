import { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { Product } from '../types';
import CreateProductModal from '../components/CreateProductModal';

const Inventory = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await api.getProducts();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
      alert('Erro ao carregar produtos. Verifique se o backend está rodando.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Helper function to format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  // Helper function to check if stock is low
  const isLowStock = (quantity: number) => {
    return quantity < 3;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Estoque</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all font-semibold shadow-md hover:shadow-lg"
          >
            + Nova Peça
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-xl text-gray-500">Carregando...</div>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-500">Nenhum produto encontrado. Cadastre o primeiro!</p>
          </div>
        ) : (
          <>
            {/* Table for larger screens */}
            <div className="hidden md:block overflow-x-auto shadow-md rounded-lg">
              <table className="min-w-full bg-white">
                <thead className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                  <tr>
                    <th className="py-3 px-6 text-left text-sm font-semibold">Nome</th>
                    <th className="py-3 px-6 text-center text-sm font-semibold">Quantidade</th>
                    <th className="py-3 px-6 text-right text-sm font-semibold">Preço</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {products.map((item) => {
                    const lowStock = isLowStock(item.quantity);

                    return (
                      <tr
                        key={item.id}
                        className="hover:bg-gray-50 transition-colors duration-150"
                      >
                        <td className="py-4 px-6 text-sm text-gray-900 font-medium">
                          {item.name}
                        </td>
                        <td className="py-4 px-6 text-sm text-center">
                          <span
                            className={`font-bold ${lowStock ? 'text-red-600' : 'text-gray-900'
                              }`}
                          >
                            {item.quantity}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-900 font-semibold text-right">
                          {formatPrice(item.price)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Card layout for mobile screens */}
            <div className="md:hidden space-y-4">
              {products.map((item) => {
                const lowStock = isLowStock(item.quantity);

                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-lg shadow-md p-5 border border-gray-200"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg">{item.name}</h3>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500 mb-1">Quantidade</div>
                        <div
                          className={`text-xl font-bold ${lowStock ? 'text-red-600' : 'text-gray-900'
                            }`}
                        >
                          {item.quantity}
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-gray-100">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Preço</span>
                        <span className="text-lg font-bold text-blue-600">
                          {formatPrice(item.price)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      <CreateProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchProducts}
      />
    </div>
  );
};




export default Inventory;
