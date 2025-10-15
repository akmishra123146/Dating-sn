import React, { useEffect, useState } from "react";
import { Card, Col, Row, Statistic, Tabs } from "antd";
import { Link } from "react-router-dom"; // ✅ Import Link
import ajaxService from "../../services/ajax-service";
import { SUPER_ADMIN } from "../../constants";

const AdminDashboard = () => {
  const [data, setData] = useState({
    total_users: 0,
    question: 0,
    // court_owners: 0,
    lifestyle: 0,
    total_payments: "0.00",
    new_payments: 0,
  });

  const onChange = (key) => {
    console.log(key);
  };

  const initialize = async () => {
    const response = await ajaxService.get("/superadmin-dashboard");
    if (response.success) {
      setData(response.data);
    }
  };

  useEffect(() => {
    if (localStorage.getItem("role") === SUPER_ADMIN) {
      initialize();
    }
  }, []);

  // ✅ Add respective routes for each card
  const statisticsData = [
    { title: "Total Users", value: data.total_users, link: "/users" },
    {
      title: "Total Questions",
      value: data.question,
      link: "/questions",
    },
    { title: "Total LifeStyle", value: data.lifestyle, link: "/liststyle-questions" },

  ];

  const items = [
    {
      key: "2",
      label: "Statistics",
      children: statistics(),
    },
  ];

  function statistics() {
    return (
      <Row gutter={[16, 24]}>
        {statisticsData.map(({ title, value, link }) => (
          <Col span={5} key={title}>
            <Link to={link}> {/* ✅ Make card clickable */}
              <Card hoverable>
                <Statistic title={title} value={value} />
              </Card>
            </Link>
          </Col>
        ))}
      </Row>
    );
  }

  return (
    <>
      <Tabs defaultActiveKey="1" items={items} onChange={onChange} />
    </>
  );
};

export default AdminDashboard;
