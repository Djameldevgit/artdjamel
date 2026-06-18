import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useHistory } from 'react-router-dom';
import { activationAccount } from '../redux/actions/authAction';

const ActivatePage = () => {
  const { activation_token } = useParams();
  const dispatch = useDispatch();
  const history = useHistory();
  const { user, token } = useSelector(state => state.auth);

  const [loading, setLoading] = useState(true);
  const [showMessage, setShowMessage] = useState(true);

  // 🔐 Si el usuario no está autenticado, redirigir al login
  useEffect(() => {
    if (!token || !user) {
      history.push('/login');
    }
  }, [token, user, history]);

  useEffect(() => {
    if (activation_token) {
      dispatch(activationAccount(activation_token));
    }
  }, [activation_token, dispatch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowMessage(false);
      setLoading(false);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (user?.isVerified) {
      const redirectTimer = setTimeout(() => {
        history.push(`/profile/${user._id}`);
      }, 1000);
      return () => clearTimeout(redirectTimer);
    }
  }, [user, history]);

  if (loading && showMessage) {
    return (
      <div className="p-4 text-center">
        <h2 className="text-lg font-semibold">🛠 Activando tu cuenta...</h2>
        <p>Un momento por favor...</p>
      </div>
    );
  }

  return (
    <div className="text-center mt-10">
      {user?.isVerified ? (
        <button
          disabled
          className="px-6 py-3 bg-green-600 text-white font-semibold rounded"
        >
          ✅ Cuenta activada correctamente. Redirigiendo...
        </button>
      ) : (
        <div className="text-red-600 font-semibold">
          ⚠ Algo salió mal. Intenta activar de nuevo más tarde.
        </div>
      )}
    </div>
  );
};

export default ActivatePage;
