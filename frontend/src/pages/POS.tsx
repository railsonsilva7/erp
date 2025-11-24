import { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { CashRegisterState, Sale, SaleItem, Product } from '../types';

interface POSProps {
  onSaleComplete: (sale: Sale) => void;
}

interface POSCartItem extends Product {
  quantityInCart: number;
}

const POS = ({ onSaleComplete }: POSProps) => {
  const [cashRegister, setCashRegister] = useState<CashRegisterState>({
    isOpen: false,
    balance: 0,
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<POSCartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await api.getProducts();
      setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
      alert('Erro ao carregar produtos. Verifique a conexão com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  // Filter products based on search
  const filteredProducts = products.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Add product to cart
  const addToCart = (productId: number) => {
    if (!cashRegister.isOpen) {
      alert('O caixa está fechado! Abra o caixa para realizar vendas.');
      return;
    }

    const product = products.find(p => p.id === productId);
    if (!product) return;

    if (product.quantity <= 0) {
      alert('Produto sem estoque!');
      return;
    }

    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
      if (existingItem.quantityInCart >= product.quantity) {
        alert('Quantidade máxima em estoque atingida!');
        return;
      }
      setCart(cart.map(item =>
        item.id === productId
          ? { ...item, quantityInCart: item.quantityInCart + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantityInCart: 1 }]);
    }
  };

  // Remove item from cart
  const removeFromCart = (productId: number) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  // Update quantity in cart
  const updateQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity === 0) {
      removeFromCart(productId);
      return;
    }

    const product = products.find(p => p.id === productId);
    if (!product) return;

    if (newQuantity > product.quantity) {
      alert(`Quantidade indisponível! Estoque atual: ${product.quantity}`);
      return;
    }

    setCart(cart.map(item =>
      item.id === productId
        ? { ...item, quantityInCart: newQuantity }
        : item
    ));
  };

  // Calculate total
  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantityInCart), 0);
  };

  // Complete sale
  const completeSale = async () => {
    if (!cashRegister.isOpen) {
      alert('O caixa está fechado!');
      return;
    }

    if (cart.length === 0) {
      alert('Carrinho vazio! Adicione produtos para finalizar a venda.');
      return;
    }

    try {
      // Process sale in backend (deduct stock)
      const saleItemsPayload = cart.map(item => ({
        product_id: item.id,
        quantity: item.quantityInCart
      }));

      await api.processSale(saleItemsPayload);

      const total = calculateTotal();

      // Create sale record for history (frontend only for now)
      const saleItems: SaleItem[] = cart.map(item => ({
        id: String(item.id),
        name: item.name,
        quantity: item.quantityInCart,
        unitPrice: item.price,
        subtotal: item.price * item.quantityInCart,
      }));

      const sale: Sale = {
        id: `sale-${Date.now()}`,
        date: new Date().toISOString(),
        items: saleItems,
        total: total,
        fiscalStatus: 'Pendente',
      };

      // Save sale to history
      onSaleComplete(sale);

      setCashRegister({
        ...cashRegister,
        balance: cashRegister.balance + total,
      });
      setCart([]);
      alert(`Venda Realizada! Total: ${formatPrice(total)}`);

      // Refresh products to update stock display
      loadProducts();

    } catch (error: any) {
      console.error('Error processing sale:', error);
      alert(`Erro ao finalizar venda: ${error.message}`);
    }
  };

  // Open/Close cash register
  const toggleCashRegister = () => {
    if (cashRegister.isOpen) {
      // Closing
      const confirmation = confirm(`Fechar caixa com saldo de ${formatPrice(cashRegister.balance)}?`);
      if (confirmation) {
        setCashRegister({ isOpen: false, balance: 0 });
        setCart([]);
      }
    } else {
      // Opening
      setCashRegister({ isOpen: true, balance: 0 });
    }
  };

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">PDV - Ponto de Venda</h1>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Products (2/3) */}
          <div className="lg:col-span-2 space-y-4">
            {/* Search Bar */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <input
                type="text"
                placeholder="Buscar produtos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Products Grid */}
            {loading ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Carregando produtos...</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {filteredProducts.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => addToCart(product.id)}
                    disabled={!cashRegister.isOpen || product.quantity === 0}
                    className={`bg-white rounded-lg shadow-md p-4 text-left transition-all ${cashRegister.isOpen && product.quantity > 0
                      ? 'hover:shadow-lg hover:scale-105 cursor-pointer'
                      : 'opacity-50 cursor-not-allowed bg-gray-100'
                      }`}
                  >
                    <h3 className="font-bold text-gray-900 text-sm mb-2 line-clamp-2">
                      {product.name}
                    </h3>
                    <p className="text-lg font-bold text-blue-600">
                      {formatPrice(product.price)}
                    </p>
                    <p className={`text-xs mt-1 font-medium ${product.quantity === 0 ? 'text-red-500' : 'text-gray-500'}`}>
                      {product.quantity === 0 ? 'Esgotado' : `Estoque: ${product.quantity}`}
                    </p>
                  </button>
                ))}
              </div>
            )}

            {!loading && filteredProducts.length === 0 && (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <p className="text-gray-500">Nenhum produto encontrado</p>
              </div>
            )}
          </div>

          {/* Right Column - Cash Register & Cart (1/3) */}
          <div className="space-y-4">
            {/* Cash Register Status */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <h2 className="text-lg font-bold text-gray-800 mb-3">Status do Caixa</h2>

              <div className="mb-4">
                <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${cashRegister.isOpen
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
                  }`}>
                  {cashRegister.isOpen ? 'Aberto' : 'Fechado'}
                </div>
              </div>

              {cashRegister.isOpen && (
                <div className="mb-4">
                  <p className="text-sm text-gray-500">Saldo</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatPrice(cashRegister.balance)}
                  </p>
                </div>
              )}

              <button
                onClick={toggleCashRegister}
                className={`w-full px-4 py-2 rounded-lg font-semibold transition-all ${cashRegister.isOpen
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
              >
                {cashRegister.isOpen ? 'Fechar Caixa' : 'Abrir Caixa'}
              </button>
            </div>

            {/* Cart */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <h2 className="text-lg font-bold text-gray-800 mb-3">Carrinho</h2>

              {cart.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-4">
                  Carrinho vazio
                </p>
              ) : (
                <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
                  {cart.map((item) => (
                    <div key={item.id} className="flex justify-between items-center border-b pb-2">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{item.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantityInCart - 1)}
                            className="w-6 h-6 bg-gray-200 rounded text-gray-700 hover:bg-gray-300"
                          >
                            -
                          </button>
                          <span className="text-sm font-semibold">{item.quantityInCart}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantityInCart + 1)}
                            className="w-6 h-6 bg-gray-200 rounded text-gray-700 hover:bg-gray-300"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-900">
                          {formatPrice(item.price * item.quantityInCart)}
                        </p>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-xs text-red-600 hover:text-red-800"
                        >
                          Remover
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Total */}
              <div className="border-t pt-3 mb-4">
                <div className="flex justify-between items-center">
                  <p className="text-lg font-bold text-gray-800">Total</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatPrice(calculateTotal())}
                  </p>
                </div>
              </div>

              {/* Complete Sale Button */}
              <button
                onClick={completeSale}
                disabled={!cashRegister.isOpen || cart.length === 0}
                className={`w-full py-4 rounded-lg font-bold text-lg transition-all ${cashRegister.isOpen && cart.length > 0
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md hover:shadow-lg'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
              >
                Finalizar Venda
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default POS;
