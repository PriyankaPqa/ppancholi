import { enumToTranslatedCollection as enumTrans } from '@crctech/registration-lib/src/ui/utils';

import { i18n } from './plugins/i18n';

export const enumToTranslatedCollection = (myEnum: Record<string, unknown>, translationPath: string) => enumTrans(myEnum, translationPath, i18n);
