import React from 'react';
import { Result, Button } from 'antd';
import { Link } from 'react-router-dom';

const NotFound = () => {

    const token = localStorage.getItem('token')

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <Result
                status="404"
                title="404"
                subTitle="Sorry, the page you visited does not exist."
                extra={
                    <Link to={token ? "/" : '/login'}>
                        <Button type="primary" className='modal-button'>{token ? 'Back Home' : 'Back Login'}</Button>
                    </Link>
                }
            />
        </div>
    );
};

export default NotFound;