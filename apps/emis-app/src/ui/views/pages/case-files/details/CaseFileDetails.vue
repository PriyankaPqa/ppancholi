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
        <span data-test="caseFileDetails-caseFileNumber">{{ caseFile.caseFileNumber }}</span>
      </div>

      <div class="rc-body14 pb-2">
        <v-icon size="16" class="pr-2" color="gray darken-2">
          mdi-calendar
        </v-icon>
        <span data-test="caseFileDetails-event">
          {{ caseFileMetadata.event ? $m(caseFileMetadata.event.name) : '-' }}
        </span>
      </div>
      <div class="divider" />

      <div class="mb-4">
        <rc-tooltip bottom>
          <template #activator="{ on }">
            <v-btn
              v-if="canEdit"
              class="mr-2 status"
              text
              :color="colorVerifyIdentity"
              data-test="caseFileDetails-verify-identity-icon"
              v-on="on"
              @click="openVerifyIdentity">
              <v-icon>mdi-shield-check</v-icon>
            </v-btn>
            <v-icon v-else :color="colorVerifyIdentity" class="mr-2 status" v-on="on">
              mdi-shield-check
            </v-icon>
          </template>
          {{ $t('caseFileDetail.verifyIdentityDialog.title') }}
        </rc-tooltip>

        <rc-tooltip bottom>
          <template #activator="{ on }">
            <v-btn
              v-if="canEdit"
              class="mr-2 status"
              text
              :color="colorValidationImpact"
              data-test="caseFileDetails-verify-impact-icon"
              v-on="on"
              @click="openImpactValidation">
              <v-icon>mdi-map-check</v-icon>
            </v-btn>
            <v-icon v-else :color="colorValidationImpact" class="mr-2 status" v-on="on">
              mdi-map-check
            </v-icon>
          </template>
          {{ $t('caseFileDetail.impactValidationDialog.title') }}
        </rc-tooltip>
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
        v-if="household && (addressFirstLine || addressSecondLine)"
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
          {{ household && household && household.members
            ? `${$t('caseFileDetail.fullHouseHold')} ${household.members.length}`
            : "-" }}
        </span>
      </div>

      <v-btn
        v-if="household"
        small
        color="primary"
        class="mb-4"
        data-test="household-profile-btn"
        @click="goToHouseholdProfile()">
        {{ $t('caseFileDetail.household_profile.button') }}
      </v-btn>

      <case-file-verify-identity-dialog
        v-if="showVerifyIdentityDialog"
        :case-file="caseFile"
        :show.sync="showVerifyIdentityDialog" />
      <impact-validation
        v-if="showImpact"
        :case-file="caseFile"
        :show.sync="showImpact" />
    </template>

    <template slot="default">
      <router-view :key="$route.fullPath" />
    </template>
  </page-template>
</template>

<script lang="ts">
import { RcTooltip } from '@libs/component-lib/components';
import { IHouseholdEntity, IHouseholdMemberMetadata, IHouseholdMetadata } from '@libs/entities-lib/household';
import mixins from 'vue-typed-mixins';
import { IdentityAuthenticationStatus, ValidationOfImpactStatus } from '@libs/entities-lib/case-file';
import PageTemplate from '@/ui/views/components/layout/PageTemplate.vue';
import { INavigationTab } from '@libs/shared-lib/types';
import routes from '@/constants/routes';
import householdHelpers from '@/ui/helpers/household';
import { FeatureKeys } from '@libs/entities-lib/tenantSettings';
import { useEventStore } from '@/pinia/event/event';
import { useHouseholdMetadataStore, useHouseholdStore } from '@/pinia/household/household';
import { useCaseFileMetadataStore, useCaseFileStore } from '@/pinia/case-file/case-file';
import { useUserStore } from '@/pinia/user/user';
import CaseFileDetailsBeneficiaryPhoneNumber from './components/CaseFileDetailsBeneficiaryPhoneNumber.vue';
import CaseFileVerifyIdentityDialog from './components/CaseFileVerifyIdentityDialog.vue';
import ImpactValidation from './components/ImpactValidationDialog.vue';
import caseFileDetail from './caseFileDetail';

export default mixins(caseFileDetail).extend({
  name: 'CaseFileDetails',

  components: {
    PageTemplate,
    CaseFileDetailsBeneficiaryPhoneNumber,
    CaseFileVerifyIdentityDialog,
    ImpactValidation,
    RcTooltip,
  },

  data() {
    return {
      loading: false,
      household: null as IHouseholdEntity,
      householdMetadata: null as IHouseholdMetadata,
      showVerifyIdentityDialog: false,
      showImpact: false,
    };
  },

  computed: {
    addressFirstLine(): string {
      return householdHelpers.getAddressLines(this.household?.address?.address)[0] || '';
    },

    addressSecondLine(): string {
      return householdHelpers.getAddressLines(this.household?.address?.address)[1] || '';
    },

    canEdit(): boolean {
      return this.$hasLevel('level1') && !this.readonly;
    },

    colorValidationImpact() {
      switch (this.caseFile?.impactStatusValidation?.status) {
        case ValidationOfImpactStatus.Impacted: return 'status_success';
        case ValidationOfImpactStatus.NotImpacted: return 'status_error';
        default: return 'status_warning';
      }
    },

    colorVerifyIdentity() {
      switch (this.caseFile?.identityAuthentication?.status) {
        case IdentityAuthenticationStatus.Passed: return 'status_success';
        case IdentityAuthenticationStatus.Failed: return 'status_error';
        default: return 'status_warning';
      }
    },

    hasPhoneNumbers(): boolean {
      if (!this.primaryBeneficiary) {
        return false;
      }
      return !!(this.primaryBeneficiary.mobilePhoneNumber || this.primaryBeneficiary.homePhoneNumber || this.primaryBeneficiary.alternatePhoneNumber);
    },

    primaryBeneficiary(): IHouseholdMemberMetadata {
      return this.householdMetadata?.memberMetadata.find((m: IHouseholdMemberMetadata) => m.id === this.household.primaryBeneficiary);
    },

    primaryBeneficiaryFullName(): string {
      if (!this.primaryBeneficiary) {
        return '';
      }
      const { firstName, lastName } = this.primaryBeneficiary;
      return `${firstName} ${lastName}`;
    },

    provinceCodeName(): string {
      return householdHelpers.provinceCodeName(this.household?.address.address);
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
        disabled: !this.canAccess,
      }, {
        text: this.$t('caseFileDetail.menu_documents') as string,
        test: 'documents',
        to: routes.caseFile.documents.home.name,
        exact: false,
      }, {
        text: this.$t('caseFileDetail.menu_financial_assistance') as string,
        test: 'case-financial-assistance',
        to: routes.caseFile.financialAssistance.home.name,
        exact: false,
      }, {
        text: this.$t('caseFileDetail.menu_assessments') as string,
        test: 'assessments',
        to: routes.caseFile.assessments.home.name,
        exact: false,
        disabled: !this.$hasFeature(FeatureKeys.AssessmentsWithinCasefiles),
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

    canAccess(): boolean {
      if (useUserStore().getUser().currentRole() === 'level0') {
        return this.$hasFeature(FeatureKeys.L0Access);
      }
        return true;
    },
  },

  async created() {
    this.loading = true;
    try {
      await useCaseFileStore().fetch(this.caseFileId);
      await useCaseFileMetadataStore().fetch(this.caseFileId, false);
      await useEventStore().fetch(this.caseFile.eventId);
      await this.getHouseholdInfo();
    } finally {
      this.loading = false;
    }
  },

  methods: {

    async getHouseholdInfo() {
      const { householdId } = this.caseFile;
      this.household = await useHouseholdStore().fetch(householdId);
      this.householdMetadata = await useHouseholdMetadataStore().fetch(householdId, false);
    },

    goToHouseholdProfile() {
      this.$router.push({
        name: routes.household.householdProfile.name,
        params: {
          id: this.caseFile?.householdId,
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
