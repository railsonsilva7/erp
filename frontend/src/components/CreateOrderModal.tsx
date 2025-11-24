import { useState } from 'react';
import type { FormEvent } from 'react';

interface CreateOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { clientName: string; deviceModel: string; description: string }) => void;
}

const CreateOrderModal = ({ isOpen, onClose, onSubmit }: CreateOrderModalProps) => {
  const [clientName, setClientName] = useState('');
  const [deviceModel, setDeviceModel] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    // Validate inputs
    if (!clientName.trim() || !deviceModel.trim() || !description.trim()) {
      alert('Por favor, preencha todos os campos');
      return;
    }

    // Submit data
    onSubmit({
      clientName: clientName.trim(),
      deviceModel: deviceModel.trim(),
      description: description.trim(),
    });

    // Reset form
    setClientName('');
    setDeviceModel('');
    setDescription('');
  };

  const handleCancel = () => {
    setClientName('');
    setDeviceModel('');
    setDescription('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-lg">
          <h2 className="text-2xl font-bold">Nova Ordem de Serviço</h2>
          <p className="text-blue-100 text-sm mt-1">Preencha os dados abaixo</p>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Client Name */}
          <div>
            <label htmlFor="clientName" className="block text-sm font-semibold text-gray-700 mb-2">
              Nome do Cliente *
            </label>
            <input
              type="text"
              id="clientName"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Ex: João Silva"
              required
            />
          </div>

          {/* Device Model */}
          <div>
            <label htmlFor="deviceModel" className="block text-sm font-semibold text-gray-700 mb-2">
              Modelo do Aparelho *
            </label>
            <input
              type="text"
              id="deviceModel"
              value={deviceModel}
              onChange={(e) => setDeviceModel(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Ex: Samsung Galaxy S21"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
              Defeito Relatado *
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
              placeholder="Descreva o problema do aparelho..."
              required
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all font-medium shadow-md"
            >
              Criar Ordem
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateOrderModal;
