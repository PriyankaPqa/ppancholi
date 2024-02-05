import '@mdi/font/css/materialdesignicons.css';
import 'roboto-fontface/css/roboto/roboto-fontface.css';

import Vue from 'vue';
import Vuetify from 'vuetify/lib';
import IdentityFailed from './customIcons/IdentityFailed.vue';
import { DEFAULT_LANGUAGE } from '../../constants/trans';
import fr from './locales/fr';
import DuplicateIcon from './customIcons/DuplicateIcon.vue';
import ResolvedIcon from './customIcons/ResolvedIcon.vue';
import ActionsIcon from './customIcons/ActionsIcon.vue';
import SearchPersonIcon from './customIcons/SearchPersonIcon.vue';
import light from './light-theme';
import dark from './dark-theme';
import IdentityNotVerified from './customIcons/IdentityNotVerified.vue';
import ValidationImpactNo from './customIcons/ValidationImpactNo.vue';
import ValidationImpactUndetermined from './customIcons/ValidationImpactUndetermined.vue';

Vue.use(Vuetify);

export const options = {
  theme: {
    options: {
      customProperties: true, // generate a css variable for each theme color, which you can then use in your components' <style> blocks.
    },
    themes: {
      light,
      dark,
    },
  },
  icons: {
    iconfont: 'mdi',
    values: {
      'rctech-duplicate': {
        component: DuplicateIcon,
      },
      'rctech-resolved': {
        component: ResolvedIcon,
      },
      'rctech-actions': {
        component: ActionsIcon,
      },
      'rctech-search-person': {
        component: SearchPersonIcon,
      },
      'rctech-identity-failed': {
        component: IdentityFailed,
      },
      'rctech-identity-not-verified': {
        component: IdentityNotVerified,
      },
      'rctech-validation-impact-no': {
        component: ValidationImpactNo,
      },
      'rctech-validation-impact-undetermined': {
        component: ValidationImpactUndetermined,
      },
    },
  },
  lang: {
    locales: { fr },
    current: DEFAULT_LANGUAGE,
  },
};

export default new Vuetify(options);
