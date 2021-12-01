<template>
  <div id="summary">
    <template v-if="associationMode || splitMode">
      <div v-if="!hideName" class="mb-8" data-test="summary__existingBeneficiary__section">
        <span class="rc-heading-3">{{ getPersonalInformation.firstName }} {{ getPersonalInformation.lastName }}</span>
        <div class="rc-body14">
          {{ $t('registration.details.registered') }} {{ moment(householdCreate.primaryBeneficiary.created).format('ll') }}
        </div>
      </div>
      <slot name="previous-events" />
      <template v-if="!householdAlreadyRegistered && !splitMode">
        <div data-test="title" class="rc-heading-5 fw-bold  mb-2 mt-8">
          {{ $t('registration.menu.privacy') }}
        </div>
        <validation-observer ref="privacyStatement">
          <crc-privacy-statement :i18n="i18n" />
        </validation-observer>
      </template>
    </template>
    <validation-observer ref="personalInfo">
      <summary-section
        :show-edit-button="!householdAlreadyRegistered && !splitMode"
        data-test="personalInformation"
        :title="$t('registration.menu.personal_info')"
        :inline-edit="personalInformation.inlineEdit"
        :loading="personalInformation.loading"
        @edit="editPersonalInformation()"
        @cancel="cancelPersonalInformation()"
        @submit="submitPersonalInformation()">
        <template #inline>
          <personal-information :recaptcha-key="recaptchaKey" :i18n="i18n" :skip-phone-email-rules="skipPhoneEmailRules" />
        </template>
        <personal-information-template :personal-information="getPersonalInformation" :show-age-in-review="showAgeInReview" />
      </summary-section>
    </validation-observer>

    <validation-observer ref="addresses">
      <summary-section
        :show-edit-button="!householdAlreadyRegistered && !splitMode"
        data-test="addresses"
        :title="$t('registration.menu.addresses')"
        :inline-edit="addresses.inlineEdit"
        :loading="addresses.loading"
        @edit="editAddresses()"
        @cancel="cancelAddresses()"
        @submit="submitAddresses()">
        <template #inline>
          <addresses :i18n="i18n" />
        </template>
        <addresses-template :household="householdCreate" />
      </summary-section>
    </validation-observer>

    <div data-test="title" class="rc-heading-5 mb-2 mt-8 fw-bold d-flex justify-space-between align-center">
      <div>
        {{ `${$t('registration.household_members.title')} (${householdCreate.additionalMembers.length})` }}
      </div>
      <v-btn
        v-if="associationMode || !splitMode"
        class="ml-2"
        color="primary"
        :disabled="disabledAddMembers"
        data-test="add-additionalMember"
        @click.native="addAdditionalMember()">
        <v-icon left>
          mdi-plus
        </v-icon> {{ $t('registration.household_members.add.label') }}
      </v-btn>
    </div>

    <template v-for="(member, index) in additionalMembersCopy">
      <validation-observer :ref="`additionalMember_${index}`" :key="index" slim>
        <additional-member-section
          :key="index"
          :show-edit-button="!householdAlreadyRegistered && !splitMode"
          :show-delete-button="!householdAlreadyRegistered && !splitMode"
          :data-test="`additionalMember_${index}`"
          :member="member"
          :inline-edit="additionalMembers[index].inlineEdit"
          :loading="additionalMembers[index].loading"
          @edit="editAdditionalMember(index)"
          @cancel="cancelAdditionalMember(index)"
          @submit="submitAdditionalMember(index)"
          @delete="showDeleteDialog(index)">
          <template #inline>
            <additional-member-form
              :api-key="apiKey"
              :i18n="i18n"
              :gender-items="genderItems"
              :current-address-type-items="currentAddressTypeItems"
              :canadian-provinces-items="canadianProvincesItems"
              :indigenous-communities-items="indigenousCommunitiesItems"
              :indigenous-types-items="indigenousTypesItems"
              :loading="loadingIndigenousCommunities"
              :member="member"
              :same-address.sync="additionalMembers[index].sameAddress"
              :shelter-locations="shelterLocations"
              @identity-change="setIdentity($event)"
              @indigenous-identity-change="setIndigenousIdentity($event)"
              @temporary-address-change="setCurrentAddress($event)" />
          </template>
          <additional-member-template :member="member" />
        </additional-member-section>
      </validation-observer>
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

    <add-edit-additional-members
      v-if="showAddAdditionalMember"
      :i18n="i18n"
      :household-id="householdCreate.id"
      :show.sync="showAddAdditionalMember"
      :index="-1"
      :member="newAdditionalMember" />
  </div>
</template>

<script lang="ts">
import { RcConfirmationDialog } from '@crctech/component-library';
import VueI18n from 'vue-i18n';
import { VForm } from '@/types';
import _cloneDeep from 'lodash/cloneDeep';
import mixins from 'vue-typed-mixins';
import CrcPrivacyStatement from '@/components/privacy-statement/CrcPrivacyStatement.vue';
import moment from 'moment';
import { IHouseholdCreate, IIdentitySet, Member } from '@/entities/household-create';
import _isEqual from 'lodash/isEqual';

import helpers from '@/ui/helpers';
import { MAX_ADDITIONAL_MEMBERS } from '@/constants/validations';
import AddEditAdditionalMembers from '@/components/additional-members/AddEditAdditionalMembers.vue';
import { IContactInformation } from '../../entities/value-objects/contact-information';
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
    CrcPrivacyStatement,
    AddEditAdditionalMembers,
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
    hideName: {
      type: Boolean,
      default: false,
    },
    recaptchaKey: {
      type: String,
      default: '',
    },
  },

  data() {
    return {
      moment,
      personalInformation: {
        inlineEdit: false,
        backup: null,
        loading: false,
      },
      addresses: {
        inlineEdit: false,
        backupCurrentAddress: null,
        backupHomeAddress: null,
        backupNoFixedHome: null,
        loading: false,
      },
      showAddAdditionalMember: false,
      disabledAddMembers: false,
      newAdditionalMember: null,
    };
  },

  computed: {
    getPersonalInformation(): IContactInformation & IIdentitySet {
      return this.$storage.registration.getters.personalInformation();
    },

    associationMode(): boolean {
      return this.$store.state.registration.householdAssociationMode;
    },

    splitMode(): boolean {
      return this.$storage.registration.getters.isSplitMode();
    },

    householdAlreadyRegistered(): boolean {
      return this.$store.state.registration.householdAlreadyRegistered;
    },
  },

  async beforeDestroy() {
    this.cancelPersonalInformation();
    this.cancelAddresses();
    this.cancelAllAdditionalMembers();
  },

  watch: {
    additionalMembersCopy() {
      if (this.additionalMembers.length !== this.additionalMembersCopy.length) {
        this.buildAdditionalMembersState();
      }
    },
  },

  methods: {
    editPersonalInformation() {
      this.personalInformation.backup = _cloneDeep(this.getPersonalInformation);
      this.personalInformation.inlineEdit = true;
      this.$storage.registration.mutations.increaseInlineEditCounter();
    },

    editAddresses() {
      const householdCopy = _cloneDeep(this.householdCreate);
      this.addresses.backupCurrentAddress = householdCopy.primaryBeneficiary.currentAddress;
      this.addresses.backupHomeAddress = householdCopy.homeAddress;
      this.addresses.inlineEdit = true;
      this.addresses.backupNoFixedHome = householdCopy.noFixedHome;
      this.$storage.registration.mutations.increaseInlineEditCounter();
    },

    cancelPersonalInformation() {
      if (this.personalInformation.inlineEdit) {
        this.$storage.registration.mutations.setPersonalInformation(this.personalInformation.backup);
        this.personalInformation.inlineEdit = false;
        this.$storage.registration.mutations.decreaseInlineEditCounter();
      }
    },

    cancelAddresses() {
      if (this.addresses?.inlineEdit) {
        this.addresses.inlineEdit = false;
        this.$storage.registration.mutations.decreaseInlineEditCounter();
        this.$storage.registration.mutations.setHomeAddress(this.addresses.backupHomeAddress);
        this.$storage.registration.mutations.setNoFixedHome(this.addresses.backupNoFixedHome);
        this.$storage.registration.mutations.setCurrentAddress(this.addresses.backupCurrentAddress);
      }
    },

    async submitPersonalInformation() {
      const isValid = await (this.$refs.personalInfo as VForm).validate();
      if (isValid) {
        if (this.associationMode) {
          await this.updatePersonalInformation();
        }
        this.personalInformation.inlineEdit = false;
        this.$storage.registration.mutations.decreaseInlineEditCounter();
      } else {
        helpers.scrollToFirstError('app');
      }
    },

    async updatePersonalInformation() {
      this.personalInformation.loading = true;

      const resIdentity = await this.$services.households.updatePersonIdentity(
        this.householdCreate.primaryBeneficiary.id,
        {
          contactInformation: this.householdCreate.primaryBeneficiary.contactInformation,
          identitySet: this.householdCreate.primaryBeneficiary.identitySet,
        },
      );

      if (!resIdentity) {
        this.$storage.registration.mutations.setIdentity(this.personalInformation.backup);
        this.personalInformation.loading = false;
        return;
      }

      this.$toasted.global.success(this.$t('registration.identity.updated'));

      const resContactInfo = await this.$services.households.updatePersonContactInformation(
        this.householdCreate.primaryBeneficiary.id,
        {
          contactInformation: this.householdCreate.primaryBeneficiary.contactInformation,
          identitySet: this.householdCreate.primaryBeneficiary.identitySet,
          isPrimaryBeneficiary: true,
        },
      );

      if (!resContactInfo) {
        this.$storage.registration.mutations.setContactInformation(this.personalInformation.backup);
        this.personalInformation.loading = false;
        return;
      }
      this.personalInformation.loading = false;
      this.$toasted.global.success(this.$t('registration.contactInformation.updated'));
    },

    async submitAddresses() {
      const isValid = await (this.$refs.addresses as VForm).validate();
      if (isValid) {
        if (this.associationMode) {
          await this.updateAddresses();
        }
        this.addresses.inlineEdit = false;
        this.$storage.registration.mutations.decreaseInlineEditCounter();
      } else {
        helpers.scrollToFirstError('app');
      }
    },

    async updateAddresses() {
      this.addresses.loading = true;
      const primaryBeneficiaryId = this.householdCreate.primaryBeneficiary.id;
      const householdId = this.householdCreate.id;

      if (this.isNewHomeAddress()) {
        const resHomeAddress = await this.updateHomeAddress(householdId, this.householdCreate);

        if (!resHomeAddress) {
          this.$storage.registration.mutations.setHomeAddress(this.addresses.backupHomeAddress);
          this.addresses.loading = false;
          return;
        }
        this.$toasted.global.success(this.$t('registration.homeAddress.updated'));
      }

      if (this.isNewPrimaryCurrentAddress()) {
        const resCurrentAddress = await this.$services.households.updatePersonAddress(primaryBeneficiaryId, this.householdCreate.primaryBeneficiary.currentAddress);

        if (!resCurrentAddress) {
          this.$storage.registration.mutations.setCurrentAddress(this.addresses.backupCurrentAddress);
          this.addresses.loading = false;
          return;
        }
        this.addresses.loading = false;
        this.$toasted.global.success(this.$t('registration.currentAddress.updated'));
      }
      this.addresses.loading = false;
    },

    async updateHomeAddress(householdId: uuid, household: IHouseholdCreate) {
      let res;
      if (household.noFixedHome) {
        res = await this.$services.households.updateNoFixedHomeAddress(householdId);
      } else {
        res = await this.$services.households.updateHomeAddress(householdId, household.homeAddress);
      }
      return res;
    },

    isNewHomeAddress(): boolean {
      return !_isEqual(this.householdCreate.homeAddress, this.addresses.backupHomeAddress);
    },

    isNewPrimaryCurrentAddress(): boolean {
      return !_isEqual(this.householdCreate.primaryBeneficiary.currentAddress, this.addresses.backupCurrentAddress);
    },

    addAdditionalMember() {
      if (this.householdCreate.additionalMembers.length < MAX_ADDITIONAL_MEMBERS) {
        this.newAdditionalMember = new Member();
        this.showAddAdditionalMember = true;
      } else {
        this.$toasted.global.warning(this.$t('warning.MAX_ADDITIONAL_MEMBERS_reached', { x: MAX_ADDITIONAL_MEMBERS }));
        this.disabledAddMembers = true;
      }
    },
  },
});
</script>
