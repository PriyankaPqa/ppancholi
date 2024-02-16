<template>
  <v-text-field
    v-model="innerValue"
    autocomplete="off"
    :disabled="disabled"
    v-bind="$attrs"
    type="tel"
    :prefix="'+' + selectedCountry.dialCode"
    :placeholder="placeholder"
    v-on="{
      ...$listeners,
      input: event => {},
      focusout: event => emitPhoneObject('focusout'),
    }"
    @keypress="isNumber($event)">
    <template #prepend-inner>
      <v-menu
        v-model="countryListOpen"
        :attach="attach"
        transition="slide-y-transition">
        <template #activator="{ on }">
          <button
            type="button"
            class="countryButton"
            :disabled="disabled"
            :aria-label="selectedCountry.name"
            v-on="on">
            <div
              :class="[
                'vti__flag',
                selectedCountry.iso2.toLowerCase(),
              ]" />
            <v-icon>
              mdi-menu-down
            </v-icon>
          </button>
        </template>

        <v-list
          v-if="countryListOpen"
          ref="countryList"
          class="countryList">
          <CountryListItem
            v-if="selectedCountry"
            :key="'selected_' + selectedCountry.iso2"
            :country="selectedCountry" />

          <v-divider v-if="selectedCountry" />

          <CountryListItem
            v-for="country in countries"
            :key="country.iso2"
            :country="country"
            @select-country="selectCountry" />
        </v-list>
      </v-menu>
    </template>
  </v-text-field>
</template>

<script lang="ts">
import Vue from 'vue';
import en from '@libs/shared-lib/constants/countries/en';
import fr from '@libs/shared-lib/constants/countries/fr';
import { parsePhoneNumber, ParsedPhoneNumber, getExample } from 'awesome-phonenumber';
import { ICountry, countries } from '@libs/component-lib/components/atoms/RcPhone/all-countries';
import CountryListItem from './components/CountryListItem.vue';

let countrySearchBuffer = '';

interface IValue {
  number: string;
  countryCode: string;
  e164Number: string;
}

/**
 * A phone number input with automatic formatting and country selection.
 *
 * Implements all props for **v-text-field**: https://vuetifyjs.com/en/components/text-fields
 */
export default Vue.extend({
  name: 'RcPhone',

  components: {
    CountryListItem,
  },

  props: {
    /**
     * The value for the input, bound with v-model. Example: { number: '514-521-9999', countryCode: 'CA', e164Number: '+514521999' }
     */
    value: {
      type: Object as () => { number: string; countryCode: string; e164Number: string },
      default: () => ({ number: '', countryCode: '', e164Number: '' }),
    },

    /**
     * The default country to select when the input is rendered with no value. Example 'CA', 'US', 'AL'
     */
    defaultCountry: {
      type: String,
      default: 'CA',
    },

    disabled: {
      type: Boolean,
      default: false,
    },

    attach: {
      type: [String, Boolean, Object],
      default: true,
    },
  },

  data() {
    return {
      innerValue: '',
      countryListOpen: false,
      selectedCountry: {} as ICountry,
    };
  },

  computed: {
    countries(): Array<ICountry> {
      const countryNames = this.$i18n?.locale === 'fr' ? fr : en;
      return countries.map((c) => ({ ...c, name: (countryNames as any)[c.iso2.toUpperCase()] || c.name }))
        .sort((a, b) => a.name.localeCompare(b.name));
    },

    placeholder(): string {
      const example = getExample(this.selectedCountry.iso2, 'mobile');
      return example?.number?.national;
    },

    phoneObject(): ParsedPhoneNumber {
      return parsePhoneNumber(this.innerValue, { regionCode: this.selectedCountry.iso2 });
    },

    e164Number(): string {
      return this.phoneObject?.number?.e164;
    },
  },

  watch: {
    value: {
      deep: true,
      immediate: true,
      handler(newValue) {
        const value = {
          number: newValue.number || '',
          countryCode: newValue.countryCode || this.defaultCountry,
          e164Number: this.e164Number,
        };
        this.innerValue = this.getInitialNumber(value.number, value.countryCode);
        this.selectedCountry = this.getInitialCountry(value, this.defaultCountry);
      },
    },

    innerValue() {
      this.emitPhoneObject('input');
    },

    countryListOpen(newValue) {
      if (newValue) {
        this.removeActiveClasses();
      }
    },
  },

  mounted() {
    if (this.value.number) {
      this.innerValue = this.getInitialNumber(this.value.number, this.defaultCountry);
      this.selectedCountry = this.getInitialCountry(this.value, this.defaultCountry);
    }
  },

  created() {
    document.body.addEventListener('keydown', this.scrollCountryMenu);
  },

  beforeDestroy() {
    document.body.removeEventListener('keydown', this.scrollCountryMenu);
  },

  methods: {

    getInitialNumber(number: string, defaultCountry: string): string {
      const pn = parsePhoneNumber(number, { regionCode: defaultCountry });
      if (pn?.valid) {
        return pn.number.national;
      }

      return number;
    },

    getInitialCountry(value: IValue, defaultCountry: string): ICountry {
      const countryCode = value.countryCode ? value.countryCode.toUpperCase() : defaultCountry.toUpperCase();
      const pn = parsePhoneNumber(value.number, { regionCode: countryCode });

      const regionCode = pn.regionCode;

      if (regionCode) {
        if (regionCode === 'US' && pn.type === 'toll-free') {
          return {
            name: 'Canada',
            iso2: 'CA',
            dialCode: '1',
            priority: 1,
          };
        }
        const country = this.countries.find((c: ICountry) => c.iso2 === regionCode.toUpperCase());
        if (country) {
          return country;
        }
      }

      const country = this.countries.find((c: ICountry) => c.iso2 === defaultCountry.toUpperCase());
      if (country) {
        return country;
      }

      return {
        name: 'Canada',
        iso2: 'CA',
        dialCode: '1',
        priority: 1,
      };
    },

    /**
     * Handles selecting the country from the country list
     * @param {ICountry} country The selected country
     */
    selectCountry(country: ICountry) {
      this.selectedCountry = country;
      this.innerValue = this.phoneObject?.number?.national || '';
    },

    /**
     * Remove the active class from country list items that are no longer highlighted
     */
    removeActiveClasses() {
      const previousActiveElems = document.getElementsByClassName('countryList__item--active');

      for (let x = 0; x < previousActiveElems.length; x += 1) {
        previousActiveElems[x].classList.remove('countryList__item--active');
      }
    },

    /**
     * Handles scrolling the country menu when the user starts typing
     */
    // eslint-disable-next-line max-statements
    scrollCountryMenu(e: KeyboardEvent) {
      if (!this.countryListOpen) {
        return;
      }
      if (e.keyCode === 40 || e.keyCode === 38) {
        const currentActiveElem = document.getElementsByClassName('countryList__item--active')[0];

        if (currentActiveElem) {
          let sibling: Element | null;

          if (e.keyCode === 38) {
            sibling = currentActiveElem.previousElementSibling;
          } else {
            sibling = currentActiveElem.nextElementSibling;
          }

          if (sibling) {
            sibling.classList.add('countryList__item--active');
            sibling.scrollIntoView();
            currentActiveElem.classList.remove('countryList__item--active');
          }
        } else {
          document.getElementsByClassName('countryList__item')[0].classList.add('countryList__item--active');
        }
      } else if (e.keyCode === 13) {
        const currentActiveElem = document.getElementsByClassName('countryList__item--active')[0];

        if (currentActiveElem) {
          const countryCode = currentActiveElem.getAttribute('data-iso');

          if (countryCode) {
            const country = this.countries.find((c) => c.iso2 === countryCode);

            // eslint-disable-next-line max-depth
            if (country) {
              this.selectCountry(country);
            }
          }
        }

        this.countryListOpen = false;
      } else {
        countrySearchBuffer += e.key;

        countrySearchBuffer = countrySearchBuffer.toLowerCase();
        const country = this.countries.find((c: ICountry) => c.name.toLowerCase().startsWith(countrySearchBuffer));

        if (country) {
          const elem = document.getElementsByClassName(`country__${country.iso2}`)[0];

          if (elem) {
            elem.scrollIntoView();

            this.removeActiveClasses();

            elem.classList.add('countryList__item--active');
          }
        }

        setTimeout(() => {
          countrySearchBuffer = '';
        }, 1000);
      }
    },

    /**
     * Check keyboard character to accept only numbers for phone number.
     * @param evt The event of pressing the keyboard
     */
    isNumber(e: KeyboardEvent): boolean {
      const charCode = e.key.charCodeAt(0);
      if ((charCode > 31 && (charCode < 48 || charCode > 57))) {
        e.preventDefault();
        return false;
      }
      return true;
    },

    emitPhoneObject(emitEventName: string) {
      const isValid = this.phoneObject?.valid;

      if (isValid) {
        this.innerValue = this.phoneObject.number.national || '';
      }

      this.$emit(emitEventName, {
        number: this.phoneObject?.number?.national,
        countryCode: this.selectedCountry.iso2,
        e164Number: this.e164Number,
      });
    },
  },

});
</script>

<style scoped lang="scss">
.countryButton {
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.countryButton:hover {
  background-color: #f5f5f5;
}

.countryList {
  max-height: 260px;
  max-width: 500px;
}

::v-deep .v-label.v-label--active {
  left: -48px!important;
}
</style>
