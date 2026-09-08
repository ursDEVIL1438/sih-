import React, { useEffect, useRef, useState, useMemo } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { computeFloodRisk } from '../../utils/floodModel';
import { terrainRiskZones, weatherLocationPoints, waterFlowPaths } from '../../data/terrainGeoJSON';
import { useSimulation } from '../../context/SimulationContext';

// Tirupati coords (lng, lat)
const TIRUPATI = [79.425, 13.645];
const MAPTILER_KEY = (import.meta as any).env?.VITE_MAPTILER_KEY || null;

export const ModernTerrainMap: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const { state, intel, activeTab, particleLimit, setParticleLimit, lifetimeScale, setLifetimeScale, force2D, setForce2D, savedPresets, saveDisplayPreset, deleteDisplayPreset, applyDisplayPreset } = useSimulation();
  const [selectedZone, setSelectedZone] = useState<any>(null);
  const [panelCollapsed, setPanelCollapsed] = useState<boolean>(false);
  const [baseMap, setBaseMap] = useState<'standard' | 'satellite'>('standard');
  const [layersVisible, setLayersVisible] = useState({ terrain: false, risk: true, rivers: true, shelters: true });
  const markersRef = useRef<any[]>([]);

  const webglSupported = useMemo(() => {
    try {
      const c = document.createElement('canvas');
      return !!(c.getContext('webgl2') || c.getContext('webgl'));
    } catch (e) { return false; }
  }, []);
  const webglStatus = webglSupported ? (force2D ? 'Forced 2D' : 'Active') : 'Unavailable';

  useEffect(() => {
    if (!containerRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: {
        version: 8,
        sources: {
          osm: {
              type: 'raster',
              tiles: [MAPTILER_KEY ? `https://api.maptiler.com/tiles/streets/{z}/{x}/{y}.png?key=${MAPTILER_KEY}` : 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
              tileSize: 256,
              attribution: MAPTILER_KEY ? '© OpenStreetMap contributors | © MapTiler' : '© OpenStreetMap contributors'
            },
          sat: {
            type: 'raster',
            tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
            tileSize: 256,
            attribution: '© Esri World Imagery'
          },
          dem: {
            type: 'raster-dem',
            tiles: ['https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png'],
            tileSize: 256,
            maxzoom: 14
          }
        },
        layers: [
          { id: 'osm', type: 'raster', source: 'osm', layout: { visibility: 'visible' } },
          { id: 'sat', type: 'raster', source: 'sat', layout: { visibility: 'none' } }
        ]
      },
      center: TIRUPATI as [number, number],
      zoom: 11.5,
      pitch: 35,
      bearing: -15,
      antialias: true
    });

    mapRef.current = map;

    map.on('load', () => {
      // By default: DO NOT enable terrain. Terrain is an optional overlay.
      // Add hillshade layer but keep it hidden until the user enables Terrain.
      if (map.getSource('dem')) {
        try {
          map.addLayer({
            id: 'hillshade',
            type: 'hillshade',
            source: 'dem',
            layout: { visibility: 'none' },
            paint: {
              'hillshade-shadow-color': 'rgba(0,0,0,0.18)',
              'hillshade-highlight-color': 'rgba(255,255,255,0.08)',
              'hillshade-accent-color': 'rgba(0,0,0,0.12)'
            }
          });
        } catch (err) {
          console.warn('Failed to add hillshade layer', err);
        }
      }

      // Add a subtle water layer from GeoJSON if present (we'll draw rivers later)

      // Add risk polygons source from existing project data
      try {
        const features = (terrainRiskZones || []).map((z: any) => {
          // convert coordinates from [lat,lng] to GeoJSON [lng,lat]
          const ring = (z.coordinates || []).map((pt: any) => [pt[1], pt[0]]);
          return {
            type: 'Feature',
            properties: { id: z.id, name: z.name, riskLevel: z.riskLevel, dangerScore: z.dangerScore, timeToImpactMinutes: z.expectedImpactMinutes },
            geometry: { type: 'Polygon', coordinates: [ring] }
          };
        });

        map.addSource('risk-zones', { type: 'geojson', data: { type: 'FeatureCollection', features } });

        map.addLayer({
          id: 'risk-fill',
          type: 'fill',
          source: 'risk-zones',
          paint: {
            // color mapping: LOW=green, MODERATE=yellow, HIGH=orange, VERY HIGH=red-orange, CRITICAL=dark red
            'fill-color': [
              'case',
              ['==', ['get', 'riskLevel'], 'CRITICAL'], '#b91c1c',
              ['==', ['get', 'riskLevel'], 'VERY HIGH'], '#ef6c00',
              ['==', ['get', 'riskLevel'], 'HIGH'], '#f97316',
              ['==', ['get', 'riskLevel'], 'MODERATE'], '#facc15',
              '#22c55e'
            ],
            'fill-opacity': 0.36,
            'fill-outline-color': 'rgba(0,0,0,0.06)'
          }
        });

        map.addLayer({
          id: 'risk-line',
          type: 'line',
          source: 'risk-zones',
          paint: { 'line-color': '#000000', 'line-opacity': 0.06, 'line-width': 1 }
        });

        map.on('click', 'risk-fill', (e) => {
          const features = map.queryRenderedFeatures(e.point, { layers: ['risk-fill'] });
          if (features && features.length) {
            const f = features[0];
            setSelectedZone(f.properties || f);
          }
        });

        map.on('mouseenter', 'risk-fill', () => { map.getCanvas().style.cursor = 'pointer'; });
        map.on('mouseleave', 'risk-fill', () => { map.getCanvas().style.cursor = ''; });
      } catch (err) {
        console.warn('Risk source error', err);
      }

      // Add simple shelters/POI markers from weatherLocationPoints as example
      try {
        const pois = weatherLocationPoints || [];
        pois.forEach((p: any) => {
          const el = document.createElement('div');
          el.className = 'jxr-marker';
          el.style.width = '34px';
          el.style.height = '34px';
          el.style.background = 'white';
          el.style.borderRadius = '9px';
          el.style.boxShadow = '0 6px 12px rgba(2,6,23,0.35)';
          el.style.display = 'flex';
          el.style.alignItems = 'center';
          el.style.justifyContent = 'center';
          el.style.border = '3px solid rgba(255,255,255,0.9)';

          // simple icon
          el.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="6" fill="#06b6d4"/></svg>`;

          const m = new maplibregl.Marker({ element: el })
            .setLngLat([p.lng || p.longitude, p.lat || p.latitude])
            .addTo(map);

          el.addEventListener('click', () => {
            setSelectedZone({ name: p.name || p.id, details: p });
          });
          // attach marker instance to element for visibility control
          (el as any).__markerInstance = m;
          markersRef.current.push(el);
        });
      } catch (err) {
        console.warn('POI markers failed', err);
      }

      // Add a simple locate control
      const geolocate = new maplibregl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: false
      });
      map.addControl(geolocate, 'top-right');

      const nav = new maplibregl.NavigationControl({ showCompass: true, showZoom: true });
      map.addControl(nav, 'top-right');

      // attribution
      map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');

      // append canvases to the map container so they render in the same stacking context
      try {
        const container = map.getContainer();
        container.appendChild(canvas);
        container.appendChild(glCanvas);
      } catch (e) {
        // fallback: append to wrapper
        try { containerRef.current && containerRef.current.appendChild(canvas); containerRef.current && containerRef.current.appendChild(glCanvas); } catch (e) {}
      }
      // initialize cloud positions from weather points
      try { updateCloudsFromWeather(); } catch (e) { /* ignore */ }
    });

    // Create overlay canvases for particle animations. Prefer WebGL when available.
    const canvas = document.createElement('canvas');
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    // Do not append canvases yet; attach them into the map container when map loads
    const glCanvas = document.createElement('canvas');
    glCanvas.style.position = 'absolute';
    glCanvas.style.top = '0';
    glCanvas.style.left = '0';
    glCanvas.style.width = '100%';
    glCanvas.style.height = '100%';
    glCanvas.style.pointerEvents = 'none';
    

    let ctx: CanvasRenderingContext2D | null = null;
    let gl: WebGLRenderingContext | WebGL2RenderingContext | null = null;
    let useWebGL = false;
    // always prepare 2D context for effects (thunder overlays etc.)
    ctx = canvas.getContext('2d')!;
    try {
      gl = (glCanvas.getContext('webgl2') || glCanvas.getContext('webgl')) as WebGLRenderingContext | WebGL2RenderingContext | null;
      if (gl && !force2D) useWebGL = true;
    } catch (e) { useWebGL = false; }

    let rafId: number | null = null;
    // Performance and behavior tuning
    const MAX_PARTICLES = 1200; // hard cap (allocation), UI controls effective limit
    const SPAWN_THROTTLE_MS = 120; // min ms between spawn bursts
    let lastSpawn = 0;
    // Thunder state map: id -> next allowed flash timestamp
    const thunderNext: Record<string, number> = {};

    function resizeCanvas() {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const w = Math.round(rect.width * devicePixelRatio);
      const h = Math.round(rect.height * devicePixelRatio);
      canvas.width = w;
      canvas.height = h;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      glCanvas.width = w;
      glCanvas.height = h;
      glCanvas.style.width = `${rect.width}px`;
      glCanvas.style.height = `${rect.height}px`;
      if (ctx) ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
      if (gl) gl.viewport(0, 0, w, h);
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    type Particle = { x: number; y: number; vx: number; vy: number; life: number; alpha: number; size?: number };
    let particles: Particle[] = [];
    // WebGL renderer state
    let glProgram: any = null;
    let glBuffer: WebGLBuffer | null = null;
    let glData: Float32Array | null = null;
    const ATTRIB_STRIDE = 4 * Float32Array.BYTES_PER_ELEMENT; // x,y,size,alpha

    // Cloud renderer state
    let cloudProgram: any = null;
    let cloudBuffer: WebGLBuffer | null = null;
    let cloudData: Float32Array | null = null;
    const MAX_CLOUDS = 48;
    let clouds: { x: number; y: number; size: number; alpha: number; vx: number; frame: number }[] = [];
    let glCloudTexture: WebGLTexture | null = null;

    // Initialize WebGL shaders and buffers for rain particles
    function initGLRenderer() {
      if (!gl) return;
      const vert = `#version 100
        attribute vec2 a_pos;
        attribute float a_size;
        attribute float a_alpha;
        uniform vec2 u_resolution;
        varying float v_alpha;
        void main(){
          vec2 clip = (a_pos / u_resolution) * 2.0 - 1.0;
          gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
          gl_PointSize = a_size;
          v_alpha = a_alpha;
        }
      `;
      const frag = `#version 100
        precision mediump float;
        varying float v_alpha;
        void main(){
          vec2 coord = gl_PointCoord - vec2(0.5);
          float dist = length(coord);
          float alpha = clamp(1.0 - dist*1.8, 0.0, 1.0) * v_alpha;
          gl_FragColor = vec4(0.49,0.83,0.98, alpha);
        }
      `;

      function compile(src: string, type: number) {
        const s = gl!.createShader(type)!;
        gl!.shaderSource(s, src);
        gl!.compileShader(s);
        if (!gl!.getShaderParameter(s, gl!.COMPILE_STATUS)) {
          console.warn('Shader compile error', gl!.getShaderInfoLog(s));
        }
        return s;
      }

      const vs = compile(vert, gl.VERTEX_SHADER);
      const fs = compile(frag, gl.FRAGMENT_SHADER);
      const prog = gl.createProgram();
      gl.attachShader(prog!, vs);
      gl.attachShader(prog!, fs);
      gl.linkProgram(prog!);
      if (!gl.getProgramParameter(prog!, gl.LINK_STATUS)) console.warn('GL link error', gl.getProgramInfoLog(prog!));
      glProgram = prog;

      glBuffer = gl.createBuffer();
      glData = new Float32Array(MAX_PARTICLES * 4);
      gl.bindBuffer(gl.ARRAY_BUFFER, glBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, glData, gl.DYNAMIC_DRAW);

      // enable additive blending for glow-like effect
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    }

    // Initialize cloud renderer: create texture and shader
    function initGLClouds() {
      if (!gl) return;
      // build a simple cloud texture on an offscreen canvas
      // create sprite-sheet with several frames horizontally
      const frames = 4;
      const frameW = 128;
      const frameH = 64;
      const c = document.createElement('canvas');
      c.width = frameW * frames;
      c.height = frameH;
      const cx = c.getContext('2d')!;
      for (let f = 0; f < frames; f++) {
        const ox = f * frameW;
        // background gradient per frame
        const grad = cx.createLinearGradient(ox, 0, ox + frameW, 0);
        grad.addColorStop(0, '#e6fbff');
        grad.addColorStop(1, '#bfefff');
        cx.fillStyle = grad;
        cx.shadowBlur = 18 + f * 2;
        cx.shadowColor = 'rgba(120,200,255,0.42)';
        cx.beginPath();
        cx.ellipse(ox + 48 + (f - 1.5) * 4, 34, 42 - f * 2, 20 - f, 0, 0, Math.PI * 2);
        cx.ellipse(ox + 78 - (f - 1.5) * 3, 28 - f, 30 - f * 1.2, 16 - f * 0.6, 0, 0, Math.PI * 2);
        cx.fill();
      }

      // create GL texture
      const tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 1);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, c);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

      const vsh = `#version 100
        attribute vec2 a_pos;
        attribute float a_size;
        attribute float a_alpha;
        attribute float a_frame;
        uniform vec2 u_resolution;
        varying float v_alpha;
        varying float v_frame;
        void main(){
          vec2 clip = (a_pos / u_resolution) * 2.0 - 1.0;
          gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
          gl_PointSize = a_size;
          v_alpha = a_alpha;
          v_frame = a_frame;
        }
      `;
      const fsh = `#version 100
        precision mediump float;
        varying float v_alpha;
        varying float v_frame;
        uniform sampler2D u_tex;
        uniform float u_frames;
        void main(){
          // compute uv within sprite-sheet frame
          float fx = v_frame + gl_PointCoord.x;
          vec2 uv = vec2(fx / u_frames, gl_PointCoord.y);
          vec4 col = texture2D(u_tex, uv);
          // soft circular mask
          vec2 coord = gl_PointCoord - vec2(0.5);
          float dist = length(coord);
          float mask = smoothstep(0.6, 0.45, dist);
          gl_FragColor = vec4(col.rgb, col.a * mask * v_alpha);
        }
      `;

      function compile(src: string, type: number) {
        const s = gl!.createShader(type)!;
        gl!.shaderSource(s, src);
        gl!.compileShader(s);
        if (!gl!.getShaderParameter(s, gl!.COMPILE_STATUS)) console.warn('Cloud shader error', gl!.getShaderInfoLog(s));
        return s;
      }

      const vs2 = compile(vsh, gl.VERTEX_SHADER);
      const fs2 = compile(fsh, gl.FRAGMENT_SHADER);
      const prog2 = gl.createProgram();
      gl.attachShader(prog2!, vs2);
      gl.attachShader(prog2!, fs2);
      gl.linkProgram(prog2!);
      if (!gl.getProgramParameter(prog2!, gl.LINK_STATUS)) console.warn('GL cloud link error', gl.getProgramInfoLog(prog2!));
      cloudProgram = prog2;
      // set as cloud texture
      glCloudTexture = tex;
      // store frame count
      (glCloudTexture as any).__frames = 4;

      cloudBuffer = gl.createBuffer();
      cloudData = new Float32Array(MAX_CLOUDS * 5);
      gl.bindBuffer(gl.ARRAY_BUFFER, cloudBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, cloudData, gl.DYNAMIC_DRAW);
    }

    function updateCloudsFromWeather() {
      const map = mapRef.current;
      if (!map) return;
      // If we're on the evacuation/flood map or flood risk is high, disable cloud animation to reduce distraction
      const isFloodMap = (activeTab === 'evacuation') || ((intel && (intel.floodProbability || 0) >= 70));
      if (isFloodMap) {
        clouds = [];
        return;
      }
      clouds = [];
      for (const w of weatherLocationPoints) {
        const risk = (w as any).currentRiskPct ?? 0;
        if (risk < 20) continue;
        const p = map.project([w.lng, w.lat]);
        const size = 48 + (risk / 100) * 120;
        const wind = Math.max(0.1, (w.windKmH || 8) / 12);
        const frame = Math.floor(Math.random() * 4);
        clouds.push({ x: p.x, y: p.y - 32, size, alpha: Math.min(1, 0.5 + risk / 120), vx: wind * (Math.random() * 0.6 + 0.4), frame });
      }
      // clamp clouds
      if (clouds.length > MAX_CLOUDS) clouds = clouds.slice(0, MAX_CLOUDS);
    }

    function spawnParticles() {
      const map = mapRef.current;
      if (!map) return;
      particles = particles.filter(p => p.life > 0);
      const now = Date.now();
      // throttle spawn bursts to avoid huge spikes
      if (now - lastSpawn < SPAWN_THROTTLE_MS) return;
      lastSpawn = now;
      const zoom = map.getZoom();
      // scale factors: bigger droplets and wider spread when zoomed in
      const scale = Math.max(0.5, 1 + (zoom - 11.5) * 0.25);

      weatherLocationPoints.forEach((w: any) => {
        const intensity = w.rainfall || 0;
        if (intensity < 8) return; // skip very light rain
        const screen = map.project([w.lng, w.lat]);
        // spawn count proportional to intensity and scale
        const baseCount = Math.min(60, Math.round((intensity / 100) * 60));
        const count = Math.max(1, Math.round(baseCount * Math.sqrt(scale)));
        // spread in screen pixels shrinks when zoomed out
        const spreadX = 40 * (1 / scale);
        const spreadY = 20 * (1 / scale);

        for (let i = 0; i < count; i++) {
          const effectiveLimit = Math.max(50, Math.min(MAX_PARTICLES, particleLimit || 500));
          if (particles.length >= effectiveLimit) break;
          particles.push({
            x: screen.x + (Math.random() - 0.5) * spreadX,
            y: screen.y + (Math.random() - 0.5) * spreadY,
            vx: (Math.random() - 0.5) * 0.6 * (1 / scale),
            vy: 2 * scale + Math.random() * 2 * scale,
            life: Math.round((24 * scale + Math.random() * 36) * lifetimeScale),
            alpha: 0.5 + Math.random() * 0.5,
            size: 1 + Math.random() * 2 * Math.max(0.6, scale)
          });
        }
        // Thunder: heavy rain (>80) may create a localized flash occasionally
        if ((intensity || 0) >= 80) {
          const id = w.id || `${w.lat}_${w.lng}`;
          const next = thunderNext[id] || 0;
          if (now > next) {
            thunderNext[id] = now + 6000 + Math.random() * 8000; // next flash
            triggerThunderAt(screen.x, screen.y, Math.min(1.2, 0.8 + intensity / 200));
          }
        }

      });
    }

    function animate() {
      const map = mapRef.current;
      if (!map) return;
      const zoom = map.getZoom();
      const scale = Math.max(0.5, 1 + (zoom - 11.5) * 0.25);
      // update particle physics
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 1;
      });

      // Respect force2D toggle: if forced, skip WebGL path even if available
      if (!force2D && useWebGL && gl && glProgram && glBuffer && glData) {
        // populate GL buffer
        const drawCount = Math.min(particles.length, MAX_PARTICLES);
        for (let i = 0; i < drawCount; i++) {
          const p = particles[i];
          const off = i * 4;
          glData[off + 0] = p.x;
          glData[off + 1] = p.y;
          glData[off + 2] = (p.size || 1.2) * (devicePixelRatio * scale * 1.5);
          glData[off + 3] = p.alpha;
        }
        // upload only used portion
        gl.bindBuffer(gl.ARRAY_BUFFER, glBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, glData.subarray(0, drawCount * 4));

        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.useProgram(glProgram);
        const a_pos = gl.getAttribLocation(glProgram, 'a_pos');
        const a_size = gl.getAttribLocation(glProgram, 'a_size');
        const a_alpha = gl.getAttribLocation(glProgram, 'a_alpha');
        const u_res = gl.getUniformLocation(glProgram, 'u_resolution');
        gl.enableVertexAttribArray(a_pos);
        gl.enableVertexAttribArray(a_size);
        gl.enableVertexAttribArray(a_alpha);
        gl.vertexAttribPointer(a_pos, 2, gl.FLOAT, false, ATTRIB_STRIDE, 0);
        gl.vertexAttribPointer(a_size, 1, gl.FLOAT, false, ATTRIB_STRIDE, 8);
        gl.vertexAttribPointer(a_alpha, 1, gl.FLOAT, false, ATTRIB_STRIDE, 12);
        gl.uniform2f(u_res, glCanvas.width, glCanvas.height);
        gl.drawArrays(gl.POINTS, 0, Math.max(0, Math.min(drawCount, MAX_PARTICLES)));
      } else if (ctx) {
        // 2D fallback
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach((p) => {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(125,211,252,${p.alpha})`;
          ctx.lineWidth = (p.size || 1.2) * scale;
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - p.vx * 3 * scale, p.y - p.vy * 3 * scale);
          ctx.stroke();
        });
      }

      // draw clouds using textured point sprites (skip when in flood/evacuation mode)
      const isFloodMap = (activeTab === 'evacuation') || ((intel && (intel.floodProbability || 0) >= 70));
      if (!isFloodMap && useWebGL && gl && cloudProgram && cloudBuffer && cloudData && glCloudTexture) {
        // update cloud physics
        for (let i = clouds.length - 1; i >= 0; i--) {
          const c = clouds[i];
          c.x += c.vx * (1 + 0.2 * Math.sin(Date.now() / 1200));
          // small vertical bob
          c.y += Math.sin((Date.now() / 1000) + i) * 0.2;
        }

        const cloudCount = Math.min(clouds.length, MAX_CLOUDS);
          for (let i = 0; i < cloudCount; i++) {
            const c = clouds[i];
            const off = i * 5;
            cloudData[off + 0] = c.x;
            cloudData[off + 1] = c.y;
            cloudData[off + 2] = c.size * devicePixelRatio;
            cloudData[off + 3] = c.alpha;
            cloudData[off + 4] = c.frame || 0;
          }
        gl.bindBuffer(gl.ARRAY_BUFFER, cloudBuffer);
          gl.bufferSubData(gl.ARRAY_BUFFER, 0, cloudData.subarray(0, cloudCount * 5));
        gl.useProgram(cloudProgram);
          const a_pos2 = gl.getAttribLocation(cloudProgram, 'a_pos');
          const a_size2 = gl.getAttribLocation(cloudProgram, 'a_size');
          const a_alpha2 = gl.getAttribLocation(cloudProgram, 'a_alpha');
          const a_frame2 = gl.getAttribLocation(cloudProgram, 'a_frame');
          const u_res2 = gl.getUniformLocation(cloudProgram, 'u_resolution');
          const u_tex = gl.getUniformLocation(cloudProgram, 'u_tex');
          const u_frames = gl.getUniformLocation(cloudProgram, 'u_frames');
          gl.enableVertexAttribArray(a_pos2);
          gl.enableVertexAttribArray(a_size2);
          gl.enableVertexAttribArray(a_alpha2);
          gl.enableVertexAttribArray(a_frame2);
          const CLOUD_STRIDE = 5 * Float32Array.BYTES_PER_ELEMENT;
          gl.vertexAttribPointer(a_pos2, 2, gl.FLOAT, false, CLOUD_STRIDE, 0);
          gl.vertexAttribPointer(a_size2, 1, gl.FLOAT, false, CLOUD_STRIDE, 8);
          gl.vertexAttribPointer(a_alpha2, 1, gl.FLOAT, false, CLOUD_STRIDE, 12);
          gl.vertexAttribPointer(a_frame2, 1, gl.FLOAT, false, CLOUD_STRIDE, 16);
          gl.uniform2f(u_res2, glCanvas.width, glCanvas.height);
          gl.activeTexture(gl.TEXTURE0);
          gl.bindTexture(gl.TEXTURE_2D, glCloudTexture);
          gl.uniform1i(u_tex, 0);
          gl.uniform1f(u_frames, (glCloudTexture as any).__frames || 4);
          gl.drawArrays(gl.POINTS, 0, cloudCount);
      }

      // spawn more frequently when many heavy-rain points
      if (Math.random() > 0.6) spawnParticles();
      rafId = requestAnimationFrame(animate);
    }

    rafId = requestAnimationFrame(animate);

    // Reproject particles when map moves or zooms: clear and respawn so particles track points
    const onMoveOrZoom = () => {
      particles = [];
      spawnParticles();
      try { updateCloudsFromWeather(); } catch (e) { /* ignore */ }
    };
    map.on('move', onMoveOrZoom);
    map.on('zoom', onMoveOrZoom);

    // initialize GL renderer if available
    if ((gl as any)) {
      initGLRenderer();
      initGLClouds();
    }

    // Thunder visual effect: localized bright flash and subtle canvas overlay
    function triggerThunderAt(x: number, y: number, intensity = 1) {
      if (!ctx) return;
      const cctx = ctx;
      // draw a quick radial flash on the canvas
      const flashDuration = 220;
      const start = performance.now();
      const drawFlash = (t: number) => {
        if (!cctx) return;
        const dt = t - start;
        const alpha = Math.max(0, 1 - dt / flashDuration) * 0.7 * intensity;
        // overlay a subtle white radial gradient
        const grd = cctx.createRadialGradient(x, y, 0, x, y, 120 * intensity);
        grd.addColorStop(0, `rgba(255,255,255,${alpha})`);
        grd.addColorStop(1, `rgba(255,255,255,0)`);
        cctx.save();
        cctx.globalCompositeOperation = 'lighter';
        cctx.fillStyle = grd;
        cctx.fillRect(x - 160, y - 160, 320, 320);
        cctx.restore();
        if (dt < flashDuration) requestAnimationFrame(drawFlash);
      };
      requestAnimationFrame(drawFlash);
    }

    // Add rivers source & layer using waterFlowPaths
    try {
      const wf = waterFlowPaths || [];
      const riverGeo = { type: 'FeatureCollection', features: (wf || []).map((r: any) => ({ type: 'Feature', properties: { id: r.id, name: r.name }, geometry: { type: 'LineString', coordinates: (r.waypoints || []).map((pt: any) => [pt[1], pt[0]]) } })) };

      if (!map.getSource('rivers')) {
        map.addSource('rivers', { type: 'geojson', data: riverGeo });
        map.addLayer({ id: 'rivers-line', type: 'line', source: 'rivers', paint: { 'line-color': '#7dd3fc', 'line-width': 2, 'line-opacity': 0.95 } });
      }
    } catch (err) {
      console.warn('Rivers layer failed', err);
    }

    // Add rainfall halo source/layer for heavy rain points (pulsing)
    try {
      const rainFeatures = (weatherLocationPoints || []).filter((w:any) => (w.rainfall || 0) >= 20).map((w:any) => ({ type: 'Feature', properties: { id: w.id, name: w.name, rainfall: w.rainfall }, geometry: { type: 'Point', coordinates: [w.lng, w.lat] } }));
      const rainGeo = { type: 'FeatureCollection', features: rainFeatures };
      if (!map.getSource('rain-halo')) {
        map.addSource('rain-halo', { type: 'geojson', data: rainGeo });
        map.addLayer({
          id: 'rain-halo',
          type: 'circle',
          source: 'rain-halo',
          paint: {
            'circle-color': 'rgba(96,165,250,0.12)',
            'circle-stroke-color': 'rgba(96,165,250,0.18)',
            'circle-stroke-width': 1,
            // base radius will be adjusted by zoom; multiplied further by pulse
            'circle-radius': ['interpolate', ['linear'], ['zoom'], 7, 8, 11, 18, 15, 36],
            'circle-blur': 0.6
          },
          layout: { visibility: 'visible' }
        });
      }
      // Pulse animation for halo radius
      let pulse = 0;
      const pulseInterval = setInterval(() => {
        pulse = (pulse + 0.08) % 3.14;
        const scale = 1 + Math.abs(Math.sin(pulse)) * 0.35;
        try {
          if (map.getLayer('rain-halo')) {
            // adjust circle-radius by setting paint property to expression multiplied by scale
            map.setPaintProperty('rain-halo', 'circle-radius', ['*', ['interpolate', ['linear'], ['zoom'], 7, 8, 11, 18, 15, 36], scale]);
          }
        } catch (e) { /* ignore */ }
      }, 300);

      // attach pulseInterval to map for cleanup later
      (map as any).__rainPulseInterval = pulseInterval;
    } catch (err) {
      console.warn('Rain halo failed', err);
    }

    // animate river flow by shifting dasharray
    let dashOffset = 0;
    const riverAnim = setInterval(() => {
      dashOffset = (dashOffset + 1) % 64;
      try {
        if (mapRef.current && mapRef.current.getLayer('rivers-line')) {
          mapRef.current.setPaintProperty('rivers-line', 'line-dasharray', [dashOffset, 12]);
        }
      } catch (e) { /* ignore */ }
    }, 120);
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      clearInterval(riverAnim);
      // clear rain halo pulse interval if set
      try {
        const pi = (map as any).__rainPulseInterval;
        if (pi) clearInterval(pi);
      } catch (e) { /* ignore */ }
      // remove move/zoom listeners
      try {
        map.off('move', onMoveOrZoom);
        map.off('zoom', onMoveOrZoom);
      } catch (e) { /* ignore */ }
      window.removeEventListener('resize', resizeCanvas);
      try { canvas.remove(); } catch (e) { /* ignore */ }
      try { glCanvas.remove(); } catch (e) { /* ignore */ }
      try {
        if (gl && glBuffer) gl.deleteBuffer(glBuffer);
        if (gl && glProgram) gl.deleteProgram(glProgram);
        if (gl && cloudBuffer) gl.deleteBuffer(cloudBuffer);
        if (gl && cloudProgram) gl.deleteProgram(cloudProgram);
        if (gl && glCloudTexture) gl.deleteTexture(glCloudTexture);
      } catch (e) { /* ignore */ }
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Apply layer visibility changes to the map when toggles change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // base map toggles
    try {
      if (baseMap === 'standard') {
        if (map.getLayer('osm')) map.setLayoutProperty('osm', 'visibility', 'visible');
        if (map.getLayer('sat')) map.setLayoutProperty('sat', 'visibility', 'none');
      } else {
        if (map.getLayer('osm')) map.setLayoutProperty('osm', 'visibility', 'none');
        if (map.getLayer('sat')) map.setLayoutProperty('sat', 'visibility', 'visible');
      }
    } catch (err) { console.warn('Base map toggle error', err); }

    // terrain toggles: show/hide hillshade and enable/disable 3D terrain
    try {
      if (layersVisible.terrain) {
        // enable terrain
        if (map.getSource('dem')) {
          try { map.setTerrain({ source: 'dem', exaggeration: 1.03 }); } catch (e) { /* ignore */ }
          if (map.getLayer('hillshade')) map.setLayoutProperty('hillshade', 'visibility', 'visible');
        }
      } else {
        // disable terrain (keep base map visible)
        try { map.setTerrain({ source: 'dem', exaggeration: 0 }); } catch (e) { /* ignore */ }
        if (map.getLayer('hillshade')) map.setLayoutProperty('hillshade', 'visibility', 'none');
      }
    } catch (err) { console.warn('Terrain toggle error', err); }

    // risk layer
    try {
      if (map.getLayer('risk-fill')) map.setLayoutProperty('risk-fill', 'visibility', layersVisible.risk ? 'visible' : 'none');
      if (map.getLayer('risk-line')) map.setLayoutProperty('risk-line', 'visibility', layersVisible.risk ? 'visible' : 'none');
    } catch (err) { /* ignore */ }

    // rivers
    try {
      if (map.getLayer('rivers-line')) map.setLayoutProperty('rivers-line', 'visibility', layersVisible.rivers ? 'visible' : 'none');
    } catch (err) { /* ignore */ }

    // shelters (markers)
    try {
      markersRef.current.forEach((el: any) => {
        if (!el) return;
        const marker = (el as any).__markerInstance;
        if (marker && marker.getElement) {
          const dom = marker.getElement();
          dom.style.display = layersVisible.shelters ? 'flex' : 'none';
        }
      });
    } catch (err) { /* ignore */ }

  }, [layersVisible, baseMap]);

  // Example model use: compute a simulated risk for display when selecting a polygon
  const renderInfoCard = () => {
    if (!selectedZone) return null;
    // If terrainRiskZones feature
    const props = selectedZone.properties || selectedZone;
    const inputs = {
      rainfallPct: state.rainfall, forecastRainPct: 20, soilSaturationPct: state.soilSaturation, riverLevelPct: state.riverLevel,
      terrainSlopePct: 30, drainageCapacityPct: 35, riverProximityPct: 40
    };

    const res = computeFloodRisk(inputs as any);

    return (
      <div className="absolute right-4 bottom-6 z-50 w-96 bg-white/95 text-slate-900 p-4 rounded-lg shadow-xl font-sans">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="text-sm font-bold text-slate-800">{props.name || props.id || props.zoneName || 'Zone'}</div>
            <div className="text-xs text-slate-500">MODEL ESTIMATE — Simulated Flood Risk</div>
          </div>
          <div className="text-right">
            <div className="text-lg font-extrabold text-red-600">{res.score}%</div>
            <div className="text-[11px] text-slate-500">{res.level}</div>
          </div>
        </div>

        <div className="mt-2 text-[13px] text-slate-700">
          <div>Expected Impact: <strong>{props.timeToImpactMinutes || '—'} minutes</strong></div>
          <div>Confidence: <strong>Model Estimate</strong></div>
        </div>

        <div className="mt-3 text-[13px]">
          <div className="font-semibold">Why?</div>
          <ul className="list-disc pl-5 text-[13px] text-slate-600">
            <li>Recent heavy rainfall observed</li>
            <li>Soil saturation elevated</li>
            <li>Nearby river levels increasing</li>
            <li>Steep local slopes</li>
          </ul>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <button className="px-3 py-1.5 bg-cyan-500 text-white rounded">Show Safe Route</button>
          <button onClick={() => setSelectedZone(null)} className="text-xs text-slate-500">Close</button>
        </div>
      </div>
    );
  };

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full rounded-xl" />
      {renderInfoCard()}
      {/* Layer controls compact */}
      <div className={`absolute top-4 left-4 z-50 bg-white/95 p-3 rounded-lg shadow-md text-xs ${panelCollapsed ? 'w-12 overflow-hidden' : 'w-auto'}`} aria-expanded={!panelCollapsed} aria-label="Map controls">
        <button aria-controls="map-controls-body" aria-expanded={!panelCollapsed} onClick={() => setPanelCollapsed((s) => !s)} className="mb-2 px-2 py-1 text-[12px] bg-white/80 rounded">{panelCollapsed ? '▶' : '◀'}</button>
        <div className="font-semibold text-slate-700">Base Map</div>
        <div id="map-controls-body" role="region">
        <div className="mt-1 flex gap-2">
          <button className={`px-2 py-1 rounded text-[13px] ${baseMap==='standard' ? 'bg-cyan-500 text-white' : 'bg-white/60'}`} onClick={() => setBaseMap('standard')}>Standard</button>
          <button className={`px-2 py-1 rounded text-[13px] ${baseMap==='satellite' ? 'bg-cyan-500 text-white' : 'bg-white/60'}`} onClick={() => setBaseMap('satellite')}>Satellite</button>
        </div>

        <div className="mt-3 font-semibold text-slate-700">Overlays</div>
        <div className="mt-1 space-y-1">
          {Object.keys(layersVisible).map((k) => (
            <label key={k} className="flex items-center gap-2">
              <input type="checkbox" checked={(layersVisible as any)[k]} onChange={() => setLayersVisible({ ...(layersVisible as any), [k]: !(layersVisible as any)[k] })} />
              <span className="text-slate-700 text-[13px]">{k}</span>
            </label>
          ))}
        </div>
      
          <div className="mt-3 font-semibold text-slate-700">Performance</div>
          <div className="mt-2 text-[13px] w-64">
            <div className="flex gap-2 mb-2">
              <button className="px-2 py-1 rounded bg-white/60 text-[13px]" onClick={() => { setParticleLimit(150); setLifetimeScale(0.7); }}>Low</button>
              <button className="px-2 py-1 rounded bg-white/60 text-[13px]" onClick={() => { setParticleLimit(500); setLifetimeScale(1.0); }}>Medium</button>
              <button className="px-2 py-1 rounded bg-white/60 text-[13px]" onClick={() => { setParticleLimit(1000); setLifetimeScale(1.3); }}>High</button>
              <button className="px-2 py-1 rounded bg-white/60 text-[13px]" onClick={() => { setParticleLimit(500); setLifetimeScale(1.0); localStorage.removeItem('sim:particleLimit'); localStorage.removeItem('sim:lifetimeScale'); }}>Reset</button>
            </div>
            <div className="text-[12px] text-slate-600 flex justify-between"><span>Particle Limit</span><span className="font-medium">{particleLimit}</span></div>
            <input type="range" min={50} max={1200} step={10} value={particleLimit} onChange={(e) => setParticleLimit(Number(e.target.value))} className="w-full" />
            <div className="mt-2 text-[12px] text-slate-600 flex justify-between"><span>Lifetime Scale</span><span className="font-medium">{lifetimeScale.toFixed(1)}x</span></div>
            <input type="range" min={0.4} max={2.0} step={0.1} value={lifetimeScale} onChange={(e) => setLifetimeScale(Number(e.target.value))} className="w-full" />
            <div className="mt-3 flex items-center gap-2">
              <label className="flex items-center gap-2 text-[13px]"><input type="checkbox" checked={force2D} onChange={(e) => setForce2D(e.target.checked)} /> Force 2D Rendering</label>
            </div>

            <div className="mt-3">
              <div className="text-[12px] text-slate-600">Saved Presets</div>
              <div className="mt-2 space-y-1">
                {Object.keys(savedPresets || {}).length === 0 && <div className="text-[12px] text-slate-500">No presets saved</div>}
                {Object.entries((savedPresets || {}) as Record<string, { particleLimit: number; lifetimeScale: number }>).map(([name, p]) => (
                  <div key={name} className="flex items-center justify-between bg-white/50 p-1 rounded">
                    <div className="text-[13px]">{name} — {p.particleLimit} / {p.lifetimeScale}x</div>
                    <div className="flex gap-2">
                      <button className="px-2 py-1 text-[12px] bg-white/60 rounded" onClick={() => applyDisplayPreset(name)}>Apply</button>
                      <button className="px-2 py-1 text-[12px] bg-white/60 rounded" onClick={() => deleteDisplayPreset(name)}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-2 flex gap-2">
                <input id="presetName" placeholder="Preset name" className="px-2 py-1 text-[13px] rounded border" />
                <button className="px-2 py-1 text-[13px] bg-cyan-500 text-white rounded" onClick={() => {
                  const el = document.getElementById('presetName') as HTMLInputElement | null;
                  if (!el) return; const v = el.value.trim(); if (!v) return; saveDisplayPreset(v, particleLimit, lifetimeScale); el.value = '';
                }}>Save</button>
              </div>
            </div>
            </div>
          </div>
          <div className="mt-2 text-[12px]">
            <div className="inline-block px-2 py-1 rounded bg-white/60">WebGL: <strong>{webglStatus}</strong></div>
          </div>
      </div>
    </div>
  );
};
