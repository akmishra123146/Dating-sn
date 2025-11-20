import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  EyeOutlined,
  EditOutlined,
  PlusOutlined,
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
  Upload,
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
  const [options, setOptions] = useState([{ id: "new_0", option: "" }]);
  const [optionErrors, setOptionErrors] = useState([false]);
  const [editId, setEditId] = useState(null); // <-- track edit mode
  const [fileList, setFileList] = useState([]);
  const [originalImageUrl, setOriginalImageUrl] = useState(null);

  // ---------- Options Handlers ----------
  const handleAddOption = () => {
    const hasEmpty = options.some((opt) => !opt.option.trim());
    if (hasEmpty) {
      notification.warning({
        message: "Please fill all existing options before adding a new one.",
      });
      return;
    }

    const newId = `new_${Date.now()}`;
    setOptions([...options, { id: newId, option: "" }]);
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
      title: "Image",
      key: "image",
      render: (_, record) => (
        record.image_url ? (
          <img
            src={record.image_url}
            alt="Lifestyle Question"
            style={{ 
              width: 50, 
              height: 50, 
              objectFit: "contain", // Changed from "cover" to "contain" to fit the entire image without cropping
              borderRadius: 4 
            }}
          />
        ) : (
          <span>No Image</span>
        )
      ),
    },
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
    setOriginalImageUrl(record.image_url);

    form.setFieldsValue({
      type: record.options_type,
      question: record.question,
    });

    setFileList(
      record.image_url
        ? [
            {
              uid: `-1`,
              name: "image",
              status: "done",
              url: record.image_url,
            },
          ]
        : []
    );

    let newOptions = [];
    if (record.options_type === 1) {
      if (record.question_options?.length) {
        newOptions = record.question_options.map((opt) => ({ id: opt.id, option: opt.option }));
      } else {
        const newId = `new_${Date.now()}`;
        newOptions = [{ id: newId, option: "" }];
      }
    } else {
      newOptions = [];
    }
    setOptions(newOptions);
    setOptionErrors(new Array(newOptions.length).fill(false));
  };

  const handleTypeChange = (e) => {
    const newType = Number(e.target.value);
    setQuestionType(newType);
    if (newType === 1 && options.length === 0) {
      const newId = `new_${Date.now()}`;
      setOptions([{ id: newId, option: "" }]);
      setOptionErrors([false]);
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

    const formData = new FormData();
    formData.append("question", values.question);
    formData.append("options_type", questionType);

    if (questionType === 1) {
      const filteredOptions = options.filter((opt) => opt.option.trim() !== "");
      filteredOptions.forEach((opt, idx) => {
        formData.append(`question_options[${idx}][option]`, opt.option);
        if (opt.id && !String(opt.id).startsWith("new_")) {
          formData.append(`question_options[${idx}][id]`, opt.id);
        }
      });
    }

    const hasNewFile = fileList.some((file) => file.originFileObj);
    const shouldRemoveImage = editId && originalImageUrl && fileList.length === 0;
    const shouldKeepImage = editId && !hasNewFile && fileList.length > 0;

    if (hasNewFile) {
      const newFile = fileList.find((file) => file.originFileObj);
      formData.append("image", newFile.originFileObj);
    } 

    const response = editId
      ? await ajaxService.postFormData(`/update-lifestyle/`, editId, formData)
      : await ajaxService.post("/lifestyles", formData);

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
    setOriginalImageUrl(null);
    setOptions([{ id: "new_0", option: "" }]);
    setOptionErrors([false]);
    setFileList([]);
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
                  onChange={handleTypeChange}
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

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item label={<b>Question Image</b>}>
                <Upload
                  listType="picture-card"
                  fileList={fileList}
                  onChange={({ fileList: newFileList }) => setFileList(newFileList)}
                  beforeUpload={() => false}
                  rules={[{ required: true, message: "Please select image" }]}
                >
                  {fileList.length < 1 && (
                    <div>
                      <PlusOutlined />
                      <div style={{ marginTop: 8 }}>Upload Image</div>
                    </div>
                  )}
                </Upload>
              </Form.Item>
            </Col>
          </Row>

          {questionType === 1 && (
            <>
              <Title level={5} style={{ marginTop: 10 }}>
                Options
              </Title>
              {options.map((item, index) => (
                <Row key={item.id} gutter={8} style={{ marginBottom: 8 }}>
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