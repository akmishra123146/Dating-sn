import { Button, Divider, Form, Select, Tabs, notification } from "antd"
import { HourSelector } from "../../../components"
import ajaxService from "../../../services/ajax-service"
import { CalendarOutlined, CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import moment from "moment";
import DatePicker from "react-multi-date-picker";
import DatePanel from "react-multi-date-picker/plugins/date_panel";
import ClosedDateTable from "./closedDateTable";

const { Option } = Select

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const ProfileSettings = () => {

    const [form] = Form.useForm()
    const courtID = localStorage.getItem('courtID')

    const [forceRefresh, setForceRefresh] = useState(true)

    const [settingID, setSettingID] = useState(0)
    const [activeTab, setActiveTab] = useState('1')

    const [closedDatesData, setClosedDatesData] = useState([])

    const onFinish = async (values) => {
        if (activeTab === '1') {
            values.start_time = `${values.start_time}:00`;
            values.end_time = `${values.end_time}:00`;
            values.court_id = localStorage.getItem('courtID');

            delete values.closed_date;

            let response = {};

            if (settingID > 0) {
                response = await ajaxService.put('/court-availability/', settingID, values)
            } else {
                response = await ajaxService.post('/court-availability', values)
            }

            if (response.success) {
                notification.open({ message: response.message, icon: <CheckCircleOutlined style={{ color: '#108ee9' }} /> })
            } else {
                for (const key in response.data) {
                    const message = JSON.stringify(response.data[key]).slice(1, -1).replace(/"/g, '');
                    notification.open({ message: message, icon: <CloseCircleOutlined style={{ color: 'red' }} /> })
                }
            }
        } else if (activeTab === '2') {

            const closedDates = [];

            values.closed_dates.map((date, index) => (
                closedDates.push(date.format() + " 00:00:00")
            ))

            const response = await ajaxService.post('/add-closed-date', { closed_dates: closedDates, court_id: courtID })

            if (response.success) {
                setForceRefresh(true)
                notification.open({ message: response.message, icon: <CheckCircleOutlined style={{ color: '#108ee9' }} /> })
            } else {
                for (const key in response.data) {
                    const message = JSON.stringify(response.data[key]).slice(1, -1).replace(/"/g, '');
                    notification.open({ message: message, icon: <CloseCircleOutlined style={{ color: 'red' }} /> })
                }
            }
        }
    }

    const onFinishFailed = (errorInfo) => {
        console.error('Failed : ' + errorInfo)
    }

    const loadClosedDates = async () => {
        const response = await ajaxService.get('/get-closed-date/' + courtID)

        const { success, data } = response

        if (success) {
            setClosedDatesData(data)
        }
    }

    const initialize = async () => {
        const response = await ajaxService.get('/court-availability/' + courtID)

        const { success, data } = response;

        if (success) {
            if (data) {
                setSettingID(data.id)
                data.start_time = moment(data.start_time, 'HH:mm:ss').format('HH:mm')
                data.end_time = moment(data.end_time, 'HH:mm:ss').format('HH:mm')
                form.setFieldsValue({ ...data })
            }
        }
    }

    useEffect(() => {
        initialize()
    }, [])

    useEffect(() => {
        if (forceRefresh) {
            loadClosedDates();
            setForceRefresh(false)
        }
    }, [forceRefresh])

    const WeekDays = (
        <Select placeholder="Select day" style={{ width: "20%" }}>
            {daysOfWeek.map((day) => (
                <Option key={day} value={day}>
                    {day}
                </Option>
            ))}
        </Select>
    )

    const availability = (
        <>
            <Form.Item label={<b>Enter Opening Time</b>} name='start_time' rules={[{ required: activeTab == "1" ? true : false, message: 'Start time is required' }]}>
                <HourSelector form={form} name='start_time' />
            </Form.Item>

            <Form.Item label={<b>Enter Closing Time</b>} name='end_time' rules={[{ required: activeTab == "1" ? true : false, message: 'Closing time is required' }]}>
                <HourSelector form={form} name='end_time' />
            </Form.Item>

            <Form.Item label={<b>Add Start Day</b>} name='start_day' rules={[{ required: activeTab == "1" ? true : false, message: 'Start day is required' }]}>
                {WeekDays}
            </Form.Item>

            <Form.Item label={<b>Add End Day</b>} name='end_day' rules={[{ required: activeTab == "1" ? true : false, message: 'End day is required' }]}>
                {WeekDays}
            </Form.Item>
        </>
    )

    const closedDate = (
        <Form.Item labelCol={{ span: 24 }} label={<b>Add CLosed Dates <CalendarOutlined /></b>} name='closed_dates' rules={[{ required: activeTab == "2" ? true : false, message: 'Closed date is required' }]}>
            <DatePicker
                format="YYYY-MM-DD"
                multiple={true}
                sort={true}
                style={{ width: '272px', height: '32px' }}
                plugins={[<DatePanel />]}
                placeholder="Enter closed dates"
            />
        </Form.Item>
    )

    return (
        <>
            <Form form={form} layout="vertical" onFinish={onFinish} onFinishFailed={onFinishFailed}>
                <Tabs
                    defaultActiveKey={activeTab}
                    onChange={setActiveTab}
                    items={[
                        { key: '1', label: 'Availability', children: availability },
                        { key: '2', label: 'Closed Date', children: closedDate }
                    ]}
                />

                <Button type="primary" htmlType="submit" className="modal-button" style={{ background: 'var(--themeColor)' }}>
                    Save
                </Button>
            </Form>

            {(activeTab === "2" && closedDatesData.length > 0) &&
                <>
                    <Divider />
                    <ClosedDateTable data={closedDatesData} setForceRefresh={setForceRefresh} />
                </>
            }
        </>
    )
}

export default ProfileSettings