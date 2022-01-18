<template>
  <validation-observer ref="form" v-slot="{ failed, pristine }" slim>
    <rc-dialog
      :title="title"
      :show="true"
      :cancel-action-label="$t('common.buttons.cancel')"
      :submit-action-label="isEditMode ? $t('common.save') : $t('common.add')"
      :content-only-scrolling="true"
      :persistent="true"
      :max-width="750"
      :min-height="610"
      :loading="loading"
      :submit-button-disabled="failed || (isEditMode && pristine)"
      @cancel="$emit('close')"
      @close="$emit('close')"
      @submit="onSubmit">
      <v-container>
        <v-row v-if="location" justify="center">
          <v-col cols="12" class="pa-0">
            <language-tabs :language="languageMode" @click="setLanguageMode" />

            <v-row class="pt-4">
              <v-col cols="8" md="8" sm="12" class="pb-0">
                <v-text-field-with-validation
                  v-model="location.name.translation[languageMode]"
                  data-test="location-name"
                  :label="locationNameLabel"
                  :rules="rules.name"
                  @input="resetAsUnique()" />
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
              <v-col cols="12" class="pb-0">
                <validation-provider v-slot="{ errors, classes }" :rules="rules.streetAddress" mode="aggressive" data-test="location-streetAddress">
                  <rc-google-autocomplete
                    ref="address__street_autocomplete"
                    v-model="location.address.streetAddress"
                    :class="classes"
                    :error-messages="errors"
                    :api-key="apiKey"
                    outlined
                    :disable-autocomplete="!enableAutocomplete"
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

              <v-col cols="12" sm="6" md="4">
                <v-select-with-validation
                  v-if="isCanada"
                  v-model="location.address.province"
                  :rules="rules.province"
                  data-test="location-province"
                  :label="`${$t('common.address.province')}*`"
                  :items="canadianProvinces" />
                <v-text-field-with-validation
                  v-else
                  v-model="location.address.specifiedOtherProvince"
                  :rules="rules.specifiedOtherProvince"
                  data-test="location-specifiedOtherProvince"
                  :label="`${$t('common.address.province')}*`" />
              </v-col>

              <v-col cols="12" sm="6" md="4" class="pb-0">
                <v-text-field-with-validation
                  v-model="location.address.postalCode"
                  :rules="rules.postalCode"
                  data-test="location-postalCode"
                  :label="$t('common.address.postalCode')" />
              </v-col>

              <v-col cols="12" md="8" class="pb-0">
                <validation-provider v-slot="{ errors, classes }" :rules="rules.country" mode="aggressive" data-test="location-country">
                  <rc-country-select
                    v-model="location.address.country"
                    outlined
                    :error-messages="errors"
                    :class="classes"
                    :label="`${$t('common.address.country')} *`"
                    @change="onChangeCountry($event)" />
                </validation-provider>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-container>
    </rc-dialog>
  </validation-observer>
</template>

<script lang="ts">
import mixins from 'vue-typed-mixins';
import _cloneDeep from 'lodash/cloneDeep';
import { TranslateResult } from 'vue-i18n';
import {
  RcDialog,
  VTextFieldWithValidation,
  VSelectWithValidation,
  RcGoogleAutocomplete,
  RcCountrySelect,
} from '@crctech/component-library';
import { ECanadaProvinces, EEventSummarySections, VForm } from '@/types';
import {
  EEventLocationStatus,
  IEventEntity,
  IEventGenericLocation,
} from '@/entities/event';

import LanguageTabs from '@/ui/shared-components/LanguageTabs.vue';
import entityUtils from '@/entities/utils';
import { MAX_LENGTH_MD, MAX_LENGTH_SM } from '@/constants/validations';
import { localStorageKeys } from '@/constants/localStorage';
import helpers from '@/ui/helpers/helpers';
import handleUniqueNameSubmitError from '@/ui/mixins/handleUniqueNameSubmitError';
import { FeatureKeys } from '@/entities/tenantSettings';

export default mixins(handleUniqueNameSubmitError).extend({

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
      type: Object as () => IEventEntity,
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
    };
  },

  computed: {
    canadianProvinces(): Record<string, unknown>[] {
      const provinces = helpers.enumToTranslatedCollection(ECanadaProvinces, 'common.provinces');
      // Remove the "Other" option
      return provinces.filter((e) => e.value !== ECanadaProvinces.OT);
    },

    isCanada(): boolean {
      return this.location.address?.country === 'CA';
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
          required: this.isCanada,
        },
        specifiedOtherProvince: {
          required: !this.isCanada,
          max: MAX_LENGTH_SM,
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

    allLocations(): IEventGenericLocation[] {
      return this.isRegistrationLocation ? this.event.registrationLocations : this.event.shelterLocations;
    },

    enableAutocomplete(): boolean {
      return this.$hasFeature(FeatureKeys.AddressAutoFill);
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
    initCreateMode() {
      this.location = {
        name: entityUtils.initMultilingualAttributes(),
        status: EEventLocationStatus.Active,
        address: {
          country: null,
          streetAddress: null,
          province: null,
          specifiedOtherProvince: null,
          city: null,
          postalCode: null,
        },
      };
      this.isActive = true;
    },

    initEditMode() {
      const location = this.allLocations.find((location: IEventGenericLocation) => location.id === this.id);
      if (location) {
        this.location = _cloneDeep(location);
        this.isActive = this.location.status === EEventLocationStatus.Active;
      }
    },

    fillEmptyMultilingualFields() {
      this.location.name = entityUtils.getFilledMultilingualField(this.location.name);
    },

    onChangeCountry(country: string) {
      this.location.address = {
        country,
        streetAddress: null,
        province: null,
        specifiedOtherProvince: null,
        city: null,
        postalCode: null,
      };
    },

    async onSubmit() {
      const isValid = await (this.$refs.form as VForm).validate();
      if (isValid) {
        this.fillEmptyMultilingualFields();
        this.loading = true;
        try {
          await this.submitLocation();
          this.$emit('close');
        } catch (e) {
          this.$appInsights.trackTrace('Event gen. location submit error', { error: e }, 'EventGenericLocationDialog', 'onSubmit');
          this.handleSubmitError(e);
        } finally {
          this.loading = false;
        }
      }
    },

    async submitLocation() {
      const params = {
        eventId: this.event.id,
        payload: this.location,
        section: this.isRegistrationLocation ? EEventSummarySections.RegistrationLocation : EEventSummarySections.ShelterLocation,
        action: this.isEditMode ? 'edit' : 'add',
      };

      await this.$storage.event.actions.updateEventSection(params);
    },

    setLanguageMode(lang: string) {
      this.languageMode = lang;
      this.fillEmptyMultilingualFields();
    },

    updateStatus(value: boolean) {
      this.location.status = value ? EEventLocationStatus.Active : EEventLocationStatus.Inactive;
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    streetAddressAutocomplete(autocomplete: any) {
      const {
        country, province, postalCode, city, street,
      } = autocomplete;
      this.location.address.country = country;
      this.location.address.streetAddress = street;
      this.location.address.city = city;
      this.location.address.postalCode = postalCode;
      this.location.address.province = country === 'CA' ? Number(ECanadaProvinces[province]) : ECanadaProvinces.OT;
      this.location.address.specifiedOtherProvince = country === 'CA' ? null : province;
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
