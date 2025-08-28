import { CloseCircleOutlined, DeleteOutlined, EyeOutlined } from "@ant-design/icons"
import { Avatar, Button, Col, Modal, Row, Space, Table, Typography, notification } from "antd"
import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { Filter } from "../../../components"
import ajaxService from "../../../services/ajax-service"
import { BASE_URL } from "../../../constants"

const { Title, Text } = Typography

const Waitlist = () => {

    const { id } = useParams()

    const [showModal, setShowModal] = useState(false)
    const [data, setData] = useState({})
    const [waitlistUsers, setWaitlistUsers] = useState([])

    const handleClick = (id) => {
        const findData = waitlistUsers.find(i => i.id === id);
        setData(findData)
        setShowModal(true)
    }

    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            width: '90%'
        },
        {
            title: 'Actions',
            key: 'address',
            render: (text, record) => (
                <Space size='small'>
                    <Button type='primary' size="small" style={{ background: "#B9E4EB", color: '#0580A6', fontSize: '16px' }} onClick={() => handleClick(record.id)}>
                        <EyeOutlined />
                    </Button>

                    <Button type='primary' size="small" style={{ background: "#EBDEE1", color: '#FF9595', fontSize: '16px' }} danger onClick={() => console.log(record.id)}>
                        <DeleteOutlined />
                    </Button>
                </Space>
            )
        },
    ]

    const handleSearch = async ({ name }) => {

        const waitlist = JSON.parse(localStorage.getItem('waitlisted'))

        const filteredData = waitlist.filter(item => item.name.toLowerCase().includes(name.toLowerCase()));

        setWaitlistUsers(filteredData)

        if (name && filteredData.length === 0) {
            notification.open({ message: `${name} is not found!`, icon: <CloseCircleOutlined style={{ color: 'red' }} /> })
        }

        if (!name) {
            initialize(id)
        }
    }

    const initialize = async (id) => {

        const response = await ajaxService.get(`/event-waitlist-user?event_id=${id}`)

        const { success, data } = response

        if (success) {

            localStorage.setItem('waitlisted', JSON.stringify(data[0].users_waitlisted))

            setWaitlistUsers(data[0].users_waitlisted)
        }

    }

    useEffect(() => {
        initialize(id)
    }, [])

    const renderModal = (
        <Modal
            className="court-modal second-modal"
            width="35%"
            open={showModal}
            maskClosable={false}
            onCancel={() => setShowModal(false)}
            footer={null}
        >
            <div style={{ padding: '5px 0px 15px 30px', marginTop: 25 }}>
                <Title id="modal-title" level={3}>Personal Details</Title>
                <br />
                <div style={{ padding: '0px 45px 0px 45px' }}>
                    <Row gutter={[100, 20]}>

                        <Col span={5}>
                            <Avatar
                                size={100}
                                width={100}
                                alt="Image Not Found..."
                                src={data.images && (data.images).length > 0 ? BASE_URL + '/storage/' + data.images[0]?.image : ''}
                            />
                        </Col>
                        <Col span={19}>
                            <Text style={{ fontWeight: 'bold' }}>{data.name ?? ''}</Text>
                            <br />
                            <Text>{data.email ?? ''}</Text>
                            <br />

                            <Row style={{ marginTop: 10 }} gutter={[0, 8]}>
                                <Col span={9}>
                                    <Text>Phone Number :</Text>
                                </Col>
                                <Col span={14}>
                                    <Text>{data.phone ?? ''}</Text>
                                </Col>

                                <Col span={9}>
                                    <Text>User ID :</Text>
                                </Col>
                                <Col span={14}>
                                    <Text>{data.id ?? ''}</Text>
                                </Col>
                            </Row>
                        </Col>

                        <Col span={24}>
                            <Row gutter={[93, 16]}>
                                <Col span={24}>
                                    <Text style={{ fontWeight: 'bolder' }}>Sports</Text>
                                </Col>
                                {(data && data.interest_users) &&
                                    data?.interest_users.map((i, index) => (
                                        <Col span={4} key={`col-${index}`}>
                                            <Button key={`btn-${index}`} type="primary" style={{ background: '#ba00a1', borderRadius: '50px' }}>{i.interest}</Button>
                                        </Col>
                                    ))
                                }
                            </Row>
                        </Col>
                    </Row>
                </div>
                <br />
                <div style={{ textAlign: 'center' }}>
                    <Button className="modal-button" key="finish" type="primary" onClick={() => setShowModal(false)} style={{ background: 'var(--themeColor)' }}>
                        Close
                    </Button>
                </div>
            </div>
        </Modal>
    )

    return (
        <>
            <Filter handleSearch={handleSearch} placeholder="Search user name" />

            <Table
                columns={columns}
                dataSource={waitlistUsers}
                style={{ background: 'none' }}
                rowKey='id'
                // pagination={{
                //     onChange: (page, size) => handleChangePage(page),
                //     current: dataSource.current_page,
                //     pageSize: dataSource.per_page,
                //     total: dataSource.total,
                // }}
                pagination={false}
            />
            {renderModal}
        </>
    )

}
export default Waitlist