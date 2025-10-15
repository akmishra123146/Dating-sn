import { Card, Col, Row, Statistic, Tabs } from "antd";
import ajaxService from "../../services/ajax-service";
import { useEffect, useState } from "react";
import { COURT_USER } from "../../constants";

const CourtDashboard = () => {

    const [data, setData] = useState({
        'new_bookings': 0,
        'total_payment_to_receive': 0,
    });

    const onChange = (key) => {
        console.log(key);
    };

    const initialize = async () => {
        const response = await ajaxService.get('/court-dashboard');
        if (response.success) {
            setData(response.data);
        }
    }

    useEffect(() => {
        if (localStorage.getItem('role') === COURT_USER) {
            initialize()
        }
    }, [])

    const statisticsData = [
        { title: 'New Bookings', value: data.new_bookings },
        { title: 'Total Payment To Recieve', value: '$'+data.total_payment_to_receive },
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

export default CourtDashboard