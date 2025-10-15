import React from 'react';
import { Form, Input, Button, Typography, notification } from 'antd';
import { CloseCircleOutlined } from '@ant-design/icons';
import { useHistory, useLocation } from 'react-router-dom';
import fitMatchIcon from "../../assets/icons/logo.png"
import ajaxService from '../../services/ajax-service';

const { Text, Title } = Typography

const Login = ({ onLogin }) => {

    let history = useHistory()
    let location = useLocation()

    let { from } = location.state || { from: { pathname: "/" } };

    const onFinish = async (values) => {

        const response = await ajaxService.getAccessToken(values.email, values.password)

        console.log(response);

        if (response.success) {

            const { name, role, token, court_id } = response.data

            if (court_id) {
                localStorage.setItem('courtID', court_id)
            }

            localStorage.setItem('name', name)
            localStorage.setItem('role', role)
            localStorage.setItem('token', token)

            onLogin();

            history.replace(from);
        } else {
            if (response.message === 'Unauthenticated') {
                notification.open({ message: response.data.error, icon: <CloseCircleOutlined style={{ color: 'red' }} /> })
            } else {
                for (const key in response.data) {
                    const message = JSON.stringify(response.data[key]).slice(1, -1).replace(/"/g, '');
                    notification.open({ message: message, icon: <CloseCircleOutlined style={{ color: 'red' }} /> })
                }
            }
        }
    };

    const onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };

    return (
        <div className="login-container">
            <img src={fitMatchIcon} alt="fitmatch icon" style={{ width : '140px', height: '140px', marginBottom: 20 }} />
            <div style={{ marginBottom: 20, textAlign: 'center' }}>
                <Title id='title' style={{ margin: 0 }}>Sign In</Title>
                <Text id='subtitle'>Access Portal</Text>
            </div>
            <Form
                style={{ width: '350px' }}
                name="basic"
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
                initialValues={{ email: location.email }}
            >
                <Form.Item
                    className='login-form-item'
                    name="email"
                    rules={[
                        { type: 'email', message: 'The input is not valid email!' },
                        { required: true, message: 'Please input your email!' },
                    ]}
                >
                    <Input type='email' style={{ borderRadius: '20px', height: '45px' }} placeholder='example123@gmail.com' allowClear />
                </Form.Item>

                <Form.Item
                    className='login-form-item'
                    name="password"
                    rules={[{ required: true, message: 'Please input your password!' }]}
                >
                    <Input.Password style={{ borderRadius: '20px', height: '45px' }} placeholder="••••••••" allowClear />
                </Form.Item>

                <Form.Item className='login-form-item'>
                    <Button style={{ width: '350px', background: 'var(--themeColor)', borderRadius: '20px', height: "40px" }} type="primary" htmlType="submit">
                        Sign In
                    </Button>
                </Form.Item>

                <Form.Item className='login-form-item'>
                    <a onClick={() => history.push({ pathname: '/forgot-password' })} style={{ color: '#ba00a1' }}><b>Forgot Password?</b></a>
                </Form.Item>
            </Form>
        </div>
    );
};

export default Login;