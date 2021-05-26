<template>
  <page-template
    :loading="loading"
    :left-menu-title="beneficiaryFullName"
    :navigation-tabs="tabs">
    <template v-if="caseFile" slot="left-menu">
      <div class="rc-body14 pb-2">
        <v-icon size="16" class="pr-2" color="gray darken-2">
          mdi-clipboard-text
        </v-icon>
        <span data-test="caseFileDetails-caseFileNumber">{{ caseFile.caseFileNumber }}</span>
      </div>

      <div class="rc-body14 pb-2">
        <v-icon size="16" class="pr-2" color="gray darken-2">
          mdi-calendar
        </v-icon>
        <span data-test="caseFileDetails-event">
          {{ $m(caseFile.event.name) }}
        </span>
      </div>
      <div class="divider" />

      <div class="mb-4">
        <v-btn
          v-if="canVerifyIdentity"
          class="mr-2 status"
          text
          :color="colorVerifyIdentity"
          data-test="caseFileDetails-verify-identity-icon"
          @click="openVerifyIdentity">
          <v-icon>mdi-shield-check</v-icon>
        </v-btn>
        <v-icon v-else :color="colorVerifyIdentity" class="mr-2 status">
          mdi-shield-check
        </v-icon>

        <v-btn
          v-if="canChangeImpactValidation"
          class="mr-2 status"
          text
          :color="colorValidationImpact"
          data-test="caseFileDetails-verify-impact-icon"
          @click="openImpactValidation">
          <v-icon>mdi-map-check</v-icon>
        </v-btn>
        <v-icon v-else :color="colorValidationImpact" class="mr-2 status">
          mdi-map-check
        </v-icon>
      </div>

      <div
        v-if="contactInfo && contactInfo.email"
        class="d-flex flex-row align-start mb-2 rc-body14 break-word">
        <v-icon small class="mr-2 mt-1">
          mdi-email
        </v-icon>
        <span data-test="caseFileDetails-email">{{ contactInfo.email }}</span>
      </div>

      <div
        v-if="hasPhoneNumbers"
        class="d-flex flex-row align-start mb-2 rc-body14">
        <v-icon small class="mr-2 mt-1">
          mdi-phone
        </v-icon>
        <div class="d-flex flex-column">
          <case-file-details-beneficiary-phone-number
            v-if="contactInfo.homePhoneNumber"
            data-test="caseFileDetails-home-phone-number"
            :phone-number="contactInfo.homePhoneNumber"
            :label="'caseFileDetail.beneficiaryPhoneNumber.homeInitial'" />

          <case-file-details-beneficiary-phone-number
            v-if="contactInfo.mobilePhoneNumber"
            data-test="caseFileDetails-mobile-phone-number"
            :phone-number="contactInfo.mobilePhoneNumber"
            :label="'caseFileDetail.beneficiaryPhoneNumber.mobileInitial'" />

          <case-file-details-beneficiary-phone-number
            v-if="contactInfo.alternatePhoneNumber"
            data-test="caseFileDetails-alternate-phone-number"
            :phone-number="contactInfo.alternatePhoneNumber"
            :label="'caseFileDetail.beneficiaryPhoneNumber.alternateInitial'" />
        </div>
      </div>

      <div
        v-if="caseFile.beneficiary.homeAddress"
        class="d-flex flex-row align-start mb-2 rc-body14">
        <v-icon small class="mr-2 mt-1">
          mdi-map-marker
        </v-icon>
        <div class="d-flex flex-column" data-test="caseFileDetails-home-address">
          <span v-if="addressFirstLine">{{ addressFirstLine }}</span>
          <span v-if="addressSecondLine">{{ addressSecondLine }}</span>
        </div>
      </div>

      <div
        class="d-flex flex-row rc-body14">
        <v-icon small class="mr-2">
          mdi-account-multiple
        </v-icon>
        <span data-test="caseFileDetails-household-member-count">
          {{ $t('caseFileDetail.fullHouseHold', {x: caseFile.beneficiary.householdMemberCount}) }}
        </span>
      </div>

      <v-btn
        v-if="caseFile.beneficiary"
        small
        color="primary"
        class="my-4"
        data-test="beneficiary-profile-btn"
        @click="goToBeneficiaryProfile()">
        {{ $t('caseFileDetail.beneficiary_profile.button') }}
      </v-btn>
    </template>

    <template slot="default">
      <router-view />
    </template>
  </page-template>
</template>

<script lang="ts">
import Vue from 'vue';
import { ICaseFile, ICaseFileBeneficiaryContactInfo } from '@/entities/case-file';
import PageTemplate from '@/ui/views/components/layout/PageTemplate.vue';
import { INavigationTab } from '@/types';
import routes from '@/constants/routes';
import CaseFileDetailsBeneficiaryPhoneNumber from './components/CaseFileDetailsBeneficiaryPhoneNumber.vue';

export default Vue.extend({
  name: 'CaseFileDetails',

  components: {
    PageTemplate,
    CaseFileDetailsBeneficiaryPhoneNumber,
  },

  props: {
    /**
     * The id of the current case file
     */
    id: {
      type: String,
      required: true,
    },
  },

  data() {
    return {
      loading: false,
      error: false,
    };
  },

  computed: {
    addressFirstLine(): string {
      if (this.caseFile.beneficiary.homeAddress) {
        const address = this.caseFile.beneficiary.homeAddress;
        const unitSuite = address.unitSuite ? `${address.unitSuite}-` : '';
        return unitSuite + address.streetAddress;
      }
      return '';
    },

    addressSecondLine(): string {
      if (this.caseFile.beneficiary.homeAddress) {
        const address = this.caseFile.beneficiary.homeAddress;
        return `${address.city}, ${this.$m(address.provinceCode)} ${address.postalCode}`;
      }
      return '';
    },

    caseFile(): ICaseFile {
      return this.$storage.caseFile.getters.caseFileById(this.id);
    },

    beneficiaryFullName(): string {
      if (!this.caseFile) return '';
      return `${this.caseFile.beneficiary.firstName} ${this.caseFile.beneficiary.lastName}`;
    },

    canVerifyIdentity(): boolean {
      return true;
    },

    canChangeImpactValidation(): boolean {
      return true;
    },

    colorValidationImpact() {
      return 'status_success';
    },

    colorVerifyIdentity() {
      return 'status_success';
    },

    contactInfo() : ICaseFileBeneficiaryContactInfo {
      return this.caseFile.beneficiary?.contactInformation;
    },

    hasPhoneNumbers(): boolean {
      const { contactInformation } = this.caseFile.beneficiary;
      return !!(contactInformation.mobilePhoneNumber || contactInformation.homePhoneNumber || contactInformation.alternatePhoneNumber);
    },

    tabs(): Array<INavigationTab> {
      return [{
        text: this.$t('caseFileDetail.menu_activity') as string,
        test: 'case-file-activity',
        icon: '',
        to: routes.caseFile.activity.name,
      }, {
        text: this.$t('caseFileDetail.menu_case_note') as string,
        test: 'case-note',
        to: routes.caseFile.note.name,

      }, {
        text: this.$t('caseFileDetail.menu_documents') as string,
        test: 'attached-documents',
        disabled: true,
        // to: routes.caseFileDocuments.name,
      }, {
        text: this.$t('caseFileDetail.menu_financial_assistance') as string,
        test: 'financial-assistance',
        disabled: true,
        // to: routes.caseFileFinancialAssistance.name,
        // exact: false,
      }, {
        text: this.$t('caseFileDetail.menu_assessments') as string,
        test: 'assessments',
        // to: routes.caseFileAssessments.name,
        disabled: true,
      }, {
        text: this.$t('caseFileDetail.menu_referrals') as string,
        test: 'referrals',
        // to: routes.caseFileReferrals.name,
        disabled: true,
        // exact: false,
      }, {
        text: this.$t('caseFileDetail.menu_recoveryPlan') as string,
        test: 'recovery-plan',
        disabled: true,
      }];
    },

  },

  async created() {
    this.loading = true;
    try {
      await this.$storage.caseFile.actions.fetchCaseFile(this.id);
    } catch {
      this.error = true;
    } finally {
      this.loading = false;
    }
  },

  methods: {

    goToBeneficiaryProfile() {
      this.$router.push({
        name: routes.caseFile.beneficiaryProfile.name,
        params: {
          beneficiaryId: this.caseFile.beneficiary.id,
        },
      });
    },

    openImpactValidation() {
      return true;
    },

    openVerifyIdentity() {
      return true;
    },
  },
});
</script>

<style scoped lang="scss">
  .divider {
    margin: 4px -16px 16px;
    border-top: 1px solid var(--v-grey-lighten2);
  }

  button.status {
    background: white;
    min-width: 0 !important;
    padding: 0 5px !important;
  }

</style>
