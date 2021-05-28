import Vue from 'vue';
import { TranslateResult } from 'vue-i18n';
import _isEqual from 'lodash/isEqual';
import _cloneDeep from 'lodash/cloneDeep';
import helpers from '../../../ui/helpers';
import { ECanadaProvinces, IOptionItemData, EOptionItemStatus } from '../../../types';
import { localStorageKeys } from '../../../constants/localStorage';
import { IShelterLocationData, IHouseholdCreate, IIdentitySet } from '../../../entities/household-create';

import { IMember } from '../../../entities/value-objects/member/index';
import { ECurrentAddressTypes, ICurrentAddress } from '../../../entities/value-objects/current-address/index';

/**
 * Mixin used for AdditionalMember form in review registration
 */

export default Vue.extend({
  data() {
    return {
      apiKey: localStorage.getItem(localStorageKeys.googleMapsAPIKey.name)
        ? localStorage.getItem(localStorageKeys.googleMapsAPIKey.name)
        : process.env.VUE_APP_GOOGLE_API_KEY,

      additionalMembers: [],
      showAdditionalMemberDelete: false,
      indexAdditionalMember: -1,
    };
  },

  computed: {

    householdCreate(): IHouseholdCreate {
      return this.$storage.household.getters.householdCreate();
    },

    additionalMembersCopy(): IMember[] {
      return _cloneDeep(this.householdCreate.additionalMembers);
    },

    genderItems(): IOptionItemData[] {
      return this.$storage.registration.getters.genders();
    },

    canadianProvincesItems(): Record<string, unknown>[] {
      // eslint-disable-next-line
      return helpers.getCanadianProvincesWithoutOther((this as any).i18n);
    },

    shelterLocations(): IShelterLocationData[] {
      const event = this.$storage.registration.getters.event();
      if (event) {
        return event.shelterLocations.filter((s: IShelterLocationData) => s.status === EOptionItemStatus.Active);
      }
      return [];
    },

    indigenousTypesItems(): Record<string, TranslateResult>[] {
      if (this.indexAdditionalMember !== -1) {
        return this.$storage.registration.getters.indigenousTypesItems(
          this.currentAdditionalMember.identitySet.indigenousProvince,
        );
      }
      return [];
    },

    indigenousCommunitiesItems(): Record<string, string>[] {
      if (this.indexAdditionalMember !== -1) {
        return this.$storage.registration.getters.indigenousCommunitiesItems(
          this.currentAdditionalMember.identitySet.indigenousProvince,
          this.currentAdditionalMember.identitySet.indigenousType,
        );
      }
      return [];
    },

    loadingIndigenousIdentities(): boolean {
      return this.$store.state.registration.loadingIndigenousIdentities;
    },

    currentAdditionalMember(): IMember {
      return this.additionalMembersCopy[this.indexAdditionalMember];
    },

    currentAddressTypeItems(): Record<string, unknown>[] {
      // eslint-disable-next-line
      const list = helpers.enumToTranslatedCollection(ECurrentAddressTypes, 'registration.addresses.temporaryAddressTypes', (this as any).i18n);
      return list.filter((item) => item.value !== ECurrentAddressTypes.RemainingInHome);
    },
  },

  created() {
    this.buildAdditionalMembersState();
  },

  methods: {
    cancelAllAdditionalMembers() {
      for (let i = 0; i < this.additionalMembers.length; i += 1) {
        this.cancelAdditionalMember(i);
      }
    },

    buildAdditionalMembersState() {
      const membersCount = this.householdCreate.additionalMembers.length;
      this.additionalMembers = [...new Array(membersCount)].map((_, index) => ({
        inlineEdit: false,
        backup: null,
        sameAddress: _isEqual(this.additionalMembersCopy[index].currentAddress, this.householdCreate.primaryBeneficiary.currentAddress),
      }));
    },

    editAdditionalMember(index: number) {
      this.indexAdditionalMember = index;
      this.additionalMembers[index].backup = _cloneDeep(this.householdCreate.additionalMembers[index]);
      this.additionalMembers[index].inlineEdit = true;
    },

    cancelAdditionalMember(index: number) {
      if (this.additionalMembers[index].inlineEdit) {
        this.additionalMembers[index].inlineEdit = false;
        this.$storage.household.mutations.editAdditionalMember(
          this.additionalMembers[index].backup, index, this.additionalMembers[index].sameAddress,
        );
      }
    },

    async submitAdditionalMember(index: number) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const isValid = await ((this.$refs[`additionalMember_${index}`] as any)[0]).validate();
      if (isValid) {
        this.additionalMembers[index].inlineEdit = false;

        // Not watcher on this form to mutate so we need to do it here
        this.$storage.household.mutations.editAdditionalMember(
          this.additionalMembersCopy[index], index, this.additionalMembers[index].sameAddress,
        );
      }
    },

    showDeleteDialog(index: number) {
      this.showAdditionalMemberDelete = true;
      this.indexAdditionalMember = index;
    },

    deleteAdditionalMember() {
      this.$storage.household.mutations.removeAdditionalMember(this.indexAdditionalMember);
      this.showAdditionalMemberDelete = false;
    },

    setIdentity(form: IIdentitySet) {
      if (this.currentAdditionalMember) {
        this.currentAdditionalMember.identitySet.setIdentity(form);
        this.$storage.household.mutations.editAdditionalMember(
          this.currentAdditionalMember,
          this.indexAdditionalMember,
          this.additionalMembers[this.indexAdditionalMember].sameAddress,
        );
      }
    },

    setIndigenousIdentity(form: IIdentitySet) {
      if (this.currentAdditionalMember) {
        this.currentAdditionalMember.identitySet.setIndigenousIdentity(form);
        this.$storage.household.mutations.editAdditionalMember(
          this.currentAdditionalMember,
          this.indexAdditionalMember,
          this.additionalMembers[this.indexAdditionalMember].sameAddress,
        );
      }
    },

    setCurrentAddress(form: ICurrentAddress) {
      if (this.currentAdditionalMember) {
        this.currentAdditionalMember.currentAddress = _cloneDeep(form);
        this.$storage.household.mutations.editAdditionalMember(
          this.currentAdditionalMember,
          this.indexAdditionalMember,
          this.additionalMembers[this.indexAdditionalMember].sameAddress,
        );
      }
    },

    async onIndigenousProvinceChange(provinceCode: ECanadaProvinces) {
      await this.$storage.registration.actions.fetchIndigenousIdentitiesByProvince(provinceCode);
    },
  },
});
