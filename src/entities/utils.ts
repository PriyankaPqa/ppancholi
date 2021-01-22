import { IMultilingual } from '@/types';

export default {
  // Validate if a multilingual field contains at least one valid value
  validateMultilingualFieldRequired(field: IMultilingual) {
    let isValid = true;

    if (!field || !field.translation || !Object.keys(field.translation).length) {
      return false;
    }

    Object.keys(field.translation).forEach((key) => {
      if (!field.translation[key]) {
        isValid = false;
      }
    });

    return isValid;
  },

  // Validate if any of the values in a multilingual field exceed the specified max length
  validateMultilingualFieldLength(field: IMultilingual, maxLength: number) {
    let isValid = true;

    if (!field || !field.translation || !Object.keys(field.translation).length) {
      return true;
    }

    Object.keys(field.translation).forEach((key) => {
      if (field.translation[key].length > maxLength) {
        isValid = false;
      }
    });

    return isValid;
  },
};
