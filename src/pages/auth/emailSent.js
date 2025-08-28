import React from "react"
import { ReactComponent as EmailSentIcon } from '../../assets/icons/email-sent.svg';
import { Button, Form, Input, Typography } from "antd";
import { useHistory } from "react-router-dom";

const { Title, Text } = Typography

const EmailSent = () => {

    const history = useHistory()

    const onClick = () => {
        history.push({ pathname: '/reset-password' })
    }

    return (
        <>
            <div className="login-container">
                <EmailSentIcon style={{ height: 100, marginBottom: 30 }} />
                <div style={{ marginBottom: 20, textAlign: 'center' }}>
                    <Title id='title' style={{ margin: '0px 0px 10px 0px', }}>Email Sent</Title>
                    <Text id='subtitle'>Instructions to reset your password has been sent to your email address</Text>
                </div>

                <Button style={{ width: '150px', background: 'var(--themeColor)', borderRadius: '20px', height: "50px" }} type="primary" htmlType="submit" onClick={onClick}>
                    Next
                </Button>

            </div>
        </>
    )
}

export default EmailSent