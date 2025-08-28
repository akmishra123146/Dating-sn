import { UploadOutlined } from "@ant-design/icons";
import { Upload } from "antd";

const ImageUploader = ({ fileList, beforeUpload, handleChange, length = 1, handleRemove }) => {

    const customRequest = (e) => {
        e.onSuccess();
    };

    return (
        <Upload
            name="image"
            accept=".jpg,.jpeg,.png,.svg"
            beforeUpload={beforeUpload}
            onChange={handleChange}
            fileList={fileList}
            listType="picture-circle"
            onRemove={handleRemove}
            customRequest={customRequest}
        >
            {fileList.length < length && (
                <div>
                    <UploadOutlined />
                    <div style={{ marginTop: 8 }}>Upload</div>
                </div>
            )}
        </Upload>
    );
};

export default ImageUploader;