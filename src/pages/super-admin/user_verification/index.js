import { Button, Space, Typography, Table, Modal, Row, Col, Image, Avatar, notification } from "antd"
import { CheckCircleOutlined, CloseCircleOutlined, DeleteOutlined, EyeOutlined } from "@ant-design/icons"
import { Filter } from "../../../components";
import { useEffect, useState } from "react";
import ajaxService from "../../../services/ajax-service";
import { BASE_URL } from "../../../constants";

const { Text, Title } = Typography

const UserVerification = () => {

    const [user, setUser] = useState({})
    const [filter, setFilter] = useState('')
    const [showModal, setShowModal] = useState(false)
    const [dataSource, setDataSource] = useState({})

    const handleClick = (id) => {
        const data = (dataSource.data).find(i => i.id === id);
        data.interest_users = data?.interest_users.join(', ');
        setUser(data);
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
    ];

    const handleChangePage = async (page) => {
        const response = await ajaxService.get(`/verifications?name=${filter}&page=${page}`);
        if (response.success) {
            setDataSource(response)
        }

    }

    const handleSearch = async ({ name }) => {

        const response = await ajaxService.get(`/verifications?name=${name}`);

        const { success, data } = response;

        if (success) {
            if (data.length == 0) {
                setFilter('')
                notification.open({ message: `${name} is not found!`, icon: <CloseCircleOutlined style={{ color: 'red' }} /> })
            } else {
                setFilter(name)
            }

            setDataSource(response)
        }
    }

    const handleVerify = async (id, status) => {

        const data = { id: id, status: status }

        const response = await ajaxService.post('/approve-reject-verification', data)
        if (response.success) {
            setShowModal(false)
            initialize()
            notification.open({ message: response.data.verification_status, icon: <CheckCircleOutlined style={{ color: '#108ee9' }} /> })
        } else {
            notification.open({ message: response.message, icon: <CloseCircleOutlined style={{ color: 'red' }} /> })
        }

    }

    const initialize = async () => {
        const response = await ajaxService.get(`/verifications?name=${filter}`);
        if (response.success) {

            response.data = (response.data).filter(i => i.verification_status === 'pending');

            setDataSource(response)
        }
    }

    useEffect(() => {
        initialize()
    }, [])

    const renderImage = (imageSrc, label) => (
        <div style={{ textAlign: 'center' }}>
            {imageSrc ? (
                <>
                    <Image
                        preview={false}
                        width={110}
                        height={130}
                        style={{ borderRadius: '20px' }}
                        src={BASE_URL + '/storage/' + imageSrc}
                    />
                    <br />
                </>
            ) : (
                <div style={{ width: 110, height: 130, backgroundColor: '#484848', borderRadius: '20px' }} />
            )}
            <Text style={{ fontSize: 11 }}>{label}</Text>
        </div>
    )

    const renderModal = (
        <Modal
            className="court-modal second-modal"
            width="40%"
            open={showModal}
            maskClosable={false}
            onCancel={() => setShowModal(false)}
            footer={null}
        >
            <div style={{ padding: '15px 35px', marginTop: 25 }}>
                <Title id='modal-title' level={3}>Verify The Person</Title>
                <Row gutter={16}>

                    <Col span={12}>
                        <Avatar size={70} src={user.images && (user.images).length > 0 ? BASE_URL + '/storage/' + user.images[0]?.image : ''} />
                        <br />
                        <p style={{ fontWeight: 'bold', color: '#ba00a1', fontSize: 15 }}>{user?.name}</p>

                        <p style={{ fontSize: 12, lineHeight: 1.5 }}>{user?.bio}</p>
                        <Text style={{ fontSize: 12 }}>{user?.email}</Text>
                        <br />
                        <Text style={{ fontSize: 12 }}>{user?.phone}</Text>
                        <br />
                        {user?.interests_data && user.interests_data.map((i, index) => (
                            <Text key={'interests-' + index} style={{ fontSize: 12 }}>
                                {i.interest_name}{index !== user.interests_data.length - 1 ? ", " : ""}
                            </Text>
                        ))}
                        <br />
                    </Col>
                    <Col span={12}>
                        <div style={{ display: 'flex', justifyContent: 'space-evenly', marginTop: 80 }}>
                            {renderImage(user?.cnic_front, 'ID Front')}
                            {renderImage(user?.cnic_back, 'ID Back')}
                        </div>
                    </Col>
                </Row>

                <div style={{ textAlign: 'center', marginTop: 20 }}>
                    <Button
                        key="reject"
                        className="modal-button"
                        style={{ width: 'auto', marginRight: "10px" }}
                        onClick={() => handleVerify(user?.id, 'rejected')}
                    >
                        Request More Details
                    </Button>

                    <Button
                        type="primary"
                        key="approve"
                        className="modal-button"
                        style={{ background: 'var(--themeColor)' }}
                        onClick={() => handleVerify(user?.id, 'approved')}
                    >
                        Verify
                    </Button>
                </div>
            </div>
        </Modal>
    )

    return (
        <>
            <Filter handleSearch={handleSearch} placeholder="Search user" />
            <Table
                columns={columns}
                dataSource={dataSource.data}
                style={{ background: 'none' }}
                rowKey='id'
                pagination={{
                    onChange: (page, size) => handleChangePage(page),
                    current: dataSource.meta?.current_page,
                    pageSize: dataSource.meta?.per_page,
                    total: dataSource.meta?.total,
                }}
            />
            {renderModal}
        </>
    )
}

export default UserVerification