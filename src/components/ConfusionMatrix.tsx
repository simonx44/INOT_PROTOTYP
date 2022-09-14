import { FC, useEffect, useMemo, useRef, useState } from "react";
import { CustomerSegements } from "../helper/utilities";
import { connector, SettingsReduxProps } from "../state/settings";

type IProps = {
  results: Record<
    CustomerSegements,
    { athletic: number; elegant: number; casual: number }
  >;
};

const ConfusionMatrix: FC<IProps> = ({ results }) => {
  const calcMetrics = (performance: {
    tp: number;
    tn: number;
    fp: number;
    fn: number;
  }) => {
    const { tp, tn, fp, fn } = performance;

    const precision = Math.round((tp / (tp + fp)) * 100) / 100;
    const recall = Math.round((tp / (tp + fn)) * 100) / 100;
    const f1 = Math.round(((2 * tp) / (2 * tp + fp + fn)) * 100) / 100;
    return { precision, recall, f1 };
  };

  const metrics: Record<string, any> = useMemo(() => {
    const maticsToCalc = {
      athletic: {
        precision: 0,
        recall: 0,
        f1: 0,
        performance: { tp: 0, tn: 0, fp: 0, fn: 0 },
      },
      elegant: {
        precision: 0,
        recall: 0,
        f1: 0,
        performance: { tp: 0, tn: 0, fp: 0, fn: 0 },
      },
      casual: {
        precision: 0,
        recall: 0,
        f1: 0,
        performance: { tp: 0, tn: 0, fp: 0, fn: 0 },
      },
    };

    const classes = ["athletic", "elegant", "casual"];

    for (const k of Object.keys(results)) {
      const res = (results as Record<string, any>)[k];

      const performance = (maticsToCalc as any)[k].performance;
      Object.keys(res).forEach((el) => {
        //get  all tn
        for (const label of classes) {
          if (k !== label && el !== label) {
            (maticsToCalc as any)[label].performance.tn += res[el];
          }
        }
        if (k === el) {
          performance.tp = res[el];
        } else {
          (maticsToCalc as any)[el].performance.fn += res[el];

          performance.fp += res[el];
        }
      });
    }

    Object.keys(maticsToCalc).forEach((e) => {
      const metric = (maticsToCalc as any)[e];
      const performance = metric.performance;
      const { f1, precision, recall } = calcMetrics(performance);
      metric.precision = precision;
      metric.recall = recall;
      metric.f1 = f1;
    });

    return maticsToCalc;
  }, [results]);

  return (
    <div className="confusionMatrixContainer">
      <div className="matrix">
        <div className="predictedAxis">Predicted Class</div>
        <div className="trueAxis">True Class</div>
        <div className="flex">
          {Object.keys(results).map((el) => {
            return (
              <div className="horizontalDesc" key={`${el}-h`}>
                <div className="desc">{el}</div>
              </div>
            );
          })}
        </div>
        <div className="">
          <div className="verticalDesc">
            {Object.keys(results).map((el) => (
              <div className="vDesc" key={`${el}-v`}>
                {el}
              </div>
            ))}
          </div>
          {Object.keys(results).map((el) => {
            return (
              <div className="flex">
                {Object.keys(results[el as CustomerSegements]).map((it) => {
                  const truePos = it === el;
                  const validationRes = results[
                    el as CustomerSegements
                  ] as any as Record<string, string>;
                  return (
                    <div
                      key={`${it}`}
                      className={truePos ? "item truePos" : "item false"}
                    >
                      {validationRes[it]}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      <div className="mb-4">
        <div>
          <h4 className="text-center">Confusion Matrix result</h4>
          <div className="flex justify-content-center align-items-center">
            <table className="metrics">
              <tr>
                <th>Class</th>
                <th className="label">TP</th>
                <th className="label">TN</th>
                <th className="label">FP</th>
                <th className="label">FN</th>
              </tr>

              {Object.keys(metrics).map((m) => (
                <tr key={m}>
                  <td className="label">{m}</td>
                  <td>{metrics[m].performance.tp}</td>
                  <td>{metrics[m].performance.tn}</td>
                  <td>{metrics[m].performance.fp}</td>
                  <td>{metrics[m].performance.fn}</td>
                </tr>
              ))}
            </table>
          </div>
        </div>

        <div className="flex flex-column justify-content-center align-items-center">
          <h4 className="text-center">Confusion Matrix result</h4>
          <table className="metrics">
            <tr>
              <th>Class</th>
              <th className="label">Precision</th>
              <th className="label">Recall</th>
              <th className="label">F1-score</th>
            </tr>

            {Object.keys(metrics).map((m) => (
              <tr key={m}>
                <td className="label">{m}</td>
                <td>{metrics[m].precision}</td>
                <td>{metrics[m].recall}</td>
                <td>{metrics[m].f1}</td>
              </tr>
            ))}
          </table>
        </div>
      </div>
    </div>
  );
};

export default ConfusionMatrix;
