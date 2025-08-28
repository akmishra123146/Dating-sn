import { Button, Space, Table, Typography, notification } from "antd";
import { useHistory ,Link } from "react-router-dom";
import { EditOutlined, DeleteOutlined, CloseCircleOutlined ,CheckCircleOutlined, EyeOutlined} from '@ant-design/icons';
import { useEffect, useState } from "react";
import ajaxService from "../../../services/ajax-service";
import moment from "moment";
import { Filter } from "../../../components";

const { Text } = Typography

const FREE_USER = "free-user";
const PAID_USER = "paid-user";

const Users = () => {

    let history = useHistory()

    const [filter, setFilter] = useState('')

    const [type, setType] = useState(FREE_USER)
    const [dataSource, setDataSource] = useState({});

    const columns = [
        
        {
            title: 'User ID',
            dataIndex: 'id',
            key: 'id',
        },
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Phone',
            dataIndex: 'phone',
            key: 'phone',
        },
        {
            title: 'Online Status',
            dataIndex: 'status',
            key: 'status',
        },
        {
            title: 'Plan',
            dataIndex: 'stripe_id',
            key: 'stripe_id',
            render: (stripe_id) => (<Text>{(stripe_id) ? 'Paid-user' : 'Free-user'}</Text>)
        },
        {
            title: 'Status',
            dataIndex: 'active',
            key: 'active',
            render: (active) => (<Text>{(active) ? 'Active' : 'Inactive'}</Text>)
        },
        {
            title: 'Created Date',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (created_at) => (<Text>{moment(created_at).format('DD-MMM-YYYY')}</Text>)
        },
        {
            title: 'Actions',
            key: 'address',
            render: (text, record) => (
                <Space size='small'>
                    <Link to={`/users/${record.id}`}>
                        <Button
                            type="primary"
                            size="small"
                            style={{ background: "#C9DBD7", color: "#658664", fontSize: "16px" }}
                        >
                            <EyeOutlined />
                        </Button>
                    </Link>
                    <Link to={`/users/edit/${record.id}`}>
                    <Button type='primary' size="small" style={{ background: "#C9DBD7", color: '#658664', fontSize: '16px' }} primary>
                        <EditOutlined />
                    </Button>
                    </Link>
                    <Button type='primary' size="small" style={{ background: "#EBDEE1", color: '#FF9595', fontSize: '16px' }} danger onClick={() => openDeleteModal(record.id)}>
                        <DeleteOutlined />
                    </Button>
                </Space>
            )
        },
    ];

    const openDeleteModal = async (id ) => {
        console.log(id)
        const response = await ajaxService.delete(`/users/`,id)

        const { success, data } = response;
        console.log('response',response);
        if (success) {
            notification.open({ message: `User deleted successfully!`, icon: <CheckCircleOutlined style={{ color: 'green' }} /> })
            initialize(type)
        }
    }

    const handleSearch = async ({ name }) => {

        const response = await ajaxService.get(`/users?user_type=${type}&name=${name}`)

        const { success, data } = response;
        console.log('response',response);
        if (success) {
            if (data.data.length == 0) {
                setFilter('')
                notification.open({ message: `${name} is not found!`, icon: <CloseCircleOutlined style={{ color: 'red' }} /> })
            } else {
                setFilter(name)
            }

            setDataSource(response.data)
        }
    }

    const onClick = (type) => {
        setType(type)
        initialize(type)
    }

    const handleChangePage = async (page) => {
        const response = await ajaxService.get(`/users?user_type=${type}&name=${filter}&page=${page}`)

        if (response.success) {
            setDataSource(response.data)
        }

    }

    const initialize = async (type) => {
        const response = await ajaxService.get(`/users?user_type=${type}&name=${filter}`)

        if (response.success) {
            setDataSource(response.data)
        }
    }

    useEffect(() => {
        initialize(type)
    }, [])

    return (
        <>
            <Space style={{ display: 'flex', justifyContent: 'space-between' }}>

                <Filter handleSearch={handleSearch} placeholder="Search User name" />

                <ul className="user-type" style={{ display: 'flex', justifyContent: "space-between", width: '180px' }}>
                    <li style={type === FREE_USER ? { fontWeight: 'bolder' } : {}}><a style={{ color: 'black' }} onClick={() => onClick(FREE_USER)}>Free</a></li>
                    <li style={type === PAID_USER ? { fontWeight: 'bolder' } : {}}><a style={{ color: 'black' }} onClick={() => onClick(PAID_USER)}>Premium</a></li>
                </ul>

            </Space>

            <Table
                columns={columns}
                dataSource={dataSource.data}
                style={{ background: 'none' }}
                rowKey='id'
                pagination={{
                    onChange: (page, size) => handleChangePage(page),
                    current: dataSource.current_page,
                    pageSize: dataSource.per_page,
                    total: dataSource.total,
                }}
            />
        </>
    )
}
export default Users