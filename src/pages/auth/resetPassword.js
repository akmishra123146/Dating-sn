import React from 'react';
import { Form, Input, Button, Typography, notification } from 'antd';
import { useHistory } from 'react-router-dom';
import ajaxService from '../../services/ajax-service';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';

const { Text, Title } = Typography

const ResetPassword = () => {

    let history = useHistory()

    const onFinish = async (values) => {

        const data = { ...values, email: localStorage.getItem('forgotPasswordEmail') }

        const response = await ajaxService.post('/reset-password', data)

        if (response.success) {
            history.push({ pathname: '/login', email: response.data.email })

            localStorage.removeItem('forgotPasswordEmail')
            notification.open({ message: 'Password has been updated successfully.', icon: <CheckCircleOutlined style={{ color: '#108ee9' }} /> })
        } else {
            notification.open({ message: 'Email does not exist!', icon: <CloseCircleOutlined style={{ color: 'red' }} /> })
        }
    };

    const onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };

    return (
        <div className="login-container">
            <div style={{ marginBottom: 20, textAlign: 'center' }}>
                <Title id='title' style={{ margin: 0 }}>Reset Your Password</Title>
                <Text id='subtitle'>Enter your new password </Text>
            </div>
            <Form
                style={{ width: '350px' }}
                name="basic"
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
            >
                <Form.Item
                    name="password"
                    className='login-form-item'
                    rules={[{ required: true, message: 'Please input your password!' }]}
                >
                    <Input.Password style={{ borderRadius: '20px', height: '45px' }} placeholder="Enter new password here" allowClear />
                </Form.Item>

                <Form.Item
                    name="confirmed_password"
                    className='login-form-item'
                    dependencies={['password']}
                    rules={[
                        {
                            required: true,
                            message: 'Please confirm your password!',
                        },
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                if (!value || getFieldValue('password') === value) {
                                    return Promise.resolve();
                                }
                                return Promise.reject(new Error('The new password that you entered do not match!'));
                            },
                        }),
                    ]}
                >
                    <Input.Password style={{ borderRadius: '20px', height: '45px' }} placeholder="Confirm new password here" allowClear />
                </Form.Item>
                <Form.Item className='login-form-item'>
                    <Button style={{ width: '350px', background: 'var(--themeColor)', borderRadius: '20px', height: "40px" }} type="primary" htmlType="submit">
                        Confirm
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
};

export default ResetPassword;