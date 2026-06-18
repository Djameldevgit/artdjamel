// src/hooks/useUserPlan.js
import { useSelector } from 'react-redux';

const useUserPlan = () => {
  const { auth } = useSelector(state => state);
  const user = auth?.user;
  
  // Determinar si el usuario tiene un plan de pago activo (basic, pro, business)
  const isPaidUser = user?.role === 'userpro' && user?.channelPlan && user?.channelPlan !== 'free';
  const hasPaidPlanActive = isPaidUser && (!user?.channelPlanExpiresAt || new Date(user.channelPlanExpiresAt) > new Date());
  
  // Determinar si está en período de prueba (trial)
  const isTrialActive = user?.trialUsed === true && user?.trialEndDate && new Date(user.trialEndDate) > new Date();
  
  // El plan actual: 'free' (trial), 'basic', 'pro', 'business'
  const getCurrentPlan = () => {
    if (!user) return 'free';
    if (hasPaidPlanActive) return user.channelPlan; // basic, pro, business
    if (isTrialActive) return 'free';
    // Si no tiene trial activo ni plan de pago, se considera sin plan (no puede crear canales)
    return 'none';
  };
  
  // Nombre del plan
  const getPlanName = () => {
    const plan = getCurrentPlan();
    const names = {
      'none': 'Aucun plan',
      'free': 'Essai 5 jours',
      'basic': 'Basic',
      'pro': 'Pro',
      'business': 'Business'
    };
    return names[plan] || 'Essai 5 jours';
  };
  
  // Color del plan
  const getPlanColor = () => {
    const plan = getCurrentPlan();
    const colors = {
      'none': '#6c757d',
      'free': '#10b981',
      'basic': '#667eea',
      'pro': '#f093fb',
      'business': '#f6b93b'
    };
    return colors[plan] || '#10b981';
  };
  
  // Icono del plan
  const getPlanIcon = () => {
    const plan = getCurrentPlan();
    const icons = {
      'none': '❌',
      'free': '🎁',
      'basic': '⭐',
      'pro': '🚀',
      'business': '👑'
    };
    return icons[plan] || '🎁';
  };
  
  // Límites según el plan (trial o de pago)
  const getPlanLimits = () => {
    const plan = getCurrentPlan();
    const limits = {
      none: {
        maxChannels: 0,
        maxVideos: 0,
        maxDuration: 0,
        maxStorage: 0,
        canUpload: false,
        canComment: false,
        canLike: false,
        canShare: false,
        canAddMusic: false,
        canAccessAnalytics: false,
        canDownload: false
      },
      free: { // plan de prueba (trial)
        maxChannels: 1,
        maxVideos: 1,
        maxDuration: 20,
        maxStorage: 10,
        canUpload: true,
        canComment: true,
        canLike: true,
        canShare: true,
        canAddMusic: false,
        canAccessAnalytics: false,
        canDownload: false
      },
      basic: {
        maxChannels: 3,
        maxVideos: 50,
        maxDuration: 40,
        maxStorage: 50,
        canUpload: true,
        canComment: true,
        canLike: true,
        canShare: true,
        canCreatePlaylist: true,
        canAddMusic: false,
        canAccessAnalytics: false,
        canDownload: false
      },
      pro: {
        maxChannels: 7,
        maxVideos: 200,
        maxDuration: 60,
        maxStorage: 500,
        canUpload: true,
        canComment: true,
        canLike: true,
        canShare: true,
        canCreatePlaylist: true,
        canDownload: true,
        canAddMusic: true,
        canAccessAnalytics: true
      },
      business: {
        maxChannels: 15,
        maxVideos: 'unlimited',
        maxDuration: 120,
        maxStorage: 2048,
        canUpload: true,
        canComment: true,
        canLike: true,
        canShare: true,
        canCreatePlaylist: true,
        canDownload: true,
        canAddMusic: true,
        canPromote: true,
        canAccessAnalytics: true
      }
    };
    return limits[plan] || limits.free;
  };
  
  // Es usuario con plan de pago (no trial)
  const isUserPro = hasPaidPlanActive;
  
  // Verificar si el plan de pago está activo (para mostrar caducidad)
  const hasActivePlan = () => {
    if (!isUserPro) return false;
    if (!user?.channelPlanExpiresAt) return true;
    return new Date(user.channelPlanExpiresAt) > new Date();
  };
  
  // Verificar si el plan de pago ha expirado
  const isExpired = () => {
    if (!isUserPro) return false;
    if (!user?.channelPlanExpiresAt) return false;
    return new Date(user.channelPlanExpiresAt) < new Date();
  };
  
  // Días restantes (para plan de pago o trial)
  const getDaysRemaining = () => {
    const plan = getCurrentPlan();
    if (plan === 'free' && isTrialActive && user?.trialEndDate) {
      const diff = new Date(user.trialEndDate) - new Date();
      return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    }
    if (isUserPro && user?.channelPlanExpiresAt) {
      const diff = new Date(user.channelPlanExpiresAt) - new Date();
      return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    }
    return 0;
  };
  
  // Verificar si puede crear un nuevo canal (según límites y si está en trial o plan de pago)
  const canCreateChannel = (currentChannelCount) => {
    const limits = getPlanLimits();
    if (limits.maxChannels === 'unlimited') return true;
    return currentChannelCount < limits.maxChannels;
  };
  
  // Verificar si puede subir un video
  const canUploadVideo = (currentVideoCount) => {
    const limits = getPlanLimits();
    if (limits.maxVideos === 'unlimited') return true;
    return currentVideoCount < limits.maxVideos;
  };
  
  // Verificar si el video cumple duración máxima
  const isValidDuration = (durationInSeconds) => {
    const limits = getPlanLimits();
    return durationInSeconds <= limits.maxDuration;
  };
  
  // Verificar si tiene una acción específica disponible
  const hasAction = (action) => {
    const limits = getPlanLimits();
    return limits[action] === true;
  };
  
  return {
    currentPlan: getCurrentPlan(),
    planName: getPlanName(),
    planColor: getPlanColor(),
    planIcon: getPlanIcon(),
    planLimits: getPlanLimits(),
    isUserPro,
    hasActivePlan: hasActivePlan(),
    isExpired: isExpired(),
    getDaysRemaining,
    canCreateChannel,
    canUploadVideo,
    isValidDuration,
    hasAction,
    user,
    isTrialActive // adicional por si se necesita
  };
};

export default useUserPlan;