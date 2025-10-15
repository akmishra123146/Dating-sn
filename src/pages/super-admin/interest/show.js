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
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  ArrowLeftOutlined,
  HomeOutlined,
  DeleteFilled,
} from "@ant-design/icons";

// Small reusable component for rendering options
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

  const fetchData = useCallback(async (id) => {
    setLoading(true);
    try {
      const response = await ajaxService.get(`/interest/${id}`);
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

  const handleDelete = useCallback(async () => {
    try {
      const response = await ajaxService.delete("/interest/", id);
      if (response.success) {
        message.success("Interest deleted successfully");
        history.push("/interest");
      } else {
        message.error("Failed to delete interest");
      }
    } catch (err) {
      console.error("Delete error:", err);
      message.error("Error deleting interest");
    }
  }, [id, history]);

  const openEditModal = () => {
    form.setFieldsValue({
      question: data.question,
      type: data.options_type,
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (values) => {
    const payload = {
      question: values.question,
      options_type: questionType,
      ...(questionType === 1 && {
        question_options: options.filter((opt) => opt.option.trim() !== ""),
      }),
    };

    try {
      const response = await ajaxService.put("/interest/", id, payload);
      if (response.success) {
        message.success("Interest updated successfully");
        setData(response.data); // update details instantly
        fetchData(id);
        setShowEditModal(false);
      } else {
        message.error("Failed to update interest");
      }
    } catch (err) {
      console.error("Update error:", err);
      message.error("Error updating interest");
    }
  };

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
                { title: <Link to="/interest">Interest</Link> },
                {
                  title: data?.question
                    ? `${data.question.substring(0, 20)}...`
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
          </Col>
        </Row>
      </div>
      <Card className="w-full shadow-xl rounded-lg">
        {/* Details */}
        <Descriptions
          title="Interest Details"
          bordered
          column={1}
          labelStyle={{ fontWeight: "bold", width: "200px" }}
        >
          <Descriptions.Item label="ID">{data.id}</Descriptions.Item>
          <Descriptions.Item label="Interest">
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
                label="Interest Type"
                name="type"
                rules={[{ required: true, message: "Select interest type" }]}
              >
                <select
                  style={{ width: "100%", height: "35px", borderRadius: "4px" }}
                  onChange={(e) => setQuestionType(Number(e.target.value))}
                >
                  <option value={2}>Simple Question</option>
                  <option value={1}>Question With Options</option>
                </select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                label="Interest"
                name="interest"
                rules={[{ required: true, message: "Enter interest" }]}
              >
                <Input placeholder="Enter interest" />
              </Form.Item>
            </Col>
          </Row>

          {questionType === 1 && (
            <>
              <h4 className="mt-2">Options</h4>
              {options.map((opt, idx) => (
                <Row key={idx} gutter={8} style={{ marginBottom: 8 }}>
                  <Col span={20}>
                    <Input
                      value={opt.option}
                      placeholder={`Option ${idx + 1}`}
                      onChange={(e) => handleOptionChange(e.target.value, idx)}
                    />
                  </Col>
                  <Col span={4}>
                    {options.length > 1 && (
                      <Button danger onClick={() => handleRemoveOption(idx)}>
                        <DeleteFilled />
                      </Button>
                    )}
                  </Col>
                </Row>
              ))}
              <Button block onClick={handleAddOption} type="dashed">
                Add Option
              </Button>
            </>
          )}

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

export default QuestionDetails;
