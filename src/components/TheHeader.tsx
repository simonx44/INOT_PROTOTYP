import React from "react";
import { ApplicationMode } from "../App";

interface IProps {
  mode: ApplicationMode;
  updateMode: (mode: ApplicationMode) => void;
}

const TheHeaderBar: React.FC<IProps> = ({ mode, updateMode }) => {
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
    </header>
  );
};

export default TheHeaderBar;
