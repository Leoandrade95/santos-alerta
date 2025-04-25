import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FloodReport } from '@/lib/supabase/client';
import MapComponent from '../map/MapComponent';

interface ReportFormProps {
  onSubmit: (data: Partial<FloodReport>) => Promise<void>;
  isSubmitting: boolean;
}

export default function ReportForm({ onSubmit, isSubmitting }: ReportFormProps) {
  const [selectedLocation, setSelectedLocation] = useState<{lat: number, lng: number} | null>(null);
  const [address, setAddress] = useState<string>('');
  const { register, handleSubmit, formState: { errors }, setValue } = useForm();
  
  const handleMapClick = async (lat: number, lng: number) => {
    setSelectedLocation({ lat, lng });
    
    // Tentar obter o endereço a partir das coordenadas (geocodificação reversa)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      const data = await response.json();
      
      if (data && data.display_name) {
        const addressText = data.display_name;
        setAddress(addressText);
        setValue('address', addressText);
      }
    } catch (error) {
      console.error('Erro ao obter endereço:', error);
    }
  };
  
  const processSubmit = (data: any) => {
    if (!selectedLocation) {
      alert('Por favor, selecione a localização do alagamento no mapa.');
      return;
    }
    
    const reportData: Partial<FloodReport> = {
      location: selectedLocation,
      address: data.address,
      severity: parseInt(data.severity),
      comments: data.comments,
      reportedAt: new Date().toISOString(),
      reportedBy: 'anonymous', // Em uma versão futura, poderia ser um ID de usuário
    };
    
    onSubmit(reportData);
  };
  
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Reportar Alagamento</h2>
      
      <div className="border rounded-lg overflow-hidden">
        <MapComponent 
          floodReports={[]} 
          onMapClick={handleMapClick}
          selectMode={true}
        />
      </div>
      
      {selectedLocation && (
        <div className="bg-blue-50 p-3 rounded-md">
          <p className="text-sm">
            <span className="font-semibold">Localização selecionada:</span> {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
          </p>
        </div>
      )}
      
      <form onSubmit={handleSubmit(processSubmit)} className="space-y-4">
        <div>
          <label htmlFor="address" className="block text-sm font-medium">
            Endereço
          </label>
          <input
            id="address"
            type="text"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
            placeholder="Rua, número, bairro"
            {...register('address', { required: true })}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
          {errors.address && (
            <p className="text-red-500 text-sm mt-1">Endereço é obrigatório</p>
          )}
        </div>
        
        <div>
          <label htmlFor="severity" className="block text-sm font-medium">
            Nível do Alagamento
          </label>
          <select
            id="severity"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
            {...register('severity', { required: true })}
            defaultValue=""
          >
            <option value="" disabled>Selecione o nível</option>
            <option value="1">Leve (água na calçada)</option>
            <option value="2">Moderado (água na rua)</option>
            <option value="3">Grave (água acima do joelho)</option>
          </select>
          {errors.severity && (
            <p className="text-red-500 text-sm mt-1">Nível é obrigatório</p>
          )}
        </div>
        
        <div>
          <label htmlFor="comments" className="block text-sm font-medium">
            Comentários (opcional)
          </label>
          <textarea
            id="comments"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
            rows={3}
            placeholder="Adicione informações úteis sobre o alagamento..."
            {...register('comments')}
          />
        </div>
        
        <button
          type="submit"
          className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
            isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
          }`}
          disabled={isSubmitting || !selectedLocation}
        >
          {isSubmitting ? 'Enviando...' : 'Reportar Alagamento'}
        </button>
      </form>
    </div>
  );
}
