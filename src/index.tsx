import React from "react";
import ReactDOM from "react-dom";
import { Upload, Icon, message } from "antd";
import "antd/dist/antd.css";
import Dragger, { DragProps, UploadFile } from "./Dragger";

// const { Dragger: DraggerAntd } = Upload;

const props: DragProps = {
  name: "file",
  // action: "https://www.mocky.io/v2/5cc8019d300000980a055e76",
  action: "http://localhost:8080/upload",
  onChange(uploadFile: UploadFile) {
    const { status } = uploadFile;
    if (status !== "uploading") {
      console.log(uploadFile.file);
    }
    if (status === "done") {
      message.success(`${uploadFile.file!.name}上传成功!`);
    } else if (status === "error") {
      message.error(`${uploadFile.file!.name}上传失败!`);
    }
  }
};

const App = () => {
  return (
    <div>
      {/* <DraggerAntd {...props}>        
          <Icon type="inbox" />              
      </DraggerAntd> */}
      <Dragger {...props}>
        <Icon type="inbox" style={{ fontSize: "30px", color: "#08c" }} />
      </Dragger>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById("root"));
