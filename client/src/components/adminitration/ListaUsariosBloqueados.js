import { useSelector, useDispatch } from "react-redux";
import { useState, useEffect } from "react";
import UserCard from "../UserCard";
import moment from "moment";
import { unBlockUser } from "../../redux/actions/userAction";
import { getDataAPI } from "../../utils/fetchData";
import { getBlockedUsers, USER_TYPES_BLOCK } from "../../redux/actions/userBlockAction";
import { useTranslation } from 'react-i18next';
import LoadMoreBtn from "../LoadMoreBtn";
import { Spinner } from "react-bootstrap";

const ListaUsuariosBloqueados = () => {
  const dispatch = useDispatch();
  const { userBlockReducer, auth, languageReducer } = useSelector((state) => state);
  const { t } = useTranslation('listausariosbloqueados');
  const lang = languageReducer.language || 'en';

  const [blockedUsers, setBlockedUsers] = useState([]);
  const [load, setLoad] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [searchTerm, setSearchTerm] = useState(""); // estado para búsqueda

  useEffect(() => {
     if (auth.token) {
   dispatch(getBlockedUsers(auth.token))}
  }, [dispatch, auth.token])

  // 🔹 Buscar en el backend
  const handleSearch = async () => {
    try {
      setLoad(true);
      const res = await getDataAPI(
        `users/block?limit=9&search=${searchTerm}`,
        auth.token
      );
      dispatch({
        type: USER_TYPES_BLOCK.GET_USERS_BLOCK,
        payload: {
          blockedUsers: res.data.blockedUsers,
          result: res.data.result,
          page: 1,
        },
      });
    } catch (err) {
      console.error("Error searching blocked users:", err);
    } finally {
      setLoad(false);
    }
  };

  // 🔹 Cargar bloqueados iniciales
  useEffect(() => {
    const fetchBlockedUsers = async () => {
      try {
        setLoad(true);
        const res = await getDataAPI(`users/block?limit=9`, auth.token);
        dispatch({
          type: USER_TYPES_BLOCK.GET_USERS_BLOCK,
          payload: {
            blockedUsers: res.data.blockedUsers,
            result: res.data.result,
            page: 1,
          },
        });
      } catch (err) {
        console.error("Error fetching blocked users:", err);
      } finally {
        setLoad(false);
        setInitialLoad(false);
      }
    };

    if (initialLoad && auth.token) {
      fetchBlockedUsers();
    }
  }, [auth.token, dispatch, initialLoad]);

  // 🔹 Actualizar el estado local cuando cambia el reducer
  useEffect(() => {
    if (Array.isArray(userBlockReducer.blockedUsers)) {
      setBlockedUsers(userBlockReducer.blockedUsers);
    }
  }, [userBlockReducer.blockedUsers]);

  // 🔹 Paginación
  const handleLoadMore = async () => {
    setLoad(true);
    try {
      const res = await getDataAPI(
        `users/block?limit=${(userBlockReducer.page + 1) * 9}&search=${searchTerm}`,
        auth.token
      );
      dispatch({
        type: USER_TYPES_BLOCK.GET_USERS_BLOCK,
        payload: {
          blockedUsers: res.data.blockedUsers,
          result: res.data.result,
          page: userBlockReducer.page + 1,
        },
      });
    } catch (err) {
      console.error("Error loading more blocked users:", err);
    } finally {
      setLoad(false);
    }
  };

  const formatDate = (date) =>
    moment(date).locale('en').format("DD/MM/YYYY HH:mm");

  const handleDesbloqueo = (user) => {
    const datosDesbloqueo = {
      motivo: t('motivoDesbloqueoManual', { lng: lang }),
      fechaBloqueo: new Date().toISOString(),
      fechaLimite: null
    };

    dispatch(unBlockUser({ auth, datosDesbloqueo, user }));
    setBlockedUsers((prev) => prev.filter((block) => block._id !== user._id));
  };

  if (initialLoad) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "50vh" }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <div className="modalusersearchlist">
      {/* 🔹 Barra de búsqueda */}
      <div className="d-flex mb-3">
        <input
          type="text"
          className="form-control"
          placeholder={t('buscarUsuario', { lng: lang })}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button className="btn btn-primary ms-2" onClick={handleSearch}>
          {t('buscar', { lng: lang })}
        </button>
      </div>

      {/* 🔹 Tabla de usuarios bloqueados */}
      <div className="table-responsive mt-3">
        <table className="table">
        <thead>
  <tr>
    <th>#</th>
    <th>{t('usuarioBloqueado', { lng: lang })}</th>
    <th>{t('usuarioQueBloquea', { lng: lang })}</th>
    <th>{t('motivoBloqueo', { lng: lang })}</th>
    <th>{t('detalle', { lng: lang })}</th>
    <th>{t('fechaBloqueo', { lng: lang })}</th>
    <th>{t('fechaLimite', { lng: lang })}</th>
    <th>{t('estado', { lng: lang })}</th>
    <th>{t('acciones', { lng: lang })}</th>
  </tr>
</thead>
<tbody>
  {blockedUsers.length > 0 ? (
    blockedUsers.map((block, index) => (
      <tr key={block.id || block.user?._id || index}>
        <td>{index + 1}</td>
        <td><UserCard user={block.user} /></td>
        <td>{block.userquibloquea?.username || t('desconocido', { lng: lang })}</td>
        <td>{block.motivo || t('noEspecificado', { lng: lang })}</td>
        <td>{block.content || t('noEspecificado', { lng: lang })}</td>
        <td>{formatDate(block.createdAt)}</td>
        <td>{block.fechaLimite ? formatDate(block.fechaLimite) : t('noEspecificado', { lng: lang })}</td>
        <td>{block.esBloqueado ? t('bloqueado', { lng: lang }) : t('desbloqueado', { lng: lang })}</td>
        <td>
          <div className="action-dropdown">
            <button className="btn btn-danger dropdown-toggle" type="button" data-bs-toggle="dropdown">
              {t('accion', { lng: lang })}
            </button>
            <div className="dropdown-menu">
              <button className="dropdown-item" onClick={() => handleDesbloqueo(block)}>
                {t('desbloquear', { lng: lang })}
              </button>
            </div>
          </div>
        </td>
      </tr>
    ))
  ) : (
    <tr>
      <td colSpan="9">{t('noUsuariosBloqueados', { lng: lang })}</td>
    </tr>
  )}
</tbody>

        </table>
      </div>

      {/* 🔹 Spinner mientras carga más */}
      {load && (
        <div className="text-center my-3">
          <Spinner animation="border" variant="primary" />
        </div>
      )}

      {/* 🔹 Botón de paginación */}
      {blockedUsers.length > 0 && (
        <div className="d-flex justify-content-center my-3">
          <LoadMoreBtn
            result={userBlockReducer.result}
            page={userBlockReducer.page}
            load={load}
            handleLoadMore={handleLoadMore}
          />
        </div>
      )}
    </div>
  );
};

export default ListaUsuariosBloqueados;
