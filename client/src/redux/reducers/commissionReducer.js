import { COMMISSION_TYPES } from '../actions/commissionAction';

const initialState = {
  loading: false,
  clientCommissions: [],      // encargos del cliente
  artistCommissions: [],      // encargos para el artista
  commissionDetail: null,
  currentPayment: null,       // { paymentUrl, paymentId }
  error: null
};

const commissionReducer = (state = initialState, action) => {
  switch (action.type) {
    case COMMISSION_TYPES.LOADING:
      return { ...state, loading: action.payload };

    case COMMISSION_TYPES.GET_CLIENT_COMMISSIONS:
      return { ...state, clientCommissions: action.payload };

    case COMMISSION_TYPES.GET_ARTIST_COMMISSIONS:
      return { ...state, artistCommissions: action.payload };

    case COMMISSION_TYPES.GET_COMMISSION_DETAIL:
      return { ...state, commissionDetail: action.payload };

    case COMMISSION_TYPES.CREATE_COMMISSION:
      return {
        ...state,
        clientCommissions: [action.payload, ...state.clientCommissions]
      };

    case COMMISSION_TYPES.RESPOND_COMMISSION:
      // Actualiza tanto en la lista del artista como del cliente
      const updated = action.payload;
      return {
        ...state,
        artistCommissions: state.artistCommissions.map(c =>
          c._id === updated._id ? updated : c
        ),
        clientCommissions: state.clientCommissions.map(c =>
          c._id === updated._id ? updated : c
        ),
        commissionDetail: state.commissionDetail?._id === updated._id
          ? updated
          : state.commissionDetail
      };

    case COMMISSION_TYPES.DECIDE_COMMISSION:
      const decided = action.payload;
      return {
        ...state,
        clientCommissions: state.clientCommissions.map(c =>
          c._id === decided._id ? decided : c
        ),
        artistCommissions: state.artistCommissions.map(c =>
          c._id === decided._id ? decided : c
        ),
        commissionDetail: state.commissionDetail?._id === decided._id
          ? decided
          : state.commissionDetail
      };

    case COMMISSION_TYPES.INITIATE_PAYMENT:
      return { ...state, currentPayment: action.payload };

    case COMMISSION_TYPES.SET_ERROR:
      return { ...state, error: action.payload };

    case COMMISSION_TYPES.CLEAR_ERROR:
      return { ...state, error: null };

    case COMMISSION_TYPES.CLEAR_COMMISSIONS:
      return { ...initialState };

    default:
      return state;
  }
};

export default commissionReducer;