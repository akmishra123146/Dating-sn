import { Button, Space, Typography, Table, Modal, notification } from "antd"
import { CloseCircleOutlined, DeleteOutlined, EyeOutlined } from "@ant-design/icons"
import { Filter } from "../../../components";
import { useEffect, useState } from "react";
import ajaxService from "../../../services/ajax-service"
import moment from "moment";

const { Text, Title } = Typography

const Referrals = () => {

    const [filter, setFilter] = useState('')
    const [showModal, setShowModal] = useState(false)
    const [data, setData] = useState([])
    const [dataSource, setDataSource] = useState({})

    const handleClick = (id) => {

        const findData = (dataSource.data).find(i => i.id === id);

        setData(findData.referred_users)
        setShowModal(true)
    }

    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Created Date',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (created_at) => (<Text>{created_at ? moment(created_at).format('DD-MMM-YYYY') : ''}</Text>)
        },
        {
            title: 'Referral Code',
            dataIndex: 'referrral_code',
            key: 'referrral_code',
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
        const response = await ajaxService.get(`/get-referrals?name=${filter}&page=${page}`);
        if (response.success) {
            setDataSource(response)
        }

    }

    const handleSearch = async ({ name }) => {

        const response = await ajaxService.get(`/get-referrals?name=${name}`);

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


    const initialize = async () => {
        const response = await ajaxService.get('/get-referrals');
        if (response.success) {
            setDataSource(response)
        }
    }

    useEffect(() => {
        initialize()
    }, [])

    const renderModal = (
        <Modal
            className="court-modal second-modal"
            width="25%"
            open={showModal}
            maskClosable={false}
            onCancel={() => setShowModal(false)}
            footer={null}
        >
            <div style={{ padding: '30px 0px', marginTop: 25 }}>
                <div style={{ marginBottom: 20, textAlign: 'center' }}>
                    <Title id='modal-title' level={3}>{data.length} Users Invited</Title>
                </div>
                <br />
                <div style={{ margin: '0px 35px' }}>
                    {
                        data.map(i => (
                            <div key={i.id}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Text>{i.user_name}</Text>
                                    <Text style={{ color: '#ba00a1' }}>{i.created_at ? moment(i.created_at).format('DD-MMM-YYYY') : ''}</Text>
                                </div>
                                <hr />
                            </div>
                        ))
                    }
                </div>
            </div>
        </Modal>
    )

    return (
        <>
            <Filter handleSearch={handleSearch} placeholder="Search referral" />
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

export default Referrals