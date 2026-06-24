import { useEffect, useRef, useState } from 'react';
import { BrowserRouter as Router, Switch, Route, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import Login from './pages/login';
import Register from './pages/register';
import { refreshToken } from './redux/actions/authAction';
import io from 'socket.io-client';
import { GLOBALTYPES } from './redux/actions/globalTypes';
import SocketClient from './SocketClient';
import Home from './pages/home';
 
import NotFound from './pages/NotFound';
import CategoryPage from './pages/category/CategoryPage';
import Navbar2 from './components/header/Navbar2';
import DashboardPage from './pages/users/dashboardpage';
import profile from './pages/users/profile';
 
import ProfileSettings from './pages/users/ProfileSettings';
import Bloqueos404 from './components/adminitration/Bloqueos404';
 
import NotifyPage from './pages/notiy/NotifyPage';
import EditVideoWizard from './pages/video/EditVideoWizard';
import usePushNotifications from './pages/notiy/UsePushNotifications';
import InfoUserVideo from './pages/video/userVideo/InfoUserVideo';
import TrendingVideos from './pages/video/TrendingVideos';
 
import Conversation from './pages/message/[id]';
import Message from './pages/message/index';
 
import Map from './pages/Map';
import UserProInfoPlans from './pages/userProInfoPlans';
import PaymentRequest from './pages/PaymentRequest';
 
import PaymentSuccess from './pages/userProo/PaymentSuccess';
 
 
import CreateArtworkWizard from './pages/video/CreateArtWorkWizard';
import DetailArtworkPage from './pages/video/DetailArtworkPage';
import Cart from './pages/Cart';
import AdminOrders from './components/orders/AdminOrders';
import UserOrders from './components/orders/UserOrders';
import Roless from './components/Roless';
 
 
let audioElement = null;
let audioUnlocked = false;

const initAudio = () => {
  if (!audioElement) {
    audioElement = new Audio('/sounds/notify.mp3');
    audioElement.preload = 'auto';
    audioElement.load();
    console.log('🔊 Audio inicializado');
  }
};

const forceUnlockAudio = () => {
  if (audioUnlocked || !audioElement) return;

  try {
    audioElement.volume = 0;
    const promise = audioElement.play();
    if (promise !== undefined) {
      promise.then(() => {
        audioElement.pause();
        audioElement.currentTime = 0;
        audioElement.volume = 0.8;
        audioUnlocked = true;
        console.log('✅ Audio desbloqueado correctamente');
      }).catch((err) => {
        console.log('⚠️ No se pudo desbloquear audio:', err);
      });
    }
  } catch (error) {
    console.log('⚠️ Error desbloqueando audio:', error);
  }
};

const playSound = () => {
  if (!audioElement) return;

  if (!audioUnlocked) {
    forceUnlockAudio();
  }

  try {
    audioElement.currentTime = 0;
    audioElement.volume = 0.8;
    audioElement.play().catch(err => {
      console.log('⚠️ Error reproduciendo:', err);
      if (err.name === 'NotAllowedError') {
        audioElement.volume = 0;
        audioElement.play().then(() => {
          audioElement.pause();
          audioElement.volume = 0.8;
        }).catch(() => { });
      }
    });
  } catch (error) {
    console.warn('Sonido no soportado:', error);
  }
};

const vibratePhone = (pattern = [300, 100, 300]) => {
  if ('vibrate' in navigator && navigator.vibrate) {
    navigator.vibrate(pattern);
    console.log('📳 Vibración');
  }
};

function AppContent() {
  const { auth, notify } = useSelector(state => state);
  const dispatch = useDispatch();
  const [isReady, setIsReady] = useState(false);
  const lastNotifyId = useRef(null);
  const { sendLocalNotification, isPWAInstalled } = usePushNotifications();
  const location = useLocation();

  // ✅ ============================================
  // ✅ VERIFICACIÓN DE PLAN DESPUÉS DE PAGO
  // ✅ ============================================
  

  
  useEffect(() => {
    initAudio();
    setIsReady(true);
  }, []);

  // ✅ Detectar interacción del usuario para desbloquear audio
  useEffect(() => {
    const handleInteraction = () => {
      if (!audioUnlocked) {
        forceUnlockAudio();
      }
    };

    window.addEventListener('click', handleInteraction);
    window.addEventListener('touchstart', handleInteraction);

    return () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
    };
  }, []);

  // ✅ Solicitar permiso de notificación
  useEffect(() => {
    const requestPermission = () => {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    };

    window.addEventListener('click', requestPermission);
    window.addEventListener('touchstart', requestPermission);

    return () => {
      window.removeEventListener('click', requestPermission);
      window.removeEventListener('touchstart', requestPermission);
    };
  }, []);

  // ✅ Socket
  useEffect(() => {
    dispatch(refreshToken());

    const socket = io();
    dispatch({ type: GLOBALTYPES.SOCKET, payload: socket });

    return () => socket.close();
  }, [dispatch]);

  // ✅ NOTIFICACIONES
  useEffect(() => {
    if (!notify.data || notify.data.length === 0 || !isReady) return;

    const latest = notify.data[0];

    if (latest._id !== lastNotifyId.current) {
      lastNotifyId.current = latest._id;

      const title = latest.text || 'Nouvelle notification';
      const body = latest.content || `${latest.user?.username || 'Quelqu\'un'} a interagi`;
      const icon = latest.image || latest.user?.avatar || '/icon-web-01.png';
      const url = latest.url || '/';

      if (isPWAInstalled && 'serviceWorker' in navigator) {
        sendLocalNotification(title, body, url, icon);
      }

      console.log('🔔 Notificación recibida, reproduciendo sonido...');
      playSound();
      vibratePhone([200, 100, 200]);

      if (Notification.permission === 'granted' && !isPWAInstalled) {
        try {
          const notificationOptions = {
            body: body,
            icon: icon,
            badge: icon,
            requireInteraction: true,
            tag: `notify-${latest._id}`,
            silent: false
          };

          const notification = new Notification(title, notificationOptions);

          notification.onclick = () => {
            window.focus();
            if (url) window.location.href = url;
          };

          notification.onerror = (err) => {
            console.log('❌ Error en notificación:', err);
          };

        } catch (notifError) {
          console.log('⚠️ Error creando notificación:', notifError.message);
        }
      }
    }
  }, [notify.data, isReady, isPWAInstalled, sendLocalNotification]);

  // ✅ Navbar
  const shouldShowNavbar = (pathname) => {
    const explicitRoutes = [
      '/',
      '/register',
      '/login',
      '/bloqueos404',
      '/notify',
      '/create-video-page',
      '/admindashboard',
      '/admin/posts',
      '/message',
      '/profile/settings',
      '/users/dashboard',
      '/users/roles',
      '/donation',
      '/planes',
      '/userproinfoplans'
     
      
   
    ];

    const prefixes = [
      '/edit-video/',
      '/video/',
      '/videos/trending',
      '/create-image-page',
      '/edit-image/',
      '/message/',
      '/profile/',
      '/donation/',
      '/userproinfoplans'
       
    
    ];

    if (explicitRoutes.includes(pathname)) return true;
    if (prefixes.some(prefix => pathname.startsWith(prefix))) return true;

    return false;
  };

  if (auth.token && auth.user?.isBlocked) {
    return (
      <Router>
        <Route exact path="/bloqueos404" component={Bloqueos404} />
        <Route path="*" component={Bloqueos404} />
      </Router>
    );
  }

  return (
    <div className="App">
      {shouldShowNavbar(location.pathname) && <Navbar2 />}

      <div id="google_translate_element" style={{ display: 'none' }} />
      {auth.token && <SocketClient />}

      <Switch>
        <Route exact path="/" component={Home} />
        <Route exact path="/register" component={Register} />
        <Route exact path="/login" component={Login} />
        <Route exact path="/bloqueos404" component={Bloqueos404} />
        <Route exact path="/notify" component={NotifyPage} />
        <Route exact path="/create-video-page" component={CreateArtworkWizard} />
        <Route path="/edit-video/:id" component={EditVideoWizard} />
        <Route exact path="/video/:id" component={DetailArtworkPage} />
        <Route exact path="/video/userVideo/:userId/info" component={InfoUserVideo} />
        <Route exact path="/videos/trending" component={TrendingVideos} />
        <Route exact path="/adminorders" component={AdminOrders} />
        <Route exact path="/adminorders" component={UserOrders} />
        <Route exact path="/cart" component={Cart} />
 
        <Route exact path="/map" component={Map} />
       
        <Route exact path="/message" component={Message} />
        <Route exact path="/message/:id" component={Conversation} />
        <Route exact path="/profile/settings" component={ProfileSettings} />
        <Route exact path="/users/dashboard" component={DashboardPage} />
        <Route exact path="/profile/:id" component={profile} />
        <Route exact path="/users/roles" component={Roless} />
   
        <Route exact path="/userpropayment" component={PaymentRequest} />
        <Route exact path="/userproinfoplans" component={UserProInfoPlans} />
        <Route path="/payment-success" component={PaymentSuccess} />
        
         <Route exact path="/:slug/:page?" component={CategoryPage} />
        <Route exact path="/:slug/:subSlug/:page?" component={CategoryPage} />
        <Route exact path="/:slug/:subSlug/:articleSlug/:page?" component={CategoryPage} />
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;