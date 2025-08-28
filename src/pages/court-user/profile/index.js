import { Tabs } from "antd";
import ProfileSettings from "./setting";

const CourtUserProfile = () => {

    const onChange = (key) => {
        // console.log(key);
    };

    const items = [
        {
            key: '1',
            label: 'Setting',
            children: <ProfileSettings />,
        },
    ];

    return (
        <>
            <Tabs defaultActiveKey="1" items={items} onChange={onChange} />
        </>
    )
}

export default CourtUserProfile