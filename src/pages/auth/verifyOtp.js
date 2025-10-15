import React, { useState } from "react"
import { ReactComponent as EmailSentIcon } from '../../assets/icons/email-sent.svg';
import { Button, Form, Input, Typography, notification } from "antd";
import { useHistory } from "react-router-dom";
import ajaxService from "../../services/ajax-service";
import { CloseCircleOutlined } from "@ant-design/icons";

const { Title, Text } = Typography

const VerifyOtp = () => {

    const history = useHistory()

    const [loading, setLoading] = useState(false)

    const onFinish = async (values) => {

        setLoading(true)

        const data = { email: localStorage.getItem('forgotPasswordEmail'), ...values }

        const response = await ajaxService.post('/verify_otp', data)

        if (response.success) {
            setLoading(false)
            history.push({ pathname: '/reset-password' })
        } else {
            setLoading(false)
            notification.open({ message: "The provided OTP does not match the expected value.", icon: <CloseCircleOutlined style={{ color: 'red' }} /> })
        }

    }

    const onFinishFailed = errorInfo => {
        console.error("Field:" + errorInfo)
    }

    return (
        <>
            <div className="login-container">
                <EmailSentIcon style={{ height: 100, marginBottom: 30 }} />
                <div style={{ marginBottom: 20, textAlign: 'center' }}>
                    <Title id='title' style={{ margin: '0px 0px 10px 0px', }}>Verification OTP Code</Title>
                    <Text id='subtitle'>We have sent the verification code to your email. Please check your inbox to complete the verification process.</Text>
                </div>

                <Form onFinish={onFinish} onFinishFailed={onFinishFailed}>

                    <Form.Item
                        className='login-form-item'
                        name="otp"
                        rules={[
                            { required: true, message: 'Please input your OTP code!' },
                        ]}
                    >
                        <Input type="number" style={{ width: '300px', borderRadius: '10px', height: '60px' }} placeholder='Enter OTP code here.' allowClear />
                    </Form.Item>

                    <Form.Item className='login-form-item'>
                        <Button style={{ width: '150px', background: 'var(--themeColor)', borderRadius: '20px', height: "50px" }} type="primary" htmlType="submit" loading={loading}>
                            Verify OTP
                        </Button>
                    </Form.Item>
                </Form>

            </div>
        </>
    )
}

export default VerifyOtp