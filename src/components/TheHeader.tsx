import { Dialog } from "primereact/dialog";
import { InputNumber } from "primereact/inputnumber";
import React, { useState } from "react";
import { ApplicationMode } from "../App";
import Settings from "./Settings";

interface IProps {
  mode: ApplicationMode;
  updateMode: (mode: ApplicationMode) => void;
}

const TheHeaderBar: React.FC<IProps> = ({ mode, updateMode }) => {
  const [showSettings, updateSettings] = useState(false);

  const routes = [
    {
      name: "Image Collection",
      mode: ApplicationMode.Collection,
      icon: "pi-images",
    },
    {
      name: "Webcam Mode",
      mode: ApplicationMode.Webcam,
      icon: "pi-camera",
    },
    {
      name: "Upload your own image",
      mode: ApplicationMode.Upload,
      icon: "pi-upload",
    },
  ];

  return (
    <header className="topbar">
      <div className="topbar__brand">
        <div className="topbar__brand__name">
          INNOT - PASSENGER TYPE DETECTOR
        </div>
        <div className="topbar__brand__icon">
          <i className="pi pi-camera" />
        </div>
        <div className="navItems">
          {routes.map((route) => (
            <li
              className={route.mode === mode ? "active" : ""}
              onClick={() => updateMode(route.mode)}
              key={route.mode}
            >
              <span>{route.name}</span>
              <i className={`pi ${route.icon}`}></i>
            </li>
          ))}
        </div>
      </div>
      <div>
        <i
          className="pi pi-cog"
          style={{ fontSize: "24px" }}
          onClick={() => updateSettings(true)}
        ></i>
      </div>

      <Dialog
        visible={showSettings}
        header={"Settings"}
        onHide={() => updateSettings(false)}
        breakpoints={{ "960px": "75vw", "640px": "100vw" }}
        style={{ width: "50vw" }}
      >
        <Settings />
      </Dialog>
    </header>
  );
};

export default TheHeaderBar;
