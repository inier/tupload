import React from 'react';
import ReactDOM from 'react-dom';
import 'antd/dist/antd.css';
import { Upload, Icon, message } from 'antd';
import Dragger, { DragProps, UploadFile } from './Dragger';
const props: DragProps = {
    name: 'file',
    //action: 'https://www.mocky.io/v2/5cc8019d300000980a055e76',
    action: 'http://localhost:8080/upload',
    onChange: (uploadFile: UploadFile) => {//当上传状态发生改变的时候会执行回调
        console.log(uploadFile);
        const { status } = uploadFile;
        if (status == 'done') {
            message.success(`${uploadFile.file!.name}上传成功!`);
        } else if (status == 'error') {
            message.error(`${uploadFile.file!.name}上传失败!`);
        }
    }
}
ReactDOM.render(
    <Dragger {...props}><Icon type="inbox" /></Dragger>,
    document.getElementById('root')
);