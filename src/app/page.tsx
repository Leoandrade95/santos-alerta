"use client";

import { useState, useEffect } from 'react';
import { 
  getActiveFloodReports, 
  createFloodReport, 
  voteOnFloodReport, 
  markFloodAsResolved,
  FloodReport 
} from '@/lib/supabase/client';
import MapComponent from '@/components/map/MapComponent';
import ReportForm from '@/components/reports/ReportForm';
import FloodDetailsCard from '@/components/reports/FloodDetailsCard';
import FilterBar, { FilterOptions } from '@/components/reports/FilterBar';

export default function HomePage() {
  const [floodReports, setFloodReports] = useState<FloodReport[]>([]);
  const [filteredReports, setFilteredReports] = useState<FloodReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<FloodReport | null>(null);
  const [showReportForm, setShowReportForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [neighborhoods, setNeighborhoods] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Carregar alagamentos ativos ao iniciar
  useEffect(() => {
    async function loadFloodReports() {
      setIsLoading(true);
      try {
        const reports = await getActiveFloodReports();
        setFloodReports(reports);
        setFilteredReports(reports);
        
        // Extrair bairros únicos dos reportes
        const uniqueNeighborhoods = Array.from(
          new Set(
            reports
              .map(report => {
                // Tentar extrair o bairro do endereço (simplificado)
                const parts = report.address.split(',');
                return parts.length > 1 ? parts[1].trim() : null;
              })
              .filter(Boolean)
          )
        );
        setNeighborhoods(uniqueNeighborhoods as string[]);
      } catch (error) {
        console.error('Erro ao carregar alagamentos:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadFloodReports();
  }, []);
  
  // Função para aplicar filtros
  const handleFilterChange = (filters: FilterOptions) => {
    const now = new Date();
    const filtered = floodReports.filter(report => {
      // Filtro de tempo
      const reportDate = new Date(report.reportedAt);
      const hoursDiff = (now.getTime() - reportDate.getTime()) / (1000 * 60 * 60);
      if (hoursDiff > filters.timeRange) return false;
      
      // Filtro de severidade
      if (!filters.severity.includes(report.severity)) return false;
      
      // Filtro de bairro
      if (filters.neighborhood) {
        const parts = report.address.split(',');
        const reportNeighborhood = parts.length > 1 ? parts[1].trim() : '';
        if (reportNeighborhood !== filters.neighborhood) return false;
      }
      
      return true;
    });
    
    setFilteredReports(filtered);
  };
  
  // Função para lidar com clique em marcador
  const handleMarkerClick = (report: FloodReport) => {
    setSelectedReport(report);
    setShowReportForm(false);
  };
  
  // Função para enviar novo reporte
  const handleSubmitReport = async (reportData: Partial<FloodReport>) => {
    setIsSubmitting(true);
    try {
      const newReport = await createFloodReport(reportData as Omit<FloodReport, 'id' | 'upvotes' | 'downvotes' | 'status'>);
      if (newReport) {
        setFloodReports(prev => [newReport, ...prev]);
        setFilteredReports(prev => [newReport, ...prev]);
        setShowReportForm(false);
        alert('Alagamento reportado com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao enviar reporte:', error);
      alert('Erro ao enviar reporte. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Função para votar em um reporte
  const handleVote = async (reportId: string, voteType: 'up' | 'down') => {
    try {
      const updatedReport = await voteOnFloodReport(reportId, voteType);
      if (updatedReport) {
        // Atualizar o reporte na lista
        const updatedReports = floodReports.map(report => 
          report.id === reportId ? updatedReport : report
        );
        setFloodReports(updatedReports);
        setFilteredReports(prev => 
          prev.map(report => report.id === reportId ? updatedReport : report)
        );
        
        // Atualizar o reporte selecionado, se for o mesmo
        if (selectedReport?.id === reportId) {
          setSelectedReport(updatedReport);
        }
      }
    } catch (error) {
      console.error('Erro ao votar:', error);
    }
  };
  
  // Função para marcar alagamento como resolvido
  const handleMarkResolved = async (reportId: string) => {
    try {
      const updatedReport = await markFloodAsResolved(reportId);
      if (updatedReport) {
        // Remover o reporte resolvido das listas
        setFloodReports(prev => prev.filter(report => report.id !== reportId));
        setFilteredReports(prev => prev.filter(report => report.id !== reportId));
        setSelectedReport(null);
      }
    } catch (error) {
      console.error('Erro ao marcar como resolvido:', error);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Cabeçalho */}
      <header className="bg-blue-600 text-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Santos Alerta</h1>
            <button
              onClick={() => {
                setShowReportForm(true);
                setSelectedReport(null);
              }}
              className="bg-white text-blue-600 px-4 py-2 rounded-md font-medium hover:bg-blue-50 transition-colors"
            >
              Reportar Alagamento
            </button>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-6">
        {/* Barra de filtros */}
        <FilterBar 
          onFilterChange={handleFilterChange}
          availableNeighborhoods={neighborhoods}
        />
        
        {/* Contagem de alagamentos */}
        <div className="mb-4">
          <p className="text-gray-700">
            {filteredReports.length} {filteredReports.length === 1 ? 'alagamento ativo' : 'alagamentos ativos'}
          </p>
        </div>
        
        {/* Mapa principal */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          {isLoading ? (
            <div className="h-[50vh] w-full bg-gray-200 animate-pulse flex items-center justify-center">
              <p>Carregando mapa...</p>
            </div>
          ) : (
            <MapComponent 
              floodReports={filteredReports}
              onMarkerClick={handleMarkerClick}
            />
          )}
        </div>
        
        {/* Formulário de reporte ou detalhes do alagamento */}
        <div className="bg-white rounded-lg shadow-md p-4">
          {showReportForm ? (
            <ReportForm 
              onSubmit={handleSubmitReport}
              isSubmitting={isSubmitting}
            />
          ) : selectedReport ? (
            <FloodDetailsCard 
              report={selectedReport}
              onVote={handleVote}
              onMarkResolved={handleMarkResolved}
              onClose={() => setSelectedReport(null)}
            />
          ) : (
            <div className="text-center py-8">
              <h2 className="text-xl font-medium text-gray-700">Bem-vindo ao Santos Alerta</h2>
              <p className="mt-2 text-gray-500">
                Clique em um marcador no mapa para ver detalhes do alagamento ou use o botão "Reportar Alagamento" para informar um novo ponto de alagamento.
              </p>
            </div>
          )}
        </div>
      </main>
      
      {/* Rodapé */}
      <footer className="bg-gray-800 text-white py-6">
        <div className="container mx-auto px-4">
          <p className="text-center text-sm">
            Santos Alerta &copy; {new Date().getFullYear()} - Aplicativo para alerta de alagamentos em Santos
          </p>
        </div>
      </footer>
    </div>
  );
}
