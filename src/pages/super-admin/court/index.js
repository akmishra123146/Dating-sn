import { useEffect, useState } from "react";
import {
    Button, Card, Col, Empty, Form, Image, Input, Modal, Pagination, Row, Select, Space, Typography, notification, Popconfirm
} from "antd";
import { CloseCircleOutlined, CheckCircleOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { BASE_URL } from "../../../constants";
import { Filter, ImageUploader } from "../../../components";
import ajaxService from "../../../services/ajax-service";

const { Title, Text } = Typography;
const { Option } = Select;

const Courts = () => {
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
            court_rate: 0,
            city: { name: '' },
            court_owner: { name: '', phone: '', email: '' },
            images: [{ image: null }]
        }]
    });
    const [sports, setSports] = useState([]);
    const [fileList, setFileList] = useState([]);
    const [removedImages, setRemovedImages] = useState([]); // State for removed images
    const [countries, setCountries] = useState([]);
    const [cities, setCities] = useState([]);
    const [states, setStates] = useState([]);
    const [editingCourt, setEditingCourt] = useState(null); // Track court being edited
    const [isEditing, setIsEditing] = useState(false); // Toggle between creating/editing

    // Handle file upload and image removal
    const handleChange = (info) => {
        let updatedFileList = [...info.fileList];
        setFileList(updatedFileList);
    };

    const handleRemoveImage = (file) => {
       console.log('handleRemoveImage');
        if (file.uid && !file.originFileObj) {
            // If the image has an ID, track it for removal
            setRemovedImages((prev) => [...prev, file.uid]);
        }
        // Remove the image from fileList
        setFileList((prev) => prev.filter(item => item.uid !== file.uid));
    };

    const beforeUpload = (file) => {
        return true;
    };

    const onFinish = async () => {
        try {
            await form.validateFields();
            // setLoading(true);
    
            const images = fileList
                .filter(i => i.originFileObj) // Get newly added files
                .map(i => i.originFileObj);
    
            const data = new FormData();
    
            // Append form values to FormData
            for (const key in formData) {
                if (formData.hasOwnProperty(key)) {
                    const value = formData[key];
                    if (key === 'images') {
                        if (images.length > 0) {
                            images.forEach((file) => {
                                data.append('images[]', file);
                            });
                        }
                    } else if (key === 'interests') {
                        value.forEach((interest, index) => {
                            data.append(`interests[${index}]`, interest);
                        });
                    } else {
                        data.append(key, value);
                    }
                }
            }

            // Append removed images
            if (removedImages.length > 0) {
                removedImages.forEach((imageId) => {
                    console.log('remove_image',imageId);
                    data.append('remove_images[]', imageId);
                });
            }
    
            // console.log('Logging FormData contents outside put:');
            // for (let pair of data.entries()) {
            //     console.log(pair[0] + ':', pair[1]);
            // }
            if (isEditing) {
                data.append('_method', 'PUT');
            }

            // Send PUT or POST request
            const response = isEditing
                ? await ajaxService.post(`/court/${editingCourt.id}`, data)
                : await ajaxService.post('/court', data);
    
            if (response.success) {
                setLoading(false);
                handleCancel(); // Reset form and close modal
                initialize(); // Refresh court data
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

    const handleNext = async () => {
        try {
            await form.validateFields();
            setCurrentStep(currentStep + 1);
        } catch (error) {
            console.error('Form validation error:', error);
        }
    };

    function handleCancel() {
        setShowModal(false);
        form.resetFields();
        setFileList([]);
        setRemovedImages([]); // Reset removed images on cancel
        setCurrentStep(0);
        setIsEditing(false); // Reset editing state
        setEditingCourt(null); // Clear selected court
    }

    const handleSearch = async ({ name }) => {
        const response = await ajaxService.get(`/court?name=${name}`);
        const { success, data } = response;
        if (success) {
            if (data.data.length == 0) {
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
        const response = await ajaxService.get(`/court?name=${filter}&page=${page}`);
        if (response.success) {
            setData(response.data);
        }
    };

    const loadCountries = async () => {
        const response = await ajaxService.get('/country');
        if (response.success) {
            setCountries(response.data);
        }
    };

    const loadStates = async (id) => {
        if (id) {
            const response = await ajaxService.get(`/state?country_id=${id}`);
            if (response.success) {
                setStates(response.data);
            }
        } else {
            setStates([]);
            setCities([]);
            form.setFieldsValue({ state: undefined, city: undefined });
        }
    };

    const loadCities = async (id) => {
        if (id) {
            const response = await ajaxService.get(`/city?state_id=${id}`);
            if (response.success) {
                setCities(response.data);
            }
        } else {
            setCities([]);
            form.setFieldsValue({ city: undefined });
        }
    };

    const loadSports = async () => {
        const response = await ajaxService.get('/interest');
        const { success, data } = response;
        if (success) {
            setSports(data);
        }
    };

    const initialize = async () => {
        const response = await ajaxService.get('/court');
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

    // Edit court functionality
    const handleEdit = (court) => {
        setIsEditing(true);
        setEditingCourt(court);
        setShowModal(true);
        // Pre-fill the form with court data
        form.setFieldsValue({
            court_name: court.name,
            court_rate: court.court_rate,
            country: court.country?.id,
            state: court.state?.id,
            city: court.city?.id,
            name: court.court_owner.name,
            phone: court.court_owner.phone,
            email: court.court_owner.email,
            interests: court.interests.map(s => s.interest_id),
            longitude: court.longitude,
            latitude: court.latitude,
            platform_charges: court.platform_charges,
        });
        loadStates(court.country?.id);
        loadCities(court.state?.id);

        // Load any existing images
        setFileList(
            court.images.map(img => ({
                uid: img.id, // Use image ID as uid
                url: BASE_URL + '/storage/' + img.image,
                name: img.image,
            }))
        );
    };

    // Delete court functionality
    const handleDelete = async (courtId) => {
        try {
            const response = await ajaxService.delete(`/court/${courtId}`);
            if (response.success) {
                notification.open({
                    message: 'Court deleted successfully!',
                    icon: <CheckCircleOutlined style={{ color: '#108ee9' }} />
                });
                initialize(); // Reload courts
            } else {
                notification.open({
                    message: 'Failed to delete the court',
                    icon: <CloseCircleOutlined style={{ color: 'red' }} />
                });
            }
        } catch (error) {
            console.error('Delete error:', error);
        }
    };

    useEffect(() => {
        initialize();
        loadSports();
        loadCountries();
    }, []);

    const step1 = (
        <Form form={form} layout="vertical" onValuesChange={handleFormChange}>
            <Row gutter={16}>
                <Col span={24}>
                    <Form.Item name="images">
                        <ImageUploader
                            fileList={fileList}
                            beforeUpload={beforeUpload}
                            handleChange={handleChange}
                            handleRemove={handleRemoveImage}
                            length={3}
                        />
                    </Form.Item>
                </Col>

                <Col span={24}>
                    <Form.Item label={<b>Court Name</b>} name="court_name" rules={[{ required: true, message: 'Court name is required' }]}>
                        <Input placeholder="ABC Court..." allowClear />
                    </Form.Item>
                </Col>

                <Col span={12}>
                    <Form.Item label={<b>Court Owner Name</b>} name="name" rules={[{ required: true, message: 'Court owner name is required' }]}>
                        <Input placeholder="Name" allowClear />
                    </Form.Item>
                </Col>

                <Col span={12}>
                    <Form.Item label={<b>Country</b>} name="country" rules={[{ required: true, message: 'Country is required' }]}>
                        <Select
                            placeholder="Select Country"
                            showSearch allowClear
                            style={{ width: '100%' }}
                            onChange={(id) => loadStates(id)}
                            filterOption={(input, option) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}>
                            {countries.map(({ id, name }) => {
                                return <Option key={id} value={id}>{name}</Option>
                            })}
                        </Select>
                    </Form.Item>
                </Col>

                <Col span={12}>
                    <Form.Item label={<b>State</b>} name="state" rules={[{ required: true, message: 'State is required' }]}>
                        <Select
                            placeholder="Select State"
                            showSearch allowClear
                            style={{ width: '100%' }}
                            onChange={(id) => loadCities(id)}
                            filterOption={(input, option) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}>
                            {states.map(({ id, name }) => {
                                return <Option key={id} value={id}>{name}</Option>
                            })}
                        </Select>
                    </Form.Item>
                </Col>

                <Col span={12}>
                    <Form.Item label={<b>City</b>} name="city" rules={[{ required: true, message: 'City is required' }]}>
                        <Select
                            placeholder="Select City"
                            showSearch allowClear
                            style={{ width: '100%' }}
                            filterOption={(input, option) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}>
                            {cities.map(({ id, name }) => {
                                return <Option key={id} value={id}>{name}</Option>
                            })}
                        </Select>
                    </Form.Item>
                </Col>

                <Col span={24}>
                    <Form.Item label={<b>Select Sports</b>} name="interests" rules={[{ required: true, message: 'Sport is required' }]}>
                        <Select
                            mode="multiple"
                            placeholder="Select Sports"
                            showSearch allowClear
                            style={{ width: '100%' }}
                            filterOption={(input, option) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}>
                            {sports.map(({ id, name }) => {
                                return <Option key={id} value={id}>{name}</Option>
                            })}
                        </Select>
                    </Form.Item>
                </Col>

                <Col span={24}>
                    <Form.Item label={<b>Court Rate</b>} name="court_rate" rules={[{ required: true, message: 'Court rate is required' }]}>
                        <Input placeholder="Rate per/hour" type="number" step={0.01} allowClear />
                    </Form.Item>
                </Col>

                <Col span={24}>
                    <Form.Item label={<b>Platform Commission In Percentage</b>} name="platform_charges" rules={[{ required: true, message: 'Platform commission in percentage is required' }]}>
                        <Input placeholder="Platform Commission In Percentage" type="number" step={0.01} allowClear />
                    </Form.Item>
                </Col>

                <Col span={12}>
                    <Form.Item label={<b>Longitude</b>} name="longitude" rules={[{ required: true, message: 'Longitude is required' }]}>
                        <Input type="number" step={0.01} placeholder="Logitude" allowClear />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item label={<b>Latitude</b>} name="latitude" rules={[{ required: true, message: 'Latitude is required' }]}>
                        <Input type="number" step={0.01} placeholder="Latitude" allowClear />
                    </Form.Item>
                </Col>

            </Row>
        </Form>
    );

    const step2 = (
        <Form form={form} layout="vertical" onValuesChange={handleFormChange}>
            <Row gutter={16}>
                <Col span={24}>
                    <Form.Item label={<b>Phone</b>} name="phone" rules={[{ required: true, message: 'Phone is required' }]}>
                        <Input type="number" placeholder="Phone No." allowClear />
                    </Form.Item>
                </Col>

                {!isEditing && (
                    <>
                        <Col span={24}>
                            <Form.Item label={<b>Email</b>} name="email" rules={[{ required: true, message: 'Email is required' }]}>
                                <Input placeholder="Email" allowClear />
                            </Form.Item>
                        </Col>

                        <Col span={24}>
                            <Form.Item label={<b>Password</b>} name="password" rules={[{ required: true, message: 'Password is required' }]}>
                                <Input.Password placeholder="Password" allowClear />
                            </Form.Item>
                        </Col>

                        <Col span={24}>
                            <Form.Item
                                label={<b>Confirm Password</b>}
                                name="confirm"
                                dependencies={['password']}
                                rules={[
                                    {
                                        required: true,
                                        message: 'Please confirm your password!',
                                    },
                                    ({ getFieldValue }) => ({
                                        validator(_, value) {
                                            if (!value || getFieldValue('password') === value) {
                                                return Promise.resolve();
                                            }
                                            return Promise.reject(new Error('The new password that you entered do not match!'));
                                        },
                                    }),
                                ]}
                            >
                                <Input.Password placeholder="Confirm password" allowClear />
                            </Form.Item>
                        </Col>
                    </>
                )}
            </Row>
        </Form>
    );

    const steps = [step1, step2];

    const renderModal = (
        <Modal
            className="court-modal"
            width="35%"
            open={showModal}
            maskClosable={false}
            onCancel={handleCancel}
            footer={[
                <div key="div" style={{ textAlign: 'center' }}>
                    {currentStep > 0 && (
                        <Button key="back" onClick={() => setCurrentStep(currentStep - 1)} className="modal-button">
                            Previous
                        </Button>
                    )}
                    {currentStep < steps.length - 1 && (
                        <>
                            <Button key="cancel" onClick={handleCancel} className="modal-button">
                                Cancel
                            </Button>
                            <Button key="next" type="primary" onClick={handleNext} style={{ background: 'var(--themeColor)', marginLeft: 10 }} className="modal-button">
                                Next
                            </Button>
                        </>
                    )}
                    {currentStep === steps.length - 1 && (
                        <Button key="finish" type="primary" onClick={onFinish} style={{ background: 'var(--themeColor)' }} className="modal-button" loading={loading}>
                            {isEditing ? 'Update' : 'Save'}
                        </Button>
                    )}
                </div>
            ]}
        >
            <div style={{ marginTop: 5 }}>{steps[currentStep]}</div>
        </Modal>
    );

    const renderContent = (
        <Row gutter={[30, 25]}>
            {
                (data.data).map((court, i) => (
                    <Col span={12} key={i}>
                        <Card style={{ borderRadius: '20px' }}>
                            <Row gutter={16}>
                                <Col span={17}>
                                    <Title level={4} style={{ color: '#0580a6', textTransform: 'capitalize' }}>{court.name}</Title>

                                    <Row>
                                        <Col span={4}>
                                            <Text><b>City</b></Text>
                                        </Col>
                                        <Col span={18}>
                                            <Text>{court.city.name}</Text>
                                        </Col>

                                        <Col span={4}>
                                            <Text><b>Name</b></Text>
                                        </Col>
                                        <Col span={18}>
                                            <Text>{court.court_owner.name}</Text>
                                        </Col>

                                        <Col span={4}>
                                            <Text><b>Phone</b></Text>
                                        </Col>
                                        <Col span={18}>
                                            <Text>{court.court_owner.phone}</Text>
                                        </Col>

                                        <Col span={4}>
                                            <Text><b>Email</b></Text>
                                        </Col>
                                        <Col span={18}>
                                            <Text>{court.court_owner.email}</Text>
                                        </Col>
                                    </Row>
                                </Col>
                                <Col span={7}>
                                    <Image
                                        preview={false}
                                        width={170}
                                        height={163}
                                        style={{ borderRadius: '30px' }}
                                        src={court.images[0]?.image && BASE_URL + '/storage/' + court.images[0]?.image}
                                    />
                                </Col>
                            </Row>

                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
                                <Text>Price:</Text>
                                <Text><b>{court.court_rate}/ per hour</b></Text>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: "10px", marginTop: 10 }}>
                                <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(court)}>Edit</Button>
                                <Popconfirm
                                    title="Are you sure you want to delete this court?"
                                    onConfirm={() => handleDelete(court.id)}
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
                <Filter handleSearch={handleSearch} placeholder="Search court name" />
                <Button type="primary" style={{ background: 'var(--themeColor)' }} onClick={() => setShowModal(true)}>Create Court</Button>
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

export default Courts;
