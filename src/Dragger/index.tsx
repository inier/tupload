import React, {
  useRef,
  useState,
  useEffect,
  MutableRefObject,
  RefObject
} from "react";
import "./index.scss";
import { Icon, Progress, Card } from "antd";

export type DragProps = React.PropsWithChildren<{
  onChange: any;
  name: string;
  action: string;
}>;

// 每个上传的文件都有这样的一个对象，记录上传的过程
export interface UploadFile {
  file: File; // 上传的文件
  percent: number; //当前文件上传的百分比
  url?: string; // 服务器上传成功之后返回的url地址
  status?: string; // 状态  initial uploading error done
}

const Dragger: React.SFC<DragProps> = function(props: DragProps): JSX.Element {
  const [uploadFiles, setUploadFiles] = useState<Array<UploadFile>>([]);
  // {current: 指向真正要引用的元素 } 第一次渲染current=undefined, 从第二次开始 current就只想真是的dom元素
  let uploadContainer: MutableRefObject<HTMLDivElement | undefined> = useRef<
    HTMLDivElement | undefined
  >();

  const onDragEnter: (ev: DragEvent) => any = (ev: DragEvent): any => {
    ev.preventDefault(); // 组织默认事件
    ev.stopPropagation();
  };
  const onDragOver: (ev: DragEvent) => any = (ev: DragEvent): any => {
    ev.preventDefault(); // 组织默认事件
    ev.stopPropagation();
  };
  const onDragLeave: (ev: DragEvent) => any = (ev: DragEvent): any => {
    ev.preventDefault(); // 组织默认事件
    ev.stopPropagation();
  };
  const onDrop: (ev: DragEvent) => any = (ev: DragEvent): any => {
    ev.preventDefault(); // 组织默认事件
    ev.stopPropagation();

    let transfer: DataTransfer | null = ev.dataTransfer;
    if (transfer && transfer.files) {
      upload(transfer.files);
    }
  };

  function sendRequest(formData: FormData, file: File, cb?: Function) {
    let xhr: XMLHttpRequest = new XMLHttpRequest();

    xhr.open("POST", props.action, true);
    xhr.responseType = "json";
    xhr.timeout = 10000;

    let uploadFile: UploadFile = {
      file,
      percent: 0,
      status: "uploading"
    };
    uploadFiles.push(uploadFile);

    xhr.onprogress = onUploadProgress;
    xhr.upload.onprogress = onUploadProgress;

    xhr.send(formData); //开始上传，发送form数据

    function onUploadProgress(ev: ProgressEvent) {
      if (ev.lengthComputable) {
        //当上传的过程中，会不停的触发onprogress事件
        let percent: number = parseInt(
          ((ev.loaded / ev.total) * 100).toFixed(0)
        );

        uploadFile.percent = percent;

        if (percent >= 100) {
          uploadFile.status = "done";
        }

        setUploadFiles([...uploadFiles]);
      }
    }

    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4 && xhr.status === 200) {
        uploadFile.url = xhr.response.url;
        cb && cb();
        props.onChange(uploadFile);
        setUploadFiles([...uploadFiles]);
      }
    };

    xhr.onerror = function() {
      uploadFile.status = "error";
      setUploadFiles([...uploadFiles]);
    };

    xhr.ontimeout = function() {
      uploadFile.status = "error";
      setUploadFiles([...uploadFiles]);
    };
  }

  const upload = (files: FileList) => {
    console.log(files);
    // 当文件体积较大时，可以将文件切除多个小块，分块上传
    let chunkSize = 1 * 1024 * 1024; // 每个小块2M

    for (let i = 0; i < files.length; i++) {
      let file = files[i];

      let chunks = []; // 存放当前文件的所有分块；
      let chunkCount = 0; // 总的文件块数
      let sendedChunkCount = 0; // 已成功上传的块数
      let token = +new Date(); // 当前文件的所有分块共有同一token
      let name = file.name; // 当前文件的所有分块共有同一文件名

      if (file.size > chunkSize) {
        let start = 0,
          end = 0;
        while (true) {
          end += chunkSize;
          let blob = file.slice(start, end);
          start += chunkSize;

          if (!blob.size) {
            break;
          }
          chunks.push(blob);
        }
      } else {
        chunks.push(file);
      }

      chunkCount = chunks.length;

      for (let j = 0; j < chunkCount; j++) {
        let formData = new FormData();

        formData.append("token", token + "");
        formData.append("file", chunks[j]);
        formData.append("index", j + "");

        console.log(formData);
        sendRequest(formData, file, function() {
          sendedChunkCount += 1;

          if (sendedChunkCount === chunkCount) {
            let fd = new FormData();

            fd.append("type", "join");
            fd.append("token", token + "");
            fd.append("chunkCount", chunkCount + "");
            fd.append("filename", name);

            sendRequest(fd, file);
          }
        });
      }
    }
  };

  // useEffect中的函数会在组件挂载完成（真是dom加载完成）或更新完成后执行
  useEffect(() => {
    uploadContainer.current!.addEventListener("dragenter", onDragEnter);
    uploadContainer.current!.addEventListener("dragover", onDragOver);
    uploadContainer.current!.addEventListener("dragleave", onDragLeave);
    uploadContainer.current!.addEventListener("drop", onDrop);
    // useEffect会返回一个函数， 他会在组件卸载时执行
    return () => {
      uploadContainer.current!.removeEventListener("dragenter", onDragEnter);
      uploadContainer.current!.removeEventListener("dragover", onDragOver);
      uploadContainer.current!.removeEventListener("dragleave", onDragLeave);
      uploadContainer.current!.removeEventListener("drop", onDrop);
    };
  });

  return (
    <>
      <div
        className="dragger-container"
        ref={uploadContainer as RefObject<HTMLDivElement> | null | undefined}
      >
        {props.children}
      </div>
      {uploadFiles.map((uploadFile: UploadFile, index: number) => (
        <div key={index}>
          <div>
            <Icon type="paper-clip" />
            <span style={{ marginLeft: "10px" }}>{uploadFile.file!.name}</span>
          </div>
          <Progress
            percent={Number(uploadFile.percent)}
            status={uploadFile.status === "error" ? "exception" : undefined}
          />
        </div>
      ))}
      {uploadFiles.map((uploadFile, index) =>
        uploadFile.url ? (
          <Card
            key={index}
            hoverable
            style={{ width: 100 }}
            cover={<img alt="example" src={uploadFile.url} />}
          >
            <Card.Meta title={uploadFile.file!.name} />
          </Card>
        ) : null
      )}
    </>
  );
};

export default Dragger;
