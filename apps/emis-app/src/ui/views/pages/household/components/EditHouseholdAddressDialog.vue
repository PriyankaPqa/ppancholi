<template>
  <validation-observer ref="form" v-slot="{ failed }" slim>
    <rc-dialog
      :title="$t('household.profile.edit.address.title')"
      :show="show"
      :cancel-action-label="$t('common.buttons.cancel')"
      :submit-action-label="$t('common.save')"
      :persistent="true"
      :max-width="750"
      :submit-button-disabled="failed || !hasChanged || submitOnGoing"
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
        is-edit-mode
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
import AddressForm from '@libs/registration-lib/components/forms/AddressForm.vue';
import libHelpers from '@libs/entities-lib/helpers';
import { RcDialog, VCheckboxWithValidation, VTextAreaWithValidation } from '@libs/component-lib/components';
import { IAddressData, IHouseholdCreate } from '@libs/entities-lib/household-create';
import _cloneDeep from 'lodash/cloneDeep';
import isEqual from 'lodash/isEqual';
import { Address, IAddress } from '@libs/entities-lib/value-objects/address';
import { IHouseholdEntity } from '@libs/entities-lib/household';
import { localStorageKeys } from '@/constants/localStorage';
import { VForm } from '@libs/shared-lib/types';
import { MAX_LENGTH_LG } from '@libs/shared-lib/constants/validations';
import { FeatureKeys } from '@libs/entities-lib/tenantSettings';
import { useRegistrationStore } from '@/pinia/registration/registration';
import { useHouseholdStore } from '@/pinia/household/household';

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
        : process.env.VITE_GOOGLE_API_KEY,
      address: null as IAddress,
      noFixedHome: false,
      noFixedHomeDetails: '',
      submitOnGoing: false,
    };
  },

  computed: {
    canadianProvincesItems(): Record<string, unknown>[] {
      return libHelpers.getCanadianProvincesWithoutOther(this.$i18n);
    },

    rules(): Record<string, unknown> {
      return {
        noFixedHomeDetails: {
          max: MAX_LENGTH_LG,
        },
      };
    },

    householdCreate(): IHouseholdCreate {
      return useRegistrationStore().getHouseholdCreate();
    },

    currentHousehold(): IHouseholdEntity {
      return useHouseholdStore().getById(this.householdCreate.id);
    },

    hasChanged(): boolean {
      return !isEqual(this.address, this.householdCreate.homeAddress)
        || this.noFixedHome !== this.householdCreate.noFixedHome
        || this.noFixedHomeDetails !== this.currentHousehold.address.observation;
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
    this.noFixedHomeDetails = this.currentHousehold.address.observation;
  },

  methods: {
    async submit() {
      const isValid = await (this.$refs.form as VForm).validate();
      if (isValid) {
        this.submitOnGoing = true;
        const householdId = this.householdCreate.id;
        const res = this.noFixedHome
          ? await this.updateNoFixedHomeAddress(householdId, this.noFixedHomeDetails)
          : await this.updateHomeAddress(householdId, this.address);
        this.submitOnGoing = false;
        if (res) {
          this.$toasted.global.success(this.$t('household.profile.edit.address.success'));
          this.close();
        }
      }
    },

    async updateNoFixedHomeAddress(householdId: string, observation: string) {
      const res = await useHouseholdStore().updateNoFixedHomeAddress({ householdId, observation });
      if (res) {
        this.householdCreate.noFixedHome = true;
      }
      return res;
    },

    async updateHomeAddress(householdId: string, address: IAddress) {
      const res = await useHouseholdStore().updateHomeAddress({ householdId, address });
      if (res) {
        this.householdCreate.noFixedHome = false;
        this.householdCreate.setHomeAddress(address);
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
