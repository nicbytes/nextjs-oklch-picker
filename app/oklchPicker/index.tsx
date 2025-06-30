import { OklchContextProvider } from "./context/OklchContext";
import OklchPickerComponent from "./pickerComponent";

export default function OklchPicker() {
  return (
    <OklchContextProvider defaultColorCode="#000">
      <OklchPickerComponent />
    </OklchContextProvider>
  );
}