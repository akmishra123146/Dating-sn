import { Button, Form, Input, Space } from "antd"
import { SearchOutlined } from "@ant-design/icons"

const Filter = ({ handleSearch, placeholder }) => {
    return (
        <Form onFinish={handleSearch} layout="vertical">
            <Space direction="horizontal">
                <Form.Item name="name" style={{ marginTop: 20 }}>
                    <Input placeholder={placeholder} style={{ width: "250px" }} allowClear />
                </Form.Item>
                <Form.Item style={{ marginTop: 20 }}>
                    <Button htmlType="submit"><SearchOutlined style={{ color: "#0580a6" }} /></Button>
                </Form.Item>
            </Space>
        </Form>
    )
}

export default Filter