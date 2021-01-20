import { IMultilingual } from '@/types';

export default {
  // Validate if a multilingual field contains at least one valid value
  validateMultilingualFieldRequired(field: IMultilingual) {
    let isValid = true;

    if (!field || !field.value || !Object.keys(field.value).length) {
      return false;
    }

    Object.keys(field.value).forEach((key) => {
      if (!field.value[key]) {
        isValid = false;
      }
    });

    return isValid;
  },

  // Validate if any of the values in a multilingual field exceed the specified max length
  validateMultilingualFieldLength(field: IMultilingual, maxLength: number) {
    let isValid = true;

    if (!field || !field.value || !Object.keys(field.value).length) {
      return true;
    }

    Object.keys(field.value).forEach((key) => {
      if (field.value[key].length > maxLength) {
        isValid = false;
      }
    });

    return isValid;
  },
};
