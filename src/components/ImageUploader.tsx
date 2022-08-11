import React, { useEffect, useRef, useState } from "react";
import { Toast } from "primereact/toast";
import { FileUpload } from "primereact/fileupload";
import { ProgressBar } from "primereact/progressbar";
import { Button } from "primereact/button";
import { Tooltip } from "primereact/tooltip";
import { Tag } from "primereact/tag";
import ImageObjectDetector from "./ImageObjectDetector";

const FileUploader = () => {
  const [totalSize, setTotalSize] = useState(0);
  const [img, updateImg] = useState<string | undefined>();
  const toast = useRef(null);
  const fileUploadRef = useRef(null);

  const onUpload = () => {
    // @ts-ignore
    toast.current.show({
      severity: "info",
      summary: "Success",
      detail: "File Uploaded",
    });
  };

  useEffect(() => {
    var element = document.querySelector('[aria-label="Cancel"]');

    element?.addEventListener("click", () => updateImg(undefined));
  }, []);

  const emptyTemplate = () => {
    return (
      <div className="flex align-items-center flex-column">
        <i
          className="pi pi-image mt-3 p-5"
          style={{
            fontSize: "5em",
            borderRadius: "50%",
            backgroundColor: "var(--surface-b)",
            color: "var(--surface-d)",
          }}
        ></i>
        <span
          style={{ fontSize: "1.2em", color: "var(--text-color-secondary)" }}
          className="my-5"
        >
          Drag and Drop Image Here
        </span>
      </div>
    );
  };

  const customBase64Uploader = async (event: any) => {
    // convert file to base64 encoded
    const file = event.files[0];
    const reader = new FileReader();
    let blob = await fetch(file.objectURL).then((r) => r.blob()); //blob:url
    reader.readAsDataURL(blob);
    reader.onloadend = function () {
      const base64data = reader.result;
      updateImg(base64data as string);
    };
  };

  return (
    <div className="grid">
      <Toast ref={toast}></Toast>

      <Tooltip target=".custom-choose-btn" content="Choose" position="bottom" />

      <div className="col-12">
        <FileUpload
          onUpload={onUpload}
          multiple={false}
          accept="image/*"
          maxFileSize={1000000}
          emptyTemplate={emptyTemplate}
          uploadHandler={customBase64Uploader}
          customUpload={true}
          uploadOptions={{ label: "Analyse image", icon: "pi-desktop pi" }}
        />

        {img && (
          <div className="mt-5 ">
            <ImageObjectDetector img={img} />
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUploader;
