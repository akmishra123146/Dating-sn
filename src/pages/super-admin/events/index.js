import { useEffect, useState } from "react";
import ajaxService from "../../../services/ajax-service";
import {
  Button,
  Card,
  Col,
  Empty,
  Pagination,
  Row,
  Typography,
  Image,
  Space,
  Form,
  Modal,
  Input,
  Select,
  notification,
  DatePicker,
} from "antd";
import { BASE_URL } from "../../../constants";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { useHistory } from "react-router-dom";
import moment from "moment";
import { ImageUploader } from "../../../components";

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const Events = () => {
  const history = useHistory();
  const [form] = Form.useForm();

  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [renderData, setRenderData] = useState(true);
  const [fileList, setFileList] = useState([]);

  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [data, setData] = useState({
    data: [
      {
        name: null,
        description: null,
        date: null,
        images: [
          {
            image: null,
          },
        ],
        city: {
          name: null,
          state: {
            name: null,
            country: {
              name: null,
            },
          },
        },
      },
    ],
  });

  const handleChange = (info) => {
    let fileList = [...info.fileList];
    setFileList(fileList);
    if (fileList.length > 0 && fileList[0].status === "done") {
      form.setFieldsValue({ images: fileList });
    } else {
      form.setFieldsValue({ images: undefined });
    }
  };

  const beforeUpload = (file) => {
    return true;
  };

  const onFinish = async (values) => {
    setLoading(true);

    const data = new FormData();

    for (const key in values) {
      if (values.hasOwnProperty(key)) {
        const value = values[key];
        if (key === "images" && fileList.length) {
          data.append("images[]", fileList[0].originFileObj);
        } else if (key === "date") {
          data.append("date", value.format("YYYY-MM-DD HH:mm:ss"));
        } else {
          data.append(key, value);
        }
      }
    }

    const response = await ajaxService.post("/event", data);
    if (response.success) {
      setLoading(false);
      handleCancel();
      initialize();
      notification.open({
        message: response.message,
        icon: <CheckCircleOutlined style={{ color: "#108ee9" }} />,
      });
    } else {
      setLoading(false);
      for (const key in response.data) {
        const message = JSON.stringify(response.data[key])
          .slice(1, -1)
          .replace(/"/g, "");
        notification.open({
          message: message,
          icon: <CloseCircleOutlined style={{ color: "red" }} />,
        });
      }
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  function handleCancel() {
    setShowModal(false);
    form.resetFields();
    setFileList([]);
  }

  const handleChangePage = async (page) => {
    const response = await ajaxService.get(`/event?page=${page}`);
    if (response.success) {
      setData(response.data);
    }
  };

  const loadCountries = async () => {
    const response = await ajaxService.get("/country");
    if (response.success) {
      setCountries(response.data);
    }
  };

  const loadStates = async (id) => {
    if (id) {
      const response = await ajaxService.get(`/state?country_id=${id}`);
      if (response.success) {
        setStates(response.data);
      }
    } else {
      setStates([]);
      setCities([]);
      form.setFieldsValue({ state: undefined, city: undefined });
    }
  };

  const loadCities = async (id) => {
    if (id) {
      const response = await ajaxService.get(`/city?state_id=${id}`);
      if (response.success) {
        setCities(response.data);
      }
    } else {
      setCities([]);
      form.setFieldsValue({ city: undefined });
    }
  };

  const initialize = async () => {
    const response = await ajaxService.get("/event");

    const { success, data } = response;

    if (success) {
      if (data.data) {
        if (data.data.length === 0) setRenderData(false); // if data object data is null array

        setData(data);
      } else {
        setRenderData(false); // when data comes with null array
      }
    }
  };

  useEffect(() => {
    initialize();
    loadCountries();
  }, []);

  const renderModal = (
    <Modal
      className="court-modal"
      width="35%"
      open={showModal}
      maskClosable={false}
      onCancel={handleCancel}
      footer={[
        <div key="div" style={{ textAlign: "center" }}>
          <Button className="modal-button" key="cancel" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            className="modal-button"
            key="finish"
            type="primary"
            onClick={form.submit}
            style={{ background: "var(--themeColor)", marginLeft: 10 }}
            loading={loading}
          >
            Save
          </Button>
        </div>,
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
      >
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="images"
              rules={[{ required: true, message: "Image is required" }]}
            >
              <ImageUploader
                fileList={fileList}
                beforeUpload={beforeUpload}
                handleChange={handleChange}
              />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item
              label={<b>Event Name</b>}
              name="name"
              rules={[{ required: true, message: "Event name is required" }]}
            >
              <Input placeholder="ABC Event..." allowClear />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label={<b>Country</b>}
              name="country"
              rules={[{ required: true, message: "Country is required" }]}
            >
              <Select
                placeholder="Select Country"
                showSearch
                allowClear
                style={{ width: "100%" }}
                onChange={(id) => loadStates(id)}
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >=
                  0
                }
              >
                {countries.map(({ id, name }) => {
                  return (
                    <Option key={id} value={id}>
                      {name}
                    </Option>
                  );
                })}
              </Select>
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label={<b>State</b>}
              name="state"
              rules={[{ required: true, message: "State is required" }]}
            >
              <Select
                placeholder="Select State"
                showSearch
                allowClear
                style={{ width: "100%" }}
                onChange={(id) => loadCities(id)}
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >=
                  0
                }
              >
                {states.map(({ id, name }) => {
                  return (
                    <Option key={id} value={id}>
                      {name}
                    </Option>
                  );
                })}
              </Select>
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item
              label={<b>City</b>}
              name="city"
              rules={[{ required: true, message: "City is required" }]}
            >
              <Select
                placeholder="Select City"
                showSearch
                allowClear
                style={{ width: "100%" }}
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >=
                  0
                }
              >
                {cities.map(({ id, name }) => {
                  return (
                    <Option key={id} value={id}>
                      {name}
                    </Option>
                  );
                })}
              </Select>
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item
              label={<b>Street Name</b>}
              name="street_name"
              rules={[{ required: true, message: "Street Name is required" }]}
            >
              <Input placeholder="Street Name" allowClear />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label={<b>Date</b>}
              name="date"
              rules={[{ required: true, message: "Date is required" }]}
            >
              <DatePicker style={{ width: "100%" }} allowClear />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label={<b>Link</b>}
              name="link"
              rules={[{ required: true, message: "Link is required" }]}
            >
              <Input placeholder="www" allowClear />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item
              label={<b>Description</b>}
              name="description"
              rules={[{ required: true, message: "Description is required" }]}
            >
              <TextArea rows={4} placeholder="Description" allowClear />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );

  const renderContent = (
    <Row gutter={[30, 25]}>
      {data.data.map((event, i) => (
        <Col span={12} key={i}>
          <Card style={{ borderRadius: "20px" }}>
            <Row gutter={16}>
              <Col span={17}>
                <Space
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <Title
                    level={4}
                    style={{ color: "#0580a6", textTransform: "capitalize" }}
                  >
                    {event.name}
                  </Title>

                  <a
                    onClick={() =>
                      history.push({ pathname: "/events/waitlist/" + event.id })
                    }
                  >
                    <EyeOutlined
                      style={{ fontSize: 18, color: "#0580a6" }}
                      title="Waitlist"
                    />
                  </a>
                </Space>
                <Text id="subtitle">
                  {moment(event.date).format("D MMMM, YYYY")}
                </Text>
                <br />
                <br />
                <Text id="subtitle" style={{ color: "#ba00a1" }}>
                  {event.city.name +
                    ", " +
                    event.city.state.name +
                    ", " +
                    event.city.state.country.name}
                </Text>
                <br />
                <p className="description">{event.description}</p>
                <br />
              </Col>
              <Col span={7}>
                <Image
                  preview={false}
                  width={170}
                  height={163}
                  style={{ borderRadius: "30px" }}
                  src={
                    event.images[0]?.image &&
                    BASE_URL + "/storage/" + event.images[0]?.image
                  }
                />
              </Col>
            </Row>
          </Card>
        </Col>
      ))}
    </Row>
  );

  return (
    <>
      <div style={{ textAlign: "right" }}>
        <Button
          type="primary"
          style={{ background: "var(--themeColor)" }}
          onClick={() => setShowModal(true)}
        >
          Create Event
        </Button>
      </div>
      <br />
      {renderData && data.data[0].name ? (
        renderContent
      ) : (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
      )}
      <br />

      <div style={{ textAlign: "right" }}>
        <Pagination
          current={data.meta?.current_page}
          pageSize={data.meta?.per_page}
          total={data.meta?.total}
          onChange={(page, size) => handleChangePage(page)}
        />
      </div>

      {renderModal}
    </>
  );
};

export default Events;
