console.log('[APP] Iniciando aplicación...');

// Estado global
let map = null;
let userMarker = null;
let destMarker = null;
let routeLine = null;
let selectedHeight = 12.6;

// Constantes
const US_CENTER = [39.8283, -98.5795];
const US_ZOOM = 4;

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    console.log('[APP] DOM cargado');
    initializeApp();
});

async function initializeApp() {
    console.log('[APP] Inicializando aplicación...');
    
    // Inicializar mapa
    initMap();
    
    // Obtener ubicación del usuario
    await loadUserLocation();
    
    // Configurar event listeners
    setupEventListeners();
    
    console.log('[APP] Aplicación inicializada');
}

function initMap() {
    console.log('[MAP] Inicializando mapa...');
    
    map = L.map('map', {
        maxBounds: [[15, -180], [75, -50]],
        maxBoundsViscosity: 1.0,
        minZoom: 3,
        maxZoom: 18
    }).setView(US_CENTER, US_ZOOM);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
        maxZoom: 19
    }).addTo(map);

    // Bloquear pan fuera de EE.UU.
    map.on('drag', function() {
        map.panInsideBounds([[15, -180], [75, -50]], { animate: false });
    });

    console.log('[MAP] Mapa inicializado');
}

async function loadUserLocation() {
    console.log('[GEO] Cargando ubicación del usuario...');
    
    // PRIORIDAD 1: GPS del dispositivo (TU ubicación REAL)
    console.log('[GEO] Intentando GPS del dispositivo...');
    let location = await getGPSLocation();
    
    if (location) {
        console.log('[GEO] GPS detectado:', location);
        updateMapWithLocation(location);
        return;
    }
    
    // PRIORIDAD 2: IP geolocation (fallback)
    console.log('[GEO] GPS no disponible, intentando IP geolocation...');
    location = await getIPLocation();
    
    if (location) {
        console.log('[GEO] IP detectada:', location);
        updateMapWithLocation(location);
        return;
    }
    
    // PRIORIDAD 3: Centro de EE.UU. (último recurso)
    console.log('[GEO] IP no disponible, usando ubicación por defecto');
    location = {
        lat: US_CENTER[0],
        lon: US_CENTER[1],
        city: 'Centro EE.UU.',
        source: 'Default'
    };
    
    updateMapWithLocation(location);
}

async function getGPSLocation() {
    console.log('[GPS] Intentando obtener ubicación GPS...');
    
    return new Promise((resolve) => {
        if (!navigator.geolocation) {
            console.log('[GPS] GPS no disponible');
            resolve(null);
            return;
        }

        const timeout = setTimeout(() => {
            console.log('[GPS] Timeout (5s)');
            resolve(null);
        }, 5000);

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                clearTimeout(timeout);
                const { latitude, longitude } = pos.coords;
                console.log('[GPS] Ubicación obtenida:', latitude, longitude);
                resolve({
                    lat: latitude,
                    lon: longitude,
                    source: 'GPS'
                });
            },
            (err) => {
                clearTimeout(timeout);
                console.log('[GPS] Error:', err.message);
                resolve(null);
            }
        );
    });
}

async function getIPLocation() {
    console.log('[IP] Intentando obtener ubicación por IP...');
    
    // Usar geoip-db.com (sin restricciones CORS)
    try {
        const response = await fetch('https://geoip-db.com/json/');
        const data = await response.json();
        
        console.log('[IP] geoip-db:', data.country_code, data.city, data.latitude, data.longitude);
        
        if (data.country_code === 'US') {
            return {
                lat: data.latitude,
                lon: data.longitude,
                city: data.city,
                region: data.state,
                source: 'IP (geoip-db)'
            };
        }
    } catch (err) {
        console.log('[IP] geoip-db error:', err.message);
    }
    
    // Fallback a ipapi.co
    try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        
        console.log('[IP] ipapi.co:', data.country_code, data.latitude, data.longitude);
        
        if (data.country_code === 'US') {
            return {
                lat: data.latitude,
                lon: data.longitude,
                city: data.city,
                region: data.region,
                source: 'IP (ipapi.co)'
            };
        }
    } catch (err) {
        console.log('[IP] ipapi.co error:', err.message);
    }
    
    console.log('[IP] Todos los servicios fallaron');
    return null;
}

async function updateMapWithLocation(location) {
    console.log('[UPDATE] Actualizando mapa con ubicación:', location);
    
    const { lat, lon, source } = location;
    
    // Eliminar marcador anterior
    if (userMarker) {
        map.removeLayer(userMarker);
    }
    
    // Crear marcador
    userMarker = L.circleMarker([lat, lon], {
        radius: 8,
        fillColor: '#2B5C8F',
        color: '#fff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8
    }).addTo(map).bindPopup(`📍 Tu Ubicación (${source})`).openPopup();
    
    // Centrar mapa
    map.setView([lat, lon], 12);
    
    // Obtener nombre de la ciudad
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
        const data = await response.json();
        const address = data.display_name || `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
        
        document.getElementById('origin-input').value = address;
        document.getElementById('origin-input').dataset.lat = lat;
        document.getElementById('origin-input').dataset.lon = lon;
        
        console.log('[UPDATE] Dirección actualizada:', address);
    } catch (err) {
        console.error('[UPDATE] Error obteniendo dirección:', err);
        document.getElementById('origin-input').value = `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
    }
}

async function searchRoute() {
    console.log('[ROUTE] Buscando ruta...');
    
    const originInput = document.getElementById('origin-input');
    const destInput = document.getElementById('destination-input');
    
    if (!originInput.value || !destInput.value) {
        alert('Por favor completa origen y destino');
        return;
    }
    
    const originLat = parseFloat(originInput.dataset.lat);
    const originLon = parseFloat(originInput.dataset.lon);
    
    if (!originLat || !originLon) {
        alert('Ubicación de origen no válida');
        return;
    }
    
    // Buscar destino
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&countrycodes=us&limit=1&q=${encodeURIComponent(destInput.value)}`
        );
        const results = await response.json();
        
        if (!results.length) {
            alert('Destino no encontrado');
            return;
        }
        
        const dest = results[0];
        const destLat = parseFloat(dest.lat);
        const destLon = parseFloat(dest.lon);
        
        console.log('[ROUTE] Destino encontrado:', destLat, destLon);
        
        // Actualizar marcador de destino
        if (destMarker) {
            map.removeLayer(destMarker);
        }
        
        destMarker = L.circleMarker([destLat, destLon], {
            radius: 8,
            fillColor: '#FF9800',
            color: '#fff',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.8
        }).addTo(map).bindPopup('📍 Destino').openPopup();
        
        // Calcular ruta
        await calculateRoute(originLat, originLon, destLat, destLon);
        
    } catch (err) {
        console.error('[ROUTE] Error:', err);
        alert('Error buscando destino');
    }
}

async function calculateRoute(lat1, lon1, lat2, lon2) {
    console.log('[CALC] Calculando ruta...');
    
    try {
        const url = `https://router.project-osrm.org/route/v1/driving/${lon1},${lat1};${lon2},${lat2}?overview=full&geometries=geojson`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (!data.routes || !data.routes.length) {
            alert('No se encontró ruta');
            return;
        }
        
        const route = data.routes[0];
        const distance = (route.distance / 1000).toFixed(1);
        const duration = Math.round(route.duration / 60);
        
        console.log('[CALC] Ruta calculada:', distance, 'km,', duration, 'min');
        
        // Dibujar ruta
        if (routeLine) {
            map.removeLayer(routeLine);
        }
        
        routeLine = L.polyline(
            route.geometry.coordinates.map(([lon, lat]) => [lat, lon]),
            { color: '#00BCD4', weight: 3, opacity: 0.7 }
        ).addTo(map);
        
        map.fitBounds(routeLine.getBounds());
        
        alert(`Ruta: ${distance} km, ${duration} minutos`);
        
    } catch (err) {
        console.error('[CALC] Error:', err);
        alert('Error calculando ruta');
    }
}

function setupEventListeners() {
    console.log('[EVENTS] Configurando event listeners...');
    
    // Botón: Mi Ubicación
    document.getElementById('current-location-btn').addEventListener('click', async function() {
        console.log('[BTN] Mi Ubicación');
        const location = await getGPSLocation() || await getIPLocation();
        if (location) {
            updateMapWithLocation(location);
        }
    });
    
    // Botón: Buscar Ruta
    document.getElementById('search-btn').addEventListener('click', searchRoute);
    
    // Botones de altura
    document.querySelectorAll('.height-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.height-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            selectedHeight = parseFloat(this.dataset.height);
            document.getElementById('height-info').textContent = `Altura: ${selectedHeight}'`;
            console.log('[HEIGHT] Altura seleccionada:', selectedHeight);
        });
    });
    
    // Establecer altura por defecto
    document.querySelector('[data-height="12.6"]').classList.add('active');
    
    console.log('[EVENTS] Event listeners configurados');
}
