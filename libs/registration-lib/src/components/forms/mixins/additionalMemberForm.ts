import Vue from 'vue';
import { TranslateResult } from 'vue-i18n';
import _isEqual from 'lodash/isEqual';
import _cloneDeep from 'lodash/cloneDeep';
import _debounce from 'lodash/debounce';
import helpers from '@libs/entities-lib/helpers';
import {
  IHouseholdCreate, IIdentitySet, IdentitySet,
} from '@libs/entities-lib/household-create';
import { IMember } from '@libs/entities-lib/value-objects/member/index';
import { ICurrentAddress } from '@libs/entities-lib/value-objects/current-address/index';
import { IOptionItemData } from '@libs/shared-lib/types';
import { useAddresses } from '@libs/registration-lib/components/forms/mixins/useAddresses';
import { EEventLocationStatus, IEventGenericLocation } from '@libs/entities-lib/event';
import { localStorageKeys } from '../../../constants/localStorage';

/**
 * Mixin used for AdditionalMember form in review registration
 */

export default Vue.extend({
  props: {
  },

  setup() {
    const { getCurrentAddressTypeItems } = useAddresses();
    return { getCurrentAddressTypeItems };
  },

  data() {
    return {
      apiKey: localStorage.getItem(localStorageKeys.googleMapsAPIKey.name)
        ? localStorage.getItem(localStorageKeys.googleMapsAPIKey.name)
        : process.env.VITE_GOOGLE_API_KEY,

      additionalMembers: [] as {
        personalInfoEdit: boolean,
        tempAddressEdit: boolean,
        backupIdentity: IIdentitySet,
        backupTempAddress: ICurrentAddress,
        sameAddress: boolean,
        backupSameAddress: boolean,
        loading: boolean,
      }[],
      showAdditionalMemberDelete: false,
      indexAdditionalMember: -1,
    };
  },

  computed: {

    householdCreate(): IHouseholdCreate {
      return this.$registrationStore.getHouseholdCreate();
    },

    additionalMembersCopy(): IMember[] {
      return _cloneDeep(this.householdCreate.additionalMembers);
    },

    genderItems(): IOptionItemData[] {
      return this.$registrationStore.getGenders();
    },

    canadianProvincesItems(): Record<string, unknown>[] {
      // eslint-disable-next-line
      return helpers.getCanadianProvincesWithoutOther((this as any).$i18n);
    },

    shelterLocations(): IEventGenericLocation[] {
      const event = this.$registrationStore.getEvent();
      if (event) {
        return event.shelterLocations.filter((s) => s.status === EEventLocationStatus.Active);
      }
      return [];
    },

    indigenousTypesItems(): Record<string, TranslateResult>[] {
      if (this.indexAdditionalMember !== -1) {
        return this.$registrationStore.getIndigenousTypesItems();
      }
      return [];
    },

    indigenousCommunitiesItems(): Record<string, string>[] {
      if (this.indexAdditionalMember !== -1) {
        return this.$registrationStore.getIndigenousCommunitiesItems(
          this.currentAdditionalMember.identitySet.indigenousType,
        );
      }
      return [];
    },

    loadingIndigenousCommunities(): boolean {
      return this.$registrationStore.loadingIndigenousCommunities;
    },

    currentAdditionalMember(): IMember {
      return this.additionalMembersCopy[this.indexAdditionalMember];
    },

    associationMode(): boolean {
      return this.$registrationStore.householdAssociationMode;
    },

    splitMode(): boolean {
      return this.$registrationStore.isSplitMode();
    },

    applySavesRightAway(): boolean {
      // when we are editing a household the save buttons are applied right away.  A split will apply everything only at the end.
      return !!this.householdCreate.id && !this.splitMode;
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
        personalInfoEdit: false,
        tempAddressEdit: false,
        backupIdentity: null,
        backupTempAddress: null,
        loading: false,
        sameAddress: _isEqual(this.additionalMembersCopy[index].currentAddress, this.householdCreate.primaryBeneficiary.currentAddress),
        backupSameAddress: _isEqual(this.additionalMembersCopy[index].currentAddress, this.householdCreate.primaryBeneficiary.currentAddress),
      }));
    },

    editAdditionalMember(index: number, section?: string) {
      this.indexAdditionalMember = index;
      if (section !== 'personalInfo') {
        this.additionalMembers[index].backupIdentity = this.additionalMembers[index].backupIdentity || _cloneDeep(this.householdCreate.additionalMembers[index].identitySet);
        this.additionalMembers[index].backupTempAddress = _cloneDeep(this.householdCreate.additionalMembers[index].currentAddress);
        this.additionalMembers[index].tempAddressEdit = true;
        this.additionalMembers[index].backupSameAddress = this.additionalMembers[index].sameAddress;
        this.$registrationStore.increaseInlineEditCounter();
      }

      if (section !== 'tempAddress') {
        this.additionalMembers[index].backupIdentity = _cloneDeep(this.householdCreate.additionalMembers[index].identitySet);
        this.additionalMembers[index].backupTempAddress = this.additionalMembers[index].backupTempAddress
          || _cloneDeep(this.householdCreate.additionalMembers[index].currentAddress);
          this.additionalMembers[index].personalInfoEdit = true;
        if (this.additionalMembers[index].backupSameAddress == null) {
          this.additionalMembers[index].backupSameAddress = this.additionalMembers[index].sameAddress;
        }
        this.$registrationStore.increaseInlineEditCounter();
      }
    },

    cancelAdditionalMember(index: number, section?: string) {
      const member = _cloneDeep(this.additionalMembersCopy[index]);
      if (section !== 'personalInfo' && this.additionalMembers[index].tempAddressEdit) {
        this.additionalMembers[index].tempAddressEdit = false;
        this.$registrationStore.decreaseInlineEditCounter();
        member.currentAddress = this.additionalMembers[index].backupTempAddress;
        this.additionalMembers[index].sameAddress = this.additionalMembers[index].backupSameAddress;
        this.$registrationStore.householdCreate.editAdditionalMember(member, index, this.additionalMembers[index].sameAddress);
      }
      if (section !== 'tempAddress' && this.additionalMembers[index].personalInfoEdit) {
        this.additionalMembers[index].personalInfoEdit = false;
        this.$registrationStore.decreaseInlineEditCounter();
        member.identitySet = this.additionalMembers[index].backupIdentity;
        this.$registrationStore.householdCreate.editAdditionalMember(member, index, this.additionalMembers[index].sameAddress);
      }
    },

    async submitAdditionalMember(index: number, section?: string) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const isValid = await ((this.$refs[`additionalMember_${index}`] as any)[0]).validate();
      if (isValid) {
        // Not watcher on this form to mutate so we need to do it here
        this.$registrationStore.householdCreate.editAdditionalMember(this.additionalMembersCopy[index], index, this.additionalMembers[index].sameAddress);

        if (this.applySavesRightAway && section !== 'tempAddress') {
          await this.updateMember(index);
        }

        if (section !== 'personalInfo') {
          this.additionalMembers[index].tempAddressEdit = false;
          this.$registrationStore.decreaseInlineEditCounter();
        }
        if (section !== 'tempAddress') {
          this.additionalMembers[index].personalInfoEdit = false;
          this.$registrationStore.decreaseInlineEditCounter();
        }
      } else {
        helpers.scrollToFirstError('app');
      }
    },

    async updateMember(index: number): Promise<boolean> {
      this.additionalMembers[index].loading = true;
      const member = this.householdCreate.additionalMembers[index];

      const resIdentity = await this.$services.households.updatePersonIdentity(
        member.id,
        !this.$registrationStore.isCRCRegistration(),
        { identitySet: member.identitySet, contactInformation: member.contactInformation },
      );
      if (!resIdentity) {
        member.identitySet = this.additionalMembers[index].backupIdentity;
        this.$registrationStore.householdCreate.editAdditionalMember(member, index, !this.additionalMembers[index].sameAddress);
        this.additionalMembers[index].loading = false;
        return;
      }
      this.$toasted.global.success(this.$t('registration.identity.updated'));

      if (!this.$hasFeature(this.$featureKeys.CaseFileIndividual) && this.isNewMemberCurrentAddress(index)) {
        const resAddress = await this.$services.households.updatePersonAddress(member.id, !this.$registrationStore.isCRCRegistration(), member.currentAddress);

        if (!resAddress) {
          member.currentAddress = this.additionalMembers[index].backupTempAddress;
          this.additionalMembers[index].sameAddress = !this.additionalMembers[index].sameAddress;
          this.$registrationStore.householdCreate.editAdditionalMember(member, index, !this.additionalMembers[index].sameAddress);
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
      if (this.applySavesRightAway) {
        const memberId = this.householdCreate.additionalMembers[this.indexAdditionalMember].id;
        const householdId = this.householdCreate.id;
        const index = this.indexAdditionalMember;
        const res = this.$registrationStore.deleteAdditionalMember({ householdId, memberId, index });
        if (!res) {
          return;
        }
      } else {
        this.$registrationStore.householdCreate.removeAdditionalMember(this.indexAdditionalMember);
      }
      this.$toasted.global.success(this.$t('registration.member.removed'));
      this.showAdditionalMemberDelete = false;
    },

   setIdentity(form: IIdentitySet) {
      if (this.currentAdditionalMember) {
        this.currentAdditionalMember.identitySet.setIdentity(form);
        this.$registrationStore.householdCreate.editAdditionalMember(
          this.currentAdditionalMember,
          this.indexAdditionalMember,
          this.additionalMembers[this.indexAdditionalMember].sameAddress,
          );

          this.additionalMembers[this.indexAdditionalMember].loading = true;
          this.checkDuplicates(new IdentitySet(form));
      }
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    checkDuplicates: _debounce(async function func(this:any, form: IIdentitySet) {
      await this.$registrationStore.checkDuplicates({ form, isPrimaryMember: false, index: this.indexAdditionalMember });
      this.additionalMembers[this.indexAdditionalMember].loading = false;
    }, 500),

    setIndigenousIdentity(form: IIdentitySet) {
      if (this.currentAdditionalMember) {
        this.currentAdditionalMember.identitySet.setIndigenousIdentity(form);
        this.$registrationStore.householdCreate.editAdditionalMember(
          this.currentAdditionalMember,
          this.indexAdditionalMember,
          this.additionalMembers[this.indexAdditionalMember].sameAddress,
        );
      }
    },

    setCurrentAddress(form: ICurrentAddress) {
      if (this.currentAdditionalMember) {
        this.currentAdditionalMember.currentAddress = _cloneDeep(form);
        this.$registrationStore.householdCreate.editAdditionalMember(
          this.currentAdditionalMember,
          this.indexAdditionalMember,
          this.additionalMembers[this.indexAdditionalMember].sameAddress,
        );
      }
    },

    isNewMemberCurrentAddress(index: number): boolean {
      return !_isEqual(this.householdCreate.additionalMembers[index].currentAddress, this.additionalMembers[index].backupTempAddress);
    },

    makeShelterLocationsListForMember(m: IMember) {
      if (m.currentAddress?.shelterLocation) {
        return [m.currentAddress.shelterLocation, ...this.shelterLocations];
      }
      return this.shelterLocations;
    },

    makeCurrentAddressTypeItems(m: IMember): Record<string, unknown>[] {
      const hasShelterLocations = !!this.makeShelterLocationsListForMember(m)?.length;
      return this.getCurrentAddressTypeItems(this.$i18n, this.householdCreate?.noFixedHome, hasShelterLocations);
    },
  },
});
