import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { forgotPassword } from '../redux/actions/authAction'
import { Container, Row, Col, Form, Button, Card } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const dispatch = useDispatch()

  const { languageReducer } = useSelector(state => state)
  const lang = languageReducer.language || 'es'
  const { t } = useTranslation('auth')

  const handleSubmit = (e) => {
    e.preventDefault()
    dispatch(forgotPassword(email))
  }

  return (
    <Container className="d-flex justify-content-center align-items-center min-vh-100">
      <Row className="w-100 justify-content-center">
        <Col xs={12} sm={10} md={8} lg={6}>
          <Card className="shadow-sm p-4">
            <h3 className="text-center mb-4">
              {t('forgotPassword.title', { lng: lang })}
            </h3>

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3" controlId="formEmail">
                <Form.Label>{t('forgotPassword.emailLabel', { lng: lang })}</Form.Label>
                <Form.Control
                  type="email"
                  placeholder={t('forgotPassword.emailPlaceholder', { lng: lang })}
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </Form.Group>

              <Button variant="primary" type="submit" className="w-100">
                {t('forgotPassword.submitButton', { lng: lang })}
              </Button>
            </Form>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}

export default ForgotPassword

