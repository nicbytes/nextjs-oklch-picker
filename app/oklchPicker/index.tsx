import { OklchContextProvider } from "./context/OklchContext";
import OklchPickerComponent from "./pickerComponent";

export interface OklchPickerProps {
  defaultColorCode?: string;
}

export default function OklchPicker({ defaultColorCode }: OklchPickerProps) {
  return (
    <OklchContextProvider defaultColorCode={defaultColorCode ?? "#000"}>
      <OklchPickerComponent />
    </OklchContextProvider>
  );
}