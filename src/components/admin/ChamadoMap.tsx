import { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { StatusBadge } from './StatusBadge';
import type { Chamado } from '@/types';

import iconUrl       from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl     from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({ iconUrl, iconRetinaUrl, shadowUrl });

const CAT_EMOJI: Record<string, string> = {
  Buraco: '🕳️', Iluminação: '💡', Vazamento: '💧',
  Lixo: '🗑️', Árvore: '🌳', Outro: '⚠️',
};

function colorIcon(status: string) {
  const color = status === 'Resolvido' ? '#10b981'
              : status === 'Em andamento' ? '#f59e0b'
              : '#3b82f6';

  return L.divIcon({
    html: `<div style="
      width:24px;height:24px;border-radius:50%;
      background:${color};border:3px solid white;
      box-shadow:0 2px 6px rgba(0,0,0,.3)
    "></div>`,
    className: '',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
}

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR');
}

interface Props { chamados: Chamado[] }

export function ChamadoMap({ chamados }: Props) {
  const withGeo = chamados.filter(c => c.latitude != null && c.longitude != null);

  if (withGeo.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 flex flex-col items-center justify-center py-20 text-slate-400">
        <span className="text-4xl mb-3">🗺️</span>
        <p className="text-sm">Nenhum chamado com localização cadastrada.</p>
        <p className="text-xs mt-1">A localização é capturada automaticamente pelo chatbot.</p>
      </div>
    );
  }

  const center: [number, number] = [
    withGeo.reduce((s, c) => s + c.latitude!, 0) / withGeo.length,
    withGeo.reduce((s, c) => s + c.longitude!, 0) / withGeo.length,
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700">
          Mapa de Ocorrências
        </h3>
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" /> Aberto</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-yellow-500 inline-block" /> Em andamento</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Resolvido</span>
        </div>
      </div>

      <MapContainer
        center={center}
        zoom={13}
        style={{ height: '520px', width: '100%' }}
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {withGeo.map(c => (
          <Marker
            key={c.id}
            position={[c.latitude!, c.longitude!]}
            icon={colorIcon(c.status)}
          >
            <Popup minWidth={220}>
              <div className="text-sm space-y-1 py-1">
                <div className="font-bold text-slate-800">
                  {CAT_EMOJI[c.categoria]} {c.categoria}
                </div>
                <code className="text-xs text-slate-500">{c.protocolo}</code>
                <div className="mt-1">
                  <StatusBadge status={c.status} size="sm" />
                </div>
                <p className="text-slate-600 text-xs mt-1 leading-relaxed">
                  {c.descricao.slice(0, 100)}{c.descricao.length > 100 ? '...' : ''}
                </p>
                <p className="text-xs text-slate-400">{fmt(c.created_at)}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
