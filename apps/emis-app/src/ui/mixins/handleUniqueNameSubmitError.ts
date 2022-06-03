/**
 * Mixin to handle submit error when checking if submitted name is unique
 */

import Vue from 'vue';
import { IServerError } from '@libs/core-lib/types';
import helpers from '../helpers/helpers';

export default Vue.extend({
  data() {
    return {
      isNameUnique: false,
    };
  },

  methods: {
    handleSubmitError(e: IServerError) {
      const errorData = e.response?.data?.errors;
      if (!errorData || !Array.isArray(errorData)) {
        this.$reportToasted(this.$t('error.submit_error'), e);
      } else {
        errorData.forEach((error) => {
          // Used to display a validation error inside the form when an entity name is not unique, instead of the toaster that is displayed for global errors
          // The call should not use the global error handler
          if (error.code === 'errors.an-entity-with-this-name-already-exists') {
            this.isNameUnique = false;
            setTimeout(() => {
              helpers.scrollToFirstError('scrollAnchor');
            }, 300);
          } else if (this.$te(error.code)) {
            this.$toasted.global.error(this.$t(error.code));
          } else {
            this.$reportToasted(this.$t('error.submit_error'), e);
          }
        });
      }
    },

    resetAsUnique() {
      if (!this.isNameUnique) {
        this.isNameUnique = true;
      }
    },
  },
});
