import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  EyeOutlined,
  EditOutlined
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
} from "antd";
import { useEffect, useState } from "react";
import ajaxService from "../../../services/ajax-service";
import { Filter } from "../../../components";
import { Link } from "react-router-dom";

const { Text, Title } = Typography;

const Interests = () => {
  const [form] = Form.useForm();

  const [showModal, setShowModal] = useState(false);

  const [dataSource, setDataSource] = useState({ data: [], current_page: 1, per_page: 10, total: 0 });

  const [allInterests, setAllInterests] = useState([]);
  const [fullInterests, setFullInterests] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  const [editingInterest, setEditingInterest] = useState(null); // for edit mode

  const pageSize = 10;

  const columns = [
    {
      title: "Interests",
      dataIndex: "name",
      key: "name",
      render: (name) => <Text>{name}</Text>,
    },
    {
      title: "Actions",
      key: "actions",
      render: (text, record) => (
        <Space size="small">
          {/* <Link to={`/interest/${record.id}`}>
            <Button
              type="primary"
              size="small"
              style={{
                background: "#C9DBD7",
                color: "#658664",
                fontSize: "16px",
              }}
            >
              <EyeOutlined />
            </Button>
          </Link> */}
          <Button
            type="default"
            size="small"
            style={{ color: "#1890ff", fontSize: "16px" }}
            onClick={() => openEditModal(record)}
          >
            <EditOutlined />
          </Button>
          <Popconfirm
            title="Are you sure to delete this interest?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="primary"
              size="small"
              style={{
                background: "#EBDEE1",
                color: "#FF9595",
                fontSize: "16px",
              }}
              danger
            >
              <DeleteOutlined />
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const onFinish = async (values) => {
    let response;
    if (editingInterest) {
      // update with FormData
     const payload = {
        name: values.name,
        type: 1,
      };
      response = await ajaxService.put('/interest/',editingInterest.id, payload);
    } else {
      // create
      const payload = {
        name: values.name,
        type: 1,
      };
      response = await ajaxService.post("/interest", payload);
    }

    if (response.success) {
      handleCancel();
      initialize();
      notification.open({
        message: response.message || (editingInterest ? "Interest updated successfully!" : "Interest added successfully!"),
        icon: <CheckCircleOutlined style={{ color: "#108ee9" }} />,
      });
    } else {
      notification.open({
        message: "Unable to save interest.",
        icon: <CloseCircleOutlined style={{ color: "red" }} />,
      });
    }
  };

  const openEditModal = (record) => {
    setEditingInterest(record);
    setShowModal(true);
    form.setFieldsValue({
      name: record.name,
    });
  };

  const handleDelete = async (id) => {
    const response = await ajaxService.delete('/interest/',id);
    if (response.success) {
      notification.open({
        message: `Interest deleted successfully!`,
        icon: <CheckCircleOutlined style={{ color: "green" }} />,
      });
      initialize();
    } else {
      notification.open({
        message: "Unable to delete interest.",
        icon: <CloseCircleOutlined style={{ color: "red" }} />,
      });
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Failed: " + errorInfo);
  };

  const handleSearch = ({ name }) => {
    const query = name ? name.toLowerCase().trim() : '';
    if (!query) {
      setAllInterests(fullInterests);
      setCurrentPage(1);
      const start = 0;
      const end = pageSize;
      const sliced = fullInterests.slice(start, end);
      setDataSource({
        data: sliced,
        current_page: 1,
        per_page: pageSize,
        total: fullInterests.length
      });
      return;
    }

    const filtered = fullInterests.filter(interest =>
      interest.name.toLowerCase().includes(query)
    );

    if (filtered.length === 0) {
      notification.open({
        message: `${name} is not found!`,
        icon: <CloseCircleOutlined style={{ color: "red" }} />,
      });
      setAllInterests(fullInterests);
      setCurrentPage(1);
      const start = 0;
      const end = pageSize;
      const sliced = fullInterests.slice(start, end);
      setDataSource({
        data: sliced,
        current_page: 1,
        per_page: pageSize,
        total: fullInterests.length
      });
      return;
    }

    setAllInterests(filtered);
    setCurrentPage(1);
    const start = 0;
    const end = pageSize;
    const sliced = filtered.slice(start, end);
    setDataSource({
      data: sliced,
      current_page: 1,
      per_page: pageSize,
      total: filtered.length
    });
  };

  const handleChangePage = (page) => {
    setCurrentPage(page);
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const sliced = allInterests.slice(start, end);
    setDataSource({
      data: sliced,
      current_page: page,
      per_page: pageSize,
      total: allInterests.length
    });
  };

  const initialize = async () => {
    const response = await ajaxService.get("/interest");
    if (response.success) {
      const interests = response.data.data || response.data || [];
      setFullInterests(interests);
      setAllInterests(interests);
      setCurrentPage(1);
      const start = 0;
      const end = pageSize;
      const sliced = interests.slice(start, end);
      setDataSource({
        data: sliced,
        current_page: 1,
        per_page: pageSize,
        total: interests.length
      });
    }
  };

  useEffect(() => {
    initialize();
  }, []);

  const handleCancel = () => {
    setShowModal(false);
    setEditingInterest(null);
    form.resetFields();
  };

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
            {editingInterest ? "Edit Interest" : "Add New Interest"}
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
                label={<b>Please write the interest below</b>}
                name="name"
                rules={[{ required: true, message: "Interest is required" }]}
              >
                <Input
                  addonBefore="Interest "
                  placeholder="Write interest here"
                  allowClear
                />
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
              {editingInterest ? "Update" : "Add"}
            </Button>
          </div>
        </Form>
      </div>
    </Modal>
  );

  return (
    <>
      <Space style={{ display: "flex", justifyContent: "space-between" }}>
        <Filter handleSearch={handleSearch} placeholder="Search interest" />

        <Button
          type="primary"
          style={{ background: "var(--themeColor)" }}
          onClick={() => setShowModal(true)}
        >
          Add New Interest
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

export default Interests;