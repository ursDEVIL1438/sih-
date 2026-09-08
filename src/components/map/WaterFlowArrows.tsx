import React from 'react';
import { Polyline, Popup } from 'react-leaflet';
import { waterFlowPaths } from '../../data/terrainGeoJSON';

export const WaterFlowArrows: React.FC = () => {
  return (
    <>
      {waterFlowPaths.map((path) => (
        <Polyline
          key={path.id}
          positions={path.waypoints}
          pathOptions={{
            color: '#00F0FF',
            weight: 3.5,
            dashArray: '6, 8',
            opacity: 0.9,
          }}
        >
          <Popup>
            <div className="p-1 font-mono text-xs">
              <div className="font-bold text-cyan-400">WATERSHED WATER-FLOW VECTOR</div>
              <div>Channel: <span className="text-white">{path.name}</span></div>
              <div className="text-slate-400 text-[10px]">Flow Direction: High Elevation Downhill Stream → Main Valley River</div>
            </div>
          </Popup>
        </Polyline>
      ))}
    </>
  );
};
