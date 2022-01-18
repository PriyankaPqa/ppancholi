<template>
  <validation-observer ref="form" v-slot="{ failed }" slim>
    <rc-dialog
      :title="$t('household.profile.edit.address.title')"
      :show="show"
      :cancel-action-label="$t('common.buttons.cancel')"
      :submit-action-label="$t('common.save')"
      :persistent="true"
      :max-width="750"
      :submit-button-disabled="failed || !hasChanged"
      @cancel="cancel()"
      @close="close()"
      @submit="submit()">
      <v-row no-gutters>
        <v-checkbox-with-validation
          v-model="noFixedHome"
          data-test="address__noFixedHomeAddress"
          :label="`${$t('registration.addresses.noFixedHomeAddress')}`" />
      </v-row>
      <address-form
        v-if="!noFixedHome"
        :api-key="apiKey"
        :canadian-provinces-items="canadianProvincesItems"
        :disable-autocomplete="!enableAutocomplete"
        prefix-data-test="address"
        :home-address="address"
        @change="setAddress($event)" />
      <v-text-area-with-validation
        v-if="noFixedHome"
        v-model="noFixedHomeDetails"
        data-test="noFixedHomeDetails"
        :rules="rules.noFixedHomeDetails"
        :label="$t('household.profile.edit.noFixedHome.details.label')" />
    </rc-dialog>
  </validation-observer>
</template>

<script lang="ts">
import Vue from 'vue';
import { AddressForm } from '@crctech/registration-lib';
import libHelpers from '@crctech/registration-lib/src/ui/helpers';
import { RcDialog, VCheckboxWithValidation, VTextAreaWithValidation } from '@crctech/component-library';
import { IAddressData, IHouseholdCreate } from '@crctech/registration-lib/src/entities/household-create';
import _cloneDeep from 'lodash/cloneDeep';
import isEqual from 'lodash/isEqual';
import { Address, IAddress } from '@crctech/registration-lib/src/entities/value-objects/address';
import { IHouseholdCombined } from '@crctech/registration-lib/src/entities/household';
import { i18n } from '@/ui/plugins';
import { localStorageKeys } from '@/constants/localStorage';
import { VForm } from '@/types';
import { MAX_LENGTH_LG } from '@/constants/validations';
import { FeatureKeys } from '@/entities/tenantSettings';

export default Vue.extend({
  name: 'EditHouseholdAddressDialog',

  components: {
    AddressForm,
    RcDialog,
    VCheckboxWithValidation,
    VTextAreaWithValidation,
  },

  props: {
    show: {
      type: Boolean,
      required: true,
    },
  },

  data() {
    return {
      apiKey: localStorage.getItem(localStorageKeys.googleMapsAPIKey.name)
        ? localStorage.getItem(localStorageKeys.googleMapsAPIKey.name)
        : process.env.VUE_APP_GOOGLE_API_KEY,
      address: null as IAddress,
      noFixedHome: false,
      noFixedHomeDetails: '',
    };
  },

  computed: {
    canadianProvincesItems(): Record<string, unknown>[] {
      return libHelpers.getCanadianProvincesWithoutOther(i18n);
    },

    rules(): Record<string, unknown> {
      return {
        noFixedHomeDetails: {
          max: MAX_LENGTH_LG,
        },
      };
    },

    householdCreate(): IHouseholdCreate {
      return this.$storage.registration.getters.householdCreate();
    },

    currentHousehold(): IHouseholdCombined {
      return this.$storage.household.getters.get(this.householdCreate.id);
    },

    hasChanged(): boolean {
      return !isEqual(this.address, this.householdCreate.homeAddress)
        || this.noFixedHome !== this.householdCreate.noFixedHome
        || this.noFixedHomeDetails !== this.currentHousehold.entity.address.observation;
    },

    enableAutocomplete(): boolean {
      return this.$hasFeature(FeatureKeys.AddressAutoFill);
    },
  },

  watch: {
    noFixedHome(val) {
      if (!val) {
        this.setAddress(null);
      }
    },
  },

  created() {
    this.address = _cloneDeep(this.householdCreate.homeAddress);
    this.noFixedHome = this.householdCreate.noFixedHome;
    this.noFixedHomeDetails = this.currentHousehold.entity.address.observation;
  },

  methods: {
    async submit() {
      const isValid = await (this.$refs.form as VForm).validate();
      if (isValid) {
        const householdId = this.householdCreate.id;
        const res = this.noFixedHome
          ? await this.updateNoFixedHomeAddress(householdId, this.noFixedHomeDetails)
          : await this.updateHomeAddress(householdId, this.address);
        if (res) {
          this.$toasted.global.success(this.$t('household.profile.edit.address.success'));
          this.close();
        }
      }
    },

    async updateNoFixedHomeAddress(householdId: string, observation: string) {
      const res = await this.$storage.household.actions.updateNoFixedHomeAddress(householdId, observation);
      if (res) {
        this.$storage.registration.mutations.setNoFixedHome(true);
      }
      return res;
    },

    async updateHomeAddress(householdId: string, address: IAddress) {
      const res = await this.$storage.household.actions.updateHomeAddress(householdId, address);
      if (res) {
        this.$storage.registration.mutations.setNoFixedHome(false);
        this.$storage.registration.mutations.setHomeAddress(address);
      }
      return res;
    },

    cancel() {
      this.close();
    },

    close() {
      this.$emit('update:show', false);
    },

    setAddress(address: IAddressData) {
      this.address = new Address(address);
    },

  },
});
</script>
