import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import {
  Button,
  Col,
  Row,
  Space,
  Table,
  Typography,
  notification,
  Modal,
} from "antd";
import { useEffect, useState } from "react";
import ajaxService from "../../../services/ajax-service";
import { Filter } from "../../../components";

const { Text, Title } = Typography;

const ContactUs = () => {
  const [dataSource, setDataSource] = useState({ data: [], current_page: 1, per_page: 10, total: 0 });
  const [type, setType] = useState(1);
  const [filter, setFilter] = useState('');

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [contactToDelete, setContactToDelete] = useState(null);

  const columns = [
    {
      title: "SNo",
      dataIndex: "id",
      key: "id",
      render: (text, record, index) => (
        (dataSource.current_page - 1) * dataSource.per_page + index + 1
      ),
    },
    {
      title: "Name",
      dataIndex: "user",
      key: "name",
      render: (user) => <Text>{user?.name || 'N/A'}</Text>,
    },
    {
      title: "Email",
      dataIndex: "user",
      key: "email",
      render: (user) => <Text style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>{user?.email || 'N/A'}</Text>,
    },
    {
      title: "Phone",
      dataIndex: "user",
      key: "phone",
      render: (user) => <Text>{user && user.country_code && user.phone ? `+${user.country_code} ${user.phone}` : 'N/A'}</Text>,
    },
    {
      title: "Purpose",
      dataIndex: "purpose",
      key: "purpose",
      render: (purpose) => <Text>{purpose}</Text>,
    },
    {
      title: "Subject",
      dataIndex: "subject",
      key: "subject",
      render: (subject) => <Text>{subject}</Text>,
    },
    {
      title: "Message",
      dataIndex: "message",
      key: "message",
      render: (message) => <Text style={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>{message}</Text>,
    },
    {
      title: "Created At",
      dataIndex: "created_at",
      key: "created_at",
      render: (created_at) => <Text>{new Date(created_at).toLocaleDateString()}</Text>,
    },
    {
      title: "Actions",
      key: "actions",
      render: (text, record) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            style={{ background: "#EBDEE1", color: "#FF9595", fontSize: "16px" }}
            danger
            onClick={() => handleDeleteClick(record.id)}
          >
            <DeleteOutlined />
          </Button>
        </Space>
      ),
    },
  ];

  const handleDeleteClick = (id) => {
    setContactToDelete(id);
    setDeleteModalVisible(true);
  };

  const handleConfirmDelete = async () => {
    if (contactToDelete) {
      try {
        const response = await ajaxService.delete('/contact-us/', contactToDelete);
        if (response.success) {
          notification.open({
            message: `Contact deleted successfully!`,
            icon: <CheckCircleOutlined style={{ color: "green" }} />,
          });
          fetchData(1);
        } else {
          notification.open({
            message: "Unable to delete contact.",
            icon: <CloseCircleOutlined style={{ color: "red" }} />,
          });
        }
      } catch (error) {
        console.error('Delete error:', error);
        notification.open({
          message: "Unable to delete contact.",
          icon: <CloseCircleOutlined style={{ color: "red" }} />,
        });
      }
    }
    setDeleteModalVisible(false);
    setContactToDelete(null);
  };

  const handleSearch = async ({ name }) => {
    const query = name ? name.trim() : '';
    const response = await ajaxService.get(`/contact-us?type=${type}&search=${query}`);
    const { success, data } = response;
    console.log('response',response);
    if (success) {
      if (data.data.length == 0) {
        setFilter('');
        notification.open({ message: `${name} is not found!`, icon: <CloseCircleOutlined style={{ color: 'red' }} /> })
      } else {
        setFilter(query);
      }
      setDataSource(data);
    }
  };

  const handleChangePage = async (page) => {
    const response = await ajaxService.get(`/contact-us?type=${type}&search=${filter}&page=${page}`);
    if (response.success) {
      setDataSource(response.data);
    }
  };

  const fetchData = async (page = 1) => {
    const response = await ajaxService.get(`/contact-us?type=${type}&search=${filter}&page=${page}`);
    if (response.success) {
      setDataSource(response.data);
    }
  };

  const onClick = async (newType) => {
    setFilter('');
    setType(newType);
    const response = await ajaxService.get(`/contact-us?type=${newType}&search=`);
    if (response.success) {
      setDataSource(response.data);
    }
  };

  useEffect(() => {
    fetchData(1);
  }, []);

  return (
    <>
      <Space style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <Filter handleSearch={handleSearch} placeholder="Search by subject, purpose or name" />
        <ul className="user-type" style={{ display: 'flex', justifyContent: "space-between", width: '220px' }}>
          <li style={type === 1 ? { fontWeight: 'bolder' } : {}}><a style={{ color: 'black' }} onClick={() => onClick(1)}>Feedback</a></li>
          <li style={type === 0 ? { fontWeight: 'bolder' } : {}}><a style={{ color: 'black' }} onClick={() => onClick(0)}>Complaint</a></li>
        </ul>
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
      <Modal
        title="Confirm Delete"
        open={deleteModalVisible}
        onOk={handleConfirmDelete}
        onCancel={() => setDeleteModalVisible(false)}
        okText="Delete"
        cancelText="Cancel"
        okType="danger"
      >
        <p>Are you sure you want to delete this contact? This action cannot be undone.</p>
      </Modal>
    </>
  );
};

export default ContactUs;