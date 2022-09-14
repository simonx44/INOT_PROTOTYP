import React, { useEffect, useMemo, useState } from "react";
import "./App.scss";
import ImageUploader from "./components/ImageUploader";
import Gallery from "./components/Gallery";
import TheHeaderBar from "./components/TheHeader";
import Webcam from "./components/Webcam";
import { connector } from "./state/settings";

export enum ApplicationMode {
  Collection,
  Webcam,
  Upload,
}

function App(props: any) {
  const [mode, updateMode] = useState<ApplicationMode>(
    ApplicationMode.Collection
  );

  useEffect(() => {
    const confidence = localStorage.getItem("confidence");
    if (confidence) {
      props.updateConfidence(confidence);
    }
  }, []);

  const Component: JSX.Element = useMemo(() => {
    switch (mode) {
      case ApplicationMode.Collection:
        return <Gallery />;
      case ApplicationMode.Upload:
        return <ImageUploader />;
      default:
        return <Webcam />;
    }
  }, [mode]);

  return (
    <div className="App">
      <TheHeaderBar mode={mode} updateMode={updateMode} />
      <main className="App-main">{Component}</main>
    </div>
  );
}

export default connector(App);
