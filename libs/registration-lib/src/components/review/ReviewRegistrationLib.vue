<template>
  <div id="summary">
    <template v-if="associationMode || splitMode">
      <div v-if="!hideName" class="mb-8" data-test="summary__existingBeneficiary__section">
        <span class="rc-heading-3">{{ getPersonalInformation.firstName }} {{ getPersonalInformation.lastName }}</span>
        <div class="rc-body14">
          {{ $t('registration.details.registered') }} {{ format(new Date(householdCreate.primaryBeneficiary.created), 'PP') }}
        </div>
      </div>
      <slot name="previous-events" :household-id="householdCreate.id" />
      <template v-if="canEditSections">
        <div data-test="title" class="rc-heading-5 fw-bold  mb-2 mt-8">
          {{ $t('registration.menu.privacy') }}
        </div>
        <validation-observer ref="privacyStatement">
          <crc-privacy-statement :user="user" :consent-statements="consentStatements" />
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
        :show-edit-button="canEditSections"
        data-test="personalInformation"
        :title="$t('registration.menu.personal_info')"
        :inline-edit="personalInformation.inlineEdit"
        :loading="personalInformation.loading"
        :submit-disabled="failed || saveDisabled"
        @edit="editPersonalInformation()"
        @cancel="cancelPersonalInformation()"
        @submit="validateEmailAndSubmitPersonalInfo()">
        <template #inline>
          <personal-information-lib :skip-phone-email-rules="skipPhoneEmailRules" :min-age-registration="minAgeRegistration" is-edit-mode />
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
        v-if="!$hasFeature($featureKeys.CaseFileIndividual)"
        :show-edit-button="canEditSections"
        data-test="addresses"
        :title="$t('registration.menu.addresses')"
        :inline-edit="addresses.homeEdit || addresses.currentEdit"
        :loading="addresses.loading"
        :submit-disabled="failed"
        @edit="editAddresses()"
        @cancel="cancelAddresses()"
        @submit="submitAddresses()">
        <template #inline>
          <addresses-lib :disable-autocomplete="disableAutocomplete" is-edit-mode />
        </template>
        <addresses-template
          :household="householdCreate"
          :show-edit-button="canEditSections"
          :disable-autocomplete="disableAutocomplete" />
      </summary-section>

      <template v-if="$hasFeature($featureKeys.CaseFileIndividual)">
        <div data-test="title" class="rc-heading-5 flex-grow-1 fw-bold">
          {{ $t('registration.menu.addresses') }}
        </div>
        <div class="split-container">
          <summary-section
            :show-edit-button="canEditSections"
            data-test="addresses_household"
            :title="$t('registration.addresses.homeAddress')"
            small-title
            :inline-edit="addresses.homeEdit"
            :loading="addresses.loading"
            :submit-disabled="failed"
            @edit="editAddresses('home')"
            @cancel="cancelAddresses('home')"
            @submit="submitAddresses('home')">
            <template #inline>
              <addresses-lib :disable-autocomplete="disableAutocomplete" is-edit-mode :show-current-address="false" />
            </template>
            <home-address-template
              :address="householdCreate.homeAddress"
              :show-edit-button="canEditSections"
              :disable-autocomplete="disableAutocomplete"
              hide-title />
          </summary-section>

          <summary-section
            :show-edit-button="canEditSections"
            data-test="addresses_primary"
            :title="$t('registration.addresses.currentAddress')"
            small-title
            :inline-edit="addresses.currentEdit"
            :loading="addresses.loading"
            :submit-disabled="failed"
            @edit="editAddresses('current')"
            @cancel="cancelAddresses('current')"
            @submit="submitAddresses('current')">
            <template #inline>
              <addresses-lib :disable-autocomplete="disableAutocomplete" is-edit-mode :show-home-address="false" />
            </template>
            <current-address-template
              :current-address="householdCreate.primaryBeneficiary.currentAddress"
              hide-title />
          </summary-section>
        </div>
      </template>
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
    <div data-test="title" class="rc-heading-5 mb-2 fw-bold d-flex justify-space-between align-center flex-wrap">
      <div>
        {{ `${$t('registration.household_members.title')} (${householdCreate.additionalMembers.length})` }}
      </div>
      <v-btn
        v-if="canEditSections"
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

    <div v-for="(member, index) in additionalMembersCopy" :key="index">
      <validation-observer :ref="`additionalMember_${index}`" v-slot="{ failed }" slim>
        <additional-member-section
          :key="index"
          :show-edit-button="canEditSections && !$hasFeature($featureKeys.CaseFileIndividual)"
          :show-delete-button="canEditSections"
          :data-test="`additionalMember_${index}`"
          :member="member"
          :inline-edit="!$hasFeature($featureKeys.CaseFileIndividual) && additionalMembers[index].personalInfoEdit"
          :loading="additionalMembers[index].loading"
          :save-disabled-if-duplicate="!$registrationStore.isCRCRegistration()"
          @edit="editAdditionalMember(index)"
          @cancel="cancelAdditionalMember(index)"
          @submit="submitAdditionalMember(index)"
          @delete="showDeleteDialog(index)">
          <template #inline>
            <additional-member-form
              :api-key="apiKey"
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
          <div>
            <additional-member-template v-if="!$hasFeature($featureKeys.CaseFileIndividual)" :member="member" />

            <div v-else class="split-container inside">
              <summary-section
                :show-edit-button="canEditSections"
                :data-test="`additionalMember_${index}.personalinfo`"
                :title="$t('registration.menu.personal_info')"
                small-title
                :inline-edit="additionalMembers[index].personalInfoEdit"
                :loading="additionalMembers[index].loading"
                :submit-disabled="failed || disabledIfDuplicate(member)"
                @edit="editAdditionalMember(index, 'personalInfo')"
                @cancel="cancelAdditionalMember(index, 'personalInfo')"
                @submit="submitAdditionalMember(index, 'personalInfo')">
                <template #inline>
                  <additional-member-form
                    :api-key="apiKey"
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
                    hide-edit-temporary-address
                    @identity-change="setIdentity($event)"
                    @indigenous-identity-change="setIndigenousIdentity($event)"
                    @temporary-address-change="setCurrentAddress($event)" />
                </template>
                <additional-member-template :member="member" :review-mode="true" />
              </summary-section>

              <summary-section
                :show-edit-button="canEditSections"
                :data-test="`additionalMember_${index}.tempaddress`"
                :title="$t('registration.addresses.currentAddress')"
                small-title
                :inline-edit="additionalMembers[index].tempAddressEdit"
                :loading="additionalMembers[index].loading"
                :submit-disabled="failed || disabledIfDuplicate(member)"
                @edit="editAdditionalMember(index, 'tempAddress')"
                @cancel="cancelAdditionalMember(index, 'tempAddress')"
                @submit="submitAdditionalMember(index, 'tempAddress')">
                <template #inline>
                  <additional-member-form
                    :api-key="apiKey"
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
                    :show-identity-section="false"
                    class="mb-4"
                    @identity-change="setIdentity($event)"
                    @indigenous-identity-change="setIndigenousIdentity($event)"
                    @temporary-address-change="setCurrentAddress($event)" />
                </template>
                <current-address-template :current-address="member.currentAddress" hide-title />
              </summary-section>
            </div>
          </div>
        </additional-member-section>
      </validation-observer>
    </div>

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
      :household-id="householdCreate.id"
      :show.sync="showAddAdditionalMember"
      :disable-autocomplete="disableAutocomplete"
      :index="-1"
      :submit-changes-to-service="applySavesRightAway"
      :send-same-address-to-service="false"
      :member="newAdditionalMember" />
  </div>
</template>

<script lang="ts">
import { RcConfirmationDialog, MessageBox } from '@libs/component-lib/components';
import { VForm } from '@libs/registration-lib/types';
import _cloneDeep from 'lodash/cloneDeep';
import mixins from 'vue-typed-mixins';
import CrcPrivacyStatement from '@libs/registration-lib/components/privacy-statement/CrcPrivacyStatement.vue';
import { IHouseholdCreate, IIdentitySet, IMember, Member, MemberDuplicateStatus } from '@libs/entities-lib/household-create';
import _isEqual from 'lodash/isEqual';
import { IConsentStatement } from '@libs/entities-lib/tenantSettings';
import helpers from '@libs/entities-lib/helpers';
import { MAX_ADDITIONAL_MEMBERS, MIN_AGE_REGISTRATION } from '@libs/registration-lib/constants/validations';
import { EventHub } from '@libs/shared-lib/plugins/event-hub';
import { IContactInformation } from '@libs/entities-lib/src/value-objects/contact-information';
import { IUser } from '@libs/entities-lib/user';
import _merge from 'lodash/merge';
import { format } from 'date-fns';
import AddEditAdditionalMembersLib from '../additional-members/AddEditAdditionalMembersLib.vue';
import additionalMemberForm from '../forms/mixins/additionalMemberForm';
import PersonalInformationLib from '../personal-information/PersonalInformationLib.vue';
import AddressesLib from '../addresses/AddressesLib.vue';
import HomeAddressTemplate from './addresses/HomeAddressTemplate.vue';
import CurrentAddressTemplate from './addresses/CurrentAddressTemplate.vue';
import PersonalInformationTemplate from './personal-information/PersonalInformationTemplate.vue';
import AddressesTemplate from './addresses/AddressesTemplate.vue';
import SummarySection from './SummarySection.vue';
import AdditionalMemberForm from '../additional-members/AdditionalMemberForm.vue';
import AdditionalMemberSection from './additional-members/AdditionalMemberSection.vue';
import AdditionalMemberTemplate from './additional-members/AdditionalMemberTemplate.vue';

export default mixins(additionalMemberForm).extend({
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
    HomeAddressTemplate,
    CurrentAddressTemplate,
  },

  props: {
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
        homeEdit: false,
        currentEdit: false,
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

    saveDisabled():boolean {
      return !this.$registrationStore.isCRCRegistration()
      && (this.getPersonalInformation.duplicateStatusInCurrentHousehold === MemberDuplicateStatus.Duplicate
       || this.getPersonalInformation.duplicateStatusInDb === MemberDuplicateStatus.Duplicate);
    },

    minAgeRegistration(): number {
      return this.$registrationStore.isCRCRegistration() ? null : MIN_AGE_REGISTRATION;
    },

    canEditSections(): boolean {
      return this.$registrationStore.inlineEditCounter === 0 && !this.householdAlreadyRegistered && !this.splitMode;
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
    disabledIfDuplicate(member: IMember): boolean {
      return !this.$registrationStore.isCRCRegistration() && member.identitySet
        && member.identitySet.getMemberDuplicateStatus() === MemberDuplicateStatus.Duplicate;
    },

    editPersonalInformation() {
      this.personalInformation.backup.identitySet = _cloneDeep(this.$registrationStore.householdCreate.primaryBeneficiary.identitySet);
      this.personalInformation.backup.contactInformation = _cloneDeep(this.$registrationStore.householdCreate.primaryBeneficiary.contactInformation);
      this.personalInformation.inlineEdit = true;
      this.$registrationStore.increaseInlineEditCounter();
    },

    editAddresses(section?: string) {
      const householdCopy = _cloneDeep(this.householdCreate);
      if (section !== 'home') {
        this.addresses.backupCurrentAddress = householdCopy.primaryBeneficiary.currentAddress;
        this.addresses.backupHomeAddress = this.addresses.backupHomeAddress || householdCopy.homeAddress;
        this.addresses.currentEdit = true;
        this.$registrationStore.increaseInlineEditCounter();
      }

      if (section !== 'current') {
        this.addresses.backupHomeAddress = householdCopy.homeAddress;
        this.addresses.backupCurrentAddress = this.addresses.backupCurrentAddress || householdCopy.primaryBeneficiary.currentAddress;
        this.addresses.homeEdit = true;
        this.addresses.backupNoFixedHome = householdCopy.noFixedHome;
        this.$registrationStore.increaseInlineEditCounter();
      }
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

    cancelAddresses(section?: string) {
      if (section !== 'home' && this.addresses.currentEdit) {
        this.addresses.currentEdit = false;
        this.$registrationStore.decreaseInlineEditCounter();
        this.$registrationStore.householdCreate.setCurrentAddress(this.addresses.backupCurrentAddress);
      }
      if (section !== 'current' && this.addresses.homeEdit) {
        this.addresses.homeEdit = false;
        this.$registrationStore.decreaseInlineEditCounter();
        this.$registrationStore.householdCreate.setHomeAddress(this.addresses.backupHomeAddress);
        this.$registrationStore.householdCreate.noFixedHome = this.addresses.backupNoFixedHome;
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

    async submitAddresses(section?: string) {
      const isValid = await (this.$refs.addresses as VForm).validate();
      if (isValid) {
        if (this.applySavesRightAway) {
          await this.updateAddresses();
        }

        if (section !== 'home') {
          this.addresses.currentEdit = false;
          this.addresses.backupCurrentAddress = _cloneDeep(this.householdCreate.primaryBeneficiary.currentAddress);
          this.$registrationStore.decreaseInlineEditCounter();
        }
        if (section !== 'current') {
          this.addresses.homeEdit = false;
          this.addresses.backupHomeAddress = _cloneDeep(this.householdCreate.homeAddress);
          this.$registrationStore.decreaseInlineEditCounter();
        }
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

      if (!this.$hasFeature(this.$featureKeys.CaseFileIndividual) && this.isNewPrimaryCurrentAddress()) {
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
</script>

<style scoped lang="scss">
@import "@libs/shared-lib/assets/styles/breakpoints";

@media only screen and (min-width: $breakpoint-xs-min) and (max-width: $breakpoint-xs-max) {
  .split-container {
    justify-items: center;
    align-items: baseline;
    & > * {
      width: 100%;
      padding: 16px;
      border: solid 1px var(--v-grey-lighten2);
      &:first-child {
        border-radius: 4px 4px 0px 0px;
      }
      &:not(:first-child) {
        border-top: 0;
      }
      &:last-child {
        border-radius: 0px 0px 4px 4px;
      }
    }
    &.inside > :first-child {
      border-top: 0;
      border-radius: 0;
    }
  }
}
@media only screen and (min-width: $breakpoint-sm-min) {
  .split-container {
    border: solid 1px var(--v-grey-lighten2);
    border-radius: 4px;
    display: flex;
    & > * {
      width: 100%;
      padding: 16px;
      &:not(:first-child) {
          border-left: 1px solid var(--v-grey-lighten2);
      }
    }
    &.inside {
      border-top: 0;
      border-radius: 0px 0px 4px 4px;
    }
  }
}
</style>
