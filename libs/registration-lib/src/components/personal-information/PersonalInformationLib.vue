<template>
  <v-row no-gutters>
    <identity-form
      :form="identitySet"
      :gender-items="genderItems"
      :name-dob-disabled="isSplitMode"
      :min-age-restriction="minAgeRegistration"
      @change="setIdentity($event)" />

    <contact-information-form
      :form="contactInformation"
      :preferred-languages-items="preferredLanguagesItems"
      :primary-spoken-languages-items="primarySpokenLanguagesItems"
      :skip-phone-email-rules="skipPhoneEmailRules"
      :allow-duplicate-emails="allowDuplicateEmails"
      :person-id="member.id"
      @change="setContactInformation($event)" />

    <indigenous-identity-form
      :form="identitySet"
      :canadian-provinces-items="canadianProvincesItems"
      :i18n="i18n"
      :indigenous-communities-items="indigenousCommunitiesItems"
      :indigenous-types-items="indigenousTypesItems"
      :loading="loadingIndigenousCommunities"
      @change="setIndigenousIdentity($event)" />
  </v-row>
</template>

<script lang="ts">
import Vue, { VueConstructor } from 'vue';
import VueI18n, { TranslateResult } from 'vue-i18n';
import _debounce from 'lodash/debounce';
import { Status } from '@libs/entities-lib/base';
import helpers from '@libs/entities-lib/helpers';
import { IOptionItemData } from '@libs/shared-lib/types';
import { ContactInformation, IContactInformation } from '@libs/entities-lib/value-objects/contact-information';
import {
  IdentitySet, IIdentitySet, IMember, ISplitHousehold,
} from '@libs/entities-lib/household-create';
import { IInformationFromBeneficiarySearch } from '@/types/interfaces/IInformationFromBeneficiarySearch';
import _cloneDeep from 'lodash/cloneDeep';
import { FeatureKeys } from '@libs/entities-lib/tenantSettings';
import { TabId } from '@libs/registration-lib/types/interfaces/IRegistrationMenuItem';
import ContactInformationForm from '../forms/ContactInformationForm.vue';
import IndigenousIdentityForm from '../forms/IndigenousIdentityForm.vue';
import IdentityForm from '../forms/IdentityForm.vue';

const vueComponent: VueConstructor = Vue.extend({
  name: 'PersonalInformation',

  components: {
    IndigenousIdentityForm,
    IdentityForm,
    ContactInformationForm,
  },

  props: {
    minAgeRegistration: {
      type: Number,
      default: null,
    },
    skipPhoneEmailRules: {
      type: Boolean,
      default: false,
    },
    allowDuplicateEmails: {
      type: Boolean,
      default: false,
    },
    i18n: {
      type: Object as () => VueI18n,
      required: true,
    },
    memberProps: {
      type: Object as () => IMember,
      default: null,
    },
    includeInactiveOptions: {
      type: Boolean,
      default: false,
    },
    isEditMode: {
      type: Boolean,
      default: false,
    },
    isInPrimaryMemberDialog: {
      type: Boolean,
      default: false,
    },
    makePrimaryMode: {
      type: Boolean,
      default: false,
    },
    preventDbDuplicateCheck: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return { FeatureKeys };
  },

  computed: {
    storeMode(): boolean {
      return !this.memberProps;
    },

    identitySet(): IIdentitySet {
      return this.member.identitySet;
    },

    contactInformation(): IContactInformation {
      return this.member.contactInformation;
    },

    member(): IMember {
      return this.memberProps || this.$registrationStore.getHouseholdCreate().primaryBeneficiary;
    },

    preferredLanguagesItems(): IOptionItemData[] {
      return this.$registrationStore.getPreferredLanguages();
    },

    primarySpokenLanguagesItems(): IOptionItemData[] {
      let items = this.$registrationStore.getPrimarySpokenLanguages(this.includeInactiveOptions);

      items = items.filter((i) => i.status === Status.Active || i.id === this.contactInformation.primarySpokenLanguage?.id);

      return items;
    },

    genderItems(): IOptionItemData[] {
      let items = this.$registrationStore.getGenders(this.includeInactiveOptions);

      items = items.filter((i) => i.status === Status.Active || i.id === this.identitySet.gender.id);

      return items;
    },

    indigenousTypesItems(): Record<string, TranslateResult>[] {
      return this.$registrationStore.getIndigenousTypesItems();
    },

    indigenousCommunitiesItems(): Record<string, string>[] {
      return this.$registrationStore.getIndigenousCommunitiesItems(this.identitySet.indigenousType);
    },

    loadingIndigenousCommunities(): boolean {
      return this.$registrationStore.loadingIndigenousCommunities;
    },

    canadianProvincesItems(): Record<string, unknown>[] {
      return helpers.getCanadianProvincesWithoutOther(this.i18n);
    },

    splitHousehold(): ISplitHousehold {
      return this.$registrationStore.splitHouseholdState;
    },

    isSplitMode(): boolean {
      return this.$registrationStore.isSplitMode();
    },

    isTouched(): boolean {
      return this.$registrationStore.tabs.filter((el) => el.id === TabId.PersonalInfo)[0].isTouched;
    },

    shouldLoadDataFromBeneficiarySearch(): boolean {
      return this.$registrationStore.isCRCRegistration() && !this.isEditMode && !this.isSplitMode && !this.isTouched && !this.isInPrimaryMemberDialog;
    },
  },

  async created() {
    // Load data from Beneficiary Search
    if (this.shouldLoadDataFromBeneficiarySearch) {
      this.loadInitialDataFromBeneficiarySearch();
    }
    // Under split mode, load data from split household member
    if (this.isSplitMode && !this.isTouched) {
      this.loadInitialDataUnderSplitMode();
    }
    // Load IndigenousCommunities as soon as the page loads
    await this.$registrationStore.fetchIndigenousCommunities();
  },

  methods: {
    setIdentity(form: IIdentitySet) {
      if (!this.isSplitMode) {
        this.$registrationStore.submitLoading = true;
        this.checkDuplicates(new IdentitySet(form));
      }

      if (this.storeMode) {
         this.$registrationStore.householdCreate.primaryBeneficiary.identitySet.setIdentity(form);
      }
      this.$emit('setIdentity', form);
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    checkDuplicates: _debounce(async function func(this:any, form: IIdentitySet) {
      await this.$registrationStore.checkDuplicates({
        form, isPrimaryMember: !this.makePrimaryMode, preventDbCheck: this.preventDbDuplicateCheck, memberId: this.memberProps?.id,
      });
      this.member.identitySet.setIdentity(form);
      this.$registrationStore.submitLoading = false;
    }, 500),

    setIndigenousIdentity(form: IIdentitySet) {
      if (this.storeMode) {
        this.$registrationStore.householdCreate.primaryBeneficiary.identitySet.setIndigenousIdentity(form);
      }
      this.$emit('setIndigenousIdentity', form);
    },

    setContactInformation(form: IContactInformation) {
      if (this.storeMode) {
        this.$registrationStore.householdCreate.primaryBeneficiary.setContactInformation(form);
      }
      this.$emit('setContactInformation', form);
    },

    loadInitialDataFromBeneficiarySearch() {
      const initIdentity = new IdentitySet();
      const initContact = new ContactInformation();
      const initDataFromBeneficiarySearch: IInformationFromBeneficiarySearch = this.$registrationStore.informationFromBeneficiarySearch;
      if (initDataFromBeneficiarySearch) {
        initIdentity.firstName = initDataFromBeneficiarySearch.firstName;
        initIdentity.lastName = initDataFromBeneficiarySearch.lastName;
        initIdentity.birthDate = initDataFromBeneficiarySearch.birthDate;
        initIdentity.firstName = initDataFromBeneficiarySearch.firstName;
        initContact.email = initDataFromBeneficiarySearch.emailAddress;
        initContact.mobilePhoneNumber = initDataFromBeneficiarySearch.phone;
      }
      this.setIdentity(initIdentity);
      this.setContactInformation(initContact);
    },

    loadInitialDataUnderSplitMode() {
      let initIdentityFromSplitHousehold;
      const initContact = new ContactInformation();
      const initDataFromBeneficiarySearch: IInformationFromBeneficiarySearch = this.$registrationStore.informationFromBeneficiarySearch;
      if (initDataFromBeneficiarySearch && this.splitHousehold) {
        initIdentityFromSplitHousehold = _cloneDeep(this.splitHousehold.splitMembers.primaryMember.identitySet);
        initIdentityFromSplitHousehold.firstName = initDataFromBeneficiarySearch.firstName;
        initIdentityFromSplitHousehold.lastName = initDataFromBeneficiarySearch.lastName;
        initIdentityFromSplitHousehold.birthDate = initDataFromBeneficiarySearch.birthDate;
        initIdentityFromSplitHousehold.firstName = initDataFromBeneficiarySearch.firstName;
        initContact.email = initDataFromBeneficiarySearch.emailAddress;
        initContact.mobilePhoneNumber = initDataFromBeneficiarySearch.phone;
      }
      this.setIdentity(initIdentityFromSplitHousehold);
      this.setContactInformation(initContact);
    },
  },
});

export default vueComponent;
</script>
