<template>
  <div id="summary">
    <summary-section
      data-test="personalInformation"
      :title="$t('registration.menu.personal_info')"
      :inline-edit="personalInformation.inlineEdit"
      @edit="editPersonalInformation()"
      @cancel="cancelPersonalInformation()"
      @submit="submitPersonalInformation()">
      <template #inline>
        <validation-observer ref="personalInfo">
          <personal-information />
        </validation-observer>
      </template>
      <personal-information-template :personal-information="getPersonalInformation" />
    </summary-section>

    <summary-section
      data-test="addresses"
      :title="$t('registration.menu.addresses')"
      :inline-edit="addresses.inlineEdit"
      @edit="editAddresses()"
      @cancel="cancelAddresses()"
      @submit="submitAddresses()">
      <template #inline>
        <validation-observer ref="addresses">
          <addresses />
        </validation-observer>
      </template>
      <addresses-template :beneficiary="beneficiary" />
    </summary-section>

    <div data-test="title" class="rc-heading-5  mb-2 mt-8 fw-bold">
      {{ `${$t('registration.household_members.title')} (${beneficiary.householdMembers.length})` }}
    </div>

    <template v-for="(person, index) in householdMembersCopy" data-test="leo">
      <household-member-section
        :key="index"
        :data-test="`householdMember_${index}`"
        :person="person"
        :inline-edit="householdMembers[index].inlineEdit"
        @edit="editHouseholdMember(index)"
        @cancel="cancelHouseholdMember(index)"
        @submit="submitHouseholdMember(index)"
        @delete="showDeleteDialog(index)">
        <template #inline>
          <validation-observer :ref="`householdMember_${index}`">
            <household-member-form
              :gender-items="genderItems"
              :canadian-provinces-items="canadianProvincesItems"
              :indigenous-communities-items="indigenousCommunitiesItems"
              :indigenous-types-items="indigenousTypesItems"
              :loading="loadingIndigenousIdentities"
              :person="person"
              :same-address.sync="householdMembers[index].sameAddress"
              @identity-change="setIdentity($event)"
              @indigenous-identity-change="setIndigenousIdentity($event)"
              @province-change="onIndigenousProvinceChange($event)" />
          </validation-observer>
        </template>
        <household-member-template :person="person" />
      </household-member-section>
    </template>

    <rc-confirmation-dialog
      v-if="showHouseholdMemberDelete"
      submit-button-key="common.yes"
      cancel-button-key="common.no"
      :title="$t('common.deletion.title')"
      :show="showHouseholdMemberDelete"
      :messages="$t('registration.household_members.delete.message')"
      @close="showHouseholdMemberDelete = false"
      @cancel="showHouseholdMemberDelete = false"
      @submit="deleteHouseholdMember()" />
  </div>
</template>

<script lang="ts">
import PersonalInformationTemplate from '@/ui/views/pages/registration/review/personal-information/PersonalInformationTemplate.vue';
import PersonalInformation from '@/ui/views/pages/registration/personal-information/PersonalInformation.vue';
import SummarySection from '@/ui/views/pages/registration/review/SummarySection.vue';
import Addresses from '@/ui/views/pages/registration/addresses/Addresses.vue';
import AddressesTemplate from '@/ui/views/pages/registration/review/addresses/AddressesTemplate.vue';
import Vue from 'vue';
import { IContactInformation } from '@/entities/value-objects/contact-information';
import { IPerson } from '@/entities/value-objects/person';
import { IBeneficiary } from '@/entities/beneficiary';
import { ECanadaProvinces, IOptionItemData, VForm } from '@/types';
import _cloneDeep from 'lodash/cloneDeep';
import HouseholdMemberSection from '@/ui/views/pages/registration/review/household-members/HouseholdMemberSection.vue';
import HouseholdMemberForm from '@/ui/views/pages/registration/household-members/HouseholdMemberForm.vue';
import HouseholdMemberTemplate
  from '@/ui/views/pages/registration/review/household-members/HouseholdMemberTemplate.vue';
import _isEqual from 'lodash/isEqual';
import { RcConfirmationDialog } from '@crctech/component-library';
import utils from '@/entities/utils';
import { TranslateResult } from 'vue-i18n';

export default Vue.extend({
  name: 'ReviewRegistration',

  components: {
    HouseholdMemberForm,
    HouseholdMemberSection,
    SummarySection,
    PersonalInformationTemplate,
    PersonalInformation,
    Addresses,
    AddressesTemplate,
    HouseholdMemberTemplate,
    RcConfirmationDialog,
  },

  data() {
    return {
      personalInformation: {
        inlineEdit: false,
        backup: null,
      },
      addresses: {
        inlineEdit: false,
        backupTemporaryAddress: null,
        backupHomeAddress: null,
      },
      householdMembers: [],
      showHouseholdMemberDelete: false,
      indexHouseholdMember: -1,
    };
  },

  computed: {
    householdMembersCopy(): IPerson[] {
      return _cloneDeep(this.beneficiary.householdMembers);
    },

    beneficiary(): IBeneficiary {
      return this.$storage.beneficiary.getters.beneficiary();
    },

    getPersonalInformation(): IContactInformation & IPerson {
      return this.$storage.beneficiary.getters.personalInformation();
    },

    genderItems(): IOptionItemData[] {
      return this.$storage.registration.getters.genders();
    },

    canadianProvincesItems(): Record<string, unknown>[] {
      return utils.enumToTranslatedCollection(ECanadaProvinces, 'common.provinces');
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

  },

  created() {
    this.buildHouseholdMembersState();
  },

  async beforeDestroy() {
    this.cancelPersonalInformation();
    this.cancelAddresses();
    this.cancelAllHouseholdMembers();
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

    editPersonalInformation() {
      this.personalInformation.backup = _cloneDeep(this.getPersonalInformation);
      this.personalInformation.inlineEdit = true;
    },

    editAddresses() {
      this.addresses.backupTemporaryAddress = _cloneDeep(this.beneficiary.person.temporaryAddress);
      this.addresses.backupHomeAddress = _cloneDeep(this.beneficiary.homeAddress);
      this.addresses.inlineEdit = true;
    },

    editHouseholdMember(index: number) {
      this.indexHouseholdMember = index;
      this.householdMembers[index].backup = _cloneDeep(this.beneficiary.householdMembers[index]);
      this.householdMembers[index].inlineEdit = true;
    },

    cancelPersonalInformation() {
      if (this.personalInformation.inlineEdit) {
        this.$storage.beneficiary.mutations.setPersonalInformation(this.personalInformation.backup);
        this.personalInformation.inlineEdit = false;
      }
    },

    cancelHouseholdMember(index: number) {
      if (this.householdMembers[index].inlineEdit) {
        this.householdMembers[index].inlineEdit = false;
        this.$storage.beneficiary.mutations.editHouseholdMember(
          this.householdMembers[index].backup, index, this.householdMembers[index].sameAddress,
        );
      }
    },

    cancelAddresses() {
      if (this.addresses.inlineEdit) {
        this.addresses.inlineEdit = false;
        this.$storage.beneficiary.mutations.setHomeAddress(this.addresses.backupHomeAddress);
        this.$storage.beneficiary.mutations.setTemporaryAddress(this.addresses.backupTemporaryAddress);
      }
    },

    async submitPersonalInformation() {
      const isValid = await (this.$refs.personalInfo as VForm).validate();
      if (isValid) {
        this.personalInformation.inlineEdit = false;
      }
    },

    async submitAddresses() {
      const isValid = await (this.$refs.addresses as VForm).validate();
      if (isValid) {
        this.addresses.inlineEdit = false;
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

    async onIndigenousProvinceChange(provinceCode: ECanadaProvinces) {
      await this.$storage.registration.actions.fetchIndigenousIdentitiesByProvince(provinceCode);
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
  },
});
</script>
