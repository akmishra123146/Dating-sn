import React from 'react';
import { Layout } from 'antd';

const { Content } = Layout;

export default function AuthLayout({ children }) {
    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Layout className="site-layout" style={{ padding: 0, backgroundColor: '#e5f3f7' }}>
                <Content style={{ margin: '0 16px' }}>
                    <div className="site-layout" style={{ padding: 24, minHeight: 360 }}>
                        {children}
                    </div>
                </Content>
            </Layout>
        </Layout>
    )
}