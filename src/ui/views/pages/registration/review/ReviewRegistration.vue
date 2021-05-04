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
              :api-key="apiKey"
              :gender-items="genderItems"
              :temporary-address-type-items="temporaryAddressTypeItems"
              :canadian-provinces-items="canadianProvincesItems"
              :indigenous-communities-items="indigenousCommunitiesItems"
              :indigenous-types-items="indigenousTypesItems"
              :loading="loadingIndigenousIdentities"
              :person="person"
              :same-address.sync="householdMembers[index].sameAddress"
              :shelter-locations="shelterLocations"
              @identity-change="setIdentity($event)"
              @indigenous-identity-change="setIndigenousIdentity($event)"
              @province-change="onIndigenousProvinceChange($event)"
              @temporary-address-change="setTemporaryAddress($event)" />
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
import { IContactInformation } from '@crctech/registration-lib/src/entities/value-objects/contact-information';
import { IPerson } from '@crctech/registration-lib/src/entities/value-objects/person';
import { VForm } from '@/types';
import _cloneDeep from 'lodash/cloneDeep';
import HouseholdMemberSection from '@/ui/views/pages/registration/review/household-members/HouseholdMemberSection.vue';
import { HouseholdMemberForm } from '@crctech/registration-lib';

import HouseholdMemberTemplate
  from '@/ui/views/pages/registration/review/household-members/HouseholdMemberTemplate.vue';
import { RcConfirmationDialog } from '@crctech/component-library';
import mixins from 'vue-typed-mixins';
import householdMemberForm from '@/ui/mixins/householdMemberForm';

export default mixins(householdMemberForm).extend({
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
    };
  },

  computed: {
    getPersonalInformation(): IContactInformation & IPerson {
      return this.$storage.beneficiary.getters.personalInformation();
    },
  },

  async beforeDestroy() {
    this.cancelPersonalInformation();
    this.cancelAddresses();
    this.cancelAllHouseholdMembers();
  },

  methods: {
    editPersonalInformation() {
      this.personalInformation.backup = _cloneDeep(this.getPersonalInformation);
      this.personalInformation.inlineEdit = true;
    },

    editAddresses() {
      this.addresses.backupTemporaryAddress = _cloneDeep(this.beneficiary.person.temporaryAddress);
      this.addresses.backupHomeAddress = _cloneDeep(this.beneficiary.homeAddress);
      this.addresses.inlineEdit = true;
    },

    cancelPersonalInformation() {
      if (this.personalInformation.inlineEdit) {
        this.$storage.beneficiary.mutations.setPersonalInformation(this.personalInformation.backup);
        this.personalInformation.inlineEdit = false;
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
  },
});
</script>
