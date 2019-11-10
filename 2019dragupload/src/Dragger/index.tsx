import React, { useRef, MutableRefObject, RefObject, useEffect, useState } from 'react';
import './index.css';
import { Progress, Icon, Card } from 'antd';
export type DragProps = React.PropsWithChildren<{
    onChange: any;
    name: string;
    action: string
}>
//每个上传的文件都有这样的一个对象，记录上传的过程
export interface UploadFile {
    file?: File,//上传的文件
    percent?: number;//当前文件上传的百分比
    url?: string;//服务器上传成功之后返回的访问URL地址
    status?: string;//状态 initial uploading error done
}

const Dragger: React.FC<DragProps> = function (props: DragProps): JSX.Element {
    let [uploadFiles, setUploadFiles] = useState<Array<UploadFile>>([]);
    //{current:指向真正要引用的元素} 第一次渲染current=undefined,从第二次开 current就指向真实的DOM元素，从第二次开始指向就不再改变了
    let uploadContainer: MutableRefObject<HTMLDivElement | undefined> = useRef<HTMLDivElement | undefined>();
    const onDragEnter: (ev: DragEvent) => any = (ev: DragEvent): any => {
        ev.preventDefault();//阻止默认事件
        ev.stopPropagation();
    }
    const onDragOver: (ev: DragEvent) => any = (ev: DragEvent): any => {
        ev.preventDefault();//阻止默认事件
        ev.stopPropagation();
    }
    const onDragLeave: (ev: DragEvent) => any = (ev: DragEvent): any => {
        ev.preventDefault();//阻止默认事件
        ev.stopPropagation();
    }
    const onDrop: (ev: DragEvent) => any = (ev: DragEvent): any => {
        ev.preventDefault();//阻止默认事件
        ev.stopPropagation();
        let transfer: DataTransfer | null = ev.dataTransfer;
        if (transfer && transfer.files) {
            upload(transfer.files);
        }
    }
    function upload(files: FileList) {
        for (let i = 0; i < files.length; i++) {
            let file = files[i];
            let formData = new FormData();
            formData.append('filename', file.name);
            formData.append(props.name, file);
            let xhr: XMLHttpRequest = new XMLHttpRequest();
            xhr.open('POST', props.action, true);
            xhr.responseType = 'json';
            let uploadFile: UploadFile = { file, percent: 0, status: 'uploading', url: '' };
            uploadFiles.push(uploadFile);
            xhr.onprogress = onUploadProgress;
            xhr.upload.onprogress = onUploadProgress;
            function onUploadProgress(event: ProgressEvent) {
                if (event.lengthComputable) {
                    //当上传的过程中，会不停的触发onprogress事件
                    let percent: number = parseInt((event.loaded / event.total * 100).toFixed(0));
                    uploadFile.percent = percent;
                    if (percent >= 100) {
                        uploadFile.status = 'done';
                    }
                    setUploadFiles([...uploadFiles]);
                }
            }
            xhr.onerror = function () {
                uploadFile.status = 'error';
                setUploadFiles([...uploadFiles]);
            }
            xhr.timeout = 10000;
            xhr.ontimeout = function () {
                uploadFile.status = 'error';
                setUploadFiles([...uploadFiles]);
            }
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    uploadFile.url = xhr.response.url;
                    props.onChange(uploadFile);
                    setUploadFiles([...uploadFiles]);
                }
            }
            xhr.send(formData);
        }
    }
    //useEffect中的函数会在组件挂载完成，真实DOM挂载 完成后执行，或者 更新完成后执行
    useEffect(() => {
        uploadContainer.current!.addEventListener('dragenter', onDragEnter);
        uploadContainer.current!.addEventListener('dragover', onDragOver);
        uploadContainer.current!.addEventListener('dragleave', onDragLeave);
        uploadContainer.current!.addEventListener('drop', onDrop);
        //useEffect会返回一个函数，它会在组件卸载的时候执行
        return () => {
            uploadContainer.current!.removeEventListener('dragenter', onDragEnter);
            uploadContainer.current!.removeEventListener('dragover', onDragOver);
            uploadContainer.current!.removeEventListener('dragleave', onDragLeave);
            uploadContainer.current!.removeEventListener('drop', onDrop);
        }
    }, []);

    return (
        <>
            <div className="dragger-container" ref={uploadContainer as RefObject<HTMLDivElement> | null | undefined}>
                {props.children}
            </div>
            {
                uploadFiles.map((uploadFile: UploadFile, index: number) => (
                    <div key={index}>
                        <div>
                            {uploadFile.status === 'loading' ? <Icon type="loading" /> : <Icon type="paper-clip" />}
                            <span style={{ marginLeft: 10 }}>{uploadFile.file!.name}</span>
                        </div>
                        <Progress percent={uploadFile.percent} status={uploadFile.status === 'error' ? 'exception' : undefined} />
                    </div>
                ))
            }
            {
                uploadFiles.map((uploadFile: UploadFile, index: number) => (
                    uploadFile.url ? <Card
                        key={index}
                        hoverable
                        style={{ width: 100 }}
                        cover={<img alt="example" src={uploadFile.url} />}
                    >
                        <Card.Meta title={uploadFile.file!.name} />
                    </Card> : null
                ))
            }
        </>

    )
}
export default Dragger;