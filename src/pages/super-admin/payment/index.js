import { Avatar, Button, Col, Form, Modal, Radio, Row, Space, Table, Typography, Upload, notification } from "antd"
import { CheckCircleOutlined, CloseCircleOutlined, PaperClipOutlined } from "@ant-design/icons"
import moment from "moment";
import { useEffect, useState } from "react";
import ajaxService from "../../../services/ajax-service";
import { Filter } from "../../../components";
import { statusBackgroundColor } from "../../../utils";
import { BASE_URL } from "../../../constants";

const { Text, Title } = Typography

const formatTimeRange = (start, end) => {
    return `${moment(start).format('h:mm')}-${moment(end).format('h:mm A')}`;
};

const BUNDLE = 'bundle-subscription'
const PREMIUM = 'premium-subscription'

const Payments = () => {

    let [form] = Form.useForm()

    const [loading, setLoading] = useState(false)

    const [type, setType] = useState(PREMIUM)
    const [premium, setPremium] = useState(false)
    const [releasePayment, setReleasePayment] = useState(false)
    const [filter, setFilter] = useState('')
    const [showModal, setShowModal] = useState(false)
    const [data, setData] = useState({})
    const [dataSource, setDataSource] = useState({})
    const [fileList, setFileList] = useState([])

    const onFinish = async (values) => {

        setLoading(true)

        const formData = new FormData()
        formData.append('image', fileList[0].originFileObj)

        const response = await ajaxService.post('/release-payment/' + data.id, formData)
        if (response.success) {
            setLoading(false)
            form.resetFields()
            setFileList([])
            setShowModal(false)
            handleReleasePayment()
            notification.open({ message: "Payment released successfully", icon: <CheckCircleOutlined style={{ color: '#108ee9' }} /> })
        } else {
            setLoading(false)
            handleReleasePayment()
            if (!response.data) {
                notification.open({ message: response.message, icon: <CloseCircleOutlined style={{ color: 'red' }} /> })
            } else {
                for (const key in response.data) {
                    const message = JSON.stringify(response.data[key]).slice(1, -1).replace(/"/g, '');
                    notification.open({ message: message, icon: <CloseCircleOutlined style={{ color: 'red' }} /> })
                }
            }
        }
    }

    const onFinishFailed = (errorInfo) => {
        console.error('Failed : ' + errorInfo);
    }

    const handleChange = (info) => {
        let fileList = [...info.fileList];
        setFileList(fileList);
    };

    const handleClick = (id) => {
        const findData = dataSource.data.find(i => i.id === id)
        setData(findData)
        setShowModal(true)
    }

    const handleType = (type) => {
        setType(type)
        initialize(true, type)
    }

    const columns = [
        {
            title: 'Name',
            dataIndex: 'id',
            key: 'name',
            render: (text, record) => (
                <>
                    <Text style={{ fontWeight: 'bold' }}>{record.booked_by ? record.booked_by.name : record.user.name}</Text>
                    <br />
                    <Text>{record.booked_by ? record.booked_by.email : record.user.email}</Text>
                </>
            )
        },
        {
            title: 'Payment Date',
            dataIndex: 'payment_date',
            key: 'payment_date',
            render: (text, record) => {
                if (record.payment && record.payment[0]?.payment_date) {
                    return moment(record.payment[0].payment_date).format('DD-MMM-YYYY')
                } else if (record.payment_date) {
                    return moment(record.payment_date).format('DD-MMM-YYYY')
                } else {
                    return ''
                }
            }
        },
        {
            title: 'Court Name',
            dataIndex: 'court_name',
            key: 'court_name',
            hidden: true
        },
        {
            title: 'Payment',
            dataIndex: premium ? 'amount' : 'total_amount',
            key: 'total_amount',
            render: (amount) => <Text>{amount ?? "0.00"}</Text>
        },
        {
            title: releasePayment ? 'Actions' : 'Status',
            dataIndex: 'payment_status',
            key: 'payment_status',
            render: (status, record) => releasePayment ? (
                <Button type='primary' style={{ background: 'var(--themeColor)' }} onClick={() => handleClick(record.id)}>
                    Release
                </Button>
            ) : (
                <Button type='primary' size="small" style={{ background: statusBackgroundColor(status), width: 80, fontSize: 12, cursor: 'default', textTransform: 'uppercase' }}>
                    {status}
                </Button>
            ),
        },
    ];

    if (releasePayment) {
        columns.splice(1, 1)
    }

    if (premium) {
        columns.splice(4, 1)
    }

    const handlePremiumPayment = () => {
        setPremium(true)
        initialize(true)
    }

    const handleReleasePayment = async (name = null) => {
        setPremium(false)
        setReleasePayment(true)
        const response = await ajaxService.get(`/release-payment?name=${name ?? filter}`);
        if (response.success) {
            setDataSource(response)
        }
    }

    const fetchData = async (url, search = false, name = '') => {
        const response = await ajaxService.get(url);
        const { success, data } = response;

        if (success) {
            if (search) {
                if (data.data.length === 0) {
                    notification.open({ message: `${name} is not found!`, icon: <CloseCircleOutlined style={{ color: 'red' }} /> });
                }
            }

            setDataSource(data);
        }
    };

    const handleChangePage = async (page) => {
        const url = `/${premium ? "premium-payments?type=" + type + "&" : "court-payment?"}name=${filter}&page=${page}`;
        await fetchData(url);
    };

    const handleSearch = async ({ name }) => {
        setFilter(name ?? '');
        if (releasePayment) {
            handleReleasePayment(name);
        } else {
            const url = `/${premium ? "premium-payments?type=" + type + "&" : "court-payment?"}name=${name}`;
            await fetchData(url, true, name);
        }
    };

    const initialize = async (premium = false, filterType = type) => {
        const url = `/${premium ? "premium-payments?type=" + filterType + "&" : "court-payment?"}name=${filter}`;
        await fetchData(url);
    };

    useEffect(() => {
        initialize()
    }, [])

    const renderModal = (
        <Modal
            className="court-modal second-modal"
            width="30%"
            open={showModal}
            maskClosable={false}
            onCancel={() => setShowModal(false)}
            footer={null}
        >
            <div style={{ padding: '3px 20px', marginTop: 25 }}>
                <Title id='modal-title' level={3}>{data.court_name}</Title>
                <br />
                <Row gutter={100}>

                    <Col span={5}>
                        <Avatar
                            size={90}
                            src={`${BASE_URL}/storage/${data.booked_by?.images?.[0]?.image || ''}`}
                        />
                    </Col>
                    <Col span={19}>
                        <Text style={{ fontWeight: 'bolder', fontSize: 17 }}>{data.booked_by && data.booked_by.name}</Text>
                        <br />
                        <Text style={{ fontWeight: 'bold' }}>{data.booked_by && data.booked_by.email}</Text>
                        <br />
                        <Text>{data.booked_by && data.booked_by.bio}</Text>
                    </Col>

                    <Col span={24} style={{ marginTop: 20, marginLeft: 10 }}>
                        <Row gutter={16}>
                            <Col span={7}>
                                <Text style={{ fontWeight: 'bolder' }}>Payment Date :</Text>
                            </Col>
                            <Col span={17}>
                                <Text>{data.payment && (data.payment).length > 0 ? moment(data.payment[0].payment_date).format('DD/MM/YYYY') : ''}</Text>
                            </Col>
                            <Col span={7}>
                                <Text style={{ fontWeight: 'bolder' }}>Match Slot :</Text>
                            </Col>
                            <Col span={17}>
                                <Text>{data.slot && (data.slot).length > 0 ? formatTimeRange(data.slot[0].start_time, data.slot[0].end_time) : ''}</Text>
                            </Col>
                        </Row>
                    </Col>
                </Row>
                <br />

                <Form form={form} onFinish={onFinish} onFinishFailed={onFinishFailed}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Form.Item name="image" rules={[{ required: true, message: 'Attachment is required' }]}>
                            <Upload
                                maxCount={1}
                                fileList={fileList}
                                onChange={handleChange}
                                customRequest={(e) => e.onSuccess()}
                            >
                                <Button icon={<PaperClipOutlined />} >Add Attachment</Button>
                            </Upload>
                        </Form.Item>

                        <Button
                            htmlType="submit"
                            type="primary"
                            loading={loading}
                            style={{ background: 'var(--themeColor)', width: 140, height: 35 }}
                        >
                            Release
                        </Button>
                    </div>
                </Form>
            </div>
        </Modal >
    )

    return (
        <>
            <Space style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>

                <Filter handleSearch={handleSearch} placeholder="Search user name" />

                {premium &&
                    <Radio.Group onChange={(e) => handleType(e.target.value)} value={type}>
                        <Radio value={PREMIUM}>Premium</Radio>
                        <Radio value={BUNDLE}>Bundle</Radio>
                    </Radio.Group>
                }

                <Space>
                    {!releasePayment && (
                        <>
                            <Button type="primary" style={{ background: 'var(--themeColor)', height: 35 }} onClick={() => handleReleasePayment()}>Release Court Payments</Button>
                            {!premium && <Button type="primary" style={{ background: 'var(--themeColor)', height: 35 }} onClick={handlePremiumPayment}>View Premium Payments</Button>}
                        </>
                    )}
                </Space>
            </Space>

            <Table
                columns={columns}
                dataSource={dataSource.data}
                style={{ background: 'none' }}
                rowKey='id'
                pagination={releasePayment ? false : {
                    onChange: (page, size) => handleChangePage(page),
                    current: dataSource.current_page,
                    pageSize: dataSource.per_page,
                    total: dataSource.total,
                    showSizeChanger: false
                }}
            />
            {renderModal}
        </>
    )
}

export default Payments