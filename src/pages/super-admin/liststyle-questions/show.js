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
  Select,
  Typography,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  ArrowLeftOutlined,
  HomeOutlined,
  DeleteFilled,
} from "@ant-design/icons";

const { Option } = Select;
const { Title } = Typography;

// Reusable Options Renderer
const QuestionOptions = ({ options }) => {
  if (!options || options.length === 0) {
    return <span className="text-gray-500">No options available</span>;
  }
  return (
    <ul className="list-disc pl-6">
      {options.map((option) => (
        <li key={option.id}>{option.option}</li>
      ))}
    </ul>
  );
};

const QuestionDetails = () => {
  const { id } = useParams();
  const history = useHistory();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showEditModal, setShowEditModal] = useState(false);
  const [form] = Form.useForm();
  const [options, setOptions] = useState([{ id: 1, option: "" }]);
  const [questionType, setQuestionType] = useState(2);

  // Fetch API
  const fetchData = useCallback(async (id) => {
    setLoading(true);
    try {
      const response = await ajaxService.get(`/lifestyles/${id}`);
      if (response.success) {
        setData(response.data);
        setQuestionType(response.data.options_type || 2);
        if (response.data.options_type === 1) {
          setOptions(response.data.question_options || [{ id: 1, option: "" }]);
        }
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

  // Delete
  const handleDelete = useCallback(async () => {
    try {
      const response = await ajaxService.delete("/lifestyles/", id);
      if (response.success) {
        message.success("Question deleted successfully");
        history.push("/lifestyles-questions");
      } else {
        message.error("Failed to delete question");
      }
    } catch (err) {
      console.error("Delete error:", err);
      message.error("Error deleting question");
    }
  }, [id, history]);

  // Open Edit Modal
  const openEditModal = () => {
    form.setFieldsValue({
      question: data.question,
      type: data.options_type,
    });
    setShowEditModal(true);
  };

  // Update Question
  const handleEditSubmit = async (values) => {
    const payload = {
      question: values.question,
      options_type: questionType,
      ...(questionType === 1 && {
        question_options: options.filter((opt) => opt.option.trim() !== ""),
      }),
    };

    try {
      const response = await ajaxService.put("/lifestyles/", id, payload);
      if (response.success) {
        message.success("Question updated successfully");
        setData(response.data);
        fetchData(id); // refresh
        setShowEditModal(false);
      } else {
        message.error("Failed to update question");
      }
    } catch (err) {
      console.error("Update error:", err);
      message.error("Error updating question");
    }
  };

  // Options Handlers
  const handleAddOption = () => {
    setOptions([...options, { id: options.length + 1, option: "" }]);
  };

  const handleOptionChange = (value, index) => {
    const updated = [...options];
    updated[index].option = value;
    setOptions(updated);
  };

  const handleRemoveOption = (index) => {
    const updated = options.filter((_, i) => i !== index);
    setOptions(updated);
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

  return (
    <div className="p-4 md:p-6 flex justify-center">
      <Card className="w-full max-w-5xl shadow-lg rounded-lg">
        {/* Breadcrumb + Actions */}
        <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-3">
          <Breadcrumb
            items={[
              {
                title: (
                  <Link to="/dashboard">
                    <HomeOutlined /> Home
                  </Link>
                ),
              },
              { title: <Link to="/lifestyles-questions">Questions</Link> },
              {
                title: data?.question ? (
                  <span style={{ maxWidth: 200 }} className="truncate">
                    {data.question}
                  </span>
                ) : (
                  "Details"
                ),
              },
            ]}
          />

          <Space wrap>
            <Button
              type="primary"
              ghost
              icon={<EditOutlined />}
              onClick={openEditModal}
            >
              Edit
            </Button>

            <Popconfirm
              title="Are you sure to delete this question?"
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
              onClick={() => history.push("/questions")}
            >
              Back
            </Button>
          </Space>
        </div>

        {/* Details */}
        <Descriptions
          title={<Title level={5}>Question Details</Title>}
          bordered
          column={1}
          size="middle"
          labelStyle={{ fontWeight: "bold", width: "220px" }}
        >
          <Descriptions.Item label="ID">{data.id}</Descriptions.Item>
          <Descriptions.Item label="Question">
            {data.question || "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            <Tag color={data.status === 1 ? "green" : "red"}>
              {data.status === 1 ? "Active" : "Inactive"}
            </Tag>
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
          <Descriptions.Item label="Options">
            <QuestionOptions options={data.question_options} />
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Edit Modal */}
      <Modal
        title="Edit Question"
        open={showEditModal}
        onCancel={() => setShowEditModal(false)}
        footer={null}
        bodyStyle={{ maxHeight: "70vh", overflowY: "auto" }}
        centered
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleEditSubmit}
          initialValues={{ type: 2 }}
        >
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                label="Question Type"
                name="type"
                rules={[{ required: true, message: "Select question type" }]}
              >
                <Select
                  placeholder="Select type"
                  onChange={(val) => setQuestionType(val)}
                >
                  <Option value={2}>Simple Question</Option>
                  <Option value={1}>Question With Options</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                label="Question"
                name="question"
                rules={[{ required: true, message: "Enter question" }]}
              >
                <Input placeholder="Enter question" />
              </Form.Item>
            </Col>
          </Row>

          {questionType === 1 && (
            <>
              <Title level={5}>Options</Title>
              {options.map((opt, idx) => (
                <Row key={idx} gutter={8} style={{ marginBottom: 8 }}>
                  <Col span={20}>
                    <Input
                      value={opt.option}
                      placeholder={`Option ${idx + 1}`}
                      onChange={(e) => handleOptionChange(e.target.value, idx)}
                    />
                  </Col>
                  <Col span={4} className="flex justify-end">
                    {options.length > 1 && (
                      <Button
                        danger
                        icon={<DeleteFilled />}
                        onClick={() => handleRemoveOption(idx)}
                      />
                    )}
                  </Col>
                </Row>
              ))}
              <Button block onClick={handleAddOption} type="dashed">
                Add Option
              </Button>
            </>
          )}

          <div className="flex justify-center mt-6">
            <Button type="primary" htmlType="submit" block>
              Update
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default QuestionDetails;
