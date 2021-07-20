import Vue from 'vue';
import { TranslateResult } from 'vue-i18n';
import _isEqual from 'lodash/isEqual';
import _cloneDeep from 'lodash/cloneDeep';
import helpers from '../../../ui/helpers';
import { IOptionItemData, EOptionItemStatus } from '../../../types';
import { localStorageKeys } from '../../../constants/localStorage';
import {
  IShelterLocationData, IHouseholdCreate, IIdentitySet,
} from '../../../entities/household-create';

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
      return this.$storage.registration.getters.householdCreate();
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
        return this.$storage.registration.getters.indigenousTypesItems();
      }
      return [];
    },

    indigenousCommunitiesItems(): Record<string, string>[] {
      if (this.indexAdditionalMember !== -1) {
        return this.$storage.registration.getters.indigenousCommunitiesItems(
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

    associationMode(): boolean {
      return this.$store.state.registration.householdAssociationMode;
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
        loading: false,
        sameAddress: _isEqual(this.additionalMembersCopy[index].currentAddress, this.householdCreate.primaryBeneficiary.currentAddress),
        backupSameAddress: _isEqual(this.additionalMembersCopy[index].currentAddress, this.householdCreate.primaryBeneficiary.currentAddress),
      }));
    },

    editAdditionalMember(index: number) {
      this.indexAdditionalMember = index;
      this.additionalMembers[index].backup = _cloneDeep(this.householdCreate.additionalMembers[index]);
      this.additionalMembers[index].inlineEdit = true;
      this.additionalMembers[index].backupSameAddress = this.additionalMembers[index].sameAddress;
      this.$storage.registration.mutations.increaseInlineEditCounter();
    },

    cancelAdditionalMember(index: number) {
      if (this.additionalMembers[index].inlineEdit) {
        this.additionalMembers[index].inlineEdit = false;
        this.additionalMembers[index].sameAddress = this.additionalMembers[index].backupSameAddress;
        this.$storage.registration.mutations.decreaseInlineEditCounter();
        this.$storage.registration.mutations.editAdditionalMember(
          this.additionalMembers[index].backup, index, this.additionalMembers[index].backupSameAddress,
        );
      }
    },

    async submitAdditionalMember(index: number) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const isValid = await ((this.$refs[`additionalMember_${index}`] as any)[0]).validate();
      if (isValid) {
        // Not watcher on this form to mutate so we need to do it here
        this.$storage.registration.mutations.editAdditionalMember(
          this.additionalMembersCopy[index], index, this.additionalMembers[index].sameAddress,
        );

        if (this.associationMode) {
          await this.updateMember(index);
        }
        this.additionalMembers[index].inlineEdit = false;
        this.$storage.registration.mutations.decreaseInlineEditCounter();
      } else {
        helpers.scrollToFirstError('app');
      }
    },

    async updateMember(index: number): Promise<boolean> {
      this.additionalMembers[index].loading = true;
      const member = this.householdCreate.additionalMembers[index];

      const resIdentity = await this.$services.households.updatePersonIdentity(member.id, member.identitySet);
      if (!resIdentity) {
        this.$storage.registration.mutations.editAdditionalMember(this.additionalMembers[index].backup, index, !this.additionalMembers[index].sameAddress);
        this.additionalMembers[index].loading = false;
        return;
      }
      this.$toasted.global.success(this.$t('registration.identity.updated'));

      if (this.isNewMemberCurrentAddress(index)) {
        const resAddress = await this.$services.households.updatePersonAddress(member.id, member.currentAddress);

        if (!resAddress) {
          const backUpWithUpdatedIdentity = {
            ...this.additionalMembers[index].backup,
            identitySet: member.identitySet,
          };
          this.additionalMembers[index].sameAddress = !this.additionalMembers[index].sameAddress;
          this.$storage.registration.mutations.editAdditionalMember(backUpWithUpdatedIdentity, index, !this.additionalMembers[index].sameAddress);
          this.additionalMembers[index].loading = false;
          return;
        }

        this.$toasted.global.success(this.$t('registration.currentAddress.updated'));
      }

      this.additionalMembers[index].loading = false;
    },

    showDeleteDialog(index: number) {
      this.showAdditionalMemberDelete = true;
      this.indexAdditionalMember = index;
    },

    deleteAdditionalMember() {
      if (this.associationMode) {
        const member = this.householdCreate.additionalMembers[this.indexAdditionalMember];
        const res = this.$services.households.deleteAdditionalMember(this.householdCreate.id, member.id);
        if (!res) {
          return;
        }
      }
      this.$toasted.global.success(this.$t('registration.member.removed'));
      this.$storage.registration.mutations.removeAdditionalMember(this.indexAdditionalMember);
      this.showAdditionalMemberDelete = false;
    },

    setIdentity(form: IIdentitySet) {
      if (this.currentAdditionalMember) {
        this.currentAdditionalMember.identitySet.setIdentity(form);
        this.$storage.registration.mutations.editAdditionalMember(
          this.currentAdditionalMember,
          this.indexAdditionalMember,
          this.additionalMembers[this.indexAdditionalMember].sameAddress,
        );
      }
    },

    setIndigenousIdentity(form: IIdentitySet) {
      if (this.currentAdditionalMember) {
        this.currentAdditionalMember.identitySet.setIndigenousIdentity(form);
        this.$storage.registration.mutations.editAdditionalMember(
          this.currentAdditionalMember,
          this.indexAdditionalMember,
          this.additionalMembers[this.indexAdditionalMember].sameAddress,
        );
      }
    },

    setCurrentAddress(form: ICurrentAddress) {
      if (this.currentAdditionalMember) {
        this.currentAdditionalMember.currentAddress = _cloneDeep(form);
        this.$storage.registration.mutations.editAdditionalMember(
          this.currentAdditionalMember,
          this.indexAdditionalMember,
          this.additionalMembers[this.indexAdditionalMember].sameAddress,
        );
      }
    },

    isNewMemberCurrentAddress(index: number): boolean {
      return !_isEqual(this.householdCreate.additionalMembers[index].currentAddress, this.additionalMembers[index].backup.currentAddress);
    },
  },
});
