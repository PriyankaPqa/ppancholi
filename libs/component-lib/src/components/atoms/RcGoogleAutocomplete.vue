<template>
  <div class="autocomplete_container">
    <v-text-field
      ref="input"
      onfocus="this.setAttribute('autocomplete','nope');"
      :placeholder="''"
      v-bind="$attrs"
      @input="onInput($event)" />
    <v-list v-if="showList" v-click-outside="{ handler: () => showList = false }" dense elevation="4" class="predictions_list pa-0">
      <v-list-item v-for="(p, index) in predictions" :key="index" class="pl-1 border" @click="onPlaceChanged(p.place_id)">
        <v-list-item-icon class="mr-0">
          <v-icon size="14">
            mdi-map-marker
          </v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title class="pl-0">
            {{ p.description }}
          </v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </div>
</template>

<script>
/* eslint-disable no-undef */
import Vue from 'vue';
import _debounce from 'lodash/debounce';
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

    disableAutocomplete: {
      type: Boolean,
      default: false,
    },

    minLength: {
      type: Number,
      default: 2,
    },

    includePlaceName: Boolean,

    clearAfterSelection: {
      type: Boolean,
      default: true,
    },
  },

  data() {
    return {
      autocompleteService: null,
      placeService: null,
      inputRef: null,
      predictions: [],
      sessionToken: '',
      place: null,
      showList: false,
      query: '',
    };
  },

  computed: {
    placeResponseFields() {
      return ['address_component', 'geometry', 'name'];
    },

    hasPredictionTypes() {
      return !!this.predictionTypes;
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
    generateSessionToken() {
      this.sessionToken = new google.maps.places.AutocompleteSessionToken();
    },
    initAutocompleteFeature() {
      if (this.$refs.input) {
        this.inputRef = this.$refs.input.$el.getElementsByTagName('input')[0];
      } else {
        this.inputRef = this.$el.getElementsByTagName('input')[0];
      }
      // Create a new session token.
      this.generateSessionToken();

      this.autocompleteService = new google.maps.places.AutocompleteService();

      if (this.autocompleteService && typeof this.autocompleteService.addListener === 'function') {
        // When the user selects an address from the drop-down, populate the address fields in the form.
        this.autocompleteService.addListener('place_changed', this.onPlaceChanged);
      }
    },
    displaySuggestions(predictions) {
      this.predictions = predictions;
      this.showList = this.query && predictions?.length > 0;
    },
    getNameFromPlaceDetails(placeResults) {
      if (placeResults == null) {
        return null;
      }
      if (placeResults.name) {
        return placeResults.name;
      }
      return null;
    },
    getLocationFromPlaceDetails(placeResults) {
      const location = { lat: null, lng: null };
      if (placeResults?.geometry?.location) {
        location.lat = placeResults.geometry.location.lat();
        location.lng = placeResults.geometry.location.lng();
      }
      return location;
    },
    getStreetFromPlaceDetails(placeResults) {
      let street = '';
      if (placeResults?.address_components) {
        const streetNumberObj = placeResults.address_components.find((element) => element.types.includes('street_number'));
        const streetNameObj = placeResults.address_components.find((element) => element.types.includes('route'));
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
    getCityFromPlaceDetails(placeResults) {
      let city = null;
      if (placeResults?.address_components) {
        const cityObj = placeResults.address_components.find((element) => (
          element.types.includes('locality')
          && element.types.includes('political')
        ));
        if (cityObj) {
          city = cityObj.long_name;
        }
      }
      return city;
    },
    getProvinceFromPlaceDetails(placeResults) {
      let province = null;
      if (placeResults?.address_components) {
        const provinceObj = placeResults.address_components.find((element) => (
          element.types.includes('administrative_area_level_1')
          && element.types.includes('political')
        ));
        if (provinceObj) {
          province = provinceObj.short_name;
        }
      }
      return province;
    },
    getCountryFromPlaceDetails(placeResults) {
      let country = null;
      if (placeResults?.address_components) {
        const countryObj = placeResults.address_components.find((element) => (
          element.types.includes('country')
          && element.types.includes('political')
        ));
        if (countryObj) {
          country = countryObj.short_name;
        }
      }
      return country;
    },
    getPostalCodeFromPlaceDetails(placeResults) {
      let postalCode = null;
      if (placeResults?.address_components) {
        const postalCodeObj = placeResults.address_components.find((element) => element.types.includes('postal_code'));
        if (postalCodeObj) {
          postalCode = postalCodeObj.long_name;
        }
      }
      return postalCode;
    },

    async getLocationAndRadius() {
      if (navigator.geolocation) {
        return new Promise((resolve) => {
          navigator.geolocation.getCurrentPosition((position) => {
            resolve({
              location: new google.maps.LatLng(position.coords.latitude, position.coords.longitude),
              radius: position.coords.accuracy,
            });
          }, () => {
            resolve({
              location: null,
              radius: null,
            });
          });
        });
      }
      return {
        location: null,
        radius: null,
      };
    },

    async getPlacePredictions(query) {
      const { location, radius } = await this.getLocationAndRadius();

      let payload = {
        input: query,
        location,
        radius,
        componentRestrictions: {
          country: this.predictionCountriesRestriction,
        },
        sessionToken: this.sessionToken,
      };

      if (this.hasPredictionTypes) {
        payload = {
          ...payload,
          types: this.predictionTypes,
        };
      }

      await this.autocompleteService.getPlacePredictions(payload, this.displaySuggestions);
    },

    onPlaceChanged(placeId) {
      this.showList = false;
      const placeService = new google.maps.places.PlacesService(document.getElementById(this.inputRef.id));

      placeService.getDetails({
        placeId,
        fields: this.placeResponseFields,
        sessionToken: this.sessionToken,
      }, (results) => {
        const placeData = {
          name: this.getNameFromPlaceDetails(results),
          location: this.getLocationFromPlaceDetails(results),
          street: this.getStreetFromPlaceDetails(results),
          city: this.getCityFromPlaceDetails(results),
          province: this.getProvinceFromPlaceDetails(results),
          country: this.getCountryFromPlaceDetails(results),
          postalCode: this.getPostalCodeFromPlaceDetails(results),
        };
        this.$emit('on-autocompleted', placeData);

        this.generateSessionToken();

        if (this.clearAfterSelection) {
          this.$refs.input.reset();
        }
      });
    },

    async onInput(query) {
      this.query = query;
      this.$emit('input', query);

      if (query?.length === 0) {
        this.showList = false;
      }

      if (query?.length >= this.minLength) {
        this.debounceGetPlacePredictions(query);
      }
    },

    debounceGetPlacePredictions: _debounce(function fc(query) {
      this.getPlacePredictions(query);
    }, 300),
  },
});
</script>

<style lang="scss">
.autocomplete_container {
  position: relative;
}

.predictions_list {
  position: absolute;
  top: 42px;
  z-index: 9999999;
  left: 10px;
  width: 90%;
}

.border{
  border-bottom: solid 1px var(--v-grey-lighten2);
}
</style>
