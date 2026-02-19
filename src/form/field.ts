export interface FormField {
  name: string;
  label: string;
  required: boolean;
  type: astroHTML.JSX.HTMLInputTypeAttribute;
  value: string | null;
}
