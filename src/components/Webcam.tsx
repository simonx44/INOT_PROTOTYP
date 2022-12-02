import React, { useRef, useState, useEffect, useMemo, FC } from "react";
import { SelectButton } from "primereact/selectbutton";
import { Card } from "primereact/card";
import Webcam from "react-webcam";
import * as tf from "@tensorflow/tfjs";
import {
  clearBoxes,
  CustomerSegements,
  detectObjects,
  determinePassangerType,
  mapCustomerSegements,
} from "../helper/utilities";
import { InputNumber } from "primereact/inputnumber";
import { InputSwitch } from "primereact/inputswitch";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import ImageObjectDetector from "./ImageObjectDetector";
import { Slider } from "primereact/slider";
import { ProgressSpinner } from "primereact/progressspinner";
import { connector, SettingsReduxProps } from "../state/settings";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

interface IProps {}

const WebcamView: FC<IProps & SettingsReduxProps> = ({ confidence }) => {
  const [mode, updateMode] = useState(1);
  const [isWebcamAvailable, updateWebcamState] = useState(true);
  const [isReloading, updateReloading] = useState(false);
  const [result, updateResult] = useState<any>();
  const [liveMode, updateLiveMode] = useState<{
    detectionsPerSecond: number;
    isActive: boolean;
    interval: any;
  }>({
    detectionsPerSecond: 2,
    isActive: false,
    interval: undefined,
  });
  const [useDelay, updateDelay] = useState({ isDelay: false, delay: 5 });
  const [screenshot, updateScreenshot] = useState({
    src: "",
    isAnalysisActive: false,
  });
  const toastRef = useRef(null);
  const webcamRef = useRef(null);
  const counterRef = useRef(null);
  const MODEL_PATH = "/model/model.json";

  const webcamOptions = [
    { icon: "pi pi-camera", value: 0, name: "Live mode" },
    { icon: "pi pi-image", value: 1, name: "Screenshot" },
  ];

  const detect = async (net: any) => {
    if (
      typeof webcamRef.current == "undefined" ||
      webcamRef.current == null ||
      // @ts-ignore
      webcamRef.current.video.readyState !== 4
    ) {
      return;
    }

    // @ts-ignore
    const video: HTMLVideoElement = webcamRef.current.video;
    // @ts-ignore
    const videoWidth = video.videoWidth;
    // @ts-ignore
    const videoHeight = video.videoHeight;

    const resizeFactor = videoWidth / 640;
    const resizeHeight = Math.round(videoHeight / resizeFactor);

    const img = tf.browser.fromPixels(video);
    const resized = tf.image.resizeBilinear(img, [640, resizeHeight]);
    const casted = resized.cast("int32");
    const expanded = casted.expandDims(0);
    const obj: any = await net.executeAsync(expanded);

    const boxes = await obj[4].array();
    const classes = await obj[2].array();
    const scores = await obj[7].array();

    requestAnimationFrame(() => {
      const objects = detectObjects(
        boxes[0],
        classes[0],
        scores[0],
        confidence / 100,
        video.offsetWidth,
        video.offsetHeight
      );
      const result = determinePassangerType(objects);
      console.log(result);
      updateResult(result);
    });

    tf.dispose(img);
    tf.dispose(resized);
    tf.dispose(casted);
    tf.dispose(expanded);
    tf.dispose(obj);
  };

  const startLiveDetection = async () => {
    const net = await tf.loadGraphModel(MODEL_PATH);

    const dps = 1000 / liveMode.detectionsPerSecond;

    console.log("DPS: ", dps);

    const interval = setInterval(() => {
      detect(net);
    }, dps);

    (toastRef.current as any).show([
      {
        severity: "info",
        summary: "Info",
        detail: "Live mode started",
        life: 3000,
      },
    ]);

    updateLiveMode({ ...liveMode, isActive: true, interval: interval });
  };

  const selectTemplate = (option: any) => {
    return (
      <div>
        <i className={option.icon}></i> <span>{option.name}</span>
      </div>
    );
  };

  const performSnapshot = () => {
    const webcamElement: any = webcamRef.current;

    if (webcamElement) {
      const imageSrc = webcamElement.getScreenshot();
      updateScreenshot({ src: imageSrc, isAnalysisActive: false });
    }
  };

  const initSnapshot = () => {
    if (!counterRef.current) {
      return;
    }

    if (useDelay.isDelay) {
      updateScreenshot({ src: "", isAnalysisActive: false });
      let localCounter = useDelay.delay;
      const counterElement: HTMLElement = counterRef.current;
      counterElement.textContent = localCounter.toString();
      counterElement.classList.remove("hidden");

      const counterInterval = setInterval(() => {
        localCounter--;
        counterElement.textContent = localCounter.toString();
        counterElement.classList.remove("hidden");

        if (localCounter === 0) {
          clearInterval(counterInterval);
          counterElement.classList.add("hidden");
          performSnapshot();
        }
      }, 1000);
    } else {
      performSnapshot();
    }
  };

  const performAction = () => {
    const isWebCamAvailable =
      webcamRef.current && (webcamRef.current as any).state.hasUserMedia
        ? true
        : false;

    if (!isWebCamAvailable) {
      (toastRef.current as any).show([
        {
          severity: "warn",
          summary: "Error",
          detail: "Webcam not available",
          life: 3000,
        },
      ]);
    }

    if (mode === 0) {
      liveMode.isActive ? stopLiveAnalysis() : startLiveDetection();
    } else {
      if (screenshot.isAnalysisActive) {
        updateScreenshot({ ...screenshot, isAnalysisActive: false });
        return;
      } else {
        initSnapshot();
      }
    }
  };

  const stopLiveAnalysis = () => {
    clearInterval(liveMode.interval);

    (toastRef.current as any).show([
      {
        severity: "info",
        summary: "Info",
        detail: "Live mode stopped",
        life: 3000,
      },
    ]);

    updateLiveMode({ ...liveMode, isActive: false, interval: undefined });
    clearBoxes();
  };

  const analyseImage = () => {
    if (!screenshot.src) {
      (toastRef.current as any).show([
        {
          severity: "warn",
          summary: "Error",
          detail: "No image found",
          life: 3000,
        },
      ]);
    }

    updateScreenshot({ ...screenshot, isAnalysisActive: true });
  };

  const buttonText = useMemo(() => {
    if (mode === 0) {
      return liveMode.isActive ? "Stop live detection" : "Start live detection";
    }

    if (mode === 1) {
      return screenshot.isAnalysisActive
        ? "Take another screenshot"
        : "Screenshot";
    }
  }, [mode, screenshot, liveMode]);

  const onWebcamAvailable = (e: any) => {
    updateWebcamState(true);
  };

  const onWebcamError = () => {
    console.log("error");
    updateWebcamState(false);
  };

  const reloadWebcam = () => {
    updateReloading(true);
    setInterval(() => updateReloading(false), 4000);
  };

  const settingsDisabled = useMemo(() => {
    if (!isWebcamAvailable) {
      return true;
    }
    return liveMode.isActive || screenshot.isAnalysisActive ? true : false;
  }, [liveMode, screenshot, isWebcamAvailable]);

  return (
    <div className="flex">
      <Toast ref={toastRef} position="bottom-right" />

      {!screenshot.isAnalysisActive ? (
        <div className="webcamViewContainer">
          {!isWebcamAvailable && !isReloading && (
            <div className="flex flex-1 flex-column justify-content-center align-items-center">
              <h3>Webcam not found</h3>
              <Button
                className="p-button-outlined"
                label="Try to connect"
                icon="pi pi-eye"
                onClick={reloadWebcam}
              />
            </div>
          )}

          {!isReloading ? (
            <div className="imageContainer" id="imageContainer">
              <Webcam
                ref={webcamRef}
                muted={true}
                className={isWebcamAvailable ? "webcam" : "hidden"}
                onUserMedia={onWebcamAvailable}
                onUserMediaError={onWebcamError}
              />
            </div>
          ) : (
            <div className="flex flex-1 flex-column justify-content-center align-items-center">
              <h3>Trying to connect</h3>
              <ProgressSpinner />
            </div>
          )}
        </div>
      ) : (
        <div className="webcamViewContainer">
          <ImageObjectDetector img={screenshot.src} />
        </div>
      )}

      <div style={{ width: "400px" }}>
        <Card
          title="Webcam settings"
          subTitle={
            !isWebcamAvailable ? "Wait for webcam signal" : "Live or screenshot"
          }
          className="screenhotBox"
          footer={() => (
            <div>
              <Button
                disabled={!isWebcamAvailable}
                className="p-button-outlined w-full"
                label={buttonText}
                icon="pi pi-eye"
                onClick={performAction}
              />
            </div>
          )}
        >
          <div className="flex flex-column flex-1">
            <h3>Settings</h3>
            <h5>Mode</h5>
            <SelectButton
              disabled={settingsDisabled}
              value={mode}
              optionLabel="name"
              options={webcamOptions}
              itemTemplate={selectTemplate}
              onChange={(e) => updateMode(e.value)}
            />
            {mode === 1 ? (
              <div className="flex flex-column flex-1">
                <div className="mt-3">
                  <h4>Enable delay</h4>
                  <InputSwitch
                    disabled={settingsDisabled}
                    checked={useDelay.isDelay}
                    onChange={() => {
                      updateDelay({ isDelay: !useDelay.isDelay, delay: 5 });
                    }}
                  />
                  {useDelay.isDelay && (
                    <div className="field mt-3 w-full">
                      <label htmlFor="horizontal">Delay in seconds</label>
                      <InputNumber
                        className="w-full"
                        inputId="horizontal"
                        value={useDelay.delay}
                        onValueChange={(e) =>
                          updateDelay({
                            ...useDelay,
                            delay: e.value ?? 1,
                          })
                        }
                        showButtons
                        buttonLayout="horizontal"
                        step={1}
                        min={1}
                        max={30}
                        incrementButtonIcon="pi pi-plus"
                        decrementButtonIcon="pi pi-minus"
                      />
                    </div>
                  )}
                </div>
                <div className="counter hidden" ref={counterRef}>
                  0
                </div>
                {screenshot.src && (
                  <div className="screenshotPreview">
                    <h3>Your screenshot:</h3>
                    <div className="flex flex-row justify-content-center align-items-center mt-3">
                      <img src={screenshot.src} alt="" />
                    </div>
                    <div className="flex flex-row my-2">
                      <Button
                        disabled={settingsDisabled}
                        className="p-button-outlined mx-1"
                        label={"Apply image"}
                        icon="pi pi-image"
                        onClick={analyseImage}
                      />
                      <Button
                        className="p-button-outlined"
                        label={"Delete"}
                        icon="pi pi-times"
                        onClick={() =>
                          updateScreenshot({ src: "", isAnalysisActive: false })
                        }
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <div className="field mt-3 w-full">
                  <h4>Detection per Seconds: {liveMode.detectionsPerSecond}</h4>

                  <Slider
                    disabled={settingsDisabled}
                    value={liveMode.detectionsPerSecond}
                    min={1}
                    max={30}
                    onChange={(e) =>
                      updateLiveMode({
                        ...liveMode,
                        //@ts-ignore
                        detectionsPerSecond: e.value,
                      })
                    }
                  />

                  <Button
                    disabled={settingsDisabled}
                    className="p-button-outlined mt-4"
                    onClick={clearBoxes}
                    label="Clear boxes"
                  />
                  {liveMode.isActive && (
                    <div className="adsContainerWeb">
                      <div className="text-lg">
                        <span>
                          {" "}
                          Passenger Type:{" "}
                          <b className="text-xl type">
                            {mapCustomerSegements(
                              result ? result.type.name : "-"
                            )}
                          </b>
                        </span>

                        <div className="objects">
                          <h4>Detected Objects</h4>

                          <DataTable
                            value={result ? result.objects : []}
                            responsiveLayout="scroll"
                            className="objectsTable"
                          >
                            <Column
                              field="object"
                              header="Object name"
                            ></Column>
                            <Column
                              field="confidence"
                              header="Confidence"
                            ></Column>
                          </DataTable>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default connector(WebcamView);
