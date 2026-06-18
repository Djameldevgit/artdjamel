import React, { useState, useEffect, useRef } from 'react';
import { Button, Form, Spinner, Card, Badge } from 'react-bootstrap';
import { MusicNote, Play, Pause, VolumeUp, Trash, Search, Check } from 'react-bootstrap-icons';
import { audioUpload } from '../../utils/imageUpload';

const StepMusicSelection = ({ wizardData, updateData }) => {
  const [musicLibrary, setMusicLibrary] = useState([]);
  const [loading, setLoading] = useState(false);
  const [playingTrackId, setPlayingTrackId] = useState(null);
  const [currentAudio, setCurrentAudio] = useState(null);
  const [searchTerm, setSearchTerm] = useState('arab');
  const [uploadingTrackId, setUploadingTrackId] = useState(null);
  const [audioError, setAudioError] = useState(null);

  // Limpiar audio al desmontar
  useEffect(() => {
    return () => {
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.src = '';
      }
    };
  }, [currentAudio]);

  const searchMusic = async () => {
    if (!searchTerm.trim()) return;
    setLoading(true);
    setAudioError(null);
    try {
      const res = await fetch(`/api/music?q=${encodeURIComponent(searchTerm)}&limit=20`);
      const data = await res.json();
      console.log("🎵 Datos recibidos del API:", data);
      const tracks = data.hits || [];
      setMusicLibrary(tracks);
      if (tracks.length === 0) {
        setAudioError(`Aucun résultat pour "${searchTerm}"`);
      }
    } catch (error) {
      console.error("Error en búsqueda:", error);
      setAudioError("Erreur de recherche");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    searchMusic();
  }, []);

  const stopAllAudio = () => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      setCurrentAudio(null);
      setPlayingTrackId(null);
    }
  };

  // ✅ Obtener URL de audio correcta (sin proxy para Cloudinary)
  const getAudioUrl = (track) => {
    const audioUrl = track.audio;
    if (!audioUrl) return null;
    
    // Si ya es de Cloudinary, usarla directamente
    if (audioUrl.includes('cloudinary.com')) {
      console.log('🎵 Usando URL directa de Cloudinary');
      return audioUrl;
    }
    
    // Si es de Jamendo, usar proxy
    if (audioUrl.includes('jamendo.com')) {
      return `/api/music/proxy?url=${encodeURIComponent(audioUrl)}`;
    }
    
    // Fallback al proxy
    return `/api/music/proxy?url=${encodeURIComponent(audioUrl)}`;
  };

  const handlePreview = async (track, e) => {
    e.stopPropagation();
    
    if (playingTrackId === track.id && currentAudio) {
      stopAllAudio();
      return;
    }
    
    stopAllAudio();
    
    const audioUrl = getAudioUrl(track);
    if (!audioUrl) {
      setAudioError(`No hay URL de audio para "${getTrackTitle(track)}"`);
      return;
    }
    
    console.log(`🎵 Reproduciendo: ${audioUrl.substring(0, 100)}...`);
    
    const audio = new Audio();
    
    // Timeout para evitar congelamiento
    const timeoutId = setTimeout(() => {
      if (audio.readyState === 0) {
        audio.pause();
        audio.src = '';
        setAudioError(`Tiempo de espera agotado para "${getTrackTitle(track)}"`);
        setPlayingTrackId(null);
        setCurrentAudio(null);
      }
    }, 10000);
    
    audio.oncanplay = () => {
      clearTimeout(timeoutId);
      audio.play().catch(err => {
        console.error("Error play:", err);
        setAudioError(`Error al reproducir: ${getTrackTitle(track)}`);
        setPlayingTrackId(null);
        setCurrentAudio(null);
      });
    };
    
    audio.onended = () => {
      clearTimeout(timeoutId);
      setPlayingTrackId(null);
      setCurrentAudio(null);
    };
    
    audio.onerror = (err) => {
      clearTimeout(timeoutId);
      console.error("Error al cargar audio:", err);
      setAudioError(`No se pudo cargar "${getTrackTitle(track)}"`);
      setPlayingTrackId(null);
      setCurrentAudio(null);
    };
    
    audio.src = audioUrl;
    setCurrentAudio(audio);
    setPlayingTrackId(track.id);
  };

// Modifica handleSelectTrack para que siempre tenga audioPublicId
// StepMusicSelection.js - Mejorar handleSelectTrack
const handleSelectTrack = async (track) => {
  if (uploadingTrackId === track.id) return;
  
  stopAllAudio();
  setUploadingTrackId(track.id);
  setAudioError(null);
  
  try {
      const trackTitle = track.title || track.name;
      const trackArtist = track.user || track.artist_name || "Artiste inconnu";
      
      console.log("🎵 PROCESANDO MÚSICA:", trackTitle);
      
      // ✅ Verificar si ya tenemos esta música en caché (evita re-subir)
      const cachedMusic = localStorage.getItem(`music_${track.id}`);
      if (cachedMusic && wizardData.selectedMusic?.id !== track.id) {
          console.log("📦 Usando música en caché");
          const parsed = JSON.parse(cachedMusic);
          updateData({ selectedMusic: parsed });
          setUploadingTrackId(null);
          return;
      }
      
      // ✅ Obtener URL del audio
      let audioUrlToUpload = track.audio;
      if (track.audio && track.audio.includes('jamendo.com')) {
          audioUrlToUpload = `/api/music/proxy?url=${encodeURIComponent(track.audio)}`;
      }
      
      console.log("🎵 URL a usar:", audioUrlToUpload);
      
      // ✅ Probar si el audio existe antes de subir
      const testResponse = await fetch(audioUrlToUpload, { method: 'HEAD' });
      if (!testResponse.ok) {
          throw new Error(`Audio no accesible: ${testResponse.status}`);
      }
      console.log("✅ Audio accesible");
      
      // ✅ Subir a Cloudinary con progreso
      let lastProgress = 0;
      const result = await audioUpload(audioUrlToUpload, (progress) => {
          if (progress !== lastProgress) {
              console.log(`📤 Upload: ${progress}%`);
              lastProgress = progress;
          }
      });
      
      if (!result || !result.public_id) {
          throw new Error("No se obtuvo public_id de Cloudinary");
      }
      
      const musicData = {
          id: track.id,
          title: trackTitle,
          artist: trackArtist,
          audioUrl: result.url,
          audioPublicId: result.public_id,
          duration: track.duration,
          volume: wizardData.musicVolume || 70
      };
      
      // ✅ Guardar en caché para futuras ediciones
      localStorage.setItem(`music_${track.id}`, JSON.stringify(musicData));
      
      console.log("✅ Música lista:", {
          title: musicData.title,
          audioPublicId: musicData.audioPublicId
      });
      
      updateData({ selectedMusic: musicData });
      
  } catch (error) {
      console.error("❌ Error detallado:", error);
      setAudioError(`${error.message}. Intenta con otra canción.`);
  } finally {
      setUploadingTrackId(null);
  }
};
  const handleRemoveMusic = () => {
    stopAllAudio();
    updateData({ selectedMusic: null });
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseInt(e.target.value);
    updateData({ musicVolume: newVolume });
    if (currentAudio) {
      currentAudio.volume = newVolume / 100;
    }
  };

  const getTrackTitle = (track) => track.title || track.name || "Sans titre";
  const getTrackArtist = (track) => track.user || track.artist_name || "Artiste inconnu";

  return (
    <div style={{ padding: '16px', color: '#ffffff' }}>
      <h5 style={{ marginBottom: '16px', color: '#ffffff' }}>🎵 Ajouter une musique</h5>

      {/* Música seleccionada */}
      {wizardData.selectedMusic && (
        <Card style={{ marginBottom: '16px', background: 'rgba(0,0,0,0.5)', border: '1px solid #667eea', color: '#ffffff' }}>
          <Card.Body>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <MusicNote style={{ marginRight: '8px' }} />
                <strong style={{ color: '#ffffff' }}>{wizardData.selectedMusic.title}</strong>
                <small style={{ marginLeft: '8px', color: '#aaaaaa' }}>
                  - {wizardData.selectedMusic.artist || "Artiste inconnu"}
                </small>
                {wizardData.selectedMusic.audioPublicId && (
                  <Badge bg="success" style={{ marginLeft: '8px' }}>✓ Prêt</Badge>
                )}
              </div>
              <Button variant="outline-danger" size="sm" onClick={handleRemoveMusic}>
                <Trash size={16} /> Retirer
              </Button>
            </div>
            <div style={{ marginTop: '8px' }}>
              <small style={{ color: '#cccccc' }}>Volume: {wizardData.musicVolume}%</small>
              <input
                type="range"
                className="form-range mt-1"
                value={wizardData.musicVolume}
                onChange={handleVolumeChange}
                min="0"
                max="100"
                style={{ width: '100%' }}
              />
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Buscador */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <Form.Control
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Rechercher titre, artiste..."
          onKeyPress={(e) => e.key === 'Enter' && searchMusic()}
          style={{ 
            background: 'rgba(255,255,255,0.1)', 
            border: 'none', 
            color: '#ffffff',
            borderRadius: '30px'
          }}
        />
        <Button onClick={searchMusic} variant="primary" disabled={loading} style={{ borderRadius: '30px' }}>
          {loading ? <Spinner size="sm" /> : <Search />}
        </Button>
      </div>

      {audioError && (
        <div className="alert alert-warning small" style={{ color: '#856404' }}>{audioError}</div>
      )}

      {/* Resultados */}
      <div style={{ 
        maxHeight: '400px', 
        overflowY: 'auto', 
        borderRadius: '16px', 
        background: '#1a1a2e',
        border: '1px solid #333' 
      }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#ffffff' }}>
            <Spinner />
          </div>
        ) : musicLibrary.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#aaaaaa' }}>
            Aucune musique trouvée
          </div>
        ) : (
          musicLibrary.map(track => (
            <div
              key={track.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 16px',
                borderBottom: '1px solid #333',
                background: wizardData.selectedMusic?.id === track.id ? '#2a2a3e' : 'transparent',
                borderLeft: wizardData.selectedMusic?.id === track.id ? '3px solid #ffd700' : 'none'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                <MusicNote style={{ color: '#667eea', fontSize: '24px' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    fontWeight: 'bold', 
                    fontSize: '16px', 
                    color: '#ffffff',
                    marginBottom: '4px'
                  }}>
                    {getTrackTitle(track)}
                  </div>
                  <div style={{ 
                    fontSize: '13px', 
                    color: '#bbbbbb'
                  }}>
                    {getTrackArtist(track)} • {Math.floor(track.duration / 60)}:{String(Math.floor(track.duration % 60)).padStart(2, '0')}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Button
                  variant={playingTrackId === track.id ? "danger" : "secondary"}
                  size="sm"
                  onClick={(e) => handlePreview(track, e)}
                  title="Écouter un extrait"
                  disabled={!track.audio}
                  style={{ borderRadius: '50%', width: '32px', height: '32px' }}
                >
                  {playingTrackId === track.id ? <Pause size={14} /> : <Play size={14} />}
                </Button>
                <Button
                  variant="success"
                  size="sm"
                  onClick={() => handleSelectTrack(track)}
                  disabled={uploadingTrackId === track.id || wizardData.selectedMusic?.id === track.id}
                  style={{ borderRadius: '20px', fontSize: '12px' }}
                >
                  {uploadingTrackId === track.id ? (
                    <Spinner size="sm" />
                  ) : wizardData.selectedMusic?.id === track.id ? (
                    <><Check size={14} style={{ marginRight: '4px' }} /> Sélectionnée</>
                  ) : (
                    'Sélectionner'
                  )}
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default StepMusicSelection;