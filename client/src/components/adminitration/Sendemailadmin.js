import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { getDataAPI } from '../../utils/fetchData';
import { USER_TYPES } from '../../redux/actions/userAction';
import {
  Button,
  Modal,
  Form,
  Container,
  Table,
  Badge,
  Spinner,
  Image,
  Row,
  Col
} from 'react-bootstrap';
import ModalEmail from './ModalEmail';
 
const Sendemailadmin = () => {
  const { auth, homeUsers, languageReducer } = useSelector((state) => state);
  const dispatch = useDispatch();
  const { t } = useTranslation('sendmailadmin');
  const lang = languageReducer.language || 'es';

  const [load, setLoad] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoad(true);
        const res = await getDataAPI(`users?limit=9`, auth.token);
        dispatch({
          type: USER_TYPES.GET_USERS,
          payload: { ...res.data, page: 1 },
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoad(false);
        setInitialLoad(false);
      }
    };

    if (initialLoad && auth.token) fetchUsers();
  }, [auth.token, dispatch, initialLoad]);

  const handleCheckboxChange = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectInactiveUsers = () => {
    const inactivos = homeUsers.users
      .filter(
        (user) =>
          !user.lastActivity ||
          new Date(user.lastActivity) < new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      )
      .map((user) => user._id);

    setSelectedUsers(inactivos);
  };

  return (
    <Container fluid="md" className="mt-4 px-3" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <Row className="mb-4">
        <Col>
          <h4>{t('usersTitle')}</h4>
        </Col>
      </Row>

      {/* Botones de acciones */}
      <Row className="mb-4">
        <Col>
          <Button
            variant="primary"
            disabled={selectedUsers.length === 0}
            onClick={() => setShowEmailModal(true)}
          >
            {t('sendEmailButton', { count: selectedUsers.length })}
          </Button>{' '}
          <Button variant="warning" onClick={handleSelectInactiveUsers}>
            {t('sendToInactive')}
          </Button>
        </Col>
      </Row>

      {/* Spinner de carga */}
      {load ? (
        <Row className="justify-content-center">
          <Col xs="auto">
            <Spinner animation="border" variant="primary" />
          </Col>
        </Row>
      ) : (
        <Table striped bordered hover responsive className="mb-4">
          <thead>
            <tr>
              <th></th>
              <th>{t('tableHeaderssss.avatar')}</th>
              <th>{t('tableHeaderssss.email')}</th>
              <th>{t('tableHeaderssss.registration')}</th>
              <th>{t('tableHeaderssss.status')}</th>
              <th>{t('tableHeaderssss.lastActivity')}</th>
            </tr>
          </thead>
          <tbody>
            {homeUsers.users.map((user) => (
              <tr key={user._id}>
                <td>
                  <Form.Check
                    type="checkbox"
                    checked={selectedUsers.includes(user._id)}
                    onChange={() => handleCheckboxChange(user._id)}
                    label=""
                    aria-label={t('selectUser')}
                  />
                </td>
                <td>
                  <Image
                    src={user.avatar}
                    roundedCircle
                    style={{ width: '35px', height: '35px' }}
                    alt={t('userAvatar')}
                  />
                </td>
                <td>{user.email}</td>
                <td>{new Date(user.createdAt).toLocaleDateString(lang)}</td>
                <td>
                  {user.emailSent ? (
                    <Badge bg="success">{t('status.sent')}</Badge>
                  ) : (
                    <Badge bg="secondary">{t('status.notSent')}</Badge>
                  )}
                </td>
                <td>
                  {user.lastActivity ? (
                    <span
                      style={{
                        color:
                          new Date(user.lastActivity) <
                          new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                            ? 'red'
                            : 'inherit'
                      }}
                    >
                      {new Date(user.lastActivity).toLocaleDateString(lang)}
                    </span>
                  ) : (
                    <span style={{ color: 'red' }}>{t('status.noActivity')}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Modal para enviar email */}
      {showEmailModal && (
        <ModalEmail
          show={showEmailModal}
          handleClose={() => setShowEmailModal(false)}
          recipients={selectedUsers}
        />
      )}
    </Container>
  );
};

export default Sendemailadmin