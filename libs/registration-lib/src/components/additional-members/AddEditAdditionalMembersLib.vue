<template>
  <validation-observer ref="form" v-slot="{ failed }" slim>
    <rc-dialog
      :title="getTitle"
      :cancel-action-label="$t('common.cancel')"
      :submit-action-label="editMode ? $t('common.save') : $t('common.add')"
      :show.sync="show"
      :content-only-scrolling="true"
      :persistent="true"
      fullscreen
      :submit-button-disabled="failed || submitDisabled"
      :loading="submitLoading"
      @cancel="cancel()"
      @close="cancel()"
      @submit="validate()">
      <v-row id="additionalMemberDialog" justify="center" class="mt-12" no-gutters>
        <v-col cols="12" xl="8" lg="8" md="11" sm="11" xs="12">
          <additional-member-form
            :api-key="apiKey"
            :shelter-locations="shelterLocations"
            :same-address.sync="sameAddress"
            :gender-items="genderItems"
            :canadian-provinces-items="canadianProvincesItems"
            :indigenous-communities-items="indigenousCommunitiesItems"
            :indigenous-types-items="indigenousTypesItems"
            :current-address-type-items="currentAddressTypeItems"
            :loading="loadingIndigenousCommunities"
            :member="memberClone"
            :disable-autocomplete="disableAutocomplete"
            :hide-edit-temporary-address="hideEditTemporaryAddress"
            :can-set-specific-address="canSetSpecificAddress"
            @identity-change="setIdentity($event)"
            @indigenous-identity-change="setIndigenousIdentity($event)"
            @temporary-address-change="setCurrentAddress($event)" />
        </v-col>
      </v-row>
    </rc-dialog>
  </validation-observer>
</template>

<script lang="ts">
import { RcDialog } from '@libs/component-lib/components';
import Vue from 'vue';
import { TranslateResult } from 'vue-i18n';
import _isEqual from 'lodash/isEqual';
import _debounce from 'lodash/debounce';
import _cloneDeep from 'lodash/cloneDeep';
import { IdentitySet, IIdentitySet, MemberDuplicateStatus } from '@libs/entities-lib/value-objects/identity-set';
import helpers from '@libs/entities-lib/helpers';
import {
  IOptionItemData,
  VForm,
} from '@libs/shared-lib/types';
import { ICurrentAddress } from '@libs/entities-lib/value-objects/current-address';
import { IMember } from '@libs/entities-lib/value-objects/member';
import { useAddresses } from '@libs/registration-lib/components/forms/mixins/useAddresses';
import { FeatureKeys } from '@libs/entities-lib/tenantSettings';
import { EEventLocationStatus, IEventGenericLocation } from '@libs/entities-lib/event';
import { localStorageKeys } from '../../constants/localStorage';
import AdditionalMemberForm from './AdditionalMemberForm.vue';

export default Vue.extend({
  name: 'AddEditAdditionalMembers',

  components: {
    AdditionalMemberForm,
    RcDialog,
  },

  props: {
    show: {
      type: Boolean,
      required: true,
    },

    member: {
      type: Object as () => IMember,
      required: true,
    },

    index: {
      type: Number,
      required: true,
    },

    shelterLocationsList: {
      type: Array as () => IEventGenericLocation[],
      default: null,
    },

    householdId: {
      type: String,
      default: '',
    },

    submitChangesToService: {
      type: Boolean,
      default: false,
    },

    disableAutocomplete: {
      type: Boolean,
      required: true,
    },

    hideEditTemporaryAddress: {
      type: Boolean,
      default: false,
    },

    canSetSpecificAddress: {
      type: Boolean,
      default: true,
    },
  },

  setup() {
    const { getCurrentAddressTypeItems } = useAddresses();
    return { getCurrentAddressTypeItems };
  },

  data() {
    return {
      sameAddress: null,
      apiKey: localStorage.getItem(localStorageKeys.googleMapsAPIKey.name)
        ? localStorage.getItem(localStorageKeys.googleMapsAPIKey.name)
        : process.env.VITE_GOOGLE_API_KEY,
      backupPerson: null as IMember,
      backupSameAddress: null as boolean,
      addressChanged: false,
      identityChanged: false,
      submitLoading: false,
      memberClone: null as IMember,
    };
  },

  computed: {
    sameAddressChanged(): boolean {
      return this.sameAddress !== this.backupSameAddress;
    },

    primaryBeneficiaryAddress(): ICurrentAddress {
      return this.$registrationStore.getHouseholdCreate().primaryBeneficiary.currentAddress;
    },

    editMode(): boolean {
      return this.index !== -1;
    },

    getTitle(): TranslateResult {
      if (this.editMode) {
        if (this.submitChangesToService) {
          const fullName = `${this.memberClone.identitySet.firstName} ${this.memberClone.identitySet.lastName}`;
          return this.$t('household.details.edit.title', { x: fullName });
        }
        return this.$t('registration.household_member.edit.title');
      }
      return this.$t('registration.household_member.add.title');
    },

    genderItems(): IOptionItemData[] {
      return this.$registrationStore.getGenders();
    },

    canadianProvincesItems(): Record<string, unknown>[] {
      return helpers.getCanadianProvincesWithoutOther(this.$i18n);
    },

    indigenousTypesItems(): Record<string, TranslateResult>[] {
      return this.$registrationStore.getIndigenousTypesItems();
    },

    indigenousCommunitiesItems(): Record<string, string>[] {
      return this.$registrationStore.getIndigenousCommunitiesItems(
        this.memberClone.identitySet.indigenousType,
      );
    },

    loadingIndigenousCommunities(): boolean {
      return this.$registrationStore.loadingIndigenousCommunities;
    },

    currentAddressTypeItems(): Record<string, unknown>[] {
      const noFixedHome = this.$registrationStore.householdCreate?.noFixedHome;
      return this.getCurrentAddressTypeItems(this.$i18n, noFixedHome, !!this.shelterLocations?.length, !this.$hasFeature(FeatureKeys.RemainingInHomeForAdditionalMembers));
    },

    shelterLocations(): IEventGenericLocation[] {
      const locations = this.shelterLocationsList || this.$registrationStore.getEvent()?.shelterLocations || [];
      return locations.filter((s) => s.status === EEventLocationStatus.Active || s.id === this.member?.currentAddress?.shelterLocation?.id);
    },

    submitDisabled():boolean {
      const isMemberDuplicate = !this.$registrationStore.isCRCRegistration()
      && this.identityChanged && this.memberClone.identitySet.getMemberDuplicateStatus() === MemberDuplicateStatus.Duplicate;
      return (!this.identityChanged && !this.addressChanged && !this.sameAddressChanged) || isMemberDuplicate;
    },
  },

  created() {
    this.memberClone = _cloneDeep(this.member);
    if (this.editMode) {
      this.sameAddress = _isEqual(this.member.currentAddress, this.primaryBeneficiaryAddress);
      this.backupSameAddress = this.sameAddress;
      this.backupPerson = _cloneDeep(this.member);
    }
  },

  methods: {
    cancel() {
      if (this.editMode) {
        this.$registrationStore.householdCreate.editAdditionalMember(this.backupPerson, this.index, this.backupSameAddress);
      }
      this.close();
    },

    close() {
      this.$emit('update:show', false);
      this.$emit('close');
    },

    async validate() {
      const isValid = await (this.$refs.form as VForm).validate();

      if (!isValid) {
        helpers.scrollToFirstErrorDialog('additionalMemberDialog');
        return;
      }

      this.submitLoading = true;

      if (this.editMode) {
        if (this.submitChangesToService) {
          await this.submitChanges();
        } else {
          this.$registrationStore.householdCreate.editAdditionalMember(this.memberClone, this.index, this.sameAddress);
        }
      } else {
        if (this.submitChangesToService) {
          await this.$registrationStore.addAdditionalMember({
            householdId: this.householdId,
            member: this.memberClone,
            sameAddress: this.sameAddress,
            caseFileIndividualMode: this.$hasFeature(FeatureKeys.CaseFileIndividual),
          });
        } else {
          this.$registrationStore.householdCreate.addAdditionalMember(this.memberClone, this.sameAddress);
        }
        this.$emit('add');
      }
      this.close();
    },

    async submitChanges() {
      if (this.addressChanged || this.sameAddressChanged) {
        const updatedAddress = await this.$registrationStore.updatePersonAddress({
          member: this.memberClone, isPrimaryMember: false, index: this.index, sameAddress: this.sameAddress,
        });
        if (!updatedAddress) {
          this.cancel();
          return;
        }
      }

      if (this.identityChanged) {
        const updatedIdentity = await this.$registrationStore.updatePersonIdentity({ member: this.memberClone, isPrimaryMember: false, index: this.index });
        if (!updatedIdentity) {
          this.cancel();
        }
      }
    },

    setIdentity(form: IIdentitySet) {
      if (!_isEqual(form, this.backupPerson?.identitySet)) {
        this.identityChanged = true;
      }
        this.submitLoading = true;
        this.checkDuplicates(new IdentitySet(form));
    },

    setIndigenousIdentity(form: IIdentitySet) {
      if (!_isEqual(form, this.backupPerson?.identitySet)) {
        this.identityChanged = true;
      }
      this.memberClone.identitySet.setIndigenousIdentity(form);
      // Update the member data, so the indigenous communities list get recalculated
      this.$registrationStore.householdCreate.editAdditionalMember(this.memberClone, this.index, this.sameAddress);
    },

    setCurrentAddress(form: ICurrentAddress) {
      if (!_isEqual(form, this.backupPerson?.currentAddress)) {
        this.addressChanged = true;
      }
      this.memberClone.setCurrentAddress(form);
    },

         // eslint-disable-next-line @typescript-eslint/no-explicit-any
    checkDuplicates: _debounce(async function func(this:any, form: IIdentitySet) {
      await this.$registrationStore.checkDuplicates({ form, isPrimaryMember: false, index: this.index });
      this.memberClone.identitySet.setIdentity(form);
      this.submitLoading = false;
    }, 500),
  },
});
</script>

<style scoped lang="scss">
@import "@libs/shared-lib/assets/styles/breakpoints";

@media only screen and (min-width: $breakpoint-xs-min) and (max-width: $breakpoint-xs-max) {
  .additionalMembersForm {
    margin: 0px;
    padding: 0px 0px 8px !important;
  }
}
@media only screen and (min-width: $breakpoint-sm-min) and (max-width: $breakpoint-md-max) {
  .additionalMembersForm {
    margin: 0px;
    padding: 8px 0px 16px !important;
  }
}
@media only screen and (min-width: $breakpoint-lg-min) {
  .additionalMembersForm {
    margin: 0px;
    padding: 16px 276px 16px !important;
  }
}
</style>
