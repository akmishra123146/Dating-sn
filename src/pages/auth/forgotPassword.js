import React, { useState } from "react"
import { ReactComponent as ForgotPasswordIcon } from '../../assets/icons/forgot-password.svg';
import { Button, Form, Input, Typography, notification } from "antd";
import backArrowIcon from "../../assets/icons/back-arrow.png"
import { useHistory } from "react-router-dom";
import ajaxService from "../../services/ajax-service";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";

const { Title, Text } = Typography

const ForgotPassword = () => {

    const history = useHistory()

    const [loading, setLoading] = useState(false);

    const onFinish = async (values) => {

        setLoading(true);

        const response = await ajaxService.post('/request-otp', values)

        const { success, data } = response

        if (success) {
            setLoading(false);
            localStorage.setItem('forgotPasswordEmail', values.email)
            // history.push({ pathname: '/email-sent' })
            history.push({ pathname: '/verify-otp' })
            notification.open({ message: data.status, icon: <CheckCircleOutlined style={{ color: '#108ee9' }} /> })
        } else {
            setLoading(false);
            notification.open({ message: data.error, icon: <CloseCircleOutlined style={{ color: 'red' }} /> })
        }

    };

    const onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };

    return (
        <>
            <img
                src={backArrowIcon}
                onClick={() => history.goBack()}
                style={{ position: 'relative', left: '10px', top: '10px', height: '30px', marginBottom: 20, cursor: 'pointer' }}
                alt="fitmatch icon"
            />

            <div className="login-container">
                <ForgotPasswordIcon style={{ height: 100, marginBottom: 45 }} />
                <div style={{ marginBottom: 20, textAlign: 'center' }}>
                    <Title id='title' style={{ margin: '0px 0px 10px 0px', }}>Forgot Password</Title>
                    <Text id='subtitle'>Enter your email address for instruction to be sent</Text>
                </div>

                <Form onFinish={onFinish} onFinishFailed={onFinishFailed}>

                    <Form.Item
                        className='login-form-item'
                        name="email"
                        rules={[
                            { type: 'email', message: 'The input is not valid email!' },
                            { required: true, message: 'Please input your email!' },
                        ]}
                    >
                        <Input type="email" style={{ width: '350px', borderRadius: '10px', height: '60px' }} placeholder='example123@gmail.com' allowClear />
                    </Form.Item>

                    <Form.Item className='login-form-item'>
                        <Button loading={loading} type="primary" htmlType="submit" style={{ width: '150px', background: 'var(--themeColor)', borderRadius: '20px', height: "50px" }}>
                            Send
                        </Button>
                    </Form.Item>
                </Form>
            </div>
        </>
    )
}

export default ForgotPassword