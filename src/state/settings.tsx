import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { connect, ConnectedProps } from "react-redux";
import { RootState } from "./store";

export interface SettingsState {
  confidence: number;
}

const initialState: SettingsState = {
  confidence: 70,
};

export const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    updateConfidence: (state, action) => {
      // eslint-disable-next-line no-param-reassign
      state.confidence = action.payload;
    },
  },
});

const mapState = (state: RootState) => ({
  confidence: state.settings.confidence,
});

const mapDispatch = {
  updateConfidence: settingsSlice.actions.updateConfidence,
};

export const connector = connect(mapState, mapDispatch);

export type SettingsReduxProps = ConnectedProps<typeof connector>;

export const { updateConfidence } = settingsSlice.actions;

export default settingsSlice.reducer;
