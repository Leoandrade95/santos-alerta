import { useState } from 'react';
import { FloodReport } from '@/lib/supabase/client';

interface FilterBarProps {
  onFilterChange: (filters: FilterOptions) => void;
  availableNeighborhoods: string[];
}

export interface FilterOptions {
  timeRange: number; // em horas
  severity: number[]; // array de níveis de severidade (1, 2, 3)
  neighborhood: string | null;
}

export default function FilterBar({ onFilterChange, availableNeighborhoods }: FilterBarProps) {
  const [filters, setFilters] = useState<FilterOptions>({
    timeRange: 24,
    severity: [1, 2, 3],
    neighborhood: null
  });
  
  const handleTimeRangeChange = (hours: number) => {
    const newFilters = { ...filters, timeRange: hours };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };
  
  const handleSeverityChange = (level: number) => {
    let newSeverity;
    if (filters.severity.includes(level)) {
      // Remove o nível se já estiver selecionado
      newSeverity = filters.severity.filter(s => s !== level);
      // Garantir que pelo menos um nível esteja selecionado
      if (newSeverity.length === 0) {
        newSeverity = [level];
        return;
      }
    } else {
      // Adiciona o nível se não estiver selecionado
      newSeverity = [...filters.severity, level];
    }
    
    const newFilters = { ...filters, severity: newSeverity };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };
  
  const handleNeighborhoodChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const neighborhood = event.target.value === '' ? null : event.target.value;
    const newFilters = { ...filters, neighborhood };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };
  
  const clearFilters = () => {
    const defaultFilters = {
      timeRange: 24,
      severity: [1, 2, 3],
      neighborhood: null
    };
    setFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };
  
  return (
    <div className="bg-white p-4 rounded-lg shadow mb-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
        <h3 className="text-lg font-medium">Filtros</h3>
        <button
          onClick={clearFilters}
          className="text-sm text-blue-600 hover:text-blue-800 mt-2 sm:mt-0"
        >
          Limpar filtros
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Filtro de tempo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Período
          </label>
          <div className="flex flex-wrap gap-2">
            {[3, 6, 12, 24, 48].map((hours) => (
              <button
                key={hours}
                onClick={() => handleTimeRangeChange(hours)}
                className={`px-3 py-1 text-xs rounded-full ${
                  filters.timeRange === hours
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {hours === 24 ? '1 dia' : hours === 48 ? '2 dias' : `${hours}h`}
              </button>
            ))}
          </div>
        </div>
        
        {/* Filtro de severidade */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nível
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleSeverityChange(1)}
              className={`px-3 py-1 text-xs rounded-full ${
                filters.severity.includes(1)
                  ? 'bg-yellow-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Leve
            </button>
            <button
              onClick={() => handleSeverityChange(2)}
              className={`px-3 py-1 text-xs rounded-full ${
                filters.severity.includes(2)
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Moderado
            </button>
            <button
              onClick={() => handleSeverityChange(3)}
              className={`px-3 py-1 text-xs rounded-full ${
                filters.severity.includes(3)
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Grave
            </button>
          </div>
        </div>
        
        {/* Filtro de bairro */}
        <div>
          <label htmlFor="neighborhood" className="block text-sm font-medium text-gray-700 mb-1">
            Bairro
          </label>
          <select
            id="neighborhood"
            value={filters.neighborhood || ''}
            onChange={handleNeighborhoodChange}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            <option value="">Todos os bairros</option>
            {availableNeighborhoods.map((neighborhood) => (
              <option key={neighborhood} value={neighborhood}>
                {neighborhood}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
