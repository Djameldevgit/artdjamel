 
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import {
    deleteUser,
    toggleActiveStatus,
    USER_TYPES,
  } from "../../redux/actions/userAction";
  import {
    bloquearUsuario,
    unBlockUser,
  } from "../../redux/actions/userAction";
  import {
    getBlockedUsers,
  } from "../../redux/actions/userBlockAction";
 

export const useUserActions = () => {
  const dispatch = useDispatch();
  const { auth } = useSelector((state) => state);
  const { t } = useTranslation('users');
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);

  const handleOpenBlockModal = (user) => {
    setSelectedUser(user);
    setShowBlockModal(true);
  };

  const handleCloseBlockModal = () => {
    setShowBlockModal(false);
    setSelectedUser(null);
  };

  const confirmDelete = (userId) => {
    setUserToDelete(userId);
    setShowDeleteModal(true);
  };

  const handleDeleteUser = async () => {
    try {
      await dispatch(deleteUser({ id: userToDelete, auth }));
      setShowDeleteModal(false);
    } catch (err) {
      console.error(t('errors.deleteUser'), err);
    }
  };

  const handleBlockUser = async (datosBloqueo) => {
    try {
      await dispatch(
        bloquearUsuario({ auth, datosBloqueo, user: selectedUser })
      );
      dispatch({
        type: 'UPDATE_USER_BLOCK_STATUS', // Asegúrate de que esta acción esté definida en tu reducer
        payload: {
          userId: selectedUser._id,
          esBloqueado: true,
        },
      });
      dispatch(getBlockedUsers(auth.token));
      handleCloseBlockModal();
    } catch (err) {
      console.error(t('errors.blockUser'), err);
    }
  };

  const handleUnblockUser = async (user) => {
    try {
      await dispatch(unBlockUser({ user, auth }));
      dispatch({
        type: 'UPDATE_USER_BLOCK_STATUS',
        payload: {
          userId: user._id,
          esBloqueado: false,
        },
      });
      dispatch(getBlockedUsers(auth.token));
    } catch (err) {
      console.error(t('errors.unblockUser'), err);
    }
  };

  const handleToggleActiveStatus = (userId) => {
    dispatch(toggleActiveStatus(userId, auth.token));
  };

  return {
    showBlockModal,
    showDeleteModal,
    selectedUser,
    setShowDeleteModal,
    handleOpenBlockModal,
    handleCloseBlockModal,
    confirmDelete,
    handleDeleteUser,
    handleBlockUser,
    handleUnblockUser,
    handleToggleActiveStatus,
  };
};