import { useEffect, useState } from "react";
import {
    Button, Card, Col, Empty, Form, Input, Modal, Pagination, Row, Select, Space, Typography, notification, Popconfirm
} from "antd";
import { CloseCircleOutlined, CheckCircleOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { Filter } from "../../../components";
import ajaxService from "../../../services/ajax-service";

const { Title, Text } = Typography;
const { Option } = Select;

const Memberships = () => {
    const [form] = Form.useForm();
    const [showModal, setShowModal] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [filter, setFilter] = useState('');
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(false);
    const [renderData, setRenderData] = useState(true);
    const [data, setData] = useState({
        data: [{
            name: '',
            fee: 0,
            duration: 0,
            benefits: '',
        }]
    });
    const [editingMembership, setEditingMembership] = useState(null); // Track membership being edited
    const [isEditing, setIsEditing] = useState(false); // Toggle between creating/editing

    const onFinish = async () => {
        try {
            await form.validateFields();

            const membershipData = { ...formData };

            if (isEditing) {
                membershipData._method = 'PUT';
            }

            const response = isEditing
                ? await ajaxService.post(`/membership/${editingMembership.id}`, membershipData)
                : await ajaxService.post('/membership', membershipData);

            if (response.success) {
                setLoading(false);
                handleCancel();
                initialize();
                notification.open({
                    message: response.message,
                    icon: <CheckCircleOutlined style={{ color: '#108ee9' }} />,
                });
            } else {
                setLoading(false);
                Object.keys(response.data).forEach(key => {
                    const message = JSON.stringify(response.data[key])
                        .slice(1, -1)
                        .replace(/"/g, '');
                    notification.open({
                        message: message,
                        icon: <CloseCircleOutlined style={{ color: 'red' }} />,
                    });
                });
            }
        } catch (error) {
            setLoading(false);
            console.error('Form submission error:', error);
            notification.error({
                message: 'Error',
                description: 'An error occurred while submitting the form.',
                icon: <CloseCircleOutlined style={{ color: 'red' }} />,
            });
        }
    };

    const handleFormChange = (changedValues, allValues) => {
        setFormData({ ...formData, ...allValues });
    };

    function handleCancel() {
        setShowModal(false);
        form.resetFields();
        setCurrentStep(0);
        setIsEditing(false);
        setEditingMembership(null);
    }

    const handleSearch = async ({ name }) => {
        const response = await ajaxService.get(`/membership?name=${name}`);
        const { success, data } = response;
        if (success) {
            if (data.data.length === 0) {
                setFilter('');
                notification.open({
                    message: `${name} is not found!`,
                    icon: <CloseCircleOutlined style={{ color: 'red' }} />
                });
            } else {
                setFilter(name);
            }
            setData(data);
        }
    };

    const handleChangePage = async (page) => {
        const response = await ajaxService.get(`/membership?name=${filter}&page=${page}`);
        if (response.success) {
            setData(response.data);
        }
    };

    const initialize = async () => {
        const response = await ajaxService.get('/membership');
        const { success, data } = response;
        if (success) {
            if (data.data) {
                if (data.data.length === 0) setRenderData(false);
                setData(data);
            } else {
                setRenderData(false);
            }
        }
    };

    // Edit membership functionality
    const handleEdit = (membership) => {
        setIsEditing(true);
        setEditingMembership(membership);
        setShowModal(true);
        form.setFieldsValue({
            name: membership.name,
            fee: membership.fee,
            duration: membership.duration,
            benefits: membership.benefits,
        });
    };

    // Delete membership functionality
    const handleDelete = async (membershipId) => {
        try {
            const response = await ajaxService.delete(`/membership/${membershipId}`);
            if (response.success) {
                notification.open({
                    message: 'Membership deleted successfully!',
                    icon: <CheckCircleOutlined style={{ color: '#108ee9' }} />
                });
                initialize();
            } else {
                notification.open({
                    message: 'Failed to delete the membership',
                    icon: <CloseCircleOutlined style={{ color: 'red' }} />
                });
            }
        } catch (error) {
            console.error('Delete error:', error);
        }
    };

    useEffect(() => {
        initialize();
    }, []);

    const step1 = (
        <Form form={form} layout="vertical" onValuesChange={handleFormChange}>
            <Row gutter={16}>
                <Col span={24}>
                    <Form.Item label={<b>Membership Name</b>} name="name" rules={[{ required: true, message: 'Membership name is required' }]}>
                        <Input placeholder="Basic, Premium, Gold..." allowClear />
                    </Form.Item>
                </Col>
                <Col span={24}>
                    <Form.Item label={<b>Membership Fee</b>} name="fee" rules={[{ required: true, message: 'Fee is required' }]}>
                        <Input placeholder="Fee" type="number" step={0.01} allowClear />
                    </Form.Item>
                </Col>
                <Col span={24}>
                    <Form.Item label={<b>Duration (in months)</b>} name="duration" rules={[{ required: true, message: 'Duration is required' }]}>
                        <Input placeholder="Duration" type="number" step={1} allowClear />
                    </Form.Item>
                </Col>
                <Col span={24}>
                    <Form.Item label={<b>Benefits</b>} name="benefits" rules={[{ required: true, message: 'Benefits are required' }]}>
                        <Input.TextArea placeholder="Benefits of membership" allowClear />
                    </Form.Item>
                </Col>
            </Row>
        </Form>
    );

    const steps = [step1];

    const renderModal = (
        <Modal
            className="membership-modal"
            width="35%"
            open={showModal}
            maskClosable={false}
            onCancel={handleCancel}
            footer={[
                <div key="div" style={{ textAlign: 'center' }}>
                    <Button key="cancel" onClick={handleCancel} className="modal-button">
                        Cancel
                    </Button>
                    <Button key="finish" type="primary" onClick={onFinish} style={{ background: 'var(--themeColor)' }} className="modal-button" loading={loading}>
                        {isEditing ? 'Update' : 'Save'}
                    </Button>
                </div>
            ]}
        >
            <div style={{ marginTop: 5 }}>{steps[currentStep]}</div>
        </Modal>
    );

    const renderContent = (
        <Row gutter={[30, 25]}>
            {
                (data.data).map((membership, i) => (
                    <Col span={12} key={i}>
                        <Card style={{ borderRadius: '20px' }}>
                            <Title level={4} style={{ color: '#0580a6' }}>{membership.name}</Title>
                            <Text><b>Fee:</b> ${membership.fee}</Text><br />
                            <Text><b>Duration:</b> {membership.duration} months</Text><br />
                            <Text><b>Benefits:</b> {membership.benefits}</Text>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: "10px", marginTop: 10 }}>
                                <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(membership)}>Edit</Button>
                                <Popconfirm
                                    title="Are you sure you want to delete this membership?"
                                    onConfirm={() => handleDelete(membership.id)}
                                    okText="Yes"
                                    cancelText="No"
                                >
                                    <Button type="link" icon={<DeleteOutlined />} danger>Delete</Button>
                                </Popconfirm>
                            </div>
                        </Card>
                    </Col>
                ))
            }
        </Row>
    );

    return (
        <>
            <Space style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Filter handleSearch={handleSearch} placeholder="Search membership name" />
                <Button type="primary" style={{ background: 'var(--themeColor)' }} onClick={() => setShowModal(true)}>Create Membership</Button>
            </Space>
            <br />
            {renderData && data.data[0]?.name ? renderContent : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />}
            <br />
            <div style={{ textAlign: 'right' }}>
                <Pagination
                    current={data.current_page}
                    pageSize={data.per_page}
                    total={data.total}
                    onChange={(page, size) => handleChangePage(page)}
                />
            </div>
            {renderModal}
        </>
    );
};

export default Memberships;
