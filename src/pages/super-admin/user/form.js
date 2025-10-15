import React, { useEffect, useState } from "react";
import { useParams, useHistory } from "react-router-dom";
import {
  Card,
  Form,
  Input,
  Button,
  DatePicker,
  Select,
  Upload,
  message,
  Spin,
  Row,
  Col,
  Tooltip,
  Avatar,
  Divider,
} from "antd";
import {
  UploadOutlined,
  ArrowLeftOutlined,
  SaveOutlined,
  UserOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import ajaxService from "../../../services/ajax-service";

const { Option } = Select;

const UserEditForm = () => {
  const { id } = useParams();
  const history = useHistory();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null); // NEW

  const fetchUser = async (userId) => {
    setLoading(true);
    try {
      const res = await ajaxService.get(`/users/${userId}`);
      if (res?.success) {
        setUser(res.data);
        setAvatarUrl(res.data.profile_image || null);
        form.setFieldsValue({
          ...res.data,
          dob: res.data.dob ? dayjs(res.data.dob) : null,
        });
      }
    } catch (err) {
      message.error("Error loading user details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchUser(id);
  }, [id]);

  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
       const payload = { ...values, dob: values.dob?.format("YYYY-MM-DD") };
      const res = await ajaxService.put(`/users/`,id, payload);

      if (res?.success) {
        message.success("✅ User updated successfully");
        history.push(`/users/${id}`);
      } else {
        message.error(res?.message || "Update failed");
      }
    } catch (err) {
      message.error("Error updating user");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <Card
        className="w-full max-w-6xl mx-auto rounded-2xl shadow-lg"
        title={<span className="text-xl font-semibold">Edit User</span>}
        extra={
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => history.goBack()}
          >
            Back
          </Button>
        }
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="space-y-6"
        >
          {/* Avatar Section */}
          {/* <div className="flex flex-col items-center gap-4 mb-6">
            <Avatar
              size={100}
              src={avatarUrl}
              icon={!avatarUrl && <UserOutlined />}
              className="shadow-md border border-gray-200"
            />
            <Upload
              name="profile_image"
              listType="picture-circle"
              maxCount={1}
              showUploadList={false}
              beforeUpload={(file) => {
                setAvatarUrl(URL.createObjectURL(file));
                setAvatarFile(file?.[0]); // store file
                return false; // prevent auto-upload
              }}
            >
              <Button icon={<UploadOutlined />}>Change Avatar</Button>
            </Upload>
          </div> */}

          <Row gutter={24}>
            {/* Left Column - Profile Info */}
            <Col xs={24} md={12}>
              <Card
                size="small"
                className="rounded-xl shadow-sm mb-4 bg-gradient-to-br from-blue-50 to-blue-100"
              >
                <p className="font-semibold text-blue-700 mb-2">
                  Profile Information
                </p>
                <Divider className="my-2" />

                <Form.Item
                  name="name"
                  label="Full Name"
                  rules={[{ required: true, message: "Name is required" }]}
                  tooltip={{
                    title: "This will appear on the profile and reports",
                    icon: <InfoCircleOutlined />,
                  }}
                >
                  <Input placeholder="Enter full name" />
                </Form.Item>

                <Form.Item name="user_name" label="Username">
                  <Input placeholder="Enter username" />
                </Form.Item>

                <Form.Item name="gender" label="Gender">
                  <Select placeholder="Select gender">
                    <Option value="male">Male</Option>
                    <Option value="female">Female</Option>
                    <Option value="other">Other</Option>
                  </Select>
                </Form.Item>

                <Form.Item name="dob" label="Date of Birth">
                  <DatePicker className="w-full" />
                </Form.Item>

                <Form.Item name="bio" label="Bio">
                  <Input.TextArea rows={3} placeholder="Write a short bio..." />
                </Form.Item>
              </Card>
            </Col>

            {/* Right Column - Contact Info */}
            <Col xs={24} md={12}>
              <Card
                size="small"
                className="rounded-xl shadow-sm mb-4 bg-gradient-to-br from-purple-50 to-purple-100"
              >
                <p className="font-semibold text-purple-700 mb-2">
                  Contact & Roles
                </p>
                <Divider className="my-2" />

                <Form.Item
                  name="email"
                  label="Email"
                  rules={[{ type: "email", message: "Invalid email" }]}
                >
                  <Input placeholder="Enter email" />
                </Form.Item>

                <Form.Item name="phone" label="Phone">
                  <Input placeholder="Enter phone number" />
                </Form.Item>
              </Card>
            </Col>
          </Row>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-4 sticky bottom-0 bg-white py-4 border-t border-gray-200">
            <Button onClick={() => history.goBack()}>Cancel</Button>
            <Button
              type="primary"
              htmlType="submit"
              icon={<SaveOutlined />}
              loading={submitting}
            >
              Save Changes
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default UserEditForm;
