<template>
  <ValidationObserver ref="form" v-slot="{ failed, pristine }" slim>
    <rc-dialog
      :title="title"
      :show="true"
      :cancel-action-label="$t('common.buttons.cancel')"
      :submit-action-label="isEditMode ? $t('common.save') : $t('common.add')"
      :content-only-scrolling="true"
      :persistent="true"
      :max-width="750"
      :min-height="590"
      :loading="loading"
      :submit-button-disabled="failed || (isEditMode && pristine)"
      @cancel="$emit('close')"
      @close="$emit('close')"
      @submit="onSubmit">
      <v-container>
        <v-row justify="center">
          <v-col cols="12" class="pa-0">
            <language-tabs :language="languageMode" @click="setLanguageMode" />

            <v-row class="pt-4">
              <v-col cols="8" md="8" sm="12" class="pb-0">
                <v-text-field-with-validation
                  v-model="location.name.translation[languageMode]"
                  data-test="location-name"
                  :label="locationNameLabel"
                  :rules="rules.name"
                  @input="checkNameUniqueness($event)" />
              </v-col>

              <v-col cols="4" md="4" sm="12">
                <div :class="['status', isActive ? 'status_success' : 'grey']">
                  <div class="pl-4 white--text" sm="12" md="9">
                    {{ $t('eventSummary.status') }}
                    <span class="rc-body14 fw-bold white--text text-uppercase" :data-test="`location-status`">
                      {{ statusName }}
                    </span>
                  </div>

                  <validation-provider>
                    <v-switch
                      v-model="isActive"
                      data-test="location-switch-status"
                      class="pt-0 mt-0"
                      height="48"
                      hide-details
                      color="white"
                      flat
                      @change="updateStatus" />
                  </validation-provider>
                </div>
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12" md="8" class="pb-0">
                <validation-provider v-slot="{ errors, classes }" :rules="rules.country" mode="aggressive" data-test="location-country">
                  <rc-country-select
                    v-model="location.address.country"
                    outlined
                    :error-messages="errors"
                    :class="classes"
                    :label="`${$t('common.address.country')} *`" />
                </validation-provider>
              </v-col>

              <v-col cols="4" />

              <v-col cols="12" class="pb-0">
                <validation-provider v-slot="{ errors, classes }" :rules="rules.streetAddress" mode="aggressive" data-test="location-streetAddress">
                  <rc-google-autocomplete
                    ref="address__street_autocomplete"
                    v-model="location.address.streetAddress"
                    :class="classes"
                    :error-messages="errors"
                    :api-key="apiKey"
                    outlined
                    :label="`${$t('common.address.streetAddress')} *`"
                    @on-autocompleted="streetAddressAutocomplete" />
                </validation-provider>
              </v-col>

              <v-col cols="12" sm="6" md="4" class="pb-0">
                <v-text-field-with-validation
                  v-model="location.address.city"
                  :rules="rules.city"
                  data-test="location-city"
                  :label="`${$t('common.address.city')} *`" />
              </v-col>

              <v-col cols="12" sm="6" md="4" class="pb-0">
                <v-select-with-validation
                  v-model="location.address.province"
                  :rules="rules.province"
                  data-test="location-province"
                  :label="`${$t('common.address.province')} *`"
                  :items="canadianProvinces" />
              </v-col>

              <v-col cols="12" sm="6" md="4" class="pb-0">
                <v-text-field-with-validation
                  v-model="location.address.postalCode"
                  :rules="rules.postalCode"
                  data-test="location-postalCode"
                  :label="$t('common.address.postalCode')" />
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-container>
    </rc-dialog>
  </ValidationObserver>
</template>

<script lang="ts">
import Vue from 'vue';
import { TranslateResult } from 'vue-i18n';
import {
  RcDialog, VTextFieldWithValidation, VSelectWithValidation, RcGoogleAutocomplete, RcCountrySelect,
} from '@crctech/component-library';

import { ECanadaProvinces, VForm } from '@/types';
import {
  EEventLocationStatus, Event, IEventGenericLocation, IEventShelterLocation,
} from '@/entities/event';
import _cloneDeep from 'lodash/cloneDeep';
import LanguageTabs from '@/ui/shared-components/LanguageTabs.vue';
import entityUtils from '@/entities/utils';
import { MAX_LENGTH_MD } from '@/constants/validations';
import { localStorageKeys } from '@/constants/localStorage';
import _includes from 'lodash/includes';
import helpers from '@/ui/helpers';
import { IShelterLocation } from '@crctech/registration-lib/src/entities/beneficiary';

export default Vue.extend({
  name: 'EventGenericLocationDialog',

  components: {
    RcDialog,
    LanguageTabs,
    VTextFieldWithValidation,
    RcGoogleAutocomplete,
    VSelectWithValidation,
    RcCountrySelect,
  },

  props: {
    event: {
      type: Object as () => Event,
      required: true,
    },
    id: {
      type: String,
      default: '',
    },
    isEditMode: {
      type: Boolean,
      required: true,
    },

    isRegistrationLocation: {
      type: Boolean,
      required: true,
    },
  },

  data() {
    return {
      languageMode: 'en',
      location: null as IEventGenericLocation,
      shelterLocationId: '',
      originalLocation: null as IEventGenericLocation,
      isActive: false,
      loading: false,
      isNameUnique: true,
    };
  },

  computed: {
    canadianProvinces(): Record<string, unknown>[] {
      const provinces = helpers.enumToTranslatedCollection(ECanadaProvinces, 'common.provinces');
      const index = provinces.findIndex((e) => e.value === ECanadaProvinces.OT);

      // Put the "Other" option at the bottom of the list
      return [...provinces.slice(0, index), ...provinces.slice(index + 1), provinces[index]];
    },

    rules(): Record<string, unknown> {
      return {
        name: {
          required: true,
          max: MAX_LENGTH_MD,
          customValidator: { isValid: this.isNameUnique, messageKey: 'validations.alreadyExists' },
        },
        country: {
          required: true,
        },
        streetAddress: {
          required: true,
          max: MAX_LENGTH_MD,
        },
        city: {
          required: true,
          max: MAX_LENGTH_MD,
        },
        province: {
          required: true,
        },
        postalCode: {
          max: MAX_LENGTH_MD,
        },
      };
    },

    statusName(): TranslateResult {
      const status = this.isActive ? 'Active' : 'Inactive';
      return this.$t(`eventSummary.status.${status}`);
    },

    title(): TranslateResult {
      if (this.isEditMode) {
        return this.isRegistrationLocation ? this.$t('eventSummary.editRegistrationLocation') : this.$t('eventSummary.editShelterLocation');
      }
      return this.isRegistrationLocation ? this.$t('eventSummary.addRegistrationLocation') : this.$t('eventSummary.addShelterLocation');
    },

    locationNameLabel(): TranslateResult {
      const label = this.isRegistrationLocation ? this.$t('eventSummary.registrationLocation.name') : this.$t('eventSummary.shelterLocation.name');

      return `${label} *`;
    },

    apiKey(): string {
      return localStorage.getItem(localStorageKeys.googleMapsAPIKey.name)
        ? localStorage.getItem(localStorageKeys.googleMapsAPIKey.name)
        : process.env.VUE_APP_GOOGLE_API_KEY;
    },

    allLocations(): IEventGenericLocation[] | IEventShelterLocation[] {
      return this.isRegistrationLocation ? this.event.registrationLocations : this.event.shelterLocations;
    },
  },

  created() {
    if (this.isEditMode) {
      this.initEditMode();
    } else {
      this.initCreateMode();
    }
  },

  methods: {

    checkNameUniqueness(name: string) {
      let otherLocations = this.allLocations;
      if (this.isEditMode) {
        otherLocations = otherLocations.filter((location) => location.name.translation.en !== this.originalLocation.name.translation.en);
      }
      const nameExists = otherLocations.some((location) => _includes(location.name.translation, name));
      this.isNameUnique = !nameExists;
    },

    initCreateMode() {
      this.location = {
        name: entityUtils.initMultilingualAttributes(),
        status: EEventLocationStatus.Active,
        address: {
          country: null,
          streetAddress: null,
          province: null,
          city: null,
          postalCode: null,
        },
      };
      this.isActive = true;
    },

    initEditMode() {
      if (this.isRegistrationLocation) {
        this.initRegistrationLocationEdit();
      } else {
        this.initShelterLocationEdit();
      }
      this.isActive = this.location.status === EEventLocationStatus.Active;
    },

    initRegistrationLocationEdit() {
      this.originalLocation = this.allLocations.find((location) => location.name.translation.en === this.id);
      this.location = _cloneDeep(this.originalLocation);
    },

    initShelterLocationEdit() {
      const thisLocation = (this.allLocations as unknown as IShelterLocation[])
        .find((location: IShelterLocation) => location.name.translation.en === this.id);
        // Store the id and the location without the Id separately in the state
        // This is a temporary solution until registration location and shelter location schemas align and registration locationn will have an id too
      const { id, ...originalLocation } = thisLocation;
      this.originalLocation = originalLocation as unknown as IEventGenericLocation;
      this.shelterLocationId = id;
      this.location = _cloneDeep(this.originalLocation);
    },

    fillEmptyMultilingualFields() {
      this.location.name = entityUtils.getFilledMultilingualField(this.location.name);
    },

    async onSubmit() {
      const isValid = await (this.$refs.form as VForm).validate();
      if (isValid) {
        this.fillEmptyMultilingualFields();

        this.loading = true;
        try {
          if (this.isEditMode) {
            this.isRegistrationLocation ? await this.editRegistrationLocation() : await this.editShelterLocation();
          } else {
            this.isRegistrationLocation ? await this.addRegistrationLocation() : await this.addShelterLocation();
          }
        } finally {
          this.loading = false;
          this.$emit('close');
        }
      }
    },

    async addRegistrationLocation() {
      const params = {
        eventId: this.event.id,
        payload: this.location,
      };

      await this.$storage.event.actions.addRegistrationLocation(params);
    },

    async editRegistrationLocation() {
      const params = {
        eventId: this.event.id,
        payload: {
          originalRegistrationLocation: this.originalLocation,
          updatedRegistrationLocation: this.location,
        },
      };

      await this.$storage.event.actions.editRegistrationLocation(params);
    },

    async addShelterLocation() {
      const params = {
        eventId: this.event.id,
        payload: this.location,
      };

      await this.$storage.event.actions.addShelterLocation(params);
    },

    async editShelterLocation() {
      const params = {
        eventId: this.event.id,
        shelterLocationId: this.shelterLocationId,
        payload: this.location,
      };

      await this.$storage.event.actions.editShelterLocation(params);
    },

    setLanguageMode(lang: string) {
      this.languageMode = lang;
      this.fillEmptyMultilingualFields();
    },

    updateStatus(value: boolean) {
      this.location.status = value ? EEventLocationStatus.Active : EEventLocationStatus.Inactive;
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    streetAddressAutocomplete(event: any) {
      this.location.address.country = event.country;
      this.location.address.streetAddress = event.street;
      this.location.address.city = event.city;
      this.location.address.postalCode = event.postalCode;

      const province = Number(ECanadaProvinces[event.province]);
      this.location.address.province = province || ECanadaProvinces.OT;
    },
  },
});
</script>

<style scoped>
.status {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding-right: 4px;
  height: 56px;
  border-radius: 4px;
}
</style>
