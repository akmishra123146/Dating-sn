import { useState } from "react"
import { CheckCircleOutlined, CloseCircleOutlined, DeleteOutlined, EditOutlined } from "@ant-design/icons"
import { Button, Col, DatePicker, Form, Modal, Row, Space, Table, Typography, notification } from "antd"
import moment from "moment"
import ajaxService from "../../../services/ajax-service"
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);

const { Text, Title } = Typography

const ClosedDateTable = ({ data, setForceRefresh }) => {

    let [form] = Form.useForm()

    const [showModal, setShowModal] = useState(false)
    const [isDelete, setIsDelete] = useState(false)

    const dateFormated = (date) => (
        <Text>{moment(date).format('DD-MMM-YYYY')}</Text>
    )

    const columns = [
        {
            title: 'S.No',
            key: 'name',
            width: '6%',
            render: (text, record, index) => <Text>{index + 1}</Text>
        },
        {
            title: 'Closed Date',
            dataIndex: 'closed_date',
            key: 'closed_date',
            render: (closed_date) => dateFormated(closed_date)
        },
        {
            title: 'Created Date',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (created_at) => dateFormated(created_at)
        },
        {
            title: 'Updated Date',
            dataIndex: 'updated_at',
            key: 'updated_at',
            render: (updated_at) => dateFormated(updated_at)
        },
        {
            title: 'Actions',
            key: 'address',
            render: (text, record) => (
                <Space size='small'>
                    <Button type='primary' size="small" style={{ background: "#C9DBD7", color: '#658664', fontSize: '16px' }} onClick={() => openModal(record.id)}>
                        <EditOutlined />
                    </Button>
                    <Button type='primary' size="small" style={{ background: "#EBDEE1", color: '#FF9595', fontSize: '16px' }} danger onClick={() => openModal(record.id, true)}>
                        <DeleteOutlined />
                    </Button>
                </Space>
            )
        }
    ]

    const onFinish = async (values) => {
        const momentDate = values.closed_date;
        const formattedDate = momentDate.format('YYYY-MM-DD HH:mm:ss');

        const id = localStorage.getItem('closedDateID');
        const courtID = localStorage.getItem('courtID');

        const data = {
            closed_date: formattedDate,
            court_id: courtID
        }

        const response = await ajaxService.post('/edit-closed-date/' + id, data)

        if (response.success) {
            localStorage.removeItem('closedDateID');
            setForceRefresh(true)
            setShowModal(false)
            notification.open({ message: response.message, icon: <CheckCircleOutlined style={{ color: '#108ee9' }} /> })
        } else {
            for (const key in response.data) {
                const message = JSON.stringify(response.data[key]).slice(1, -1).replace(/"/g, '');
                notification.open({ message: message, icon: <CloseCircleOutlined style={{ color: 'red' }} /> })
            }
        }
    }

    const onFinishFailed = errorInfo => {
        console.log('Failed: ' + errorInfo)
    }

    const deleteRow = async () => {

        let id = localStorage.getItem('closedDateID')

        let response = await ajaxService.delete('/del-closed-date/', id)

        if (response.success) {
            localStorage.removeItem('closedDateID')
            setForceRefresh(true)
            setShowModal(false)
            notification.open({ message: response.message, icon: <CheckCircleOutlined style={{ color: '#108ee9' }} /> })
        }
    }

    const openModal = (id, isDelete = false) => {
        setIsDelete(isDelete)
        localStorage.setItem('closedDateID', id)
        setShowModal(true)

        if (!isDelete) {
            const date = data.find(i => i.id === id).closed_date;
            form.setFieldsValue({ closed_date: dayjs(date) })
        }
    }

    const modalContent = () => {
        if (isDelete) {
            return (
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <p><b>Are you sure you want to delete this row?</b></p>
                </div>
            )
        } else {
            return (
                <>
                    <div style={{ marginBottom: 20, textAlign: 'center' }}>
                        <Title id='modal-title' level={3}>Add New Question</Title>
                    </div>
                    <Form form={form} layout="vertical" onFinish={onFinish} onFinishFailed={onFinishFailed}>
                        <Row gutter={16}>
                            <Col span={24}>
                                <Form.Item label={<b>Update Closed Date</b>} name="closed_date" rules={[{ required: true, message: 'Closed date is required' }]}>
                                    <DatePicker style={{ width: '100%' }} />
                                </Form.Item>
                            </Col>
                        </Row>
                    </Form>
                </>
            )
        }
    }

    const renderModal = (
        <Modal
            className="court-modal second-modal"
            width="35%"
            open={showModal}
            maskClosable={false}
            onCancel={() => setShowModal(false)}
            footer={null}
        >
            <div style={{ padding: '15px 20px', marginTop: 25 }}>
                {modalContent()}

                <div style={{ textAlign: 'center' }}>
                    <Button key="delete" onClick={() => setShowModal(false)} style={{ marginRight: "10px" }}>
                        Close
                    </Button>
                    <Button key="finish" type="primary" onClick={() => { isDelete ? deleteRow() : form.submit() }} style={{ background: 'var(--themeColor)' }}>
                        {isDelete ? "Delete" : 'Update'}
                    </Button>
                </div>
            </div>
        </Modal >
    )

    return (
        <>
            <Table
                rowKey='id'
                dataSource={data}
                columns={columns}
                pagination={false}
                style={{ marginTop: 20 }}
            />
            {renderModal}
        </>
    )
}

export default ClosedDateTable