<template>
  <page-template
    :loading="loading"
    :left-menu-title="primaryBeneficiaryFullName"
    :navigation-tabs="tabs">
    <template v-if="caseFile" slot="left-menu">
      <div class="rc-body14 pb-2">
        <v-icon size="16" class="pr-2" color="gray darken-2">
          mdi-clipboard-text
        </v-icon>
        <span data-test="caseFileDetails-caseFileNumber">{{ caseFile.entity.caseFileNumber }}</span>
      </div>

      <div class="rc-body14 pb-2">
        <v-icon size="16" class="pr-2" color="gray darken-2">
          mdi-calendar
        </v-icon>
        <span data-test="caseFileDetails-event">
          {{ caseFile.metadata.event? $m(caseFile.metadata.event.name): 'm' }}
        </span>
      </div>
      <div class="divider" />

      <div class="mb-4">
        <v-btn
          v-if="canEdit"
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
          v-if="canEdit"
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
        v-if="primaryBeneficiary && primaryBeneficiary.email"
        class="d-flex flex-row align-start mb-2 rc-body14 break-word">
        <v-icon small class="mr-2 mt-1">
          mdi-email
        </v-icon>
        <span data-test="caseFileDetails-email">{{ primaryBeneficiary.email }}</span>
      </div>

      <div
        v-if="hasPhoneNumbers"
        class="d-flex flex-row align-start mb-2 rc-body14">
        <v-icon small class="mr-2 mt-1">
          mdi-phone
        </v-icon>
        <div class="d-flex flex-column">
          <case-file-details-beneficiary-phone-number
            v-if="primaryBeneficiary.homePhoneNumber"
            data-test="caseFileDetails-home-phone-number"
            :phone-number="primaryBeneficiary.homePhoneNumber"
            :label="'caseFileDetail.beneficiaryPhoneNumber.homeInitial'" />

          <case-file-details-beneficiary-phone-number
            v-if="primaryBeneficiary.mobilePhoneNumber"
            data-test="caseFileDetails-mobile-phone-number"
            :phone-number="primaryBeneficiary.mobilePhoneNumber"
            :label="'caseFileDetail.beneficiaryPhoneNumber.mobileInitial'" />

          <case-file-details-beneficiary-phone-number
            v-if="primaryBeneficiary.alternatePhoneNumber"
            data-test="caseFileDetails-alternate-phone-number"
            :phone-number="primaryBeneficiary.alternatePhoneNumber"
            :label="'caseFileDetail.beneficiaryPhoneNumber.alternateInitial'" />
        </div>
      </div>

      <div
        v-if="household"
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
        class="d-flex flex-row rc-body14 mb-4">
        <v-icon small class="mr-2">
          mdi-account-multiple
        </v-icon>
        <span data-test="caseFileDetails-household-member-count">
          {{ household && household.entity && household.entity.members
            ? `${$t('caseFileDetail.fullHouseHold')} ${household.entity.members.length}`
            : "-" }}
        </span>
      </div>

      <v-btn
        v-if="canViewHousehold && household"
        small
        color="primary"
        class="mb-4"
        data-test="household-profile-btn"
        @click="goToHouseholdProfile()">
        {{ $t('caseFileDetail.household_profile.button') }}
      </v-btn>

      <case-file-verify-identity-dialog
        v-if="showVerifyIdentityDialog"
        :case-file="caseFile.entity"
        :show.sync="showVerifyIdentityDialog" />
      <impact-validation
        v-if="showImpact"
        :case-file="caseFile.entity"
        :show.sync="showImpact" />
    </template>

    <template slot="default">
      <router-view :key="$route.fullPath" />
    </template>
  </page-template>
</template>

<script lang="ts">
import Vue from 'vue';
import { IHouseholdCombined, IMemberMetadata } from '@crctech/registration-lib/src/entities/household';
import { ICaseFileCombined, IdentityAuthenticationStatus, ValidationOfImpactStatus } from '@/entities/case-file';
import PageTemplate from '@/ui/views/components/layout/PageTemplate.vue';
import { ECanadaProvinces, INavigationTab } from '@/types';
import routes from '@/constants/routes';
import CaseFileDetailsBeneficiaryPhoneNumber from './components/CaseFileDetailsBeneficiaryPhoneNumber.vue';
import CaseFileVerifyIdentityDialog from './components/CaseFileVerifyIdentityDialog.vue';
import ImpactValidation from './components/ImpactValidationDialog.vue';

export default Vue.extend({
  name: 'CaseFileDetails',

  components: {
    PageTemplate,
    CaseFileDetailsBeneficiaryPhoneNumber,
    CaseFileVerifyIdentityDialog,
    ImpactValidation,
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
      household: null as IHouseholdCombined,
      showVerifyIdentityDialog: false,
      showImpact: false,
    };
  },

  computed: {
    addressFirstLine(): string {
      const { address } = this.household?.entity?.address;
      if (!address) return '';
      const unitSuite = address.unitSuite ? `${address.unitSuite}-` : '';
      return unitSuite + address.streetAddress;
    },

    addressSecondLine(): string {
      const { address } = this.household?.entity?.address;
      if (!address) return '';
      return `${address.city}, ${this.provinceCodeName} ${address.postalCode}`;
    },

    caseFile(): ICaseFileCombined {
      return this.$storage.caseFile.getters.get(this.id);
    },

    canEdit(): boolean {
      return this.$hasLevel('level1');
    },

    canViewHousehold():boolean {
      return this.$hasLevel('level1');
    },

    colorValidationImpact() {
      switch (this.caseFile?.entity?.impactStatusValidation?.status) {
        case ValidationOfImpactStatus.Impacted: return 'status_success';
        case ValidationOfImpactStatus.NotImpacted: return 'status_error';
        default: return 'status_warning';
      }
    },

    colorVerifyIdentity() {
      switch (this.caseFile?.entity?.identityAuthentication?.status) {
        case IdentityAuthenticationStatus.Passed: return 'status_success';
        case IdentityAuthenticationStatus.Failed: return 'status_error';
        default: return 'status_warning';
      }
    },

    hasPhoneNumbers(): boolean {
      if (!this.primaryBeneficiary) return false;
      return !!(this.primaryBeneficiary.mobilePhoneNumber || this.primaryBeneficiary.homePhoneNumber || this.primaryBeneficiary.alternatePhoneNumber);
    },

    primaryBeneficiary(): IMemberMetadata {
      return this.household?.metadata?.memberMetadata.find((m: IMemberMetadata) => m.id === this.household.entity.primaryBeneficiary);
    },

    primaryBeneficiaryFullName(): string {
      if (!this.primaryBeneficiary) return '';
      const { firstName, lastName } = this.primaryBeneficiary;
      return `${firstName} ${lastName}`;
    },

    provinceCodeName(): string {
      const provinceCode = this.household?.entity.address.address.province;
      if (!provinceCode) return '';
      if (provinceCode === ECanadaProvinces.OT) {
        return this.household?.entity.address.address.specifiedOtherProvince;
      }
      return this.$t(`common.provinces.code.${ECanadaProvinces[provinceCode]}`) as string;
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
        test: 'documents',
        to: routes.caseFile.documents.home.name,
        exact: false,
      }, {
        text: this.$t('caseFileDetail.menu_financial_assistance') as string,
        test: 'case-financial-assistance',
        to: routes.caseFile.financialAssistance.home.name,
      }, {
        text: this.$t('caseFileDetail.menu_assessments') as string,
        test: 'assessments',
        // to: routes.caseFileAssessments.name,
        disabled: true,
      }, {
        text: this.$t('caseFileDetail.menu_referrals') as string,
        test: 'referrals',
        to: routes.caseFile.referrals.home.name,
        exact: false,
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
      await this.$storage.caseFile.actions.fetch(this.id);
      await this.getHouseholdInfo();
    } catch {
      this.error = true;
    } finally {
      this.loading = false;
    }
  },

  methods: {

    async getHouseholdInfo() {
      const { householdId } = this.caseFile.entity;
      this.household = await this.$storage.household.actions.fetch(householdId);
    },

    goToHouseholdProfile() {
      this.$router.push({
        name: routes.household.householdProfile.name,
        params: {
          id: this.caseFile?.entity?.householdId,
        },
      });
    },

    openImpactValidation() {
      this.showImpact = true;
    },

    openVerifyIdentity() {
      this.showVerifyIdentityDialog = true;
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
