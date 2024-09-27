import { IMultilingual } from '@libs/shared-lib/types';
import { SUPPORTED_LANGUAGES_INFO } from '@libs/shared-lib/constants/trans';

export default {
  /**
   * Validate if a multilingual field contains at least one valid value
   * @param field
   * @param allFields If true, all fields must have a value. If false, at least one field must have a value
   */
  validateMultilingualFieldRequired(field: IMultilingual, allFields = true) {
    let isValid = true;

    if (!field || !field.translation || !Object.keys(field.translation).length) {
      return false;
    }

    if (allFields) {
      Object.keys(field.translation).forEach((key) => {
        if (!field.translation[key]) {
          isValid = false;
        }
      });
    } else if (Object.keys(field.translation).every((key) => !field.translation[key])) {
      isValid = false;
    }

    return isValid;
  },

  /**
   * Validate if any of the values in a multilingual field exceed the specified max length
   * @param field
   * @param maxLength
   */
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
  /**
   * Initialize multilingual attributes to empty string
   */
  initMultilingualAttributes(value?: IMultilingual): IMultilingual {
    if (value && value.translation) {
      return {
        translation: {
          ...value.translation,
        },
      };
    }

    const multiLanguageObject: Record<string, string> = {};

    SUPPORTED_LANGUAGES_INFO.forEach((lang) => {
      multiLanguageObject[lang.key] = '';
    });

    return { translation: multiLanguageObject };
  },

  /**
   * Copy over non empty translations to empty translations
   * @param field A multilingual field
   */
  getFilledMultilingualField(field: IMultilingual): IMultilingual {
    let firstNonEmptyValue = '';
    const translations = field.translation;
    const newTranslations: Record<string, string> = {};

    if (!field) {
      throw new Error('You need to specify a field');
    }

    // Get the first filled value from the field
    SUPPORTED_LANGUAGES_INFO.forEach((lang) => {
      if (!firstNonEmptyValue && translations[lang.key]) {
        firstNonEmptyValue = translations[lang.key];
      }
    });

    // Populate all the empty keys with the value we stored earlier
    SUPPORTED_LANGUAGES_INFO.forEach((lang) => {
      if (!translations[lang.key]) {
        newTranslations[lang.key] = firstNonEmptyValue;
      } else {
        newTranslations[lang.key] = translations[lang.key];
      }
    });

    return {
      translation: newTranslations,
    };
  },
};
