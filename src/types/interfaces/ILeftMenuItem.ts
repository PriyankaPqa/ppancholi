export interface ILeftMenuItem {
  id: string;
  labelKey: string;
  titleKey: string;
  icon: string;
  disabled: boolean;
  isValid: boolean;
  isTouched: boolean;
  backButtonTextKey: string;
  nextButtonTextKey: string;
  componentName: string;
}
