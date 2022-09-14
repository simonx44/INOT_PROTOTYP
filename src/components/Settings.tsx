import { InputNumber } from "primereact/inputnumber";
import { useState } from "react";
import { connector, SettingsReduxProps } from "../state/settings";

const Settings: React.FC<SettingsReduxProps> = ({
  confidence,
  updateConfidence,
}) => {
  return (
    <div className="field mt-3 w-full">
      <label htmlFor="horizontal">Confidence</label>
      <InputNumber
        className="w-full"
        inputId="horizontal"
        value={confidence}
        onValueChange={(e) => updateConfidence(e.value ?? 1)}
        showButtons
        buttonLayout="horizontal"
        step={1}
        min={1}
        max={99}
        incrementButtonIcon="pi pi-plus"
        decrementButtonIcon="pi pi-minus"
      />
    </div>
  );
};

export default connector(Settings);
