import Vue from 'vue';
import helpers from '@/ui/helpers';
import { ECanadaProvinces } from '@/types';
import { localStorageKeys } from '@/constants/localStorage';
import { IShelterLocation } from '@crctech/registration-lib/src/entities/value-objects/temporary-address';
import { EOptionItemStatus } from '@crctech/registration-lib/src/types';

/**
 * Mixin used for householdmember form in review registration
 */

export default Vue.extend({
  data() {
    return {
      apiKey: localStorage.getItem(localStorageKeys.googleMapsAPIKey.name)
        ? localStorage.getItem(localStorageKeys.googleMapsAPIKey.name)
        : process.env.VUE_APP_GOOGLE_API_KEY,
    };
  },
  computed: {
    canadianProvincesItems(): Record<string, unknown>[] {
      return helpers.enumToTranslatedCollection(ECanadaProvinces, 'common.provinces');
    },

    shelterLocations(): IShelterLocation[] {
      const event = this.$storage.registration.getters.event();
      if (event) {
        return event.shelterLocations.filter((s: IShelterLocation) => s.status === EOptionItemStatus.Active);
      }
      return [];
    },
  },
});
