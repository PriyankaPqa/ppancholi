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
          <personal-information :i18n="i18n" :skip-phone-email-rules="skipPhoneEmailRules" />
        </validation-observer>
      </template>
      <personal-information-template :personal-information="getPersonalInformation" :show-age-in-review="showAgeInReview" />
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
          <addresses :i18n="i18n" />
        </validation-observer>
      </template>
      <addresses-template :household="householdCreate" />
    </summary-section>

    <div data-test="title" class="rc-heading-5  mb-2 mt-8 fw-bold">
      {{ `${$t('registration.household_members.title')} (${householdCreate.additionalMembers.length})` }}
    </div>

    <template v-for="(member, index) in additionalMembersCopy" data-test="leo">
      <additional-member-section
        :key="index"
        :data-test="`additionalMember_${index}`"
        :member="member"
        :inline-edit="additionalMembers[index].inlineEdit"
        @edit="editAdditionalMember(index)"
        @cancel="cancelAdditionalMember(index)"
        @submit="submitAdditionalMember(index)"
        @delete="showDeleteDialog(index)">
        <template #inline>
          <validation-observer :ref="`additionalMember_${index}`">
            <additional-member-form
              :api-key="apiKey"
              :i18n="i18n"
              :gender-items="genderItems"
              :current-address-type-items="currentAddressTypeItems"
              :canadian-provinces-items="canadianProvincesItems"
              :indigenous-communities-items="indigenousCommunitiesItems"
              :indigenous-types-items="indigenousTypesItems"
              :loading="loadingIndigenousIdentities"
              :member="member"
              :same-address.sync="additionalMembers[index].sameAddress"
              :shelter-locations="shelterLocations"
              @identity-change="setIdentity($event)"
              @indigenous-identity-change="setIndigenousIdentity($event)"
              @province-change="onIndigenousProvinceChange($event)"
              @temporary-address-change="setCurrentAddress($event)" />
          </validation-observer>
        </template>
        <additional-member-template :member="member" />
      </additional-member-section>
    </template>

    <rc-confirmation-dialog
      v-if="showAdditionalMemberDelete"
      submit-button-key="common.yes"
      cancel-button-key="common.no"
      :title="$t('common.deletion.title')"
      :show="showAdditionalMemberDelete"
      :messages="$t('registration.household_members.delete.message')"
      @close="showAdditionalMemberDelete = false"
      @cancel="showAdditionalMemberDelete = false"
      @submit="deleteAdditionalMember()" />
  </div>
</template>

<script lang="ts">
import { RcConfirmationDialog } from '@crctech/component-library';
import VueI18n from 'vue-i18n';
import { VForm } from '@/types';
import _cloneDeep from 'lodash/cloneDeep';
import mixins from 'vue-typed-mixins';
import { IContactInformation } from '../../entities/value-objects/contact-information';
import { IMember } from '../../entities/value-objects/member';
import additionalMemberForm from '../forms/mixins/additionalMemberForm';
import PersonalInformation from '../personal-information/PersonalInformation.vue';
import Addresses from '../addresses/Addresses.vue';
import PersonalInformationTemplate from './personal-information/PersonalInformationTemplate.vue';
import AddressesTemplate from './addresses/AddressesTemplate.vue';
import SummarySection from './SummarySection.vue';
import AdditionalMemberForm from '../additional-members/AdditionalMemberForm.vue';
import AdditionalMemberSection from './additional-members/AdditionalMemberSection.vue';
import AdditionalMemberTemplate from './additional-members/AdditionalMemberTemplate.vue';

export default mixins(additionalMemberForm).extend({
  name: 'ReviewRegistration',

  components: {
    AddressesTemplate,
    AdditionalMemberForm,
    AdditionalMemberSection,
    AdditionalMemberTemplate,
    PersonalInformationTemplate,
    SummarySection,
    PersonalInformation,
    Addresses,
    RcConfirmationDialog,
  },

  props: {
    i18n: {
      type: Object as () => VueI18n,
      required: true,
    },
    showAgeInReview: {
      type: Boolean,
      default: false,
    },
    skipPhoneEmailRules: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      personalInformation: {
        inlineEdit: false,
        backup: null,
      },
      addresses: {
        inlineEdit: false,
        backupCurrentAddress: null,
        backupHomeAddress: null,
      },
    };
  },

  computed: {
    getPersonalInformation(): IContactInformation & IMember {
      return this.$storage.household.getters.personalInformation();
    },
  },

  async beforeDestroy() {
    this.cancelPersonalInformation();
    this.cancelAddresses();
    this.cancelAllAdditionalMembers();
  },

  methods: {
    editPersonalInformation() {
      this.personalInformation.backup = _cloneDeep(this.getPersonalInformation);
      this.personalInformation.inlineEdit = true;
      this.$storage.registration.mutations.increaseInlineEditCounter();
    },

    editAddresses() {
      this.addresses.backupCurrentAddress = _cloneDeep(this.householdCreate.primaryBeneficiary.currentAddress);
      this.addresses.backupHomeAddress = _cloneDeep(this.householdCreate.homeAddress);
      this.addresses.inlineEdit = true;
      this.$storage.registration.mutations.increaseInlineEditCounter();
    },

    cancelPersonalInformation() {
      if (this.personalInformation.inlineEdit) {
        this.$storage.household.mutations.setPersonalInformation(this.personalInformation.backup);
        this.personalInformation.inlineEdit = false;
        this.$storage.registration.mutations.decreaseInlineEditCounter();
      }
    },

    cancelAddresses() {
      if (this.addresses.inlineEdit) {
        this.addresses.inlineEdit = false;
        this.$storage.registration.mutations.decreaseInlineEditCounter();
        this.$storage.household.mutations.setHomeAddress(this.addresses.backupHomeAddress);
        this.$storage.household.mutations.setCurrentAddress(this.addresses.backupCurrentAddress);
      }
    },

    async submitPersonalInformation() {
      const isValid = await (this.$refs.personalInfo as VForm).validate();
      if (isValid) {
        this.personalInformation.inlineEdit = false;
        this.$storage.registration.mutations.decreaseInlineEditCounter();
      }
    },

    async submitAddresses() {
      const isValid = await (this.$refs.addresses as VForm).validate();
      if (isValid) {
        this.addresses.inlineEdit = false;
        this.$storage.registration.mutations.decreaseInlineEditCounter();
      }
    },
  },
});
</script>
