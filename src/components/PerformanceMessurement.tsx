import { FC, useEffect, useMemo, useRef, useState } from "react";
import * as tf from "@tensorflow/tfjs";
import { ProgressSpinner } from "primereact/progressspinner";

import {
  CustomerSegements,
  detectObjects,
  determinePassangerType,
  getPreclassifiedData,
  importImages,
} from "../helper/utilities";
import { connector, SettingsReduxProps } from "../state/settings";
import ConfusionMatrix from "./ConfusionMatrix";
import { Button } from "primereact/button";

interface IProps {}

const PerformanceMessurement: FC<IProps & SettingsReduxProps> = ({
  confidence,
}) => {
  const [isProcessing, updateProcessingMode] = useState(false);
  const currentItem = useRef(null);
  const [result, updateResult] = useState({
    athletic: { athletic: 0, elegant: 0, casual: 0 },
    elegant: { athletic: 0, elegant: 0, casual: 0 },
    casual: { athletic: 0, elegant: 0, casual: 0 },
  });
  const imageRef = useRef(null);

  useEffect(() => {
    loadExistingValidationData();
  }, []);

  const loadExistingValidationData = () => {
    const rawValidationData = localStorage.getItem("validation");

    if (rawValidationData) {
      updateResult(JSON.parse(rawValidationData));
    }
  };

  const images = useMemo(() => {
    return importImages() as Record<string, any>;
  }, []);

  const initalizeProcess = async () => {
    if (typeof imageRef.current == "undefined" || imageRef.current == null) {
      return;
    }
    const preclassifiedData = getPreclassifiedData();
    console.log(preclassifiedData);
    updateProcessingMode(true);
    const MODEL_PATH = "/model/model.json";
    const net = await tf.loadGraphModel(MODEL_PATH);

    //@ts-ignore
    const image: HTMLImageElement = imageRef.current;
    //@ts-ignore
    const currentCounter: HTMLElement = currentItem.current;
    const detectionResults: Array<[CustomerSegements, CustomerSegements]> = [];
    let counter = 1;

    for (const img of Object.keys(images)) {
      image.src = images[img];

      currentCounter.innerText = counter + "";
      counter++;
      const customerSegement = await determineCustomerSegement(net);
      const expected = preclassifiedData[img];

      console.log([customerSegement as CustomerSegements, expected]);
      detectionResults.push([customerSegement as CustomerSegements, expected]);
    }

    validateResult(detectionResults);
    updateProcessingMode(false);
  };

  const validateResult = (
    results: Array<[CustomerSegements, CustomerSegements]>
  ) => {
    const resultToUpdate: Record<string, any> = {
      athletic: { athletic: 0, elegant: 0, casual: 0 },
      elegant: { athletic: 0, elegant: 0, casual: 0 },
      casual: { athletic: 0, elegant: 0, casual: 0 },
    };

    for (let el of results) {
      const [predictedType, expectedType] = el;
      const type =
        predictedType === CustomerSegements.athleticType
          ? "athletic"
          : predictedType === CustomerSegements.casualType
          ? "casual"
          : "elegant";

      switch (expectedType) {
        case CustomerSegements.athleticType:
          resultToUpdate[type].athletic++;
          break;

        case CustomerSegements.casualType:
          resultToUpdate[type].casual++;
          break;

        case CustomerSegements.elegantType:
          resultToUpdate[type].elegant++;
          break;
        default:
          break;
      }
    }

    localStorage.setItem("validation", JSON.stringify(resultToUpdate));

    updateResult(resultToUpdate as any);
  };

  const determineCustomerSegement = async (net: any) => {
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

    const boxes = await obj[6].array();
    const classes = await obj[4].array();
    const scores = await obj[5].array();

    const objects = detectObjects(
      boxes[0],
      classes[0],
      scores[0],
      confidence / 100,
      imgWidth,
      imgHeight,
      false
    );

    const result = determinePassangerType(objects);
    tf.dispose(img);
    tf.dispose(resized);
    tf.dispose(casted);
    tf.dispose(expanded);
    tf.dispose(obj);
    return result.type.name;
  };

  return (
    <div className="messurementContainer">
      <img ref={imageRef} alt={""} src={""} className={"hidden"} />
      {isProcessing ? (
        <div className="loadingSpinner">
          <ProgressSpinner />
          <div>
            <span>Measure Performance: </span>
            <b>
              (<span ref={currentItem}>1</span>/{Object.keys(images).length})
            </b>
          </div>
        </div>
      ) : (
        <>
          <ConfusionMatrix results={result as any} />
          <Button label="Rerun" icon="pi pi-play" onClick={initalizeProcess} />
        </>
      )}
    </div>
  );
};

export default connector(PerformanceMessurement);
