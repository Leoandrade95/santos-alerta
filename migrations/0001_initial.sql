CREATE TABLE flood_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  location JSONB NOT NULL,
  address TEXT NOT NULL,
  severity SMALLINT NOT NULL,
  reported_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  reported_by TEXT NOT NULL,
  comments TEXT,
  image_url TEXT,
  upvotes INTEGER NOT NULL DEFAULT 1,
  downvotes INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Índices para melhorar a performance das consultas
CREATE INDEX idx_flood_reports_status ON flood_reports(status);
CREATE INDEX idx_flood_reports_reported_at ON flood_reports(reported_at);
CREATE INDEX idx_flood_reports_severity ON flood_reports(severity);

-- Função para atualizar o timestamp de updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar o timestamp de updated_at
CREATE TRIGGER update_flood_reports_updated_at
BEFORE UPDATE ON flood_reports
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Inserir alguns dados de exemplo para testes
INSERT INTO flood_reports (
  location, 
  address, 
  severity, 
  reported_by, 
  comments, 
  status
) VALUES 
(
  '{"lat": -23.9618, "lng": -46.3322}', 
  'Av. Ana Costa, 500, Gonzaga, Santos', 
  2, 
  'anonymous', 
  'Água na altura do meio-fio, difícil para pedestres passarem.', 
  'active'
),
(
  '{"lat": -23.9550, "lng": -46.3250}', 
  'Rua Carvalho de Mendonça, 200, Encruzilhada, Santos', 
  3, 
  'anonymous', 
  'Alagamento grave, água acima do joelho. Carros não conseguem passar.', 
  'active'
),
(
  '{"lat": -23.9700, "lng": -46.3400}', 
  'Av. Conselheiro Nébias, 800, Boqueirão, Santos', 
  1, 
  'anonymous', 
  'Alagamento leve, apenas nas calçadas.', 
  'active'
);
