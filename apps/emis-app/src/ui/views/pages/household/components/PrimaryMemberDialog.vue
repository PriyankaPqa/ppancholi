<template>
  <validation-observer ref="form" v-slot="{ failed, pristine }">
    <rc-dialog
      :title="title"
      :show.sync="show"
      :cancel-action-label="$t('common.buttons.cancel')"
      :submit-action-label="makePrimaryMode ? $t('household.profile.member.make_primary') : $t('common.save')"
      :content-only-scrolling="true"
      fullscreen
      persistent
      show-close
      :submit-button-disabled="submitButtonDisabled(failed, pristine)"
      scroll-anchor-id="dialogScrollAnchor"
      @close="onCancel"
      @cancel="onCancel"
      @submit="validateEmailAndSubmit">
      <v-row class="justify-center">
        <v-col cols="12" md="8">
          <div v-if="makePrimaryMode" class="mb-6">
            <span class=" fw-bold rc-body14"> {{ $t('household.profile.member.make_primary.missing_info', { name: memberName }) }} </span>
            <h3 class="pt-6 pb-3">
              {{ $t('registration.menu.privacy') }}
            </h3>
            <crc-privacy-statement :i18n="i18n" :registration-locations="registrationLocations" />
          </div>
          <h3 v-if="makePrimaryMode" class="py-4">
            {{ $t('registration.menu.personal_info') }}
          </h3>
          <lib-personal-information
            :i18n="i18n"
            :member-props="member"
            skip-phone-email-rules
            include-inactive-options
            @setIdentity="setIdentity"
            @setIndigenousIdentity="setIndigenousIdentity"
            @setContactInformation="setContactInformation" />
          <current-address-form
            :shelter-locations="shelterLocations"
            :canadian-provinces-items="canadianProvincesItems"
            :current-address-type-items="currentAddressTypeItems"
            :api-key="apiKey"
            :current-address="member.currentAddress"
            :no-fixed-home="false"
            :disable-autocomplete="!enableAutocomplete"
            prefix-data-test="tempAddress"
            @change="setCurrentAddress($event)" />
        </v-col>
      </v-row>
    </rc-dialog>
  </validation-observer>
</template>

<script lang='ts'>
import Vue from 'vue';
import _cloneDeep from 'lodash/cloneDeep';
import _isEqual from 'lodash/isEqual';
import LibPersonalInformation from '@libs/registration-lib/components/personal-information/PersonalInformation.vue';
import CurrentAddressForm from '@libs/registration-lib/components/forms/CurrentAddressForm.vue';
import CrcPrivacyStatement from '@libs/registration-lib/components/privacy-statement/CrcPrivacyStatement.vue';

import { RcDialog } from '@libs/component-lib/components';
import {
  ContactInformation,
  CurrentAddress,
  ECurrentAddressTypes, IContactInformation, ICurrentAddress, IdentitySet, IIdentitySet, IMember,
} from '@libs/entities-lib/household-create';
import { TranslateResult } from 'vue-i18n';
import { IEventGenericLocation } from '@libs/entities-lib/registration-event';
import libHelpers from '@libs/entities-lib/helpers';
import { IHouseholdEntity } from '@libs/entities-lib/household';
import { VForm } from '@libs/shared-lib/types';
import helpers from '@/ui/helpers/helpers';
import { localStorageKeys } from '@/constants/localStorage';
import { FeatureKeys } from '@libs/entities-lib/tenantSettings';
import { EventHub } from '@libs/shared-lib/plugins/event-hub';
import { EEventLocationStatus } from '@libs/entities-lib/event';

export default Vue.extend({
  name: 'PrimaryMemberDialog',

  components: {
    LibPersonalInformation,
    RcDialog,
    CurrentAddressForm,
    CrcPrivacyStatement,
  },

  props: {
    show: {
      type: Boolean,
      required: true,
    },

    makePrimaryMode: {
      type: Boolean,
      default: false,
    },

    memberId: {
      type: String,
      default: null,
    },

    shelterLocations: {
      type: Array as () => IEventGenericLocation[],
      required: true,
    },

    registrationLocations: {
      type: Array as () => IEventGenericLocation[],
      default: null,
    },
  },

  data() {
    return {
      i18n: this.$i18n,
      backupIdentitySet: null as IIdentitySet,
      backupContactInfo: null as IContactInformation,
      backupAddress: null as ICurrentAddress,
      allMembers: [] as IMember[],
      member: null as IMember,
      additionalMembers: [] as IMember[],
      submitLoading: false,
      apiKey: localStorage.getItem(localStorageKeys.googleMapsAPIKey.name)
        ? localStorage.getItem(localStorageKeys.googleMapsAPIKey.name)
        : process.env.VITE_GOOGLE_API_KEY,
    };
  },

  computed: {
    canadianProvincesItems(): Record<string, unknown>[] {
      return libHelpers.getCanadianProvincesWithoutOther(this.i18n);
    },

    changedAddress():boolean {
      return !_isEqual(new CurrentAddress(this.member.currentAddress), new CurrentAddress(this.backupAddress));
    },

    changedIdentitySet():boolean {
      return !_isEqual(this.member.identitySet, new IdentitySet(this.backupIdentitySet));
    },

    changedContactInfo():boolean {
      const adjustedBackupData = { ...this.backupContactInfo, emailValidatedByBackend: this.member.contactInformation.emailValidatedByBackend };
      return !_isEqual(new ContactInformation(this.member.contactInformation), new ContactInformation(adjustedBackupData));
    },

    currentAddressTypeItems(): Record<string, unknown>[] {
      let items = helpers.enumToTranslatedCollection(ECurrentAddressTypes, 'registration.addresses.temporaryAddressTypes');

      const shelterLocationAvailable = this.shelterLocations?.some((s) => s.status === EEventLocationStatus.Active)
                                     || this.member.currentAddress.shelterLocation;
      if (!shelterLocationAvailable) {
        items = items.filter((i) => i.value !== ECurrentAddressTypes.Shelter);
      }

      return items;
    },

    memberName(): string {
      return `${this.member.identitySet.firstName} ${this.member.identitySet.lastName}`;
    },

    title(): TranslateResult {
      if (!this.makePrimaryMode) {
        return this.$t('household.details.edit.title', { x: this.memberName });
      }
      return this.$t('household.profile.member.make_primary');
    },

    submitButtonDisabled(): (failed: boolean, pristine:boolean) => boolean {
      return (failed, pristine) => failed || (pristine && !this.changedAddress && !this.makePrimaryMode) || this.submitLoading;
    },

    enableAutocomplete(): boolean {
      return this.$hasFeature(FeatureKeys.AddressAutoFill);
    },
  },

  created() {
    const household = this.$storage.registration.getters.householdCreate();
    // eslint-disable-next-line no-unsafe-optional-chaining
    this.allMembers = [household?.primaryBeneficiary, ...household?.additionalMembers];
    this.member = this.allMembers.filter((m) => m.id === this.memberId)[0] || this.allMembers[0];
    this.additionalMembers = this.allMembers.filter((m) => m !== this.member);
    this.backupIdentitySet = _cloneDeep(this.member.identitySet);
    this.backupContactInfo = _cloneDeep(this.member.contactInformation);
    this.backupAddress = _cloneDeep(this.member.currentAddress);
  },

  methods: {
    onCancel() {
      this.$storage.registration.mutations.setIsPrivacyAgreed(false);
      this.$emit('close');
    },

    validateEmailAndSubmit() {
      this.submitLoading = true;
      EventHub.$emit('checkEmailValidation', this.onSubmit);
    },

    async onSubmit() {
      const isValid = await (this.$refs.form as VForm).validate();
      if (isValid) {
        let ok = true;
        if (this.changedIdentitySet) {
          ok = !!await this.$storage.registration.actions.updatePersonIdentity({ member: this.member, isPrimaryMember: true });
        }

        if (ok && this.changedContactInfo) {
          ok = !!await this.$storage.registration.actions.updatePersonContactInformation({ member: this.member, isPrimaryMember: true });
        }

        if (ok && this.makePrimaryMode) {
          const household = this.$storage.registration.getters.householdCreate();
          ok = !!await this.$services.households.makePrimary(household.id, this.member.id, household.consentInformation);
          this.$storage.registration.mutations.setIsPrivacyAgreed(false);
        }

        if (ok && this.changedAddress) {
          ok = !!await this.submitAddressUpdate();
        }
        this.$emit('close');
      } else {
        this.submitLoading = false;
        helpers.scrollToFirstError('dialogScrollAnchor');
      }
    },

    setIdentity(ident: IIdentitySet) {
      this.member.identitySet.setIdentity(ident);
    },

    setIndigenousIdentity(ident: IIdentitySet) {
      this.member.identitySet.setIndigenousIdentity(ident);
    },

    setContactInformation(contact: IContactInformation) {
      this.member.contactInformation = contact;
    },

    setCurrentAddress(address: ICurrentAddress) {
      this.member.setCurrentAddress(address);
    },

    async submitAddressUpdate() {
      const address = await this.$storage.registration.actions.updatePersonAddress({ member: this.member, isPrimaryMember: true });
      let ok = !!address;
      if (ok && this.additionalMembers) {
        const addresses = await this.updateAdditionalMembersWithSameAddress();
        ok = addresses.filter((a) => !a).length === 0;
      }
      return ok;
    },

    async updateAdditionalMembersWithSameAddress() {
      const promises = [] as Array<Promise<IHouseholdEntity>>;

      this.additionalMembers.forEach(async (otherMember, index) => {
        if (_isEqual(otherMember.currentAddress, this.backupAddress)) {
          otherMember.setCurrentAddress(this.member.currentAddress);
          promises.push(this.$storage.registration.actions.updatePersonAddress({
            member: otherMember, isPrimaryMember: false, index,
          }) as Promise<IHouseholdEntity>);
        }
      });

      const addresses = await Promise.all(promises);
      return addresses;
    },
  },

});

</script>
