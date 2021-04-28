import helpers from '@crctech/registration-lib/src/ui/helpers';

import { i18n } from './plugins/i18n';

export default {
  enumToTranslatedCollection(myEnum: Record<string, unknown>, translationPath: string) {
    return helpers.enumToTranslatedCollection(myEnum, translationPath, i18n);
  },

  scrollToFirstErrorDialog(containerId: string) {
    return helpers.scrollToFirstErrorDialog(containerId);
  },
};
