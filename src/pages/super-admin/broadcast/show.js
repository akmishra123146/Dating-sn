import React, { useEffect, useState, useCallback } from "react";
import { useParams, useHistory, Link } from "react-router-dom";
import ajaxService from "../../../services/ajax-service";
import moment from "moment";
import {
  Button,
  Card,
  Popconfirm,
  message,
  Space,
  Breadcrumb,
  Tag,
  Descriptions,
  Spin,
  Modal,
  Form,
  Input,
  Row,
  Col,
  Checkbox,
  Select,
  Upload,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  ArrowLeftOutlined,
  HomeOutlined,
  SendOutlined,
  DeleteFilled,
  UploadOutlined,
} from "@ant-design/icons";

const { Option } = Select;
const { TextArea } = Input;

const BroadcastNotificationDetails = () => {
  const { id } = useParams();
  const history = useHistory();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showEditModal, setShowEditModal] = useState(false);
  const [form] = Form.useForm();
  const [users, setUsers] = useState([]);
  const [isAllChecked, setIsAllChecked] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);

  const fetchData = useCallback(async (id) => {
    setLoading(true);
    try {
      const response = await ajaxService.get(`/broad-cast-notifications/${id}`);
      if (response.success) {
        setData(response.data);
      } else {
        setError("Failed to fetch data");
      }
    } catch (err) {
      setError("Error fetching data");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

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

  const handleDelete = useCallback(async () => {
    try {
      const response = await ajaxService.delete("/broad-cast-notifications/", id);
      if (response.success) {
        message.success("Broadcast deleted successfully");
        history.push("/broad-cast-notifications");
      } else {
        message.error("Failed to delete broadcast");
      }
    } catch (err) {
      console.error("Delete error:", err);
      message.error("Error deleting broadcast");
    }
  }, [id, history]);

  const handleSend = async () => {
    try {
      const response = await ajaxService.post(`/broadcast-notifications/${id}/send`);
      if (response.success) {
        message.success("Broadcast sent successfully");
        fetchData(id);
      } else {
        message.error("Failed to send broadcast");
      }
    } catch (err) {
      console.error("Send error:", err);
      message.error("Error sending broadcast");
    }
  };

  const openEditModal = async () => {
    await fetchUsers();
    const rec = typeof data.recipients === 'string' ? JSON.parse(data.recipients) : data.recipients || [];
    const isAll = rec.includes('all');
    setIsAllChecked(isAll);
    setSelectedUsers(isAll ? [] : rec.filter(uid => typeof uid === 'string' && !isNaN(uid)));
    form.setFieldsValue({
      title: data.title,
      message: data.message,
      image: data.image_url ? [{ uid: -1, name: data.image_url, status: 'done', url: data.image_url }] : [],
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (values) => {
    const formData = new FormData();
    formData.append('title', values.title);
    formData.append('message', values.message);
    if (values.image && values.image[0]?.originFileObj) {
      formData.append('image', values.image[0].originFileObj);
    }

    let recipients = [];
    if (isAllChecked) {
      recipients = ['all'];
    } else if (selectedUsers.length > 0) {
      recipients = selectedUsers;
    }
    formData.append('recipients', JSON.stringify(recipients));

    try {
      const response = await ajaxService.put("/broad-cast-notifications/", id, formData, true);
      if (response.success) {
        message.success("Broadcast updated successfully");
        fetchData(id);
        setShowEditModal(false);
      } else {
        message.error("Failed to update broadcast");
      }
    } catch (err) {
      console.error("Update error:", err);
      message.error("Error updating broadcast");
    }
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

  useEffect(() => {
    if (id) fetchData(id);
  }, [id, fetchData]);

  if (loading) {
    return (
      <div className="flex justify-center p-10">
        <Spin size="large" />
      </div>
    );
  }

  if (error) return <p className="text-red-500 text-center">{error}</p>;
  if (!data) return <p className="text-gray-500 text-center">No data found</p>;

  const getStatusText = (stateId) => {
    switch (stateId) {
      case 1: return 'Draft';
      case 2: return 'Scheduled';
      case 3: return 'Sent';
      default: return 'Unknown';
    }
  };

  const getRecipientsText = (recipients) => {
    if (!recipients) return 'N/A';
    const rec = typeof recipients === 'string' ? JSON.parse(recipients) : recipients;
    if (rec.includes('all')) return 'All Users';
    return `${rec.length} Users`;
  };

  return (
    <div className="p-6 flex justify-center">
      {/* Fixed Breadcrumb + Actions Layout */}
      <div style={{ marginBottom: 15 }}>
        <Row justify="space-between" align="middle" className="mb-10 w-full">
          <Col flex="auto">
            <Breadcrumb
              items={[
                {
                  title: (
                    <Link to="/dashboard">
                      <HomeOutlined /> Home
                    </Link>
                  ),
                },
                { title: <Link to="/broad-cast-notifications">Broadcast Notifications</Link> },
                {
                  title: data?.title
                    ? `${data.title.substring(0, 20)}...`
                    : "Details",
                },
              ]}
            />
          </Col>
          <Col flex="none">
            <Space>
              <Button
                type="primary"
                ghost
                icon={<EditOutlined />}
                onClick={openEditModal}
              >
                Edit
              </Button>
              {data.state_id !== 3 && (
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  onClick={handleSend}
                >
                  Send
                </Button>
              )}
              <Popconfirm
                title="Are you sure to delete this broadcast?"
                onConfirm={handleDelete}
                okText="Yes"
                cancelText="No"
              >
                <Button danger icon={<DeleteOutlined />}>
                  Delete
                </Button>
              </Popconfirm>

              <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => history.push("/broad-cast-notifications")}
              >
                Back
              </Button>
            </Space>
          </Col>
        </Row>
      </div>
      <Card className="w-full shadow-xl rounded-lg">
        {/* Details */}
        <Descriptions
          title="Broadcast Notification Details"
          bordered
          column={1}
          labelStyle={{ fontWeight: "bold", width: "200px" }}
        >
          <Descriptions.Item label="ID">{data.id}</Descriptions.Item>
          <Descriptions.Item label="Title">{data.title || "N/A"}</Descriptions.Item>
          <Descriptions.Item label="Message">{data.message || "N/A"}</Descriptions.Item>
          <Descriptions.Item label="Image URL">
            {data.image_url ? <a href={data.image_url} target="_blank" rel="noopener noreferrer">View Image</a> : "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="Recipients">{getRecipientsText(data.recipients)}</Descriptions.Item>
          <Descriptions.Item label="Status">
            <Tag color={getStatusText(data.state_id) === 'Sent' ? "green" : "blue"}>
              {getStatusText(data.state_id)}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Sent At">
            {data.sent_at
              ? moment(data.sent_at).format("YYYY-MM-DD HH:mm:ss")
              : "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="Created At">
            {data.created_at
              ? moment(data.created_at).format("YYYY-MM-DD HH:mm:ss")
              : "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="Updated At">
            {data.updated_at
              ? moment(data.updated_at).format("YYYY-MM-DD HH:mm:ss")
              : "N/A"}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Edit Modal */}
      <Modal
        title="Edit Broadcast Notification"
        open={showEditModal}
        onCancel={() => setShowEditModal(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleEditSubmit}
        >
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                label="Title"
                name="title"
                rules={[{ required: true, message: "Title is required" }]}
              >
                <Input placeholder="Enter title" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                label="Message"
                name="message"
                rules={[{ required: true, message: "Message is required" }]}
              >
                <TextArea rows={4} placeholder="Enter message" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                label="Image"
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
              <Form.Item label="Recipients">
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
            <Button type="primary" htmlType="submit">
              Update
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default BroadcastNotificationDetails;