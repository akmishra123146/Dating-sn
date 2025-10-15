import React from "react";
import { Avatar, Dropdown, Layout, Space, Typography } from "antd";
import { UserOutlined } from '@ant-design/icons';
import { CiLogout } from "react-icons/ci";
import { CgProfile } from "react-icons/cg";
import { useHistory } from "react-router-dom";
import ajaxService from "../services/ajax-service";
import { Link } from "react-router-dom";

const { Header } = Layout;
const { Text } = Typography;

const MainHeader = () => {

    let history = useHistory()

    const logout = () => {
        ajaxService.post('/logout')
        localStorage.clear()
        history.push({ pathname: '/' })
    }

    const items = [
        {
            key: '1',
            label: <Link to="/profile">Profile</Link>,
            icon: <CgProfile />,
        },
        {
            type: 'divider',
        },
        {
            key: '2',
            label: 'Logout',
            icon: <CiLogout />,
            onClick: logout
        },
    ]

    return (
        <Header style={{ padding: 0, background: '#e5f3f7' }}>

            <div style={{ float: 'right', paddingRight: '20px' }}>

                <Text id="subtitle" style={{ marginRight: '20px' }}>{localStorage.getItem('name')}</Text>

                <Dropdown menu={{ items }} overlayStyle={{ width: '150px', marginTop: 10 }}>
                    <a onClick={(e) => e.preventDefault()}>
                        <Space>
                            <Avatar size="large" icon={<UserOutlined />} />
                        </Space>
                    </a>
                </Dropdown>
            </div>

        </Header>
    )
}

export default MainHeader