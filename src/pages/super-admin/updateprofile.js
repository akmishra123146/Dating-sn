import React, { useEffect, useState ,useCallback,useMemo} from "react";
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
import ajaxService from "../../services/ajax-service";

const { Option } = Select;

const ProfileEditForm = () => {
  const id = 1; // Dynamically get ID from URL params
  const history = useHistory();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
    const [error, setError] = useState(null);
  

  const fetchUser = useCallback(async (userId) => {
      setLoading(true);
      setError(null);
      try {
        const response = await ajaxService.get(`/users/${userId}`);
        if (response?.success) {
          setUser(response.data || {});
        } else {
          setError(response?.message || "Failed to fetch user data.");
          setUser(null);
        }
      } catch (err) {
        console.error("Error fetching user:", err);
        setError("Error fetching user data.");
        setUser(null);
      } finally {
        setLoading(false);
      }
    }, [id]);

    const avatarSrc = useMemo(() => {
        const src = user?.profile_image;
        return src && String(src).trim() ? src : undefined;
      }, [user?.profile_image]);
  
    useEffect(() => {
      if (id) fetchUser(id);
    }, [id, fetchUser]);

  const uploadAvatar = async (file) => {
    if (!id) return;
    const formData = new FormData();
    formData.append("profile_image", file);
    try {
      const res = await ajaxService.postFormData(`/edit-user-profile/`,id, formData);
      if (res?.success) {
        // Update to server URL
        setAvatarUrl(res.data.profile_image || avatarUrl);
        setAvatarFile(null); // Clear file after successful upload
        message.success("✅ Profile picture uploaded successfully");
      } else {
        message.error(res?.message || "Upload failed");
        // Keep preview on failure for retry on submit
      }
    } catch (err) {
      message.error("Error uploading profile picture");
      // Keep preview on error for retry
    }
  };

  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      const payload = { ...values, dob: values.dob?.format("YYYY-MM-DD") };
      const baseUrl = `/users/`;

      let res;
      if (avatarFile) {
        // Include file in FormData if still pending
        const formData = new FormData();
        Object.entries(payload).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            formData.append(key, value);
          }
        });
        formData.append('profile_image', avatarFile);
        res = await ajaxService.putFormData(baseUrl, id,formData);
      } else {
        // Regular JSON update
        res = await ajaxService.put(baseUrl, id,payload);
      }

      if (res?.success) {
        // Clean up blob URL if temporary
        if (avatarUrl && avatarUrl.startsWith('blob:')) {
          URL.revokeObjectURL(avatarUrl);
        }
        message.success("✅ User updated successfully");
        history.push(`/profile`);
      } else {
        message.error(res?.message || "Update failed");
      }
    } catch (err) {
      message.error("Error updating user");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAvatarUpload = async (file) => {
    // Revoke previous blob URL if it exists to prevent memory leaks
    if (avatarUrl && avatarUrl.startsWith('blob:')) {
      URL.revokeObjectURL(avatarUrl);
    }
    const newUrl = URL.createObjectURL(file);
    setAvatarUrl(newUrl);
    setAvatarFile(file); // Set the profile file here
    // Direct upload
    await uploadAvatar(file);
    return false; // Prevent auto-upload
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
        title={<span className="text-xl font-semibold">Update Profile</span>}
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
          <div className="relative inline-block">
            <Avatar
              size={100}
              src={avatarUrl ?? avatarSrc}
              icon={!avatarUrl && <UserOutlined />}
              className="shadow-md border border-gray-200"
            />
            <div className="absolute -bottom-2 -right-2">
              <Upload
                name="profile_image"
                listType="picture-circle"
                maxCount={1}
                showUploadList={false}
                beforeUpload={handleAvatarUpload}
              >
                <Button
                  type="primary"
                  size="small"
                  shape="circle"
                  icon={<UploadOutlined />}
                />
              </Upload>
            </div>
          </div>

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
                  Contact Details
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

export default ProfileEditForm;