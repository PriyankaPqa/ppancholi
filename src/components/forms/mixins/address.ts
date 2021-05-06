import Vue from 'vue';
import { ECanadaProvinces, VForm } from '../../../types';

/**
 * Mixin to inject when using google autocomplete
 */

declare module 'vue/types/vue' {
  interface Vue {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    form: any;
  }
}

export default Vue.extend({
  data() {
    return {
      isAutocompleteAddress: false,
    };
  },
  methods: {
    $resetGeoLocation() {
      if (!this.isAutocompleteAddress) {
        this.form.latitude = 0;
        this.form.longitude = 0;
      }
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async $streetAddressAutocomplete(autocomplete: any) {
      const {
        country, province, postalCode, city, street, location,
      } = autocomplete;
      this.isAutocompleteAddress = true;
      this.form.country = country;
      this.form.province = country === 'CA' ? ECanadaProvinces[province] : null;
      this.form.specifiedOtherProvince = country === 'CA' ? null : province;
      this.form.postalCode = postalCode;
      this.form.city = city;
      this.form.streetAddress = street;
      this.form.latitude = location.lat;
      this.form.longitude = location.lng;

      await this.$nextTick();
      this.isAutocompleteAddress = false;
    },

    $onChangeCountry(country: string) {
      this.form.reset(country);
      (this.$refs.form as VForm).reset();
    },
  },
});
