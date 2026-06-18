// frontend/src/redux/reducers/channelReducer.js

import { CHANNEL_TYPES } from '../actions/channelAction';

const initialState = {
  // Canal actual
  channel: null,
  
  // Lista de canales del usuario (para MisChannel)
  userChannels: [],
  
  // Alias para compatibilidad
  channels: [],
  
  // Videos del canal actual
  videos: [],
  totalVideos: 0,
  hasMore: false,
  
  // Videos paginados del canal
  channelVideos: {
    videos: [],
    total: 0,
    page: 1,
    totalPages: 1,
    hasMore: false
  },
  
  // Seguidores del canal
  followers: [],
  
  // ✅ CRÍTICO: Canales que sigue el usuario (array de IDs)
  followingChannels: [],
  
  // Estadísticas del canal
  channelStats: null,
  
  // Feed de videos del canal
  feedVideos: {
    videos: [],
    total: 0,
    page: 1,
    hasMore: false
  },
  
  // Canales pendientes (solo admin)
  pendingChannels: {
    channels: [],
    total: 0,
    page: 1,
    totalPages: 1,
    loading: false,
    error: null
  },
  
  // Estados de carga
  loading: false,
  feedLoading: false,
  contactInfo: null,
  isBlocked: false,
  
  // Errores
  error: null,
  pendingChannel: null,
  pendingLoading: false,
  approvedChannels: {
    channels: [],
    total: 0,
    page: 1,
    totalPages: 1,
    hasMore: false,
    loading: false,
    error: null
},



};

// ✅ FUNCIÓN HELPER PARA EXTRAER URL DE IMAGEN
const extractImageUrl = (imageData) => {
  if (!imageData) return '';
  if (typeof imageData === 'string') return imageData;
  if (Array.isArray(imageData) && imageData.length > 0) {
    return imageData[0]?.url || '';
  }
  if (imageData?.url) return imageData.url;
  return '';
};

// ✅ FUNCIÓN PARA NORMALIZAR UN CANAL
const normalizeChannel = (channel) => {
  if (!channel) return null;
  
  return {
    ...channel,
    avatar: extractImageUrl(channel.avatar),
    cover: extractImageUrl(channel.cover),
    phone: channel.phone || '',
    email: channel.email || '',
    website: channel.website || '',
    wilaya: channel.wilaya || '',
    commune: channel.commune || '',
    activity: channel.activity || '',
    description: channel.description || '',
    pending: channel.pending || false,
    isActive: channel.isActive !== false,
    isVerified: channel.isVerified || false,
    followersCount: channel.followersCount || 0,
    totalVideos: channel.totalVideos || 0,
    totalViews: channel.totalViews || 0,
    totalLikes: channel.totalLikes || 0,
    isFollowing: channel.isFollowing || false,
    // ✅ Nuevos campos para canales rechazados
    status: channel.status || (channel.pending ? 'pending' : channel.isActive ? 'approved' : 'rejected'),
    rejectionReason: channel.rejectionReason || '',
    rejectedAt: channel.rejectedAt || null,
    rejectedBy: channel.rejectedBy || null,
    resubmittedAt: channel.resubmittedAt || null,
    resubmittedCount: channel.resubmittedCount || 0
  };
};

// ✅ FUNCIÓN PARA NORMALIZAR LISTA DE CANALES
const normalizeChannels = (channels) => {
  if (!Array.isArray(channels)) return [];
  return channels.map(ch => normalizeChannel(ch));
};

const channelReducer = (state = initialState, action) => {
  switch (action.type) {
    
    // ==================== LOADING STATES ====================
    case CHANNEL_TYPES.CHANNEL_LOADING:
      return { ...state, loading: action.payload };
    
    case CHANNEL_TYPES.CHANNEL_FEED_LOADING:
      return { ...state, feedLoading: action.payload };
    
    // ==================== CREAR CANAL ====================
    case CHANNEL_TYPES.CREATE_CHANNEL_REQUEST:
      return { ...state, loading: true, error: null };
    
    case CHANNEL_TYPES.CREATE_CHANNEL_SUCCESS:
      const normalizedNewChannel = normalizeChannel(action.payload);
      return {
        ...state,
        loading: false,
        userChannels: [normalizedNewChannel, ...normalizeChannels(state.userChannels)],
        channels: [normalizedNewChannel, ...normalizeChannels(state.channels)],
        error: null
      };
    
    case CHANNEL_TYPES.CREATE_CHANNEL_FAIL:
      return { ...state, loading: false, error: action.payload };
    
    // ==================== OBTENER CANAL ACTUAL ====================
    case CHANNEL_TYPES.GET_CHANNEL:
      const payloadData = action.payload;
      
      const extractUrl = (data) => {
        if (!data) return '';
        if (typeof data === 'string') return data;
        if (Array.isArray(data) && data.length > 0) return data[0]?.url || '';
        if (data.url) return data.url;
        return '';
      };
      
      return {
        ...state,
        channel: {
          ...payloadData,
          avatar: extractUrl(payloadData.avatar),
          cover: extractUrl(payloadData.cover),
          wilaya: payloadData?.wilaya || '',
          commune: payloadData?.commune || '',
          email: payloadData?.email || '',
          phone: payloadData?.phone || '',
          website: payloadData?.website || '',
          activity: payloadData?.activity || '',
          description: payloadData?.description || '',
          followersCount: payloadData?.followersCount || 0,
          isFollowing: payloadData?.isFollowing || false,
          status: payloadData?.status || (payloadData?.pending ? 'pending' : 'approved'),
          rejectionReason: payloadData?.rejectionReason || ''
        },
        loading: false,
        error: null
      };
    
    case CHANNEL_TYPES.CLEAR_CHANNEL:
      return { ...state, channel: null };
    
    // ==================== OBTENER CANALES DEL USUARIO ====================
    case CHANNEL_TYPES.GET_USER_CHANNELS:
      const normalizedUserChannels = normalizeChannels(action.payload);
      return {
        ...state,
        userChannels: normalizedUserChannels,
        channels: normalizedUserChannels,
        loading: false,
        error: null
      };
    
    // ==================== ACTUALIZAR CANAL ====================
    case CHANNEL_TYPES.UPDATE_CHANNEL:
      const updatedNormalizedChannel = normalizeChannel(action.payload);
      
      return {
        ...state,
        channel: state.channel?._id === updatedNormalizedChannel._id
          ? updatedNormalizedChannel
          : state.channel,
        userChannels: normalizeChannels(state.userChannels.map(ch => 
          ch._id === updatedNormalizedChannel._id ? updatedNormalizedChannel : ch
        )),
        channels: normalizeChannels(state.channels.map(ch => 
          ch._id === updatedNormalizedChannel._id ? updatedNormalizedChannel : ch
        )),
        error: null
      };
    
    // ==================== VIDEOS DEL CANAL ====================
    case CHANNEL_TYPES.GET_CHANNEL_VIDEOS:
      return {
        ...state,
        videos: action.payload.videos || [],
        totalVideos: action.payload.total || 0,
        hasMore: action.payload.hasMore || false,
        channelVideos: {
          videos: action.payload.videos || [],
          total: action.payload.total || 0,
          page: action.payload.page || 1,
          totalPages: action.payload.totalPages || 1,
          hasMore: action.payload.hasMore || false
        },
        loading: false
      };
    
    case CHANNEL_TYPES.CLEAR_CHANNEL_VIDEOS:
      return {
        ...state,
        channelVideos: {
          videos: [],
          total: 0,
          page: 1,
          totalPages: 1,
          hasMore: false
        }
      };
    
    // ==================== FEED DEL CANAL ====================
    case CHANNEL_TYPES.GET_CHANNEL_FEED_VIDEOS:
      const { page, videos  } = action.payload;
      return {
        ...state,
        feedVideos: {
          videos: page === 1 ? videos : [...state.feedVideos.videos, ...videos],
          total: total || 0,
          page: page || 1,
          hasMore: hasMore || false
        },
        feedLoading: false
      };
    
    case CHANNEL_TYPES.CLEAR_CHANNEL_FEED:
      return {
        ...state,
        feedVideos: {
          videos: [],
          total: 0,
          page: 1,
          hasMore: false
        }
      };
    
    // ==================== ✅ SEGUIR CANAL (FOLLOW) ====================
    case CHANNEL_TYPES.FOLLOW_CHANNEL:
      const { channelId: followId, followersCount: followCount } = action.payload;
      
      return {
        ...state,
        channel: state.channel && state.channel._id === followId ? {
          ...state.channel,
          followersCount: followCount,
          isFollowing: true
        } : state.channel,
        
        followingChannels: state.followingChannels.includes(followId)
          ? state.followingChannels
          : [...state.followingChannels, followId],
        
        userChannels: state.userChannels.map(ch =>
          ch._id === followId
            ? { ...ch, followersCount: followCount, isFollowing: true }
            : ch
        ),
        
        channels: state.channels.map(ch =>
          ch._id === followId
            ? { ...ch, followersCount: followCount, isFollowing: true }
            : ch
        ),
        
        pendingChannels: {
          ...state.pendingChannels,
          channels: state.pendingChannels.channels.map(ch =>
            ch._id === followId
              ? { ...ch, followersCount: followCount, isFollowing: true }
              : ch
          )
        }
      };
    
    // ==================== ✅ DEJAR DE SEGUIR CANAL (UNFOLLOW) ====================
    case CHANNEL_TYPES.UNFOLLOW_CHANNEL:
      const { channelId: unfollowId, followersCount: unfollowCount } = action.payload;
      
      return {
        ...state,
        channel: state.channel && state.channel._id === unfollowId ? {
          ...state.channel,
          followersCount: unfollowCount,
          isFollowing: false
        } : state.channel,
        
        followingChannels: state.followingChannels.filter(id => id !== unfollowId),
        
        userChannels: state.userChannels.map(ch =>
          ch._id === unfollowId
            ? { ...ch, followersCount: unfollowCount, isFollowing: false }
            : ch
        ),
        
        channels: state.channels.map(ch =>
          ch._id === unfollowId
            ? { ...ch, followersCount: unfollowCount, isFollowing: false }
            : ch
        ),
        
        pendingChannels: {
          ...state.pendingChannels,
          channels: state.pendingChannels.channels.map(ch =>
            ch._id === unfollowId
              ? { ...ch, followersCount: unfollowCount, isFollowing: false }
              : ch
          )
        }
      };
    
    // ==================== ✅ ACTUALIZAR ESTADO DE FOLLOW (UNIVERSAL) ====================
    case CHANNEL_TYPES.UPDATE_CHANNEL_FOLLOW_STATUS:
      const { isFollowing, followersCount: newFollowersCount } = action.payload;
      const currentChannelId = state.channel?._id;
      
      if (!currentChannelId) return state;
      
      return {
        ...state,
        channel: state.channel ? {
          ...state.channel,
          isFollowing: isFollowing,
          followersCount: newFollowersCount
        } : state.channel,
        
        followingChannels: isFollowing
          ? (state.followingChannels.includes(currentChannelId) 
              ? state.followingChannels 
              : [...state.followingChannels, currentChannelId])
          : state.followingChannels.filter(id => id !== currentChannelId),
        
        userChannels: state.userChannels.map(ch =>
          ch._id === currentChannelId
            ? { ...ch, isFollowing: isFollowing, followersCount: newFollowersCount }
            : ch
        ),
        
        channels: state.channels.map(ch =>
          ch._id === currentChannelId
            ? { ...ch, isFollowing: isFollowing, followersCount: newFollowersCount }
            : ch
        )
      };
    
    // ==================== SEGUIDORES ====================
    case CHANNEL_TYPES.GET_CHANNEL_FOLLOWERS:
      return {
        ...state,
        followers: action.payload || [],
        loading: false
      };
    
    case CHANNEL_TYPES.GET_USER_FOLLOWING_CHANNELS:
      const followingList = action.payload || [];
      const followingIds = followingList.map(ch => ch._id || ch);
      
      return {
        ...state,
        followingChannels: followingIds,
        loading: false
      };
    
    // ==================== ESTADÍSTICAS ====================
    case CHANNEL_TYPES.CHANNEL_STATS:
      return {
        ...state,
        channelStats: action.payload,
        loading: false
      };
    
    case CHANNEL_TYPES.REGISTER_CHANNEL_VIEW:
      return {
        ...state,
        channel: state.channel ? {
          ...state.channel,
          totalViews: (state.channel.totalViews || 0) + (action.payload?.count || 1)
        } : null
      };
    
    // ==================== ADMIN - CANALES PENDIENTES ====================
    case CHANNEL_TYPES.GET_PENDING_CHANNELS_REQUEST:
      return {
        ...state,
        pendingChannels: {
          ...state.pendingChannels,
          loading: true,
          error: null
        }
      };
    
    case CHANNEL_TYPES.GET_PENDING_CHANNELS_SUCCESS:
      return {
        ...state,
        pendingChannels: {
          channels: normalizeChannels(action.payload.channels),
          total: action.payload.total || 0,
          page: action.payload.page || 1,
          totalPages: action.payload.totalPages || 1,
          loading: false,
          error: null
        }
      };
    
    case CHANNEL_TYPES.GET_PENDING_CHANNELS_FAIL:
      return {
        ...state,
        pendingChannels: {
          ...state.pendingChannels,
          loading: false,
          error: action.payload
        }
      };
    
    // ==================== APROBAR CANAL ====================
    case CHANNEL_TYPES.APPROVE_CHANNEL_REQUEST:
      return { ...state, loading: true, error: null };
    
    case CHANNEL_TYPES.APPROVE_CHANNEL_SUCCESS:
      const approvedChannel = normalizeChannel(action.payload);
      const updatedPendingChannels = state.pendingChannels.channels.filter(
        ch => ch._id !== approvedChannel._id
      );
      
      return {
        ...state,
        loading: false,
        userChannels: normalizeChannels(state.userChannels.map(ch =>
          ch._id === approvedChannel._id ? { ...ch, pending: false, isActive: true, status: 'approved' } : ch
        )),
        channels: normalizeChannels(state.channels.map(ch =>
          ch._id === approvedChannel._id ? { ...ch, pending: false, isActive: true, status: 'approved' } : ch
        )),
        pendingChannels: {
          ...state.pendingChannels,
          channels: updatedPendingChannels,
          total: Math.max(0, state.pendingChannels.total - 1)
        },
        channel: state.channel?._id === approvedChannel._id ? approvedChannel : state.channel,
        error: null
      };
    
    case CHANNEL_TYPES.APPROVE_CHANNEL_FAIL:
      return { ...state, loading: false, error: action.payload };
    
    // ==================== RECHAZAR CANAL ====================
    case CHANNEL_TYPES.REJECT_CHANNEL_REQUEST:
      return { ...state, loading: true, error: null };
    
    case CHANNEL_TYPES.REJECT_CHANNEL_SUCCESS:
      const rejectedChannel = normalizeChannel(action.payload);
      const updatedPendingAfterReject = state.pendingChannels.channels.filter(
        ch => ch._id !== rejectedChannel._id
      );
      
      return {
        ...state,
        loading: false,
        userChannels: normalizeChannels(state.userChannels.map(ch =>
          ch._id === rejectedChannel._id ? { 
            ...ch, 
            pending: false, 
            isActive: false, 
            status: 'rejected',
            rejectionReason: rejectedChannel.rejectionReason 
          } : ch
        )),
        channels: normalizeChannels(state.channels.map(ch =>
          ch._id === rejectedChannel._id ? { 
            ...ch, 
            pending: false, 
            isActive: false, 
            status: 'rejected',
            rejectionReason: rejectedChannel.rejectionReason 
          } : ch
        )),
        pendingChannels: {
          ...state.pendingChannels,
          channels: updatedPendingAfterReject,
          total: Math.max(0, state.pendingChannels.total - 1)
        },
        channel: state.channel?._id === rejectedChannel._id ? rejectedChannel : state.channel,
        error: null
      };
    
    case CHANNEL_TYPES.REJECT_CHANNEL_FAIL:
      return { ...state, loading: false, error: action.payload };
    
    // ==================== REENVIAR CANAL (RESUBMIT) ====================
    case CHANNEL_TYPES.RESUBMIT_CHANNEL_REQUEST:
      return { ...state, loading: true };
    
    case CHANNEL_TYPES.RESUBMIT_CHANNEL_SUCCESS:
      const resubmittedChannel = normalizeChannel(action.payload);
      
      return {
        ...state,
        loading: false,
        userChannels: normalizeChannels(state.userChannels.map(ch =>
          ch._id === resubmittedChannel._id ? resubmittedChannel : ch
        )),
        channels: normalizeChannels(state.channels.map(ch =>
          ch._id === resubmittedChannel._id ? resubmittedChannel : ch
        )),
        channel: state.channel?._id === resubmittedChannel._id ? resubmittedChannel : state.channel,
        error: null
      };
    
    case CHANNEL_TYPES.RESUBMIT_CHANNEL_FAIL:
      return { ...state, loading: false, error: action.payload };
    
    // Limpiar canales pendientes
    case CHANNEL_TYPES.CLEAR_PENDING_CHANNELS:
      return {
        ...state,
        pendingChannels: {
          channels: [],
          total: 0,
          page: 1,
          totalPages: 1,
          loading: false,
          error: null
        }
      };
    
    // ==================== ELIMINAR CANAL ====================
    case CHANNEL_TYPES.DELETE_CHANNEL_SUCCESS:
      return {
          ...state,
          userChannels: state.userChannels.filter(ch => ch._id !== action.payload),
          channels: state.channels.filter(ch => ch._id !== action.payload),
          channel: state.channel?._id === action.payload ? null : state.channel,
          followingChannels: state.followingChannels.filter(id => id !== action.payload),
          loading: false,
          error: null
      };
    
    case CHANNEL_TYPES.DELETE_CHANNEL_FAIL:
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    
    // ==================== REPORTAR CANAL ====================
    case CHANNEL_TYPES.REPORT_CHANNEL_SUCCESS:
      return {
        ...state,
        channel: state.channel ? {
          ...state.channel,
          reportCount: action.payload.reportCount
        } : null
      };
    
    case CHANNEL_TYPES.BLOCK_CHANNEL_SUCCESS:
      return {
        ...state,
        isBlocked: action.payload.isBlocked
      };
    
    // ==================== CONTACTO ====================
    case CHANNEL_TYPES.GET_CHANNEL_CONTACT:
      return {
        ...state,
        contactInfo: action.payload
      };
    
    case CHANNEL_TYPES.REGISTER_CHANNEL_SHARE:
      return {
        ...state,
        channel: state.channel ? {
          ...state.channel,
          shareCount: action.payload.shareCount
        } : null
      };
    
    // ==================== CANAL PENDIENTE ====================
    case CHANNEL_TYPES.GET_PENDING_CHANNEL_REQUEST:
      return {
        ...state,
        pendingLoading: true,
        error: null
      };
      
    case CHANNEL_TYPES.GET_PENDING_CHANNEL_SUCCESS:
      const normalizedPending = normalizeChannel(action.payload);
      return {
        ...state,
        pendingChannel: normalizedPending,
        channel: normalizedPending,
        pendingLoading: false,
        error: null
      };
      
    case CHANNEL_TYPES.GET_PENDING_CHANNEL_ERROR:
      return {
        ...state,
        pendingLoading: false,
        error: action.payload
      };
    
    // ==================== SET FOLLOWING CHANNELS ====================
    case CHANNEL_TYPES.SET_FOLLOWING_CHANNELS:
      return {
        ...state,
        followingChannels: action.payload || []
      };
    
    // ==================== ERROR ====================
    case CHANNEL_TYPES.CHANNEL_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false
      };
    // ==================== CANALES APROBADOS (PÚBLICOS) ====================
case CHANNEL_TYPES.GET_APPROVED_CHANNELS_REQUEST:
  return {
      ...state,
      approvedChannels: {
          ...state.approvedChannels,
          loading: true,
          error: null
      }
  };

case CHANNEL_TYPES.GET_APPROVED_CHANNELS_SUCCESS:
  const { channels, total, page: currentPage, totalPages, hasMore } = action.payload;
  const existingChannels = state.approvedChannels.channels;
  const newChannelsList = currentPage === 1 ? channels : [...existingChannels, ...channels];
  return {
      ...state,
      approvedChannels: {
          channels: newChannelsList,
          total: total || 0,
          page: currentPage || 1,
          totalPages: totalPages || 1,
          hasMore: hasMore || false,
          loading: false,
          error: null
      }
  };

case CHANNEL_TYPES.GET_APPROVED_CHANNELS_FAIL:
  return {
      ...state,
      approvedChannels: {
          ...state.approvedChannels,
          loading: false,
          error: action.payload
      }
  };

case CHANNEL_TYPES.CLEAR_APPROVED_CHANNELS:
  return {
      ...state,
      approvedChannels: {
          channels: [],
          total: 0,
          page: 1,
          totalPages: 1,
          hasMore: false,
          loading: false,
          error: null
      }
  };
    default:
      return state;
  }
};

export default channelReducer;