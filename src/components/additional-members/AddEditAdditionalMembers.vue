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
      :submit-button-disabled="failed"
      @cancel="cancel()"
      @close="cancel()"
      @submit="validate()">
      <v-row justify="center" class="mt-12" no-gutters>
        <v-col cols="12" xl="8" lg="8" md="11" sm="11" xs="12">
          <additional-member-form
            :api-key="apiKey"
            :i18n="i18n"
            :shelter-locations="shelterLocationsList || shelterLocations"
            :same-address.sync="sameAddress"
            :gender-items="genderItems"
            :canadian-provinces-items="canadianProvincesItems"
            :indigenous-communities-items="indigenousCommunitiesItems"
            :indigenous-types-items="indigenousTypesItems"
            :current-address-type-items="currentAddressTypeItems"
            :loading="loadingIndigenousCommunities"
            :member="member"
            :in-household-profile="inHouseholdProfile"
            @identity-change="setIdentity($event)"
            @indigenous-identity-change="setIndigenousIdentity($event)"
            @temporary-address-change="setCurrentAddress($event)" />
        </v-col>
      </v-row>
    </rc-dialog>
  </validation-observer>
</template>

<script lang="ts">
import { RcDialog } from '@crctech/component-library';
import Vue from 'vue';
import VueI18n, { TranslateResult } from 'vue-i18n';
import _isEqual from 'lodash/isEqual';
import _cloneDeep from 'lodash/cloneDeep';

import { IIdentitySet } from '@/entities/value-objects/identity-set';
import {
  EOptionItemStatus,
  IOptionItemData,
  VForm,
} from '../../types';
import helpers from '../../ui/helpers';

import { localStorageKeys } from '../../constants/localStorage';
import {
  ECurrentAddressTypes, ICurrentAddress, IShelterLocationData,
} from '../../entities/value-objects/current-address/index';
import { IMember } from '../../entities/value-objects/member';
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
      type: Array as () => IShelterLocationData[],
      default: null,
    },

    i18n: {
      type: Object as () => VueI18n,
      required: true,
    },

    inHouseholdProfile: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      sameAddress: true,
      apiKey: localStorage.getItem(localStorageKeys.googleMapsAPIKey.name)
        ? localStorage.getItem(localStorageKeys.googleMapsAPIKey.name)
        : process.env.VUE_APP_GOOGLE_API_KEY,
      backupPerson: null,
      backupSameAddress: null,
    };
  },

  computed: {
    primaryBeneficiaryAddress(): ICurrentAddress {
      return this.$storage.registration.getters.householdCreate().primaryBeneficiary.currentAddress;
    },

    editMode(): boolean {
      return this.index !== -1;
    },

    getTitle(): TranslateResult {
      if (this.editMode) {
        if (this.inHouseholdProfile) {
          const fullName = `${this.member.identitySet.firstName} ${this.member.identitySet.lastName}`;
          return this.$t('household.details.edit.title', { x: fullName });
        }
        return this.$t('registration.household_member.edit.title');
      }
      return this.$t('registration.household_member.add.title');
    },

    genderItems(): IOptionItemData[] {
      return this.$storage.registration.getters.genders();
    },

    canadianProvincesItems(): Record<string, unknown>[] {
      return helpers.getCanadianProvincesWithoutOther(this.i18n);
    },

    indigenousTypesItems(): Record<string, TranslateResult>[] {
      return this.$storage.registration.getters.indigenousTypesItems();
    },

    indigenousCommunitiesItems(): Record<string, string>[] {
      return this.$storage.registration.getters.indigenousCommunitiesItems(
        this.member.identitySet.indigenousType,
      );
    },

    loadingIndigenousCommunities(): boolean {
      return this.$store.state.registration.loadingIndigenousCommunities;
    },

    currentAddressTypeItems(): Record<string, unknown>[] {
      const list = helpers.enumToTranslatedCollection(ECurrentAddressTypes, 'registration.addresses.temporaryAddressTypes', this.i18n);
      return list.filter((item) => item.value !== ECurrentAddressTypes.RemainingInHome);
    },

    shelterLocations(): IShelterLocationData[] {
      const event = this.$storage.registration.getters.event();
      if (event && event.shelterLocations) {
        return event.shelterLocations.filter((s: IShelterLocationData) => s.status === EOptionItemStatus.Active);
      }
      return [];
    },
  },

  mounted() {
    if (this.editMode) {
      this.sameAddress = _isEqual(this.member.currentAddress, this.primaryBeneficiaryAddress);
      this.backupSameAddress = this.sameAddress;
      this.backupPerson = _cloneDeep(this.member);
    }
  },

  methods: {
    cancel() {
      if (this.editMode) {
        this.$storage.registration.mutations.editAdditionalMember(this.backupPerson, this.index, this.backupSameAddress);
      }
      this.close();
    },

    close() {
      this.$emit('update:show', false);
    },

    async validate() {
      const isValid = await (this.$refs.form as VForm).validate();

      if (!isValid) {
        helpers.scrollToFirstErrorDialog('additionalMemberDialog');
        return;
      }

      if (this.editMode) {
        if (this.inHouseholdProfile) {
          await this.submitChanges();
        } else {
          this.$storage.registration.mutations.editAdditionalMember(this.member, this.index, this.sameAddress);
        }
      } else {
        this.$storage.registration.mutations.addAdditionalMember(this.member, this.sameAddress);
        this.$emit('add');
      }
      this.close();
    },

    async submitChanges() {
      const updatedIdentity = await this.$storage.registration.actions.updatePersonIdentity({ member: this.member, isPrimaryMember: false, index: this.index });
      const updatedAddress = await this.$storage.registration.actions.updatePersonAddress({
        member: this.member, isPrimaryMember: false, index: this.index, sameAddress: this.sameAddress,
      });

      if (!updatedIdentity || !updatedAddress) {
        this.cancel();
      }
    },

    setIdentity(form: IIdentitySet) {
      this.member.identitySet.setIdentity(form);
    },

    setIndigenousIdentity(form: IIdentitySet) {
      this.member.identitySet.setIndigenousIdentity(form);
      // Update the member data, so the indigenous communities list get recalculated
      this.$storage.registration.mutations.editAdditionalMember(this.member, this.index, this.sameAddress);
    },

    setCurrentAddress(form: ICurrentAddress) {
      this.member.setCurrentAddress(form);
    },
  },
});
</script>

<style scoped lang="scss">
@import "../../../src/styles/breakpoints";

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
