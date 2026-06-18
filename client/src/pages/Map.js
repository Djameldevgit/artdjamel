// pages/map/Map.jsx - Versión con estilos externos profesionales
import React, { useState, useEffect } from "react";
import { useLocation, useHistory, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Container, Row, Col, Card, Button, ButtonGroup, Alert, Spinner, Badge,
  Form
} from "react-bootstrap";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { useTranslation } from "react-i18next";
import "leaflet/dist/leaflet.css";
import "./Map.css"; // Importamos los estilos nuevos

// Fix leaflet icons (igual que antes)
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';

import {
  FaStore, FaUser, FaMapMarkerAlt, FaPhone, FaEnvelope, FaSyncAlt, FaGlobe,
  FaIdCard, FaRuler, FaLocationArrow, FaWhatsapp, FaSearch
} from "react-icons/fa";

// Configurar icono por defecto de Leaflet
L.Marker.prototype.options.icon = L.icon({
  iconUrl: icon,
  iconRetinaUrl: iconRetina,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Icono personalizado para la tienda (mismo que antes)
const ShopIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAiIGhlaWdodD0iMzAiIHZpZXdCb3g9IjAgMCAzMCAzMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTE1IDI3LjVDMTUuODI4NCAyNy41IDE2LjUgMjYuODI4NCAxNi41IDI2VjI0LjVIMTMuNVYyNkMxMy41IDI2LjgyODQgMTQuMTcxNiAyNy41IDE1IDI3LjVaIiBmaWxsPSIjREQyRTM2Ii8+CjxwYXRoIGQ9Ik0yMSAyNkgyMUgyMUgyMVoiIGZpbGw9IiNGRjVCMzYiLz4KPHBhdGggZD0iTTkgNkg5SDIxSDIxVjI2SDlWNloiIGZpbGw9IiNGRjVCMzYiLz4KPHBhdGggZD0iTTcgOUg3SDIzSDIzVjI2SDdWOVoiIGZpbGw9IiNGRjVCMzYiLz4KPHBhdGggZD0iTTUgMTJINVYyNkg1VjEyWiIgZmlsbD0iI0ZGNUIzNiIvPgo8cGF0aCBkPSJNMjUgMTJIMjVWMjZIMjVWMTJaIiBmaWxsPSIjRkY1QjM2Ii8+CjxwYXRoIGQ9Ik0xOC41IDE2LjVMMTguNSAxNi41TDE4LjUgMTYuNUwxOC41IDE2LjVaIiBmaWxsPSIjRkY1QjM2Ii8+CjxwYXRoIGQ9Ik0xNSAxOS41QzE0LjE3MTYgMTkuNSAxMy41IDE4LjgyODQgMTMuNSAxOFYxNi41SDE2LjVWMThDMTYuNSAxOC44Mjg0IDE1LjgyODQgMTkuNSAxNSAxOS41WiIgZmlsbD0iI0ZGNUIzNiIvPgo8cGF0aCBkPSJNMTEuNSAxNi41VjE2LjVIMTguNVYxNi41IiBzdHJva2U9IiNGRjVCMzYiIHN0cm9rZS13aWR0aD0iMS41Ii8+CjxwYXRoIGQ9Ik0xMS41IDE5LjVWMTkuNUgxOC41VjE5LjUiIHN0cm9rZT0iI0ZGNUIzNiIgc3Ryb2tlLXdpZHRoPSIxLjUiLz4KPHBhdGggZD0iTTExLjUgMTMuNVYxMy41SDE4LjVWMTMuNSIgc3Ryb2tlPSIjRkY1QjM2IiBzdHJva2Utd2lkdGg9IjEuNSIvPgo8L3N2Zz4K',
  iconSize: [35, 35],
  iconAnchor: [17, 35],
  popupAnchor: [0, -35],
});

// Componente para cambiar vista del mapa
const ChangeView = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

// Cálculo de distancia (igual)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Hook ubicación usuario (igual)
const useUserLocation = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const getUserLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocalisation non supportée'));
        return;
      }
      setIsGettingLocation(true);
      setLocationError(null);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = { lat: position.coords.latitude, lng: position.coords.longitude, accuracy: position.coords.accuracy };
          setUserLocation(location);
          setIsGettingLocation(false);
          resolve(location);
        },
        (error) => {
          let errorMessage = 'Erreur de localisation';
          if (error.code === 1) errorMessage = 'Autorisation refusée';
          else if (error.code === 2) errorMessage = 'Position indisponible';
          else if (error.code === 3) errorMessage = 'Délai dépassé';
          setLocationError(errorMessage);
          setIsGettingLocation(false);
          reject(new Error(errorMessage));
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    });
  };
  return { userLocation, locationError, isGettingLocation, getUserLocation };
};

// Componente de distancia
const DistanceCalculator = ({ shopPosition }) => {
  const { t } = useTranslation(['map', 'common']);
  const { userLocation, locationError, isGettingLocation, getUserLocation } = useUserLocation();
  const [distance, setDistance] = useState(null);
  const [calculating, setCalculating] = useState(false);

  const calculateDistanceToShop = async () => {
    if (!shopPosition || !shopPosition.lat) return;
    setCalculating(true);
    try {
      const currentLocation = await getUserLocation();
      if (currentLocation && shopPosition.lat && shopPosition.lng) {
        const d = calculateDistance(currentLocation.lat, currentLocation.lng, shopPosition.lat, shopPosition.lng);
        setDistance(d);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCalculating(false);
    }
  };

  const formatDistance = (km) => {
    if (km < 1) return `${Math.round(km * 1000)} m`;
    if (km < 1000) return `${km.toFixed(1)} km`;
    return `${Math.round(km)} km`;
  };

  if (!shopPosition || !shopPosition.lat) return null;

  return (
    <div className="mt-3 p-3 bg-light rounded border">
      <div className="d-flex align-items-center justify-content-between mb-2 flex-wrap gap-2">
        <div className="d-flex align-items-center">
          <FaRuler className="text-primary me-2" size={20} />
          <h6 className="mb-0 fw-bold">Distance à la boutique</h6>
        </div>
        <Button variant={distance ? "outline-success" : "primary"} size="sm" onClick={calculateDistanceToShop} disabled={calculating || isGettingLocation}>
          {calculating || isGettingLocation ? <Spinner animation="border" size="sm" /> : distance ? <FaSyncAlt /> : <FaLocationArrow />}
          <span className="ms-2">{distance ? "Recalculer" : "Calculer"}</span>
        </Button>
      </div>
      {distance !== null ? (
        <div className="text-center">
          <Badge bg="success" className="fs-6 p-2"><h4 className="mb-0">{formatDistance(distance)}</h4></Badge>
          <p className="text-muted small mb-0 mt-1">Distance en ligne droite depuis votre position</p>
        </div>
      ) : locationError ? (
        <Alert variant="warning" className="py-2 mb-0"><small>{locationError}</small></Alert>
      ) : (
        <p className="text-muted small mb-0">Cliquez sur "Calculer" pour connaître la distance</p>
      )}
      {userLocation && (
        <small className="text-muted d-block mt-2">Votre position: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}</small>
      )}
    </div>
  );
};

const Map = () => {
  const history = useHistory();
  const location = useLocation();
  const { t, i18n } = useTranslation(['map', 'common', 'location']);
  const { auth } = useSelector(state => state);
  const isRTL = i18n.language === 'ar';

  const shopData = location.state?.shopData || null;

  const [mapCenter, setMapCenter] = useState([36.5, 3.5]);
  const [markerPosition, setMarkerPosition] = useState([36.5, 3.5]);
  const [shopPosition, setShopPosition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(10);
  const [mapStyle, setMapStyle] = useState("street");
  const [searchQuery, setSearchQuery] = useState("");

  const mapProviders = {
    street: { name: "Rue", url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", attribution: '© OpenStreetMap' },
    satellite: { name: "Satellite", url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", attribution: '© Esri' },
    terrain: { name: "Terrain", url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", attribution: '© OpenTopoMap' }
  };

  // Funciones de geocodificación (igual que antes)
  const geocodeManual = async (query) => {
    if (!query.trim()) return null;
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&addressdetails=1`;
      const response = await fetch(url, { headers: { 'User-Agent': 'ShopApp/1.0', 'Accept-Language': i18n.language || 'fr' } });
      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lon = parseFloat(data[0].lon);
          return { lat, lng: lon, display_name: data[0].display_name };
        }
      }
      return null;
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  const searchLocation = async () => {
    if (!shopData) {
      setError("Aucune donnée de boutique disponible");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const { wilaya, commune, address } = shopData;
    const queries = [];
    if (wilaya && commune && address) queries.push({ q: `${wilaya}, ${commune}, ${address}, Algérie`, zoom: 16 });
    if (wilaya && commune) queries.push({ q: `${wilaya}, ${commune}, Algérie`, zoom: 14 });
    if (wilaya && address) queries.push({ q: `${wilaya}, ${address}, Algérie`, zoom: 14 });
    if (wilaya) queries.push({ q: `${wilaya}, Algérie`, zoom: 10 });
    if (address) queries.push({ q: `${address}, Algérie`, zoom: 14 });
    if (!queries.length) {
      setError("Aucune information de localisation (wilaya, commune ou address)");
      setLoading(false);
      return;
    }
    for (const query of queries) {
      try {
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query.q)}&format=json&limit=1`;
        const response = await fetch(url, { headers: { 'User-Agent': 'ShopApp/1.0', 'Accept-Language': i18n.language || 'fr' } });
        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            const lat = parseFloat(data[0].lat);
            const lon = parseFloat(data[0].lon);
            setMapCenter([lat, lon]);
            setMarkerPosition([lat, lon]);
            setShopPosition({ lat, lng: lon });
            setZoomLevel(query.zoom);
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        continue;
      }
    }
    setError("Localisation non trouvée. Essayez la recherche manuelle.");
    setLoading(false);
  };

  const handleManualSearch = async () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    setError(null);
    const result = await geocodeManual(searchQuery);
    if (result) {
      setMapCenter([result.lat, result.lng]);
      setMarkerPosition([result.lat, result.lng]);
      setShopPosition({ lat: result.lat, lng: result.lng });
      setZoomLevel(15);
      setError(null);
    } else {
      setError("Adresse non trouvée. Essayez avec un nom de ville ou wilaya.");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!shopData) {
      setError("Aucune information commerciale disponible. Retournez à la vidéo.");
      setLoading(false);
    } else {
      searchLocation();
    }
  }, [shopData, i18n.language]);

  const handleGoBack = () => history.goBack();
  const handleMapStyleChange = (style) => setMapStyle(style);

  const formatSaleType = (type) => {
    if (!type) return 'Non spécifié';
    if (type === 'retail') return 'Vente au détail';
    if (type === 'wholesale') return 'Vente en gros';
    if (type === 'both') return 'Vente au détail et en gros';
    return type;
  };

  const handleCallOwner = () => { if (shopData?.mobile) window.location.href = `tel:${shopData.mobile}`; else alert('Numéro non disponible'); };
  const contactViaWhatsApp = () => { if (shopData?.mobile) { const url = `https://wa.me/${shopData.mobile.replace(/\D/g, '')}?text=${encodeURIComponent(`Bonjour ${shopData.proprietaire || ''}, je suis intéressé par vos produits.`)}`; window.open(url, '_blank'); } else alert('WhatsApp non disponible'); };

  if (!shopData && !loading) {
    return (
      <Container fluid className="map-page">
        <Card className="map-card text-center">
          <Card.Body>
            <h5>⚠️ Aucune information commerciale</h5>
            <p>Ce lien ne contient pas de données de boutique valide.</p>
            <Button variant="primary" onClick={handleGoBack}>Retour</Button>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  return (
    <div className="map-page" dir={isRTL ? "rtl" : "ltr"}>
      <Container fluid>
        <Row className="justify-content-center">
          <Col lg={10} xl={8}>
            {/* Cabecera con nombre de tienda */}
            <div className="shop-header">
              <h4><FaStore className="me-2" />{shopData?.nombretienda || 'Boutique'}</h4>
              <p>{formatSaleType(shopData?.typesVente)}</p>
            </div>

            {/* Información detallada en grid responsivo */}
            <Card className="map-card">
              <Card.Body>
                <div className="shop-info-grid">
                  {/* Propriétaire */}
                  <div className="shop-info-item">
                    <div className="shop-info-icon"><FaUser /></div>
                    <div className="shop-info-content">
                      <div className="shop-info-label">Propriétaire</div>
                      <div className="shop-info-value">{shopData?.proprietaire || 'Non spécifié'}</div>
                    </div>
                  </div>
                  {/* Type de vente */}
                  <div className="shop-info-item">
                    <div className="shop-info-icon"><FaStore /></div>
                    <div className="shop-info-content">
                      <div className="shop-info-label">Type de vente</div>
                      <div className="shop-info-value">{formatSaleType(shopData?.typesVente)}</div>
                    </div>
                  </div>
                  {/* Adresse */}
                  {(shopData?.address || shopData?.wilaya || shopData?.commune) && (
                    <div className="shop-info-item">
                      <div className="shop-info-icon"><FaMapMarkerAlt /></div>
                      <div className="shop-info-content">
                        <div className="shop-info-label">Adresse</div>
                        <div className="shop-info-value">
                          {shopData?.address || ''}
                          {shopData?.wilaya && `, ${shopData.wilaya}`}
                          {shopData?.commune && `, ${shopData.commune}`}
                        </div>
                      </div>
                    </div>
                  )}
                  {/* Présentation */}
                  {shopData?.presentacion && (
                    <div className="shop-info-item">
                      <div className="shop-info-icon"><FaIdCard /></div>
                      <div className="shop-info-content">
                        <div className="shop-info-label">Présentation</div>
                        <div className="shop-info-value">{shopData.presentacion}</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Botones de contacto */}
                {shopData?.mobile && (
                  <div className="contact-buttons">
                    <Button variant="success" className="contact-btn" onClick={handleCallOwner}>
                      <FaPhone /> Appeler
                    </Button>
                    <Button variant="success" className="contact-btn" style={{ backgroundColor: '#25D366', borderColor: '#25D366' }} onClick={contactViaWhatsApp}>
                      <FaWhatsapp /> WhatsApp
                    </Button>
                  </div>
                )}
              </Card.Body>
            </Card>

            {/* Tarjeta del mapa */}
            <Card className="map-card">
              <div className="map-card-header">
                <div className="map-title-row">
                  <div>
                    <div className="map-title"><FaGlobe /> Localisation</div>
                    <div className="map-subtitle">{shopData?.address || shopData?.wilaya || 'Adresse inconnue'}</div>
                  </div>
                  <div className="map-style-group">
                    {Object.keys(mapProviders).map(style => (
                      <Button key={style} size="sm" variant={mapStyle === style ? "primary" : "outline-secondary"} className="map-style-btn" onClick={() => handleMapStyleChange(style)}>
                        {mapProviders[style].name}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Barra de búsqueda manual */}
                <div className="map-search-wrapper">
                  <Form.Control
                    type="text"
                    placeholder="Rechercher une adresse, une ville, une wilaya..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleManualSearch()}
                    className="map-search-input"
                  />
                  <Button variant="primary" className="map-search-button" onClick={handleManualSearch} disabled={loading}>
                    <FaSearch />
                    <span className="d-none d-sm-inline ms-1"> Chercher</span>
                  </Button>
                </div>
                <small className="map-search-hint">Ex: Alger, 10 rue des Lilas, Centre commercial...</small>
              </div>

              <Card.Body className="p-0">
                {loading ? (
                  <div className="text-center py-5">
                    <Spinner animation="border" variant="primary" size="lg" />
                    <p className="mt-3">Recherche de localisation...</p>
                  </div>
                ) : error ? (
                  <Alert variant="warning" className="m-4">
                    <strong>Localisation non disponible</strong>
                    <p className="mb-0">{error}</p>
                  </Alert>
                ) : (
                  <>
                    <div className="map-container">
                      <MapContainer center={mapCenter} zoom={zoomLevel} style={{ height: '100%', width: '100%' }} scrollWheelZoom={true} key={`${mapStyle}-${mapCenter[0]}-${mapCenter[1]}`}>
                        <ChangeView center={mapCenter} zoom={zoomLevel} />
                        <TileLayer url={mapProviders[mapStyle].url} attribution={mapProviders[mapStyle].attribution} />
                        <Marker position={markerPosition} icon={ShopIcon}>
                          <Popup>
                            <div style={{ minWidth: '200px' }}>
                              <h6 className="fw-bold text-primary">{shopData?.nombretienda}</h6>
                              {shopData?.address && <div>🏠 {shopData.address}</div>}
                              {shopData?.wilaya && <div>📍 {shopData.wilaya}</div>}
                              {shopData?.commune && <div>🏘️ {shopData.commune}</div>}
                              {shopData?.mobile && (
                                <Button variant="success" size="sm" className="w-100 mt-2" onClick={contactViaWhatsApp}>
                                  <FaWhatsapp className="me-1" /> WhatsApp
                                </Button>
                              )}
                            </div>
                          </Popup>
                        </Marker>
                      </MapContainer>
                    </div>
                    <DistanceCalculator shopPosition={shopPosition} />
                  </>
                )}
              </Card.Body>

              <div className="map-footer">
                <div className="map-footer-note">Données issues de l'annonce vidéo</div>
                <div className="map-footer-buttons">
                  <Button variant="outline-secondary" size="sm" onClick={searchLocation} disabled={loading}>
                    <FaSyncAlt className="me-1" /> Actualiser
                  </Button>
                  <Button variant="outline-primary" size="sm" onClick={handleGoBack}>
                    Retour
                  </Button>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Map;