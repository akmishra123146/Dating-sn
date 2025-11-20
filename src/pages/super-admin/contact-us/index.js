import {
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import {
  Col,
  Row,
  Space,
  Table,
  Typography,
  notification,
} from "antd";
import { useEffect, useState } from "react";
import ajaxService from "../../../services/ajax-service";
import { Filter } from "../../../components";

const { Text, Title } = Typography;

const ContactUs = () => {
  const [dataSource, setDataSource] = useState({ data: [], current_page: 1, per_page: 10, total: 0 });
  const [type, setType] = useState(1)

  const [allContacts, setAllContacts] = useState([]);
  const [fullContacts, setFullContacts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  const pageSize = 10;

  const columns = [
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
      render: (user) => <Text>{'+'+ user?.country_code + ' ' + user?.phone || 'N/A'}</Text>,
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
  ];

  const handleSearch = ({ subject }) => {
    const query = subject ? subject.toLowerCase().trim() : '';
    if (!query) {
      setAllContacts(fullContacts);
      setCurrentPage(1);
      const start = 0;
      const end = pageSize;
      const sliced = fullContacts.slice(start, end);
      setDataSource({
        data: sliced,
        current_page: 1,
        per_page: pageSize,
        total: fullContacts.length
      });
      return;
    }

    const filtered = fullContacts.filter(contact =>
      contact.subject.toLowerCase().includes(query) ||
      contact.purpose.toLowerCase().includes(query) ||
      contact.user?.name?.toLowerCase().includes(query)
    );

    if (filtered.length === 0) {
      notification.open({
        message: `${subject} is not found!`,
        icon: <CloseCircleOutlined style={{ color: "red" }} />,
      });
      setAllContacts(fullContacts);
      setCurrentPage(1);
      const start = 0;
      const end = pageSize;
      const sliced = fullContacts.slice(start, end);
      setDataSource({
        data: sliced,
        current_page: 1,
        per_page: pageSize,
        total: fullContacts.length
      });
      return;
    }

    setAllContacts(filtered);
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
    const sliced = allContacts.slice(start, end);
    setDataSource({
      data: sliced,
      current_page: page,
      per_page: pageSize,
      total: allContacts.length
    });
  };

  const initialize = async (type) => {
    const response = await ajaxService.get(`/contact-us?type=${type}`);
    if (response.success) {
      const contacts = response.data.data || response.data || [];
      setFullContacts(contacts);
      setAllContacts(contacts);
      setCurrentPage(1);
      const start = 0;
      const end = pageSize;
      const sliced = contacts.slice(start, end);
      setDataSource({
        data: sliced,
        current_page: 1,
        per_page: pageSize,
        total: contacts.length
      });
    }
  };

  const onClick = (type) => {
    setType(type);
  };

  useEffect(() => {
    initialize(type);
  }, [type]);

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
    </>
  );
};

export default ContactUs;