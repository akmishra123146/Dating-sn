import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useHistory } from "react-router-dom"; // v5
import ajaxService from "../../services/ajax-service";
import dayjs from "dayjs";
import {
  Card,
  Spin,
  Alert,
  Button,
  Avatar,
  Tabs,
  List,
  Tag,
  Empty,
  Descriptions,
} from "antd";
import {
  UserOutlined,
  TeamOutlined,
  HeartOutlined,
  QuestionCircleOutlined,
  CheckCircleOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";

const { TabPane } = Tabs;

/** ---------- Small Presentational Pieces ---------- **/

const UserInfo = ({ user }) => (
  <Card bordered className="mb-4 rounded-2xl shadow-md">
    <Descriptions bordered column={1} size="middle">
      <Descriptions.Item label="Name">{user?.name || "N/A"}</Descriptions.Item>
      <Descriptions.Item label="Email">{user?.email || "N/A"}</Descriptions.Item>
      <Descriptions.Item label="Phone">{user?.phone || "N/A"}</Descriptions.Item>
      <Descriptions.Item label="Username">{user?.user_name || "N/A"}</Descriptions.Item>
      <Descriptions.Item label="Gender">{user?.gender || "N/A"}</Descriptions.Item>
      <Descriptions.Item label="Date of Birth">
        {user?.dob ? dayjs(user.dob).format("MMMM D, YYYY") : "N/A"}
      </Descriptions.Item>
      <Descriptions.Item label="Age">{user?.age ?? "N/A"}</Descriptions.Item>
    </Descriptions>
  </Card>
);

const RolesList = ({ roles = [] }) =>
  roles.length ? (
    <List
      dataSource={roles}
      renderItem={(role) => (
        <Tag
          color="blue"
          icon={<CheckCircleOutlined />}
          key={role?.id || role?.name}
        >
          {role?.name}
        </Tag>
      )}
    />
  ) : (
    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No roles" />
  );

const InterestsList = ({ interestUsers = [] }) =>
  interestUsers.length ? (
    <List
      grid={{ gutter: 12, column: 2 }}
      dataSource={interestUsers}
      renderItem={(iu, idx) => (
        <List.Item key={`${iu?.interest?.id}-${iu?.interest_type?.id}-${idx}`}>
          <Tag color="geekblue" icon={<HeartOutlined />}>
            {iu?.interest?.name || "Unknown"}{" "}
            {iu?.interest_type?.name ? `(${iu.interest_type.name})` : ""}
          </Tag>
        </List.Item>
      )}
    />
  ) : (
    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No interests" />
  );

const LifestyleAnswersList = ({ answers = [] }) =>
  answers.length ? (
    <List
      itemLayout="vertical"
      dataSource={answers}
      renderItem={(ans) => (
        <Card
          size="small"
          className="mb-2 rounded-xl shadow-sm bg-purple-50"
          title={ans?.lifestyle?.question || `Question ${ans?.question_id}`}
        >
          <p className="font-medium text-purple-700">{ans?.answer ?? "N/A"}</p>
        </Card>
      )}
    />
  ) : (
    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No lifestyle answers" />
  );

const QuestionAnswersList = ({ answers = [] }) =>
  answers.length ? (
    <List
      itemLayout="vertical"
      dataSource={answers}
      renderItem={(ans) => (
        <Card
          size="small"
          className="mb-2 rounded-xl shadow-sm bg-teal-50"
          title={ans?.question?.question || `Question ${ans?.question_id}`}
        >
          <p className="font-medium text-teal-700">{ans?.answer ?? "N/A"}</p>
        </Card>
      )}
    />
  ) : (
    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No custom answers" />
  );

/** ---------- Main Component ---------- **/

const UserDetails = () => {
  const id = 1;
  const history = useHistory(); // v5

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
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
  }, []);

  useEffect(() => {
    if (id) fetchUser(id);
  }, [id, fetchUser]);

  const avatarSrc = useMemo(() => {
    const src = user?.profile_image;
    return src && String(src).trim() ? src : undefined;
  }, [user?.profile_image]);

  if (error) {
    return (
      <div className="p-6 flex justify-center">
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          className="mt-10 w-full max-w-2xl"
        />
      </div>
    );
  }

  if (!user && loading) {
    return <Spin size="large" className="flex justify-center mt-10" />;
  }

  if (!user && !loading) {
    return (
      <div className="p-6 flex justify-center">
        <Alert
          message="No user found"
          type="warning"
          showIcon
          className="mt-10 w-full max-w-2xl"
        />
      </div>
    );
  }

  return (
    <div className="p-6">
      <Spin spinning={loading}>
        <Card
          className="w-full max-w-6xl mx-auto rounded-2xl shadow-lg"
          title={<span className="text-xl font-semibold">Profile Details</span>}
          extra={
            <Button icon={<ArrowLeftOutlined />} onClick={() => history.goBack()}>
              Back
            </Button>
          }
        >
          {/* Top section with avatar + info */}
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar & basic info */}
            <Card
              className="flex-1 flex flex-col items-center justify-center rounded-2xl shadow-md"
              bordered
            >
              <Avatar
                size={120}
                icon={<UserOutlined />}
                src={avatarSrc}
                className="mb-4 border-2 border-blue-500"
              />
              <h2 className="text-lg font-bold">{user?.name}</h2>
              <p className="text-gray-500">{user?.email}</p>
              <p className="text-sm text-gray-400">
                Member since {dayjs(user?.created_at).format("MMM YYYY")}
              </p>
            </Card>

            {/* User Info */}
            <div className="flex-1">
              <UserInfo user={user} />
            </div>
          </div>
        </Card>
      </Spin>
    </div>
  );
};

export default UserDetails;
