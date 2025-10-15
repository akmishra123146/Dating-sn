import { Button, Col, DatePicker, Form, Image, Input, Modal, Row, Select, Space, Table, Typography, notification } from "antd"
import { Filter } from "../../../components"
import { useEffect, useState } from "react"
import { CheckCircleOutlined, CloseCircleOutlined, DeleteOutlined, EyeOutlined } from "@ant-design/icons"
import moment from "moment"
import ajaxService from "../../../services/ajax-service"
import { BASE_URL } from "../../../constants"
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);

const { Option } = Select
const { Text, Title } = Typography

const formatTimeRange = (start, end) => {
    return `${moment(start).format('h:mm A')} - ${moment(end).format('h:mm A')}`;
};

const format = "YYYY-MM-DD";

const CourtUserBookings = () => {

    const [form] = Form.useForm()
    const courtID = localStorage.getItem('courtID');

    const [filter, setFilter] = useState('')
    const [loading, setLoading] = useState(false)
    const [showFormModal, setShowFormModal] = useState(false)
    const [showViewModal, setShowViewModal] = useState(false)
    const [data, setData] = useState([])
    const [dataSource, setDataSource] = useState({})
    const [slots, setSlots] = useState([])

    const handleChangePage = async (page) => {
        const response = await ajaxService.get(`/court-payment?name=${filter}&page=${page}`)
        if (response.success) {
            setDataSource(response.data)
        }
    }

    const handleClick = (id) => {
        const findData = (dataSource.data).find(i => i.id === id)
        setData(findData)
        setShowViewModal(true)
    }

    function handleCancel() {
        setShowFormModal(false);
        form.resetFields();
    }

    const columns = [
        {
            title: 'Name',
            key: 'name',
            render: (text, record) => (
                <>
                    <Text style={{ fontWeight: 'bold' }}>{record.customer_name}</Text>
                    <br />
                    <Text>{record.customer_email}</Text>
                </>
            )
        },
        {
            title: 'Created Date',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (created_at) => (<Text>{moment(created_at).format('DD-MMM-YYYY')}</Text>)
        },
        {
            title: 'Booking Date',
            dataIndex: 'day',
            key: 'day',
            render: (day) => (<Text>{moment(day).format('DD-MMM-YYYY')}</Text>)
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
                </Space >
            )
        },
    ];

    const onFinish = async (values) => {
        setLoading(true)

        let startTime = [];
        let endTime = [];

        values.timing.map(i => {
            const split = i.split(',')

            startTime.push(split[0])
            endTime.push(split[1])

        })

        values.court_id = courtID;
        values.payment_type = 'single';

        const formData = new FormData()

        for (const key in values) {
            if (values.hasOwnProperty(key)) {
                const value = values[key];
                if (key === 'timing') {
                    for (const index in startTime) {
                        formData.append(`time_start[${index}]`, `${values.day.format(format)} ${startTime[index]}`)
                        formData.append(`time_end[${index}]`, `${values.day.format(format)} ${endTime[index]}`)
                    }
                } else if (key === 'day') {
                    formData.append(`day`, values.day.format(`${format} 00:00:00`))
                } else {
                    formData.append(key, value);
                }
            }
        }

        const response = await ajaxService.post('/booking', formData);
        if (response.success) {
            setLoading(false)
            if (typeof response.data === 'string') {
                notification.open({ message: response.data, icon: <CloseCircleOutlined style={{ color: 'red' }} /> })
            } else {
                handleCancel()
                initialize()
                notification.open({ message: response.message, icon: <CheckCircleOutlined style={{ color: '#108ee9' }} /> })
            }
        } else {
            setLoading(false)
            for (const key in response.data) {
                const message = JSON.stringify(response.data[key]).slice(1, -1).replace(/"/g, '');
                notification.open({ message: message, icon: <CloseCircleOutlined style={{ color: 'red' }} /> })
            }
        }
    }

    const onFinishFailed = (errorInfo) => {
        console.error('Failed : ' + errorInfo)
    }

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

    const loadSlots = async () => {
        const response = await ajaxService.get('/get-court-availibility/' + courtID)
        if (response.length > 0) {
            setSlots(response)
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
        loadSlots()
    }, [])

    const renderViewModal = (
        <Modal
            className="court-modal second-modal"
            width="35%"
            open={showViewModal}
            maskClosable={false}
            onCancel={() => setShowViewModal(false)}
            footer={[<div key="viewFooter"></div>]}
        >
            <div style={{ padding: '15px 20px 30px', marginTop: 25 }}>
                <div style={{ marginBottom: 20, textAlign: 'center' }}>
                    <Title id='modal-title' level={3}>View Booking Details</Title>
                </div>

                <Row gutter={16} style={{ margin: '0px 3px 0px 10px' }}>
                    <Col span={17}>
                        <Title level={3} style={{ color: '#0580a6' }}>{data.customer_name ?? ''}</Title>
                        <Row gutter={[16, 6]}>
                            <Col span={9}>
                                <Text style={{ fontWeight: 'bolder' }}>Timing</Text>
                            </Col>
                            <Col span={15}>
                                <Text>{data.slot && (data.slot).length > 0 ? formatTimeRange(data.slot[0].start_time, data.slot[0].end_time) : ''}</Text>
                            </Col>

                            <Col span={9}>
                                <Text style={{ fontWeight: 'bolder' }}>Day</Text>
                            </Col>
                            <Col span={15}>
                                <Text>{data.day ?? ''}</Text>
                            </Col>

                            <Col span={9}>
                                <Text style={{ fontWeight: 'bolder' }}>Customer Email</Text>
                            </Col>
                            <Col span={15}>
                                <Text>{data.customer_email ?? ''}</Text>
                            </Col>

                            <Col span={9}>
                                <Text style={{ fontWeight: 'bolder' }}>Customer Phone</Text>
                            </Col>
                            <Col span={15}>
                                <Text>{data.customer_phone ?? ''}</Text>
                            </Col>
                        </Row>

                    </Col>
                    <Col span={5} style={{ marginTop: 50 }}>
                        <Image
                            width={130}
                            height={129}
                            preview={false}
                            style={{ borderRadius: '25px' }}
                            src={`${BASE_URL}/storage/${data.court?.images?.[0]?.image || ''}`}
                        />
                    </Col>
                </Row>
            </div>
        </Modal>
    )

    const renderFormModal = (
        <Modal
            className="court-modal"
            width="35%"
            open={showFormModal}
            maskClosable={false}
            onCancel={handleCancel}
            footer={[
                <div style={{ textAlign: 'center' }} key="formFooter">
                    <Button className="modal-button" key="finish" type="primary" onClick={form.submit} style={{ background: 'var(--themeColor)', width: '250px' }} loading={loading}>
                        Create Manual Booking
                    </Button>
                </div>
            ]}
        >

            <div style={{ textAlign: 'center' }}>
                <Title id="modal-title" level={3}>Create Manual Booking</Title>
            </div>

            <Form
                layout="vertical"
                form={form}
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
                style={{ marginTop: 40 }}
                initialValues={{ day: dayjs() }}
            >
                <Row gutter={16}>
                    <Col span={24}>
                        <Form.Item label={<b>Name</b>} name="customer_name" rules={[{ required: true, message: 'Name is required' }]}>
                            <Input placeholder="Name" allowClear />
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <Form.Item label={<b>Timing</b>} name='timing' rules={[{ required: true, message: 'Timing is required' }]}>
                            <Select mode="multiple" placeholder="8:00 AM - 9:30 AM" allowClear>
                                {
                                    slots.map((x, index) => (
                                        <Option key={index} value={`${x.start_time},${x.end_time}`}>
                                            {formatTimeRange(
                                                moment(x.start_time, 'HH:mm:ss').format(`${format} HH:mm:ss`),
                                                moment(x.end_time, 'HH:mm:ss').format(`${format} HH:mm:ss`)
                                            )}
                                        </Option>
                                    ))
                                }
                            </Select>
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <Form.Item label={<b>Day</b>} name="day" rules={[{ required: true, message: 'Day is required' }]}>
                            <DatePicker style={{ width: "100%" }} allowClear placeholder="Friday - 12 - 2024" format={format} />
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <Form.Item
                            label={<b>Customer Email</b>}
                            name="customer_email"
                            rules={[
                                { type: 'email', message: 'The input is not valid email!' },
                                { required: true, message: 'Customer email is required' }
                            ]}
                        >
                            <Input type="email" placeholder="name@web.com" allowClear />
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <Form.Item label={<b>Customer Phone</b>} name="customer_phone" rules={[{ required: true, message: 'Customer phone is required' }]}>
                            <Input type="number" placeholder="123 456 7890" allowClear />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Modal>
    )

    return (
        <>
            <Space style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Filter handleSearch={handleSearch} placeholder="Search user name" />
                <Button type="primary" style={{ background: 'var(--themeColor)' }} onClick={() => setShowFormModal(true)}>Add Manual Booking</Button>
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
                    total: dataSource.total
                }}
            />
            {renderViewModal}
            {renderFormModal}
        </>
    )
}

export default CourtUserBookings