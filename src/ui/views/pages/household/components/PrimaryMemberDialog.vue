<template>
  <ValidationObserver ref="form" v-slot="{ failed, pristine }">
    <rc-dialog
      :title="title"
      :show.sync="show"
      :cancel-action-label="$t('common.buttons.cancel')"
      :submit-action-label="$t('common.save')"
      :content-only-scrolling="true"
      fullscreen
      persistent
      show-close
      :submit-button-disabled="failed || (pristine && !changedAddress)"
      @close="onCancel"
      @cancel="onCancel"
      @submit="onSubmit">
      <v-row class="justify-center">
        <v-col cols="12" md="8">
          <lib-personal-information :i18n="i18n" skip-phone-email-rules />
          <current-address-form
            :shelter-locations="shelterLocations"
            :canadian-provinces-items="canadianProvincesItems"
            :current-address-type-items="currentAddressTypeItems"
            :api-key="apiKey"
            :current-address="member.currentAddress"
            :no-fixed-home="false"
            prefix-data-test="tempAddress"
            @change="setCurrentAddress($event)" />
        </v-col>
      </v-row>
    </rc-dialog>
  </ValidationObserver>
</template>

<script lang='ts'>
import Vue from 'vue';
import _cloneDeep from 'lodash/cloneDeep';
import _isEqual from 'lodash/isEqual';
import { PersonalInformation as LibPersonalInformation, CurrentAddressForm } from '@crctech/registration-lib';
import { RcDialog } from '@crctech/component-library';
import {
  ECurrentAddressTypes, IContactInformation, ICurrentAddress, IMember,
} from '@crctech/registration-lib/src/entities/household-create';
import { TranslateResult } from 'vue-i18n';
import { IEventGenericLocation } from '@crctech/registration-lib/src/entities/event';
import libHelpers from '@crctech/registration-lib/src/ui/helpers';
import { IHouseholdEntity } from '@crctech/registration-lib/src/entities/household';
import { VForm } from '@/types';
import helpers from '@/ui/helpers';
import { localStorageKeys } from '@/constants/localStorage';

export default Vue.extend({
  name: 'PrimaryMemberDialog',

  components: {
    LibPersonalInformation,
    RcDialog,
    CurrentAddressForm,
  },

  props: {
    show: {
      type: Boolean,
      required: true,
    },

    shelterLocations: {
      type: Array as () => IEventGenericLocation[],
      required: true,
    },
  },

  data() {
    return {
      i18n: this.$i18n,
      backupPersonalInfo: null as IMember & IContactInformation,
      backupAddress: null as ICurrentAddress,
      apiKey: localStorage.getItem(localStorageKeys.googleMapsAPIKey.name)
        ? localStorage.getItem(localStorageKeys.googleMapsAPIKey.name)
        : process.env.VUE_APP_GOOGLE_API_KEY,
    };
  },

  computed: {
    canadianProvincesItems(): Record<string, unknown>[] {
      return libHelpers.getCanadianProvincesWithoutOther(this.i18n);
    },

    changedAddress():boolean {
      return !_isEqual(this.member.currentAddress, this.backupAddress);
    },

    changedPersonalInfo():boolean {
      return !_isEqual(this.$storage.registration.getters.personalInformation(), this.backupPersonalInfo);
    },

    currentAddressTypeItems(): Record<string, unknown>[] {
      return helpers.enumToTranslatedCollection(ECurrentAddressTypes, 'registration.addresses.temporaryAddressTypes');
    },

    member() : IMember {
      const household = this.$storage.registration.getters.householdCreate();
      return household?.primaryBeneficiary;
    },

    additionalMembers(): IMember[] {
      const household = this.$storage.registration.getters.householdCreate();
      return household?.additionalMembers;
    },

    title(): TranslateResult {
      const fullName = `${this.member.identitySet.firstName} ${this.member.identitySet.lastName}`;
      return this.$t('household.details.edit.title', { x: fullName });
    },
  },

  created() {
    this.backupPersonalInfo = this.$storage.registration.getters.personalInformation();
    this.backupAddress = _cloneDeep(this.member.currentAddress);
  },

  methods: {
    onCancel() {
      this.$storage.registration.mutations.setPersonalInformation(this.backupPersonalInfo);
      this.$storage.registration.mutations.setCurrentAddress(this.backupAddress);
      this.$emit('close');
    },

    async onSubmit() {
      const isValid = await (this.$refs.form as VForm).validate();
      if (isValid) {
        try {
          if (this.changedPersonalInfo) {
            await this.submitPersonalInfoUpdate();
          }

          if (this.changedAddress) {
            await this.submitAddressUpdate();
          }
        } finally {
          this.$emit('close');
        }
      }
    },

    setCurrentAddress(address: ICurrentAddress) {
      this.$storage.registration.mutations.setCurrentAddress(address);
    },

    async submitAddressUpdate() {
      await this.$storage.registration.actions.updatePersonAddress({ member: this.member, isPrimaryMember: true });

      if (this.additionalMembers) {
        await this.updateAdditionalMembersWithSameAddress();
      }
    },

    async submitPersonalInfoUpdate() {
      await this.$storage.registration.actions.updatePersonIdentity({ member: this.member, isPrimaryMember: true });
      await this.$storage.registration.actions.updatePersonContactInformation({ member: this.member, isPrimaryMember: true });
    },

    async updateAdditionalMembersWithSameAddress() {
      const promises = [] as Array<Promise<IHouseholdEntity>>;

      this.additionalMembers.forEach(async (member, index) => {
        if (_isEqual(member.currentAddress, this.member.currentAddress)) {
          promises.push(this.$storage.registration.actions.updatePersonAddress({
            member, isPrimaryMember: false, index, sameAddress: true,
          }) as Promise<IHouseholdEntity>);
        }
      });

      await Promise.all(promises);
    },
  },

});

</script>
