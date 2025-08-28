import React, { useEffect, useState } from "react";
import { Card, Col, Row, Statistic, Tabs } from "antd";
import ajaxService from "../../services/ajax-service";
import { SUPER_ADMIN } from "../../constants";

const AdminDashboard = () => {

    const [data, setData] = useState({
        'total_users': 0,
        'verification_pending': 0,
        'court_owners': 0,
        'upcoming_events': 0,
        'total_payments': "0.00",
        'new_payments': 0
    });

    const onChange = (key) => {
        console.log(key);
    };

    const initialize = async () => {
        const response = await ajaxService.get('/superadmin-dashboard');
        if (response.success) {
            setData(response.data);
        }
    }

    useEffect(() => {
        if (localStorage.getItem('role') === SUPER_ADMIN) {
            initialize()
        }
    }, [])

    const statisticsData = [
        { title: 'Total Users', value: data.total_users },
        { title: 'Verification Pending', value: data.verification_pending },
        { title: 'Total Court Owners', value: data.court_owners },
        { title: 'Upcoming Events', value: data.upcoming_events },
        { title: 'Total Payment Received', value: data.total_payments },
        { title: 'Total New Payments', value: data.new_payments }
    ]

    const items = [
        // {
        //     key: '1',
        //     label: 'Overview',
        //     children: 'Content of Overview',
        // },
        {
            key: '2',
            label: 'Statistics',
            children: statistics(),
        }
    ];

    function statistics() {
        return (
            <Row gutter={[16, 24]}>
                {statisticsData.map(({ title, value }) => (

                    <Col span={5}>
                        <Card>
                            <Statistic
                                title={title}
                                value={value}
                            />
                        </Card>
                    </Col>
                ))}
            </Row>
        )
    }

    return (
        <>
            <Tabs defaultActiveKey="1" items={items} onChange={onChange} />
        </>
    )
}

export default AdminDashboard