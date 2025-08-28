import React from 'react';
import { Layout, theme } from 'antd';
import Sidebar from './sidebar';
import MainHeader from './header';

const {  Content } = Layout;

export default function MainLayout({ children }) {
    const { token: { borderRadiusLG } } = theme.useToken();
    return (
        <Layout hasSider>

            <Sidebar />

            <Layout style={{ marginLeft: 200, background: '#dbe9ec' }}>

                <MainHeader/>

                <Content style={{ margin: '24px 30px 0', overflow: 'initial' }}>
                    <div style={{ padding: 24, background: '#e5f3f7', borderRadius: borderRadiusLG }}>
                        {children}
                    </div>
                </Content>

            </Layout>
        </Layout>
    );
};