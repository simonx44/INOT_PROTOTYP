import React, { useRef, useState, useEffect, useMemo, FC } from "react";
import Webcam from "react-webcam";
import * as tf from "@tensorflow/tfjs";
import { drawRect } from "../helper/utilities";

interface IProps {}

const WebcamView: FC<IProps> = (props) => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const DETECTION_INTERVAL = 200;
  const MODEL_PATH = "/model/model.json";

  // Main function
  const initalizeModel = async () => {
    const net = await tf.loadGraphModel(MODEL_PATH);

    // Loop and detect hands
    setInterval(() => {
      detect(net);
    }, DETECTION_INTERVAL);
  };

  const detect = async (net: any) => {
    // Check data is available
    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      // @ts-ignore
      webcamRef.current.video.readyState === 4
    ) {
      // Get Video Properties
      // @ts-ignore
      const video = webcamRef.current.video;
      // @ts-ignore
      const videoWidth = webcamRef.current.video.videoWidth;
      // @ts-ignore
      const videoHeight = webcamRef.current.video.videoHeight;

      // Set video width
      // @ts-ignore
      webcamRef.current.video.width = videoWidth;
      // @ts-ignore
      webcamRef.current.video.height = videoHeight;

      // Set canvas height and width
      // @ts-ignore
      canvasRef.current.width = videoWidth;
      // @ts-ignore
      canvasRef.current.height = videoHeight;

      // @ts-ignore
      const ctx = canvasRef.current.getContext("2d");

      // 4. TODO - Make Detections
      const img = tf.browser.fromPixels(video);
      const resized = tf.image.resizeBilinear(img, [640, 480]);
      const casted = resized.cast("int32");
      const expanded = casted.expandDims(0);
      const obj: any = await net.executeAsync(expanded);

      const boxes = await obj[6].array();
      const classes = await obj[4].array();
      const scores = await obj[5].array();

      requestAnimationFrame(() => {
        drawRect(
          boxes[0],
          classes[0],
          scores[0],
          0.5,
          videoWidth,
          videoHeight,
          ctx
        );
      });

      tf.dispose(img);
      tf.dispose(resized);
      tf.dispose(casted);
      tf.dispose(expanded);
      tf.dispose(obj);
    }
  };

  useEffect(() => {
    initalizeModel();
  }, []);

  return (
    <div className="">
      <Webcam
        ref={webcamRef}
        muted={true}
        style={{
          position: "absolute",
          marginLeft: "auto",
          marginRight: "auto",
          left: 0,
          right: 0,
          textAlign: "center",
          zIndex: 9,
          width: 1280,
          height: 960,
        }}
      />

      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          marginLeft: "auto",
          marginRight: "auto",
          left: 0,
          right: 0,
          textAlign: "center",
          zIndex: 10,
          width: 1280,
          height: 960,
        }}
      />
    </div>
  );
};

export default WebcamView;
