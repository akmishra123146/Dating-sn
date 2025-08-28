import { ClockCircleOutlined } from "@ant-design/icons";
import { Col, Row, Select } from "antd";
import { useEffect } from "react";

const { Option } = Select

const HourSelector = ({ form, name }) => {

    const hours = Array.from({ length: 23 }, (_, i) => i + 1);

    useEffect(() => {
    }, [form, name]);

    return (
        <Select
            style={{ width: '20%' }}
            dropdownStyle={{ width: '150px' }}
            placeholder="Select time"
            key={form.getFieldValue(name)}
            defaultValue={form.getFieldValue(name)}
            suffixIcon={<ClockCircleOutlined style={{ fontSize: 14 }} />}
            onSelect={(value) => form.setFieldsValue({ [name]: value })}
        >
            {hours.map((hour) => (
                <Option style={{ width: '150px' }} key={`hour-${hour}`} value={`${hour.toString().padStart(2, '0')}:00`}>
                    <Row gutter={16}>
                        <Col span={4}>{`${hour.toString().padStart(2, '0')}`}</Col>
                        <Col span={1}>:</Col>
                        <Col span={3}>00</Col>
                    </Row>
                </Option>
            ))}
        </Select>
    )
}

export default HourSelector