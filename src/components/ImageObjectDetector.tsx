import React, { useRef, useState, useEffect, useMemo, FC } from "react";
import * as tf from "@tensorflow/tfjs";
import { ProgressSpinner } from "primereact/progressspinner";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import {
  clearBoxes,
  CustomerSegements,
  detectObjects,
  determinePassangerType,
  getAdvertismentByPassengerType,
  mapCustomerSegements,
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
    if (!isLoading) detect(net);

    //drawBox();
  };

  const detect = async (net: any) => {
    // Check data is available

    if (
      typeof imageRef.current == "undefined" ||
      imageRef.current == null ||
      // @ts-ignore
      canvasRef == null ||
      isLoading
    ) {
      return;
    }
    clearBoxes();
    // @ts-ignore
    const image: HTMLImageElement = imageRef.current;

    const imgWidth = image.width;
    const imgHeight = image.height;

    // 4. TODO - Make Detections
    const img = tf.browser.fromPixels(image);

    const resizeFactor = imgWidth / 640;
    const resizeHeight = Math.round(imgHeight / resizeFactor);

    const resized = tf.image.resizeBilinear(img, [640, resizeHeight]);
    const casted = resized.cast("int32");
    const expanded = casted.expandDims(0); 

    const obj: any = await net.executeAsync(expanded);

    //0-1
    const boxes = await obj[4].array();
    
    const classes = await obj[2].array();
    const scores = await obj[7].array();

    const arr = await obj[7].array();

    // classes: 2
    // boxes: 4
    // source 7


   

    console.log("detection finshed");

    requestAnimationFrame(() => {
      const objects = detectObjects(
        boxes[0],
        classes[0],
        scores[0],
        confidence / 100,
        imgWidth,
        imgHeight
      );

      const result = determinePassangerType(objects);
      console.log(result);
      updateResult(result);
      console.log("end");
    });

    tf.dispose(img);
    tf.dispose(resized);
    tf.dispose(casted);
    tf.dispose(expanded);
    tf.dispose(obj);
    updateLoading(false);
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
      <div className="imageContainer" id="imageContainer">
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
      </div>
      {result && (
        <div className="adsContainer">
          <div className="adsContainer--detectionResult">
            <h2> Passenger Type:</h2>
            <b className="text-xl">{mapCustomerSegements(result.type.name)}</b>
            <div className="objects">
              <h4>Detected Objects</h4>

              <DataTable
                value={result.objects}
                responsiveLayout="scroll"
                className="objectsTable"
              >
                <Column field="object" header="Object name"></Column>
                <Column field="confidence" header="Confidence"></Column>
              </DataTable>
            </div>
          </div>
          <div className="adsImageContainer">
            <h2>Advertisment</h2>
            <img className={"adsImage"} alt={""} src={advertismentImage} />
          </div>
        </div>
      )}
    </div>
  );
};

export default connector(ImageObjectDetector);
