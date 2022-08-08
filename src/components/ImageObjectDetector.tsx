import React, { useRef, useState, useEffect, useMemo, FC } from "react";
import * as tf from "@tensorflow/tfjs";
import { ProgressSpinner } from "primereact/progressspinner";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import {
  detectObjects,
  determinePassangerType,
  getAdvertismentByPassengerType,
} from "../helper/utilities";
import { connector, SettingsReduxProps } from "../state/settings";

interface IProps {
  img: any;
}

const ImageObjectDetector: FC<IProps & SettingsReduxProps> = ({
  img,
  confidence,
}) => {
  const [isLoading, updateLoading] = useState(false);
  const [advertismentImage, updateAdvertismentImage] = useState<any>();

  const [result, updateResult] = useState<any>();
  const imageRef = useRef(null);
  const canvasRef = useRef(null);
  const MODEL_PATH = "/model/model.json";

  // Main function
  const initalizeModel = async () => {
    updateLoading(true);
    const net = await tf.loadGraphModel(MODEL_PATH);

    detect(net);
  };

  const detect = async (net: any) => {
    // Check data is available
    if (
      typeof imageRef.current !== "undefined" &&
      imageRef.current !== null &&
      // @ts-ignore
      canvasRef != null
    ) {
      // @ts-ignore
      const image: HTMLImageElement = imageRef.current;

      const imgWidth = image.width;
      const imgHeight = image.height;

      // @ts-ignore
      canvasRef.current.width = imgWidth;
      // @ts-ignore
      canvasRef.current.height = imgHeight;

      // @ts-ignore
      const ctx = canvasRef.current.getContext("2d");

      // 4. TODO - Make Detections
      const img = tf.browser.fromPixels(image);

      const resized = tf.image.resizeBilinear(img, [640, 480]);
      const casted = resized.cast("int32");
      const expanded = casted.expandDims(0);
      const obj: any = await net.executeAsync(expanded);

      //0 boxes

      const boxes = await obj[6].array();
      const classes = await obj[4].array();
      const scores = await obj[5].array();

      // console.log(await obj[6].array());

      requestAnimationFrame(() => {
        const objects = detectObjects(
          boxes[0],
          classes[0],
          scores[0],
          confidence / 100,
          imgWidth,
          imgHeight,
          ctx
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
      updateLoading(false);
    }
  };

  useEffect(() => {
    initalizeModel();
  }, [img]);

  useEffect(() => {
    if (result) {
      const img = getAdvertismentByPassengerType(result.type.name);
      updateAdvertismentImage(img);
    }
  }, [result]);

  return (
    <div className="imageDetectionContainer">
      <div className="imageContainer">
        {isLoading && (
          <div className="imageContainer--spinner">
            <ProgressSpinner />
            Loading
          </div>
        )}

        <img
          ref={imageRef}
          className={isLoading ? "img imgLoading" : "img"}
          alt={""}
          src={img}
        />

        <canvas ref={canvasRef} className={"canvas"} />
      </div>
      {result && (
        <div className="adsContainer">
          <div className="adsContainer--detectionResult">
            <h2> Passenger Type:</h2>
            <span>{result.type.name.toUpperCase()}</span>
            <div className="objects">
              <h4>Detected Objects</h4>

              <DataTable value={result.objects} responsiveLayout="scroll">
                <Column field="object" header="Object name"></Column>
                <Column field="confidence" header="Confidence"></Column>
              </DataTable>
            </div>

            <div>
              <h4>Advertisement</h4>
              <img className={"adsImage"} alt={""} src={advertismentImage} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default connector(ImageObjectDetector);
