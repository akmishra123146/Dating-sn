import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  EyeOutlined,
  EditOutlined,
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
} from "antd";
import { useEffect, useState } from "react";
import ajaxService from "../../../services/ajax-service";
import { Filter } from "../../../components";
import { useHistory, Link } from "react-router-dom";

const { Text, Title } = Typography;

const ListstyleQuestions = () => {
  const [form] = Form.useForm();

  const [filter, setFilter] = useState("");
  const [showModal, setShowModal] = useState(false);

  const [dataSource, setDataSource] = useState({});
  const [questionType, setQuestionType] = useState(2);
  const [options, setOptions] = useState([{ id: 1, option: "" }]);
  const [optionErrors, setOptionErrors] = useState([]);
  const [editId, setEditId] = useState(null); // <-- track edit mode

  // ---------- Options Handlers ----------
  const handleAddOption = () => {
    const hasEmpty = options.some((opt) => !opt.option.trim());
    if (hasEmpty) {
      notification.warning({
        message: "Please fill all existing options before adding a new one.",
      });
      return;
    }

    setOptions([...options, { id: options.length + 1, option: "" }]);
    setOptionErrors([...optionErrors, false]);
  };

  const handleOptionChange = (value, index) => {
    const updatedOptions = [...options];
    updatedOptions[index].option = value;
    setOptions(updatedOptions);

    const updatedErrors = [...optionErrors];
    updatedErrors[index] = !value.trim();
    setOptionErrors(updatedErrors);
  };

  const handleRemoveOption = (index) => {
    const updatedOptions = options.filter((_, idx) => idx !== index);
    const updatedErrors = optionErrors.filter((_, idx) => idx !== index);
    setOptions(updatedOptions);
    setOptionErrors(updatedErrors);
  };

  // ---------- Table Columns ----------
  const columns = [
    {
      title: "Lifestyle Question",
      dataIndex: "question",
      key: "question",
      render: (question) => <Text>Q : {question}</Text>,
    },
    {
      title: "Actions",
      key: "actions",
      render: (text, record) => (
        <Space size="small">
          <Link to={`/liststyle-questions/${record.id}`}>
            <Button
              type="primary"
              size="small"
              style={{ background: "#C9DBD7", color: "#658664", fontSize: "16px" }}
            >
              <EyeOutlined />
            </Button>
          </Link>

          <Button
            type="primary"
            size="small"
            style={{
              background: "#FFE9C7",
              color: "#FFB020",
              fontSize: "16px",
            }}
            onClick={() => openEditModal(record)}
          >
            <EditOutlined />
          </Button>

          <Button
            type="primary"
            size="small"
            style={{
              background: "#EBDEE1",
              color: "#FF9595",
              fontSize: "16px",
            }}
            danger
            onClick={() => openDeleteModal(record.id)}
          >
            <DeleteOutlined />
          </Button>
        </Space>
      ),
    },
  ];

  // ---------- CRUD ----------
  const openDeleteModal = async (id) => {
    const response = await ajaxService.delete(`/lifestyles/`, id);

    const { success } = response;
    if (success) {
      notification.open({
        message: `Lifestyle Question deleted successfully!`,
        icon: <CheckCircleOutlined style={{ color: "green" }} />,
      });
      initialize();
    }
  };

  const openEditModal = (record) => {
    setEditId(record.id);
    setShowModal(true);
    setQuestionType(record.options_type);

    form.setFieldsValue({
      type: record.options_type,
      question: record.question,
    });

    if (record.options_type === 1 && record.question_options?.length) {
      setOptions(record.question_options.map((opt, i) => ({ id: i + 1, option: opt.option })));
    } else {
      setOptions([{ id: 1, option: "" }]);
    }
  };

  const onFinish = async (values) => {
    if (questionType === 1) {
      const emptyIndexes = options
        .map((opt, i) => (!opt.option.trim() ? i : -1))
        .filter((i) => i !== -1);
      if (emptyIndexes.length > 0) {
        const updatedErrors = options.map((opt) => !opt.option.trim());
        setOptionErrors(updatedErrors);

        notification.error({ message: "Please fill in all options before submitting." });
        return;
      }
    }

    const payload = {
      question: values.question,
      options_type: questionType,
      ...(questionType === 1 && {
        question_options: options.filter((opt) => opt.option.trim() !== ""),
      }),
    };

    const response = editId
      ? await ajaxService.put(`/lifestyles/`,editId, payload)
      : await ajaxService.post("/lifestyles", payload);

    if (response.success) {
      handleCancel();
      initialize();
      notification.open({
        message: editId ? "Question updated successfully" : response.message,
        icon: <CheckCircleOutlined style={{ color: "#108ee9" }} />,
      });
    } else {
      notification.open({
        message: "Unable to save question.",
        icon: <CloseCircleOutlined style={{ color: "red" }} />,
      });
    }
  };

  const handleSearch = async ({ name }) => {
    const response = await ajaxService.get(`/lifestyles?question=${name}`);
    if (response.success) {
      if (response.data.data.length === 0) {
        setFilter("");
        notification.open({
          message: `${name} is not found!`,
          icon: <CloseCircleOutlined style={{ color: "red" }} />,
        });
      } else {
        setFilter(name);
      }
      setDataSource(response.data);
    }
  };

  const handleChangePage = async (page) => {
    const response = await ajaxService.get(
      `/lifestyles?question=${filter}&page=${page}`
    );
    if (response.success) {
      setDataSource(response.data);
    }
  };

  const initialize = async () => {
    const response = await ajaxService.get(`/lifestyles?question=${filter}`);
    if (response.success) {
      setDataSource(response.data);
    }
  };

  useEffect(() => {
    initialize();
  }, []);

  const handleCancel = () => {
    setShowModal(false);
    setEditId(null);
    setOptions([{ id: 1, option: "" }]);
    form.resetFields();
  };

  // ---------- Modal ----------
  const renderModal = (
    <Modal
      className="court-modal second-modal"
      width="35%"
      open={showModal}
      maskClosable={false}
      onCancel={handleCancel}
      footer={null}
    >
      <div style={{ padding: "15px 20px", marginTop: 25 }}>
        <div style={{ marginBottom: 20, textAlign: "center" }}>
          <Title id="modal-title" level={3}>
            {editId ? "Edit Question" : "Add New Question"}
          </Title>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
        >
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                label={<b>Select question type</b>}
                name="type"
                initialValue={2}
                rules={[{ required: true, message: "Please select question type" }]}
              >
                <select
                  style={{ width: "100%", height: "35px", borderRadius: "4px" }}
                  onChange={(e) => setQuestionType(Number(e.target.value))}
                >
                  <option value={2}>Simple Question (No Options)</option>
                  <option value={1}>Question With Options</option>
                </select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                label={<b>Please write the question below</b>}
                name="question"
                rules={[{ required: true, message: "Question is required" }]}
              >
                <Input addonBefore="Q " placeholder="Write question here" allowClear />
              </Form.Item>
            </Col>
          </Row>

          {questionType === 1 && (
            <>
              <Title level={5} style={{ marginTop: 10 }}>
                Options
              </Title>
              {options.map((item, index) => (
                <Row key={index} gutter={8} style={{ marginBottom: 8 }}>
                  <Col span={20}>
                    <Input
                      placeholder={`Option ${index + 1}`}
                      value={item.option}
                      onChange={(e) => handleOptionChange(e.target.value, index)}
                    />
                  </Col>
                  <Col span={4}>
                    {options.length > 1 && (
                      <Button danger onClick={() => handleRemoveOption(index)}>
                        <DeleteOutlined />
                      </Button>
                    )}
                  </Col>
                </Row>
              ))}
              <Button type="dashed" block onClick={handleAddOption}>
                Add Option
              </Button>
            </>
          )}

          <div style={{ textAlign: "center", marginTop: 20 }}>
            <Button
              key="finish"
              type="primary"
              onClick={form.submit}
              style={{ background: "var(--themeColor)" }}
              className="modal-button"
            >
              {editId ? "Update" : "Add"}
            </Button>
          </div>
        </Form>
      </div>
    </Modal>
  );

  return (
    <>
      <Space style={{ display: "flex", justifyContent: "space-between" }}>
        <Filter handleSearch={handleSearch} placeholder="Search lifestyle question" />

        <Button
          type="primary"
          style={{ background: "var(--themeColor)" }}
          onClick={() => setShowModal(true)}
        >
          Add New Lifestyle Question
        </Button>
      </Space>

      <Table
        columns={columns}
        dataSource={dataSource.data}
        style={{ background: "none" }}
        rowKey="id"
        pagination={{
          onChange: (page) => handleChangePage(page),
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

export default ListstyleQuestions;
