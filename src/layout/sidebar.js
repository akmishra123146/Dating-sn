import React from 'react';
import { Layout, Menu } from 'antd';
import { Link } from 'react-router-dom';
import fitMatchIcon from "../assets/icons/logo2.png"
import { SUPER_ADMIN } from '../constants';
import { MdOutlineDashboard } from "react-icons/md";
import { TbUsersGroup } from "react-icons/tb";
import { GiTennisCourt } from "react-icons/gi";
// import { MdOutlinePayments } from "react-icons/md";
// import { LuBadgePercent } from "react-icons/lu";
import { LiaUsersSolid } from "react-icons/lia";
// import { FaUserCheck } from "react-icons/fa";
// import { VscReferences } from "react-icons/vsc";

const { Sider } = Layout;

const items = [
    {
        label: 'Dashboard',
        key: 'dashboard',
        icon: <MdOutlineDashboard />,
        link: '/'
    },
    {
        label: 'Total Users',
        key: 'users',
        icon: <TbUsersGroup />,
        link: '/users'
    },
    // {
    //     label: 'Courts',
    //     key: 'courts',
    //     icon: <GiTennisCourt />,
    //     link: '/courts',
    // },
    // {
    //     label: 'Payments',
    //     key: 'payments',
    //     icon: <MdOutlinePayments />,
    //     link: '/payments'
    // },
    // {
    //     label: 'Membership Plans',
    //     key: 'membership_plans',
    //     icon: <MdOutlinePayments />,
    //     link: '/membership-plans'
    // },
    // {
    //     label: 'Events',
    //     key: 'events',
    //     icon: <LuBadgePercent />,
    //     link: '/events'
    // },
    // {
    //     label: 'Referrals',
    //     key: 'referrals',
    //     icon: <VscReferences />,
    //     link: '/referrals'
    // },
    {
        label: 'Questions',
        key: 'questions',
        icon: <LiaUsersSolid />,
        link: '/questions'
    },
    {
        label: 'LifeStyle Questions',
        key: 'liststyle-questions',
        icon: <LiaUsersSolid />,
        link: '/liststyle-questions'
    },
    // {
    //     label: 'User Verification',
    //     key: 'user-verification',
    //     icon: <FaUserCheck />,
    //     link: '/user-verification'
    // },
    // {
    //     label: 'Help',
    //     key: 'help',
    //     icon: <IoIosHelpCircleOutline />,
    // },
];

const courtItems = [
    {
        label: 'Dashboard',
        key: 'dashboard',
        icon: <MdOutlineDashboard />,
        link: '/'
    },
    {
        label: 'Court Bookings',
        key: 'bookings',
        icon: <GiTennisCourt />,
        link: '/bookings'
    }
    // {
    //     label: 'Payments',
    //     key: 'payments',
    //     icon: <MdOutlinePayments />,
    //     link: '/payments'
    // },
]

function activate() {
    const pathname = window.location.pathname;

    if (pathname !== '/') {
        let key = pathname.replace("/", "");

        const pathSegments = key.split('/');

        // const firstSegment = pathSegments.find(segment => segment !== '');

        return pathSegments[0];
    }

    return 'dashboard';
}

const Sidebar = () => {

    const role = localStorage.getItem('role')

    return (
        <>
            <Sider style={{ overflow: 'auto', height: '100vh', position: 'fixed', left: 0, top: 0, bottom: 0, background: '#BA00A1' }}>
                <div style={{ margin: '20px 0px 10px 18px' }}>
                    <img src={fitMatchIcon} alt="fitmatch icon" style={{ height: '45px', width: '160px', objectFit: 'cover' }} />
                </div>
                <Menu
                    theme="dark"
                    mode="inline"
                    selectedKeys={[activate()]}
                    style={{ background: '#BA00A1', color: 'white', fontSize: '13px' }}
                    items={(role === SUPER_ADMIN ? items : courtItems).map(item => ({
                        key: item.key,
                        icon: item.icon,
                        label: <Link to={item.link}>{item.label}</Link>
                    }))}
                />
            </Sider>
        </>
    )
}

export default Sidebar