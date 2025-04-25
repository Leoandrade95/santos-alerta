import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Icon, LatLngExpression } from 'leaflet';
import { FloodReport } from '@/lib/supabase/client';

// Coordenadas do centro de Santos
const SANTOS_CENTER: LatLngExpression = [-23.9618, -46.3322];
const DEFAULT_ZOOM = 13;

// Corrigir o problema dos ícones do Leaflet no Next.js
// Isso é necessário porque o Leaflet espera que os assets estejam disponíveis no caminho relativo
const createLeafletIcon = (severity: number) => {
  // Em produção, usaríamos ícones personalizados para cada nível de severidade
  // Por enquanto, usamos o ícone padrão
  return new Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
};

// Componente para centralizar o mapa na localização do usuário
function LocateUser() {
  const map = useMap();
  
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          map.setView([latitude, longitude], 15);
        },
        (error) => {
          console.error('Erro ao obter localização:', error);
        }
      );
    }
  }, [map]);
  
  return null;
}

interface MapComponentProps {
  floodReports: FloodReport[];
  onMarkerClick?: (report: FloodReport) => void;
  onMapClick?: (lat: number, lng: number) => void;
  selectMode?: boolean;
}

export default function MapComponent({ 
  floodReports = [], 
  onMarkerClick,
  onMapClick,
  selectMode = false
}: MapComponentProps) {
  const [mounted, setMounted] = useState(false);
  
  // Evitar problemas de renderização no servidor com o Leaflet
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) {
    return <div className="h-[50vh] w-full bg-gray-200 animate-pulse flex items-center justify-center">
      <p>Carregando mapa...</p>
    </div>;
  }
  
  const handleMapClick = (e: any) => {
    if (selectMode && onMapClick) {
      const { lat, lng } = e.latlng;
      onMapClick(lat, lng);
    }
  };
  
  return (
    <div className="h-[50vh] w-full relative">
      <MapContainer 
        center={SANTOS_CENTER} 
        zoom={DEFAULT_ZOOM} 
        style={{ height: '100%', width: '100%' }}
        onClick={handleMapClick}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <LocateUser />
        
        {floodReports.map((report) => (
          <Marker 
            key={report.id} 
            position={[report.location.lat, report.location.lng]}
            icon={createLeafletIcon(report.severity)}
            eventHandlers={{
              click: () => onMarkerClick && onMarkerClick(report)
            }}
          >
            <Popup>
              <div>
                <h3 className="font-bold">{report.address}</h3>
                <p>Nível: {
                  report.severity === 1 ? 'Leve' : 
                  report.severity === 2 ? 'Moderado' : 'Grave'
                }</p>
                <p>Reportado: {new Date(report.reportedAt).toLocaleString('pt-BR')}</p>
                {report.comments && <p>Comentário: {report.comments}</p>}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      {selectMode && (
        <div className="absolute bottom-4 left-0 right-0 text-center bg-white bg-opacity-80 p-2 rounded-md mx-4">
          Clique no mapa para selecionar a localização do alagamento
        </div>
      )}
    </div>
  );
}
