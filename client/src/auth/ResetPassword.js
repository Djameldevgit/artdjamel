import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams, useHistory } from 'react-router-dom'
import { resetPassword } from '../redux/actions/authAction'
import { Container, Row, Col, Form, Button, Card, Alert } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'

const ResetPassword = () => {
  const [password, setPassword] = useState('')
  const [success, setSuccess] = useState(false)
  const dispatch = useDispatch()
  const { token } = useParams()
  const history = useHistory()

  const { languageReducer } = useSelector(state => state)
  const lang = languageReducer.language || 'es'
  const { t } = useTranslation('auth')

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await dispatch(resetPassword(password, token))
      setSuccess(true)
    } catch (err) {
      console.error(err)
    }
  }

  const handleGoToLogin = () => {
    history.push('/login')
  }

  return (
    <Container className="d-flex justify-content-center align-items-center min-vh-100">
      <Row className="w-100 justify-content-center">
        <Col xs={12} sm={10} md={8} lg={6}>
          <Card className="shadow-sm p-4">
            <h3 className="text-center mb-4">
              {t('resetPassword.title', { lng: lang })}
            </h3>

            {!success ? (
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="formPassword">
                  <Form.Label>{t('resetPassword.passwordLabel', { lng: lang })}</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder={t('resetPassword.passwordPlaceholder', { lng: lang })}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                  />
                </Form.Group>

                <Button variant="success" type="submit" className="w-100">
                  {t('resetPassword.submitButton', { lng: lang })}
                </Button>
              </Form>
            ) : (
              <>
                <Alert variant="success" className="text-center">
                  {t('resetPassword.successMessage', { lng: lang })}
                </Alert>
                <div className="text-center mt-3">
                  <Button variant="primary" onClick={handleGoToLogin}>
                    {t('resetPassword.goToLogin', { lng: lang })}
                  </Button>
                </div>
              </>
            )}
          </Card>
        </Col>
      </Row>
    </Container>
  )
}

export default ResetPassword



