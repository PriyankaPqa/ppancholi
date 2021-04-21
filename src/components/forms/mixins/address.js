import { ECanadaProvinces } from '../../../types';

/**
 * Mixin to inject when using google autocomplete
 */

export default {
  data() {
    return {
      isAutocompleteAddress: false,
    };
  },
  methods: {
    $resetGeoLocation() {
      if (!this.isAutocompleteAddress) {
        this.form.geoLocation.lat = null;
        this.form.geoLocation.lng = null;
      }
    },

    async $streetAddressAutocomplete(autocomplete) {
      const {
        country, province, postalCode, city, street, location,
      } = autocomplete;
      this.isAutocompleteAddress = true;
      this.form.country = country;
      this.form.provinceTerritory = country === 'CA' ? ECanadaProvinces[province] : province;
      this.form.postalCode = postalCode;
      this.form.city = city;
      this.form.street = street;
      this.form.geoLocation = location;

      await this.$nextTick();
      this.isAutocompleteAddress = false;
    },

    $onChangeCountry(country) {
      this.form.reset(country);
      (this.$refs.form).reset();
    },
  },
};
