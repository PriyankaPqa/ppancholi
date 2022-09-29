<template>
  <v-text-field
    ref="input"
    onfocus="this.setAttribute('autocomplete','nope');"
    :placeholder="''"
    v-bind="$attrs"
    @input="$emit('input', $event)"
    @change="$emit('change', $event)" />
</template>

<script>
import Vue from 'vue';
import GoogleMapsPlugin from '../../plugins/google-maps';

export default Vue.extend({
  name: 'RcGoogleAutocomplete',

  props: {
    apiKey: {
      type: String,
      required: true,
    },

    predictionTypes: {
      type: Array,
      required: false,
      default: null,
    },

    predictionCountriesRestriction: {
      type: [Array, String],
      required: false,
      default: null,
    },

    strictBounds: {
      type: Boolean,
      required: false,
      default: false,
    },

    disableAutocomplete: {
      type: Boolean,
      default: false,
    },

    includePlaceName: Boolean,
  },

  data() {
    return {
      autocomplete: {
        type: Object,
      },
    };
  },

  watch: {
    predictionCountriesRestriction() {
      this.setRequestCountryRestriction();
    },

    predictionTypes() {
      this.setRequestPredictionTypes();
    },

    includePlaceName() {
      this.setResponseFields();
    },
  },

  async mounted() {
    if (this.disableAutocomplete) {
      return;
    }

    const loader = GoogleMapsPlugin.getLoader(this.apiKey);

    loader
      .load()
      .then(() => {
        this.initAutocompleteFeature();
        setTimeout(() => {
          this.$refs.input.$el.querySelector('input').placeholder = '';
        }, 100);
      });
  },

  methods: {
    setRequestPredictionTypes() {
      if (this.autocomplete && typeof this.autocomplete.setTypes === 'function') {
        if (this.predictionTypes && this.predictionTypes.length) {
          // The types of predictions to be returned.
          // See https://developers.google.com/maps/documentation/javascript/reference/places-widget#AutocompleteOptions.types
          // See https://developers.google.com/places/supported_types#table3
          this.autocomplete.setTypes(this.predictionTypes);
        } else {
          this.autocomplete.setTypes([]);
        }
      }
    },
    setRequestCountryRestriction() {
      if (this.autocomplete && typeof this.autocomplete.setComponentRestrictions === 'function') {
        if (this.predictionCountriesRestriction) {
          // Restrict predictions to only those within the parent component. For example, the country.
          // See https://developers.google.com/maps/documentation/javascript/reference/places-widget#AutocompleteOptions.componentRestrictions
          // See https://developers.google.com/maps/documentation/javascript/reference/places-autocomplete-service#ComponentRestrictions
          // Country: ISO 3166-1 Alpha-2 country code, case insensitive
          // see https://en.wikipedia.org/wiki/List_of_ISO_3166_country_codes
          this.autocomplete.setComponentRestrictions({
            country: this.predictionCountriesRestriction,
          });
        }
      }
    },

    setResponseFields() {
      if (this.autocomplete) {
        // Fields to be included for the Place in the details response when the details are successfully retrieved
        // See https://developers.google.com/maps/documentation/javascript/reference/places-widget#AutocompleteOptions.fields
        // See https://developers.google.com/maps/documentation/javascript/reference/places-service#PlaceResult
        // See https://developers.google.com/maps/documentation/javascript/reference/geocoder#GeocoderAddressComponent
        // See https://developers.google.com/maps/documentation/javascript/reference/places-service#PlaceGeometry
        const fields = ['address_component', 'geometry', 'name'];
        if (this.includePlaceName) {
          fields.push('name');
        }

        if (this.autocomplete.setFields && typeof this.autocomplete.setFields === 'function') {
          this.autocomplete.setFields(fields);
        }
      }
    },

    initAutocompleteFeature() {
      if (this.$refs.input) {
        // eslint-disable-next-line no-undef
        this.autocomplete = new google.maps.places.Autocomplete(
          this.$refs.input.$el.getElementsByTagName('input')[0],
        );
      } else {
        // eslint-disable-next-line no-undef
        this.autocomplete = new google.maps.places.Autocomplete(
          this.$el.getElementsByTagName('input')[0],
        );
      }

      if (this.autocomplete) {
        // Autocomplete options, see https://developers.google.com/maps/documentation/javascript/reference/places-widget#AutocompleteOptions
        // const autocompleteOptions = {};

        // Set prediction types
        this.setRequestPredictionTypes();

        this.setRequestCountryRestriction();

        // we try to use the current user's position to order results
        try {
        // eslint-disable-next-line no-undef
          this.geolocate(google);
          // eslint-disable-next-line no-empty
        } catch { }

        if (this.strictBounds && typeof this.autocomplete.setOptions === 'function') {
        // indicating that the Autocomplete widget should only return those places that are inside the bounds of the Autocomplete widget at the time the query is sent
        // See https://developers.google.com/maps/documentation/javascript/reference/places-widget#AutocompleteOptions.strictBounds
          this.autocomplete.setOptions({ strictBounds: true });
        }

        // Set fields
        this.setResponseFields();

        if (typeof this.autocomplete.addListener === 'function') {
          // When the user selects an address from the drop-down, populate the
          // address fields in the form.
          this.autocomplete.addListener('place_changed', this.onPlaceChanged);
        }
      }
    },
    onPlaceChanged() {
      // Get the place details from the autocomplete object.
      // See https://developers.google.com/maps/documentation/javascript/reference/places-service#PlaceResult
      // See https://developers.google.com/maps/documentation/javascript/reference/geocoder#GeocoderAddressComponent
      // See https://developers.google.com/maps/documentation/javascript/reference/places-service#PlaceGeometry
      this.place = this.autocomplete.getPlace();

      const placeData = {
        name: this.getNameFromPlaceDetails(),
        location: this.getLocationFromPlaceDetails(),
        street: this.getStreetFromPlaceDetails(),
        city: this.getCityFromPlaceDetails(),
        province: this.getProvinceFromPlaceDetails(),
        country: this.getCountryFromPlaceDetails(),
        postalCode: this.getPostalCodeFromPlaceDetails(),
      };

      this.$emit('on-autocompleted', placeData);
    },
    getNameFromPlaceDetails() {
      if (this.place == null) {
        return null;
      }
      if (this.place.name) {
        return this.place.name;
      }
      return null;
    },
    getLocationFromPlaceDetails() {
      const location = { lat: null, lng: null };
      if (this.place?.geometry?.location) {
        location.lat = this.place.geometry.location.lat();
        location.lng = this.place.geometry.location.lng();
      }
      return location;
    },
    getStreetFromPlaceDetails() {
      let street = '';
      if (this.place && this.place.address_components) {
        const streetNumberObj = this.place.address_components.find((element) => element.types.includes('street_number'));
        const streetNameObj = this.place.address_components.find((element) => element.types.includes('route'));
        if (streetNumberObj) {
          street = streetNumberObj.long_name;
        }
        if (streetNameObj) {
          if (street !== '') {
            street += ' ';
          }
          street += streetNameObj.long_name;
        }
      }
      return street;
    },
    getCityFromPlaceDetails() {
      let city = null;
      if (this.place && this.place.address_components) {
        const cityObj = this.place.address_components.find((element) => (
          element.types.includes('locality')
          && element.types.includes('political')
        ));
        if (cityObj) {
          city = cityObj.long_name;
        }
      }
      return city;
    },
    getProvinceFromPlaceDetails() {
      let province = null;
      if (this.place && this.place.address_components) {
        const provinceObj = this.place.address_components.find((element) => (
          element.types.includes('administrative_area_level_1')
          && element.types.includes('political')
        ));
        if (provinceObj) {
          province = provinceObj.short_name;
        }
      }
      return province;
    },
    getCountryFromPlaceDetails() {
      let country = null;
      if (this.place && this.place.address_components) {
        const countryObj = this.place.address_components.find((element) => (
          element.types.includes('country')
          && element.types.includes('political')
        ));
        if (countryObj) {
          country = countryObj.short_name;
        }
      }
      return country;
    },
    getPostalCodeFromPlaceDetails() {
      let postalCode = null;
      if (this.place && this.place.address_components) {
        const postalCodeObj = this.place.address_components.find((element) => element.types.includes('postal_code'));
        if (postalCodeObj) {
          postalCode = postalCodeObj.long_name;
        }
      }
      return postalCode;
    },
    geolocate(google) {
      // Bias the autocomplete object to the user's geographical location,
      // as supplied by the browser's 'navigator.geolocation' object.
      if (navigator.geolocation && typeof this.autocomplete.setBounds === 'function') {
        navigator.geolocation.getCurrentPosition((position) => {
          const geolocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          const circle = new google.maps.Circle({
            center: geolocation,
            radius: position.coords.accuracy,
          });
          this.autocomplete.setBounds(circle.getBounds());
        });
      }
    },
  },
});
</script>
