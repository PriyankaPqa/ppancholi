<template>
  <v-row no-gutters>
    <identity-form
      :form="identitySet"
      :gender-items="genderItems"
      :min-age-restriction="minAgeRegistration"
      @change="setIdentity($event)" />

    <contact-information-form
      :form="contactInformation"
      :preferred-languages-items="preferredLanguagesItems"
      :primary-spoken-languages-items="primarySpokenLanguagesItems"
      :skip-phone-email-rules="skipPhoneEmailRules"
      :person-id="member.id"
      :recaptcha-key="recaptchaKey"
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
import Vue from 'vue';
import VueI18n, { TranslateResult } from 'vue-i18n';
import { Status } from '@libs/entities-lib/base';
import helpers from '@libs/entities-lib/helpers';
import { IOptionItemData } from '@libs/shared-lib/types';
import { ContactInformation, IContactInformation } from '@libs/entities-lib/value-objects/contact-information';
import {
  IdentitySet, IIdentitySet, IMember, ISplitHousehold,
} from '@libs/entities-lib/household-create';
import { IInformationFromBeneficiarySearch } from '@/types/interfaces/IInformationFromBeneficiarySearch';
import _cloneDeep from 'lodash/cloneDeep';
import ContactInformationForm from '../forms/ContactInformationForm.vue';
import IndigenousIdentityForm from '../forms/IndigenousIdentityForm.vue';
import IdentityForm from '../forms/IdentityForm.vue';

export default Vue.extend({
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
    i18n: {
      type: Object as () => VueI18n,
      required: true,
    },
    memberProps: {
      type: Object as () => IMember,
      default: null,
    },
    recaptchaKey: {
      type: String,
      default: '',
    },
    includeInactiveOptions: {
      type: Boolean,
      default: false,
    },
    prefillPersonalInformation: {
      type: Boolean,
      default: false,
    },
    isEditMode: {
      type: Boolean,
      default: false,
    },
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
      return this.memberProps || this.$storage.registration.getters.householdCreate().primaryBeneficiary;
    },

    preferredLanguagesItems(): IOptionItemData[] {
      return this.$storage.registration.getters.preferredLanguages();
    },

    primarySpokenLanguagesItems(): IOptionItemData[] {
      let items = this.$storage.registration.getters.primarySpokenLanguages(this.includeInactiveOptions);

      items = items.filter((i) => i.status === Status.Active || i.id === this.contactInformation.primarySpokenLanguage?.id);

      return items;
    },

    genderItems(): IOptionItemData[] {
      let items = this.$storage.registration.getters.genders(this.includeInactiveOptions);

      items = items.filter((i) => i.status === Status.Active || i.id === this.identitySet.gender.id);

      return items;
    },

    indigenousTypesItems(): Record<string, TranslateResult>[] {
      return this.$storage.registration.getters.indigenousTypesItems();
    },

    indigenousCommunitiesItems(): Record<string, string>[] {
      return this.$storage.registration.getters.indigenousCommunitiesItems(this.identitySet.indigenousType);
    },

    loadingIndigenousCommunities(): boolean {
      return this.$store.state.registration.loadingIndigenousCommunities;
    },

    canadianProvincesItems(): Record<string, unknown>[] {
      return helpers.getCanadianProvincesWithoutOther(this.i18n);
    },

    splitHousehold(): ISplitHousehold {
      return this.$store.state.registration.splitHousehold;
    },

    isSplitMode(): boolean {
      return this.$storage.registration.getters.isSplitMode();
    },

    isTouched(): boolean {
      return this.$storage.registration?.getters?.tabs()?.filter((el) => el.id === 'personalInfo')[0].isTouched;
    },
  },
  async created() {
    // Load data from Beneficiary Search
    if (this.prefillPersonalInformation && !this.isEditMode && !this.isSplitMode && !this.isTouched) {
      this.loadInitialDataFromBeneficiarySearch();
    }
    // Under split mode, load data from split household member
    if (this.prefillPersonalInformation && this.isSplitMode && !this.isTouched) {
      this.loadInitialDataUnderSplitMode();
    }
    // Load IngigenousCommunities as soon as the page loads
    await this.$storage.registration.actions.fetchIndigenousCommunities();
  },
  methods: {
    setIdentity(form: IIdentitySet) {
      if (this.storeMode) {
        this.$storage.registration.mutations.setIdentity(form);
      }
      this.$emit('setIdentity', form);
    },

    setIndigenousIdentity(form: IIdentitySet) {
      if (this.storeMode) {
        this.$storage.registration.mutations.setIndigenousIdentity(form);
      }
      this.$emit('setIndigenousIdentity', form);
    },

    setContactInformation(form: IContactInformation) {
      if (this.storeMode) {
        this.$storage.registration.mutations.setContactInformation(form);
      }
      this.$emit('setContactInformation', form);
    },

    loadInitialDataFromBeneficiarySearch() {
      const initIdentity = new IdentitySet();
      const initContact = new ContactInformation();
      const initDataFromBeneficiarySearch: IInformationFromBeneficiarySearch = this.$store.state.registration.informationFromBeneficiarySearch;
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
      const initDataFromBeneficiarySearch: IInformationFromBeneficiarySearch = this.$store.state.registration.informationFromBeneficiarySearch;
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
</script>
