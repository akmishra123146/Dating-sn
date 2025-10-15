import { Button, Modal, Space, Table, Typography, Image, notification } from "antd"
import { Filter } from "../../../components"
import { useEffect, useState } from "react"
import moment from "moment"
import { CloseCircleOutlined, DeleteOutlined, EyeOutlined } from "@ant-design/icons"
import ajaxService from "../../../services/ajax-service"
import { BASE_URL } from "../../../constants"
import { statusBackgroundColor } from "../../../utils"

const { Text, Title } = Typography

const CourtUserPayments = () => {

    const [filter, setFilter] = useState('')
    const [visibleImage, setVisibleImage] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [data, setData] = useState([])
    const [dataSource, setDataSource] = useState({})

    const handleChangePage = async (page) => {
        const response = await ajaxService.get(`/court-payment?name=${filter}&page=${page}`)
        if (response.success) {
            setDataSource(response.data)
        }
    }

    const handleClick = (id) => {
        const findData = (dataSource.data).find(i => i.id === id);
        setData(findData);
        setShowModal(true);
    }

    const columns = [
        {
            title: 'Name',
            key: 'name',
            render: (text, record) => (
                <>
                    <Text style={{ fontWeight: 'bold' }}>{record.booked_by.name}</Text>
                    <br />
                    <Text>{record.booked_by.email}</Text>
                </>
            )
        },
        {
            title: 'Status',
            dataIndex: 'payment_status',
            key: 'payment_status',
            hidden: true,
            render: (status) => (
                <Button type='primary' size="small" style={{ background: statusBackgroundColor(status), width: 80, fontSize: 12, cursor: 'default', textTransform: 'uppercase' }}>
                    {status}
                </Button>
            )
        },
        {
            title: 'Payment Date',
            dataIndex: 'payment_date',
            key: 'payment_date',
            render: (text, record) => {
                if ((record.payment).length > 0 && record.payment[0].payment_date) {
                    return moment(record.payment[0].payment_date).format('DD-MMM-YYYY')
                } else {
                    return ''
                }
            }
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

    const handleSearch = async ({ name }) => {
        const response = await ajaxService.get(`/court-payment?name=${name}`)

        const { success, data } = response;

        if (success) {

            if (data.data.length == 0) {
                setFilter('')
                notification.open({ message: `${name} is not found!`, icon: <CloseCircleOutlined style={{ color: 'red' }} /> })
            } else {
                setFilter(name)
            }

            setDataSource(response.data)
        }
    }

    const initialize = async () => {
        const response = await ajaxService.get(`/court-payment?name=${filter}`)
        if (response?.success) {
            setDataSource(response.data)
        }
    }

    useEffect(() => {
        initialize()
    }, [])

    const renderModal = (
        <Modal
            className="court-modal second-modal"
            width="28%"
            open={showModal}
            maskClosable={false}
            onCancel={() => setShowModal(false)}
            footer={null}
        >
            <div style={{ padding: '15px 20px 30px', marginTop: 25 }}>
                <Title id='modal-title' level={3}>{data.court_name ?? ''}</Title>
                <Title level={5} id='subtitle'>{data.booked_by && data.booked_by.name}</Title>

                <Title level={5} id='subtitle'>Payment Date:
                    <span style={{ marginLeft: 10 }}>
                        <Text>{data.payment && (data.payment).length > 0 ? moment(data.payment[0].payment_date).format('DD/MM/YYYY') : ''}</Text>
                    </span>
                </Title>

                <Title level={5} id='subtitle'>Payment Status:
                    <span style={{ marginLeft: 10 }}>
                        <Text style={{ color: statusBackgroundColor(data.payment_status), textTransform: 'uppercase' }}>{data.payment_status ?? ''}</Text>
                    </span>
                </Title>


                {(data.payment_status !== "unpaid" && data.payment_status !== "pending") &&
                    <div style={{ textAlign: 'center', marginTop: 20 }}>
                        <Button type="primary" onClick={() => setVisibleImage(true)} style={{ background: 'var(--themeColor)', float: 'center' }}>
                            View Attachment
                        </Button>
                    </div>
                }
            </div>
        </Modal>
    )

    const previewImage = (
        <Image
            width={200}
            style={{
                display: 'none',
            }}
            src={data.image ? BASE_URL + '/storage/' + data.image : ''}
            preview={{
                movable: false,
                mask: false,
                visible: visibleImage,
                src: data.images && (data.images).length > 0 ? BASE_URL + '/storage/' + data.images[0].image : null,
                onVisibleChange: (value) => {
                    setVisibleImage(value);
                },
            }}
        />
    )

    return (
        <>
            <Space style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Filter handleSearch={handleSearch} placeholder="Search User name" />
            </Space>

            <Table
                columns={columns}
                dataSource={dataSource.data}
                style={{ background: 'none' }}
                rowKey='id'
                pagination={{
                    onChange: (page, size) => handleChangePage(page),
                    current: dataSource.current_page,
                    pageSize: dataSource.per_page,
                    total: dataSource.total,
                }}
            />

            {renderModal}
            {previewImage}
        </>
    )
}

export default CourtUserPayments