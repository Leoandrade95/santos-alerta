import { createClient } from '@supabase/supabase-js';

// Estas são chaves públicas temporárias para desenvolvimento
// Em produção, estas seriam armazenadas em variáveis de ambiente
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://supabase.santos-alerta.example';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNhbnRvcy1hbGVydGEiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY4MjQzMjE1OSwiZXhwIjoxOTk4MDA4MTU5fQ.exemplo';

// Cria um cliente Supabase para ser usado em toda a aplicação
export const supabase = createClient(supabaseUrl, supabaseKey);

// Tipos para os dados de alagamentos
export type FloodReport = {
  id?: string;
  location: {
    lat: number;
    lng: number;
  };
  address: string;
  severity: 1 | 2 | 3; // 1: leve, 2: moderado, 3: grave
  reportedAt: string;
  reportedBy: string;
  comments?: string;
  imageUrl?: string;
  upvotes: number;
  downvotes: number;
  status: 'active' | 'resolved' | 'rejected';
};

// Funções para interagir com o banco de dados

// Obter todos os alagamentos ativos
export async function getActiveFloodReports() {
  const { data, error } = await supabase
    .from('flood_reports')
    .select('*')
    .eq('status', 'active')
    .order('reportedAt', { ascending: false });
  
  if (error) {
    console.error('Erro ao buscar alagamentos:', error);
    return [];
  }
  
  return data as FloodReport[];
}

// Criar um novo reporte de alagamento
export async function createFloodReport(report: Omit<FloodReport, 'id' | 'upvotes' | 'downvotes' | 'status'>) {
  const newReport = {
    ...report,
    upvotes: 1, // O próprio usuário que reporta conta como um upvote
    downvotes: 0,
    status: 'active' as const
  };
  
  const { data, error } = await supabase
    .from('flood_reports')
    .insert([newReport])
    .select();
  
  if (error) {
    console.error('Erro ao criar reporte de alagamento:', error);
    return null;
  }
  
  return data?.[0] as FloodReport;
}

// Votar em um reporte (confirmar ou negar)
export async function voteOnFloodReport(reportId: string, voteType: 'up' | 'down') {
  const { data: report, error: fetchError } = await supabase
    .from('flood_reports')
    .select('*')
    .eq('id', reportId)
    .single();
  
  if (fetchError) {
    console.error('Erro ao buscar reporte para votação:', fetchError);
    return null;
  }
  
  const updates = {
    upvotes: voteType === 'up' ? report.upvotes + 1 : report.upvotes,
    downvotes: voteType === 'down' ? report.downvotes + 1 : report.downvotes,
    // Se muitos downvotes, marcar como rejeitado
    status: voteType === 'down' && report.downvotes + 1 > report.upvotes * 2 
      ? 'rejected' as const 
      : report.status
  };
  
  const { data, error } = await supabase
    .from('flood_reports')
    .update(updates)
    .eq('id', reportId)
    .select();
  
  if (error) {
    console.error('Erro ao votar em reporte:', error);
    return null;
  }
  
  return data?.[0] as FloodReport;
}

// Marcar um alagamento como resolvido
export async function markFloodAsResolved(reportId: string) {
  const { data, error } = await supabase
    .from('flood_reports')
    .update({ status: 'resolved' })
    .eq('id', reportId)
    .select();
  
  if (error) {
    console.error('Erro ao marcar alagamento como resolvido:', error);
    return null;
  }
  
  return data?.[0] as FloodReport;
}
