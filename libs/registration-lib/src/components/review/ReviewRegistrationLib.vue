<template>
  <div id="summary">
    <template v-if="associationMode || splitMode">
      <div v-if="!hideName" class="mb-8" data-test="summary__existingBeneficiary__section">
        <span class="rc-heading-3">{{ getPersonalInformation.firstName }} {{ getPersonalInformation.lastName }}</span>
        <div class="rc-body14">
          {{ $t('registration.details.registered') }} {{ format(new Date(householdCreate.primaryBeneficiary.created), 'MMM d, yyyy') }}
        </div>
      </div>
      <slot name="previous-events" :household-id="householdCreate.id" />
      <template v-if="!householdAlreadyRegistered && !splitMode">
        <div data-test="title" class="rc-heading-5 fw-bold  mb-2 mt-8">
          {{ $t('registration.menu.privacy') }}
        </div>
        <validation-observer ref="privacyStatement">
          <crc-privacy-statement :i18n="i18n" :user="user" :consent-statements="consentStatements" />
        </validation-observer>
      </template>
    </template>
    <validation-observer ref="personalInfo" v-slot="{ failed }">
      <message-box
        class="rc-body12"
        small-icon
        icon="mdi-alert"
        icon-color="var(--v-notification_warning-base)"
        :styles="{
          'background-color': 'var(--v-status_yellow_pale-base)',
          color: 'var(--v-grey-darken4)',
        }"
        :message="$t('registration.review.personalinfo')" />
      <summary-section
        :show-edit-button="!householdAlreadyRegistered && !splitMode"
        data-test="personalInformation"
        :title="$t('registration.menu.personal_info')"
        :inline-edit="personalInformation.inlineEdit"
        :loading="personalInformation.loading"
        :submit-disabled="failed || isDuplicate"
        @edit="editPersonalInformation()"
        @cancel="cancelPersonalInformation()"
        @submit="validateEmailAndSubmitPersonalInfo()">
        <template #inline>
          <personal-information-lib :i18n="i18n" :skip-phone-email-rules="skipPhoneEmailRules" is-edit-mode />
        </template>
        <personal-information-template :personal-information="getPersonalInformation" :show-age-in-review="showAgeInReview" />
      </summary-section>
    </validation-observer>

    <validation-observer ref="addresses" v-slot="{ failed }">
      <message-box
        class="rc-body12 mt-8"
        small-icon
        icon="mdi-alert"
        icon-color="var(--v-notification_warning-base)"
        :styles="{
          'background-color': 'var(--v-status_yellow_pale-base)',
          color: 'var(--v-grey-darken4)',
        }"
        :message="$t('registration.review.addresses')" />
      <summary-section
        :show-edit-button="!householdAlreadyRegistered && !splitMode"
        data-test="addresses"
        :title="$t('registration.menu.addresses')"
        :inline-edit="addresses.inlineEdit"
        :loading="addresses.loading"
        :submit-disabled="failed"
        @edit="editAddresses()"
        @cancel="cancelAddresses()"
        @submit="submitAddresses()">
        <template #inline>
          <addresses-lib :i18n="i18n" :disable-autocomplete="disableAutocomplete" is-edit-mode />
        </template>
        <addresses-template :household="householdCreate" />
      </summary-section>
    </validation-observer>

    <message-box
      class="rc-body12 mt-8"
      small-icon
      icon="mdi-alert"
      icon-color="var(--v-notification_warning-base)"
      :styles="{
        'background-color': 'var(--v-status_yellow_pale-base)',
        color: 'var(--v-grey-darken4)',
      }"
      :message="$t('registration.review.members')" />
    <div data-test="title" class="rc-heading-5 mb-2 fw-bold d-flex justify-space-between align-center">
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
              :current-address-type-items="makeCurrentAddressTypeItems(member)"
              :canadian-provinces-items="canadianProvincesItems"
              :indigenous-communities-items="indigenousCommunitiesItems"
              :indigenous-types-items="indigenousTypesItems"
              :loading="loadingIndigenousCommunities"
              :member="member"
              :same-address.sync="additionalMembers[index].sameAddress"
              :shelter-locations="makeShelterLocationsListForMember(member)"
              :disable-autocomplete="disableAutocomplete"
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

    <add-edit-additional-members-lib
      v-if="showAddAdditionalMember"
      :i18n="i18n"
      :household-id="householdCreate.id"
      :show.sync="showAddAdditionalMember"
      :disable-autocomplete="disableAutocomplete"
      :index="-1"
      :submit-changes-to-service="applySavesRightAway"
      :member="newAdditionalMember" />
  </div>
</template>

<script lang="ts">
import { RcConfirmationDialog, MessageBox } from '@libs/component-lib/components';
import VueI18n from 'vue-i18n';
import { VueConstructor } from 'vue';
import { VForm } from '@libs/registration-lib/types';
import _cloneDeep from 'lodash/cloneDeep';
import mixins from 'vue-typed-mixins';
import CrcPrivacyStatement from '@libs/registration-lib/components/privacy-statement/CrcPrivacyStatement.vue';
import { IHouseholdCreate, IIdentitySet, Member, MemberDuplicateStatus } from '@libs/entities-lib/household-create';
import _isEqual from 'lodash/isEqual';
import { FeatureKeys, IConsentStatement } from '@libs/entities-lib/tenantSettings';
import helpers from '@libs/entities-lib/helpers';
import { MAX_ADDITIONAL_MEMBERS } from '@libs/registration-lib/constants/validations';
import { EventHub } from '@libs/shared-lib/plugins/event-hub';
import { IContactInformation } from '@libs/entities-lib/src/value-objects/contact-information';
import { IUser } from '@libs/entities-lib/user';
import _merge from 'lodash/merge';
import { format } from 'date-fns';
import AddEditAdditionalMembersLib from '../additional-members/AddEditAdditionalMembersLib.vue';
import additionalMemberForm from '../forms/mixins/additionalMemberForm';
import PersonalInformationLib from '../personal-information/PersonalInformationLib.vue';
import AddressesLib from '../addresses/AddressesLib.vue';
import PersonalInformationTemplate from './personal-information/PersonalInformationTemplate.vue';
import AddressesTemplate from './addresses/AddressesTemplate.vue';
import SummarySection from './SummarySection.vue';
import AdditionalMemberForm from '../additional-members/AdditionalMemberForm.vue';
import AdditionalMemberSection from './additional-members/AdditionalMemberSection.vue';
import AdditionalMemberTemplate from './additional-members/AdditionalMemberTemplate.vue';

const vueComponent: VueConstructor = mixins(additionalMemberForm).extend({
  name: 'ReviewRegistration',

  components: {
    MessageBox,
    AddressesTemplate,
    AdditionalMemberForm,
    AdditionalMemberSection,
    AdditionalMemberTemplate,
    PersonalInformationTemplate,
    SummarySection,
    PersonalInformationLib,
    AddressesLib,
    RcConfirmationDialog,
    CrcPrivacyStatement,
    AddEditAdditionalMembersLib,
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
    disableAutocomplete: {
      type: Boolean,
      required: true,
    },
    user: {
      type: Object as () => IUser,
      default: null,
    },
    consentStatements: {
      type: Array as () => IConsentStatement[],
      default: null,
    },
  },

  data() {
    return {
      format,
      personalInformation: {
        inlineEdit: false,
        backup: {
          contactInformation: null,
          identitySet: null,
        },
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
      return _merge(this.$registrationStore.householdCreate.primaryBeneficiary.contactInformation, this.$registrationStore.householdCreate.primaryBeneficiary.identitySet);
    },

    householdAlreadyRegistered(): boolean {
      return this.$registrationStore.householdAlreadyRegistered;
    },

    isDuplicate():boolean {
      return this.$hasFeature(FeatureKeys.ManageDuplicates)
      && (this.getPersonalInformation.duplicateStatusInCurrentHousehold === MemberDuplicateStatus.Duplicate
       || this.getPersonalInformation.duplicateStatusInDb === MemberDuplicateStatus.Duplicate);
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
      this.personalInformation.backup.identitySet = _cloneDeep(this.$registrationStore.householdCreate.primaryBeneficiary.identitySet);
      this.personalInformation.backup.contactInformation = _cloneDeep(this.$registrationStore.householdCreate.primaryBeneficiary.contactInformation);
      this.personalInformation.inlineEdit = true;
      this.$registrationStore.increaseInlineEditCounter();
    },

    editAddresses() {
      const householdCopy = _cloneDeep(this.householdCreate);
      this.addresses.backupCurrentAddress = householdCopy.primaryBeneficiary.currentAddress;
      this.addresses.backupHomeAddress = householdCopy.homeAddress;
      this.addresses.inlineEdit = true;
      this.addresses.backupNoFixedHome = householdCopy.noFixedHome;
      this.$registrationStore.increaseInlineEditCounter();
    },

    cancelPersonalInformation() {
      if (this.personalInformation.inlineEdit) {
        this.$registrationStore.householdCreate.primaryBeneficiary.setPersonalInformation(
          this.personalInformation.backup.contactInformation,
          this.personalInformation.backup.identitySet,
        );
        this.personalInformation.inlineEdit = false;
        this.$registrationStore.decreaseInlineEditCounter();
      }
    },

    cancelAddresses() {
      if (this.addresses?.inlineEdit) {
        this.addresses.inlineEdit = false;
        this.$registrationStore.decreaseInlineEditCounter();
        this.$registrationStore.householdCreate.setHomeAddress(this.addresses.backupHomeAddress);
        this.$registrationStore.householdCreate.noFixedHome = this.addresses.backupNoFixedHome;
        this.$registrationStore.householdCreate.setCurrentAddress(this.addresses.backupCurrentAddress);
      }
    },

    validateEmailAndSubmitPersonalInfo() {
      EventHub.$emit('checkEmailValidation', this.submitPersonalInformation);
    },

    async submitPersonalInformation() {
      const isValid = await (this.$refs.personalInfo as VForm).validate();

      if (isValid) {
        if (this.applySavesRightAway) {
          await this.updatePersonalInformation();
        }
        this.personalInformation.inlineEdit = false;
        this.$registrationStore.decreaseInlineEditCounter();
      } else {
        helpers.scrollToFirstError('app');
      }
    },

    async updatePersonalInformation() {
      this.personalInformation.loading = true;

      const resIdentity = await this.$services.households.updatePersonIdentity(
        this.householdCreate.primaryBeneficiary.id,
        !this.$registrationStore.isCRCRegistration(),
        {
          contactInformation: this.householdCreate.primaryBeneficiary.contactInformation,
          identitySet: this.householdCreate.primaryBeneficiary.identitySet,
        },
      );

      if (!resIdentity) {
        this.$registrationStore.householdCreate.primaryBeneficiary.setIdentity(this.personalInformation.backup.identitySet);
        this.personalInformation.loading = false;
        return;
      }

      this.$toasted.global.success(this.$t('registration.identity.updated'));

      const resContactInfo = await this.$services.households.updatePersonContactInformation(
        this.householdCreate.primaryBeneficiary.id,
        !this.$registrationStore.isCRCRegistration(),
        {
          contactInformation: this.householdCreate.primaryBeneficiary.contactInformation,
          identitySet: this.householdCreate.primaryBeneficiary.identitySet,
          isPrimaryBeneficiary: true,
        },
      );

      if (!resContactInfo) {
        this.$registrationStore.householdCreate.primaryBeneficiary.setContactInformation(this.personalInformation.backup.contactInformation);
        this.personalInformation.loading = false;
        return;
      }
      this.personalInformation.loading = false;
      this.$toasted.global.success(this.$t('registration.contactInformation.updated'));
    },

    async submitAddresses() {
      const isValid = await (this.$refs.addresses as VForm).validate();
      if (isValid) {
        if (this.applySavesRightAway) {
          await this.updateAddresses();
        }
        this.addresses.inlineEdit = false;
        this.$registrationStore.decreaseInlineEditCounter();
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
          this.$registrationStore.householdCreate.setHomeAddress(this.addresses.backupHomeAddress);
          this.addresses.loading = false;
          return;
        }
        this.$toasted.global.success(this.$t('registration.homeAddress.updated'));
      }

      if (this.isNewPrimaryCurrentAddress()) {
        const resCurrentAddress = await this.$services.households.updatePersonAddress(
          primaryBeneficiaryId,
          !this.$registrationStore.isCRCRegistration(),
          this.householdCreate.primaryBeneficiary.currentAddress,
        );

        if (!resCurrentAddress) {
          this.$registrationStore.householdCreate.setCurrentAddress(this.addresses.backupCurrentAddress);
          this.addresses.loading = false;
          return;
        }

        await this.updateAdditionalMembersWithSameAddress();

        this.addresses.loading = false;
        this.$toasted.global.success(this.$t('registration.currentAddress.updated'));
      }
      this.addresses.loading = false;
    },

    async updateAdditionalMembersWithSameAddress() {
      const promises = [] as Array<Promise<any>>;

      (this.additionalMembers || []).forEach(async (otherMember, index) => {
        if (otherMember.sameAddress) {
          promises.push(this.$services.households.updatePersonAddress(
            this.additionalMembersCopy[index].id,
            !this.$registrationStore.isCRCRegistration(),
            this.householdCreate.primaryBeneficiary.currentAddress,
          ) as Promise<any>);
        }
      });

      const addresses = await Promise.all(promises);
      return addresses;
    },

    async updateHomeAddress(householdId: string, household: IHouseholdCreate) {
      let res;
      if (household.noFixedHome) {
        res = await this.$services.households.updateNoFixedHomeAddress(householdId, !this.$registrationStore.isCRCRegistration());
      } else {
        res = await this.$services.households.updateHomeAddress(
          householdId,
          !this.$registrationStore.isCRCRegistration(),
          household.homeAddress,
        );
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

export default vueComponent;
</script>
