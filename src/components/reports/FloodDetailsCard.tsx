import { useState } from 'react';
import { FloodReport } from '@/lib/supabase/client';

interface FloodDetailsCardProps {
  report: FloodReport;
  onVote: (reportId: string, voteType: 'up' | 'down') => Promise<void>;
  onMarkResolved: (reportId: string) => Promise<void>;
  onClose: () => void;
}

export default function FloodDetailsCard({ 
  report, 
  onVote, 
  onMarkResolved, 
  onClose 
}: FloodDetailsCardProps) {
  const [isVoting, setIsVoting] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  
  const handleVote = async (voteType: 'up' | 'down') => {
    if (!report.id || isVoting) return;
    
    setIsVoting(true);
    try {
      await onVote(report.id, voteType);
    } catch (error) {
      console.error('Erro ao votar:', error);
    } finally {
      setIsVoting(false);
    }
  };
  
  const handleMarkResolved = async () => {
    if (!report.id || isResolving) return;
    
    setIsResolving(true);
    try {
      await onMarkResolved(report.id);
    } catch (error) {
      console.error('Erro ao marcar como resolvido:', error);
    } finally {
      setIsResolving(false);
    }
  };
  
  // Formatar a data de reporte
  const formattedDate = new Date(report.reportedAt).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  // Determinar a classe de severidade
  const severityClass = 
    report.severity === 1 ? 'bg-yellow-100 text-yellow-800' :
    report.severity === 2 ? 'bg-orange-100 text-orange-800' :
    'bg-red-100 text-red-800';
  
  const severityText = 
    report.severity === 1 ? 'Leve' :
    report.severity === 2 ? 'Moderado' :
    'Grave';
  
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-bold">{report.address}</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <span className="sr-only">Fechar</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        
        <div className="mt-2">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${severityClass}`}>
            {severityText}
          </span>
          <p className="text-sm text-gray-500 mt-1">
            Reportado em {formattedDate}
          </p>
        </div>
        
        {report.comments && (
          <div className="mt-3">
            <p className="text-sm text-gray-700">{report.comments}</p>
          </div>
        )}
        
        {report.imageUrl && (
          <div className="mt-3">
            <img 
              src={report.imageUrl} 
              alt="Foto do alagamento" 
              className="w-full h-40 object-cover rounded"
            />
          </div>
        )}
        
        <div className="mt-4 flex items-center justify-between">
          <div className="flex space-x-2">
            <button
              onClick={() => handleVote('up')}
              disabled={isVoting}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
              </svg>
              Confirmar ({report.upvotes})
            </button>
            
            <button
              onClick={() => handleVote('down')}
              disabled={isVoting}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 013 0v6zM14 9.667v-5.43a2 2 0 00-1.105-1.79l-.05-.025A4 4 0 0011.055 2H5.64a2 2 0 00-1.962 1.608l-1.2 6A2 2 0 004.44 12H8v4a2 2 0 002 2 1 1 0 001-1v-.667a4 4 0 01.8-2.4l1.4-1.866a4 4 0 00.8-2.4z" />
              </svg>
              Negar ({report.downvotes})
            </button>
          </div>
          
          <button
            onClick={handleMarkResolved}
            disabled={isResolving}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Resolvido
          </button>
        </div>
      </div>
    </div>
  );
}
