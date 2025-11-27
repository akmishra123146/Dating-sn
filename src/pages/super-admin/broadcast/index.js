import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  EyeOutlined,
  EditOutlined,
  SendOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import {
  Button,
  Col,
  Form,
  Input,
  Modal,
  Row,
  Space,
  Table,
  Typography,
  notification,
  Popconfirm,
  Checkbox,
  Select,
  Upload,
  Tag,
} from "antd";
import { useEffect, useState } from "react";
import ajaxService from "../../../services/ajax-service";
import { Filter } from "../../../components";
import { Link } from "react-router-dom";

const { Text, Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const BroadcastNotifications = () => {
  const [form] = Form.useForm();

  const [showModal, setShowModal] = useState(false);

  const [dataSource, setDataSource] = useState({ data: [], current_page: 1, per_page: 10, total: 0 });

  const [searchTerm, setSearchTerm] = useState('');

  const [editingBroadcast, setEditingBroadcast] = useState(null); // for edit mode

  const [users, setUsers] = useState([]); // for recipients select
  const [isAllChecked, setIsAllChecked] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);

  const pageSize = 10;

  const getStatusText = (stateId) => {
    switch (stateId) {
      case 1: return 'Draft';
      case 2: return 'Scheduled';
      case 3: return 'Sent';
      default: return 'Unknown';
    }
  };

  const getStatusColor = (stateId) => {
    switch (stateId) {
      case 3: return 'green';
      case 1: return 'blue';
      case 2: return 'orange';
      default: return 'default';
    }
  };

  const getRecipientsText = (recipients) => {
    if (!recipients) return 'N/A';
    const rec = typeof recipients === 'string' ? JSON.parse(recipients) : recipients;
    if (rec.includes('all')) return 'All Users';
    return `${rec.length} Users`;
  };

  const columns = [
    {
      title: "SNo",
      dataIndex: "id",
      key: "id",
      render: (text, record, index) => (
        (dataSource.current_page - 1) * dataSource.per_page + index + 1
      ),
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      render: (title) => <Text>{title}</Text>,
    },
    {
      title: "Message",
      key: "message",
      render: (_, record) => <Text>{record.message?.substring(0, 50)}...</Text>,
    },
    {
      title: "Recipients",
      key: "recipients",
      render: (_, record) => <Text>{getRecipientsText(record.recipients)}</Text>,
    },
    {
      title: "Status",
      key: "status_id",
      render: (_, record) => (
        <Tag color={getStatusColor(record.status_id)}>
          {getStatusText(record.status_id)}
        </Tag>
      ),
    },
    {
      title: "Sent At",
      key: "sent_at",
      render: (_, record) => <Text>{record.sent_at || 'N/A'}</Text>,
    },
  ];

  const fetchUsers = async () => {
    try {
      const response = await ajaxService.get("/broadcast-notifications/users");
      if (response.success) {
        setUsers(response.data.data || response.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  };

  const fetchBroadcasts = async (page = 1, search = '') => {
    try {
      const params = new URLSearchParams();
      if (search.trim()) {
        params.append('search', search.trim());
      }
      params.append('page', page.toString());
      params.append('per_page', pageSize.toString());

      const queryString = params.toString();
      console.log('Search payload (query params):', queryString); // Debug log to verify search param is included

      const response = await ajaxService.get(`/broad-cast-notifications?${queryString}`);
      if (response.success) {
        setDataSource({
          data: response.data.data || [],
          current_page: response.data.current_page || page,
          per_page: response.data.per_page || pageSize,
          total: response.data.total || 0
        });
      } else {
        setDataSource({ data: [], current_page: 1, per_page: pageSize, total: 0 });
      }
    } catch (error) {
      console.error("Failed to fetch broadcasts:", error);
      setDataSource({ data: [], current_page: 1, per_page: pageSize, total: 0 });
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchBroadcasts(1, '');
  }, []);

  const onFinish = async (values) => {
    let response;
    const formData = new FormData();
    formData.append('title', values.title);
    formData.append('message', values.message);
    if (values.image) {
      formData.append('image', values.image[0].originFileObj);
    }

    let recipients = [];
    if (isAllChecked) {
      recipients = ['all'];
    } else if (selectedUsers.length > 0) {
      recipients = selectedUsers;
    }
    recipients.forEach(recipient => {
      formData.append('recipients[]', recipient);
    });

    if (editingBroadcast) {
      // update with FormData
      response = await ajaxService.put('/broad-cast-notifications/', editingBroadcast.id, formData, true); // true for FormData
    } else {
      // create
      response = await ajaxService.post("/broad-cast-notifications", formData, true);
    }

    if (response.success) {
      handleCancel();
      fetchBroadcasts(dataSource.current_page, searchTerm);
      notification.open({
        message: response.message || (editingBroadcast ? "Broadcast updated successfully!" : "Broadcast added successfully!"),
        icon: <CheckCircleOutlined style={{ color: "#108ee9" }} />,
      });
    } else {
      notification.open({
        message: "Unable to save broadcast notification.",
        icon: <CloseCircleOutlined style={{ color: "red" }} />,
      });
    }
  };

  const openEditModal = async (record) => {
    await fetchUsers();
    setEditingBroadcast(record);
    setShowModal(true);
    const rec = typeof record.recipients === 'string' ? JSON.parse(record.recipients) : record.recipients || [];
    const isAll = rec.includes('all');
    setIsAllChecked(isAll);
    setSelectedUsers(isAll ? [] : rec.filter(id => typeof id === 'string' && !isNaN(id)));
    form.setFieldsValue({
      title: record.title,
      message: record.message,
      image: record.image_url ? [{ uid: -1, name: record.image_url, status: 'done', url: record.image_url }] : [],
    });
  };

  const handleSend = async (id) => {
    try {
      const response = await ajaxService.post(`/broadcast-notifications/${id}/send`);
      if (response.success) {
        notification.open({
          message: `Broadcast sent successfully!`,
          icon: <CheckCircleOutlined style={{ color: "green" }} />,
        });
        fetchBroadcasts(dataSource.current_page, searchTerm);
      } else {
        notification.open({
          message: "Unable to send broadcast.",
          icon: <CloseCircleOutlined style={{ color: "red" }} />,
        });
      }
    } catch (error) {
      console.error("Send error:", error);
      notification.open({
        message: "Error sending broadcast.",
        icon: <CloseCircleOutlined style={{ color: "red" }} />,
      });
    }
  };

  const handleDelete = async (id) => {
    const response = await ajaxService.delete('/broad-cast-notifications/', id);
    if (response.success) {
      notification.open({
        message: `Broadcast deleted successfully!`,
        icon: <CheckCircleOutlined style={{ color: "green" }} />,
      });
      fetchBroadcasts(dataSource.current_page, searchTerm);
    } else {
      notification.open({
        message: "Unable to delete broadcast.",
        icon: <CloseCircleOutlined style={{ color: "red" }} />,
      });
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Failed: " + errorInfo);
  };

  const handleSearch = ({ search }) => {
    const query = search ? search.trim() : '';
    console.log('Search term:', query); // Debug log to verify search input
    setSearchTerm(query);
    fetchBroadcasts(1, query);
  };

  const handleChangePage = (page) => {
    fetchBroadcasts(page, searchTerm);
  };

  const handleCancel = () => {
    setShowModal(false);
    setEditingBroadcast(null);
    setIsAllChecked(false);
    setSelectedUsers([]);
    form.resetFields();
  };

  const handleAllChange = (e) => {
    setIsAllChecked(e.target.checked);
    if (e.target.checked) {
      setSelectedUsers([]);
    }
  };

  const handleUserSelectChange = (value) => {
    setSelectedUsers(value);
  };

  const renderModal = (
    <Modal
      className="court-modal second-modal"
      width="50%"
      open={showModal}
      maskClosable={false}
      onCancel={handleCancel}
      footer={null}
    >
      <div style={{ padding: "15px 20px", marginTop: 25 }}>
        <div style={{ marginBottom: 20, textAlign: "center" }}>
          <Title id="modal-title" level={3}>
            {editingBroadcast ? "Edit Broadcast Notification" : "Add New Broadcast Notification"}
          </Title>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
        >
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                label={<b>Title</b>}
                name="title"
                rules={[{ required: true, message: "Title is required" }]}
              >
                <Input
                  placeholder="Enter title"
                  allowClear
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                label={<b>Message</b>}
                name="message"
                rules={[{ required: true, message: "Message is required" }]}
              >
                <TextArea
                  rows={4}
                  placeholder="Enter message"
                  allowClear
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                label={<b>Image</b>}
                name="image"
                valuePropName="fileList"
                getValueFromEvent={(e) => {
                  if (Array.isArray(e)) return e;
                  return e?.fileList || [];
                }}
              >
                <Upload
                  name="image"
                  listType="picture"
                  maxCount={1}
                  beforeUpload={() => false}
                  accept="image/*"
                >
                  <Button icon={<UploadOutlined />}>Select Image</Button>
                </Upload>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item label={<b>Recipients</b>}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Checkbox onChange={handleAllChange} checked={isAllChecked}>
                    Send to All Users
                  </Checkbox>
                  {!isAllChecked && (
                    <Select
                      mode="multiple"
                      style={{ width: '100%' }}
                      placeholder="Select users"
                      value={selectedUsers}
                      onChange={handleUserSelectChange}
                      filterOption={(input, option) =>
                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                      }
                    >
                      {users.map(user => (
                        <Option key={user.id} value={user.id.toString()}>{user.name || user.email}</Option>
                      ))}
                    </Select>
                  )}
                </Space>
              </Form.Item>
            </Col>
          </Row>

          <div style={{ textAlign: "center", marginTop: 20 }}>
            <Button
              key="finish"
              type="primary"
              onClick={form.submit}
              style={{ background: "var(--themeColor)" }}
              className="modal-button"
            >
              {editingBroadcast ? "Update" : "Add"}
            </Button>
          </div>
        </Form>
      </div>
    </Modal>
  );

  return (
    <>
      <Space style={{ display: "flex", justifyContent: "space-between" }}>
        <Filter handleSearch={handleSearch} placeholder="Search by title or message" />

        <Button
          type="primary"
          style={{ background: "var(--themeColor)" }}
          onClick={() => {
            setIsAllChecked(false);
            setSelectedUsers([]);
            setShowModal(true);
          }}
        >
          Add New Broadcast Notification
        </Button>
      </Space>

      <Table
        columns={columns}
        dataSource={dataSource.data || []}
        style={{ background: "none" }}
        rowKey="id"
        pagination={{
          onChange: handleChangePage,
          current: dataSource.current_page,
          pageSize: dataSource.per_page,
          total: dataSource.total,
          showSizeChanger: false,
        }}
      />
      {renderModal}
    </>
  );
};

export default BroadcastNotifications;