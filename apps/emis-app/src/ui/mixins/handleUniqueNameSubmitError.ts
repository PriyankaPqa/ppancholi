/**
 * Mixin to handle submit error when checking if submitted name is unique
 */

import Vue from 'vue';
import { IError } from '@/services/httpClient';

export default Vue.extend({
  data() {
    return {
      isNameUnique: false,
    };
  },

  methods: {
    handleSubmitError(errors: IError[]) {
      if (!Array.isArray(errors)) {
        this.$toasted.global.error(this.$t('error.unexpected_error'));
      } else {
        errors.forEach((error) => {
          // Used to display a validation error inside the form when an entity name is not unique, instead of the toaster that is displayed for global errors
          // The call should not use the global error handler
          if (error.code === 'errors.an-entity-with-this-name-already-exists') {
            this.isNameUnique = false;
          } else {
            this.$toasted.global.error(this.$t(error.code));
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
