import Vue from 'vue';
import { TranslateResult } from 'vue-i18n';
import _isEqual from 'lodash/isEqual';
import _cloneDeep from 'lodash/cloneDeep';
import helpers from '../../../ui/helpers';
import { ECanadaProvinces, IOptionItemData, EOptionItemStatus } from '../../../types';
import { localStorageKeys } from '../../../constants/localStorage';
import { IShelterLocation, IBeneficiary } from '../../../entities/beneficiary';

import { IPerson } from '../../../entities/value-objects/person/index';
import { ETemporaryAddressTypes, ITemporaryAddress } from '../../../entities/value-objects/temporary-address/index';

/**
 * Mixin used for householdmember form in review registration
 */

export default Vue.extend({
  data() {
    return {
      apiKey: localStorage.getItem(localStorageKeys.googleMapsAPIKey.name)
        ? localStorage.getItem(localStorageKeys.googleMapsAPIKey.name)
        : process.env.VUE_APP_GOOGLE_API_KEY,

      householdMembers: [],
      showHouseholdMemberDelete: false,
      indexHouseholdMember: -1,
    };
  },

  computed: {

    beneficiary(): IBeneficiary {
      return this.$storage.beneficiary.getters.beneficiary();
    },

    householdMembersCopy(): IPerson[] {
      return _cloneDeep(this.beneficiary.householdMembers);
    },

    genderItems(): IOptionItemData[] {
      return this.$storage.registration.getters.genders();
    },

    canadianProvincesItems(): Record<string, unknown>[] {
      // eslint-disable-next-line
      return helpers.getCanadianProvincesWithoutOther((this as any).i18n);
    },

    shelterLocations(): IShelterLocation[] {
      const event = this.$storage.registration.getters.event();
      if (event) {
        return event.shelterLocations.filter((s: IShelterLocation) => s.status === EOptionItemStatus.Active);
      }
      return [];
    },

    indigenousTypesItems(): Record<string, TranslateResult>[] {
      if (this.indexHouseholdMember !== -1) {
        return this.$storage.registration.getters.indigenousTypesItems(
          this.currentHouseholdMember.indigenousProvince,
        );
      }
      return [];
    },

    indigenousCommunitiesItems(): Record<string, string>[] {
      if (this.indexHouseholdMember !== -1) {
        return this.$storage.registration.getters.indigenousCommunitiesItems(
          this.currentHouseholdMember.indigenousProvince,
          this.currentHouseholdMember.indigenousType,
        );
      }
      return [];
    },

    loadingIndigenousIdentities(): boolean {
      return this.$store.state.registration.loadingIndigenousIdentities;
    },

    currentHouseholdMember(): IPerson {
      return this.householdMembersCopy[this.indexHouseholdMember];
    },

    temporaryAddressTypeItems(): Record<string, unknown>[] {
      const list = helpers.enumToTranslatedCollection(ETemporaryAddressTypes, 'registration.addresses.temporaryAddressTypes');
      return list.filter((item) => item.value !== ETemporaryAddressTypes.RemainingInHome);
    },
  },

  created() {
    this.buildHouseholdMembersState();
  },

  methods: {
    cancelAllHouseholdMembers() {
      for (let i = 0; i < this.householdMembers.length; i += 1) {
        this.cancelHouseholdMember(i);
      }
    },

    buildHouseholdMembersState() {
      const membersCount = this.beneficiary.householdMembers.length;
      this.householdMembers = [...new Array(membersCount)].map((_, index) => ({
        inlineEdit: false,
        backup: null,
        sameAddress: _isEqual(this.householdMembersCopy[index].temporaryAddress, this.beneficiary.person.temporaryAddress),
      }));
    },

    editHouseholdMember(index: number) {
      this.indexHouseholdMember = index;
      this.householdMembers[index].backup = _cloneDeep(this.beneficiary.householdMembers[index]);
      this.householdMembers[index].inlineEdit = true;
    },

    cancelHouseholdMember(index: number) {
      if (this.householdMembers[index].inlineEdit) {
        this.householdMembers[index].inlineEdit = false;
        this.$storage.beneficiary.mutations.editHouseholdMember(
          this.householdMembers[index].backup, index, this.householdMembers[index].sameAddress,
        );
      }
    },

    async submitHouseholdMember(index: number) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const isValid = await ((this.$refs[`householdMember_${index}`] as any)[0]).validate();
      if (isValid) {
        this.householdMembers[index].inlineEdit = false;

        // Not watcher on this form to mutate so we need to do it here
        this.$storage.beneficiary.mutations.editHouseholdMember(
          this.householdMembersCopy[index], index, this.householdMembers[index].sameAddress,
        );
      }
    },

    showDeleteDialog(index: number) {
      this.showHouseholdMemberDelete = true;
      this.indexHouseholdMember = index;
    },

    deleteHouseholdMember() {
      this.$storage.beneficiary.mutations.removeHouseholdMember(this.indexHouseholdMember);
      this.showHouseholdMemberDelete = false;
    },

    setIdentity(form: IPerson) {
      if (this.currentHouseholdMember) {
        this.currentHouseholdMember.setIdentity(form);
        this.$storage.beneficiary.mutations.editHouseholdMember(
          this.currentHouseholdMember,
          this.indexHouseholdMember,
          this.householdMembers[this.indexHouseholdMember].sameAddress,
        );
      }
    },

    setIndigenousIdentity(form: IPerson) {
      if (this.currentHouseholdMember) {
        this.currentHouseholdMember.setIndigenousIdentity(form);
        this.$storage.beneficiary.mutations.editHouseholdMember(
          this.currentHouseholdMember,
          this.indexHouseholdMember,
          this.householdMembers[this.indexHouseholdMember].sameAddress,
        );
      }
    },

    setTemporaryAddress(form: ITemporaryAddress) {
      if (this.currentHouseholdMember) {
        this.currentHouseholdMember.temporaryAddress = _cloneDeep(form);
        this.$storage.beneficiary.mutations.editHouseholdMember(
          this.currentHouseholdMember,
          this.indexHouseholdMember,
          this.householdMembers[this.indexHouseholdMember].sameAddress,
        );
      }
    },

    async onIndigenousProvinceChange(provinceCode: ECanadaProvinces) {
      await this.$storage.registration.actions.fetchIndigenousIdentitiesByProvince(provinceCode);
    },
  },
});
