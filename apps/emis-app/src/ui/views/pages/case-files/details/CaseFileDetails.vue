<template>
  <page-template
    :loading="loading"
    :left-menu-title="getPrimaryMemberFullName()"
    :left-menu-title-icon="isDuplicate ? '$rctech-duplicate' : ''"
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
          {{ event ? $m(event.name) : '-' }}
        </span>
      </div>
      <div class="divider" />

      <div class="mb-4">
        <rc-tooltip bottom>
          <template #activator="{ on }">
            <v-btn v-if="canEdit" text tile class="pa-0 mb-2 validation-button" data-test="caseFileDetails-verify-identity-icon" v-on="on" @click="openVerifyIdentity">
              <div class="d-flex align-center" :class="colorVerifyIdentity" data-test="caseFileDetails-identity-icon-color-validation">
                <div class="py-1 px-1" :class="colorVerifyIdentityIcon">
                  <v-icon dense color="white" class="default-icon-color">
                    {{ verifyIdentityIcon }}
                  </v-icon>
                </div>
                <div class="ml-2">
                  <span class="rc-body12"> {{ `${$t('caseFileDetail.verifyIdentity')} ${verifyIdentityStatus}` }} </span>
                </div>
              </div>
            </v-btn>
            <div v-else class="d-flex align-center mb-2 validation-button" :class="colorVerifyIdentity" v-on="on">
              <div class="py-1 px-1" :class="colorVerifyIdentityIcon">
                <v-icon dense color="white" class="default-icon-color">
                  {{ verifyIdentityIcon }}
                </v-icon>
              </div>
              <div class="ml-2">
                <span class="rc-body12"> {{ `${$t('caseFileDetail.verifyIdentity')} ${verifyIdentityStatus}` }} </span>
              </div>
            </div>
          </template>
          {{ $t('caseFileDetail.verifyIdentityDialog.title') }}
        </rc-tooltip>

        <div class="mb-4">
          <rc-tooltip bottom>
            <template #activator="{ on }">
              <v-btn v-if="canEdit" text tile class="pa-0 validation-button" data-test="caseFileDetails-verify-impact-icon" v-on="on" @click="openImpactValidation">
                <div class="d-flex align-center" :class="colorValidationImpact" data-test="caseFileDetails-impact-icon-color-validation">
                  <div class="py-1 px-1" :class="colorValidationImpactIcon">
                    <v-icon dense color="white" class="default-icon-color">
                      {{ validationImpactIcon }}
                    </v-icon>
                  </div>
                  <div class="ml-2">
                    <span class="rc-body12"> {{ `${$t('caseFileDetail.verifyImpact')} ${validationImpactStatus}` }} </span>
                  </div>
                </div>
              </v-btn>
              <div v-else class="validation-button d-flex align-center" :class="colorValidationImpact" v-on="on">
                <div class="py-1 px-1" :class="colorValidationImpactIcon">
                  <v-icon dense color="white" class="default-icon-color">
                    {{ validationImpactIcon }}
                  </v-icon>
                </div>
                <div class="ml-2">
                  <span class="rc-body12"> {{ `${$t('caseFileDetail.verifyImpact')} ${validationImpactStatus}` }} </span>
                </div>
              </div>
            </template>
            {{ $t('caseFileDetail.impactValidationDialog.title') }}
          </rc-tooltip>
        </div>
        <div
          v-if="getPrimaryMember() && getPrimaryMember().contactInformation && getPrimaryMember().contactInformation.email"
          class="d-flex flex-row align-start mb-2 rc-body14 break-word">
          <v-icon small class="mr-2 mt-1" color="gray darken-2">
            mdi-email
          </v-icon>
          <span data-test="caseFileDetails-email">{{ getPrimaryMember().contactInformation.email }}</span>
        </div>

        <household-details-list
          v-if="household && getPrimaryMember()"
          :primary-beneficiary="getPrimaryMember()"
          :address-first-line="getAddressFirstLine()"
          :address-second-line="getAddressSecondLine()"
          :has-phone-numbers="hasPhoneNumbers()"
          :country="getCountry()" />

        <div
          class="d-flex flex-row rc-body14">
          <v-icon small class="mr-2">
            mdi-account-multiple
          </v-icon>
          <span data-test="caseFileDetails-household-member-count">
            {{ household && household.members
              ? `${$t('caseFileDetail.fullHouseHold')} ${household.members.length}`
              : "-" }}
          </span>
        </div>

        <div class="d-flex flex-row rc-body14 mt-2" data-test="caseFileDetails-receiving-assistance-member-count">
          <v-icon small class="mr-2">
            mdi-account-multiple
          </v-icon>
          <span>
            {{
              `${$t('caseFileDetail.totalImpacted')}  ${receivingAssistanceMembersCount}`
            }}
          </span>
        </div>

        <v-btn
          v-if="household"
          small
          color="primary"
          class="my-4"
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
      </div>
    </template>

    <template slot="default">
      <router-view :key="$route.fullPath" />
    </template>
  </page-template>
</template>

<script lang="ts">
import { computed } from 'vue';
import { RcTooltip } from '@libs/component-lib/components';
import mixins from 'vue-typed-mixins';
import { IdentityAuthenticationStatus, ValidationOfImpactStatus } from '@libs/entities-lib/case-file';
import PageTemplate from '@/ui/views/components/layout/PageTemplate.vue';
import { INavigationTab, Status } from '@libs/shared-lib/types';
import routes from '@/constants/routes';

import { UserRoles } from '@libs/entities-lib/user';
import { useEventStore } from '@/pinia/event/event';
import { useHouseholdStore } from '@/pinia/household/household';
import { useCaseFileStore } from '@/pinia/case-file/case-file';
import { useUserStore } from '@/pinia/user/user';
import { useHouseholdDetails } from '@/ui/views/pages/household/useHouseholdDetails';
import { usePersonStore } from '@/pinia/person/person';
import { MembershipStatus } from '@libs/entities-lib/case-file-individual';
import { useCaseFileIndividualStore } from '@/pinia/case-file-individual/case-file-individual';
import CaseFileVerifyIdentityDialog from './components/CaseFileVerifyIdentityDialog.vue';
import HouseholdDetailsList from './components/HouseholdDetailsList.vue';
import ImpactValidation from './components/ImpactValidationDialog.vue';
import caseFileDetail from './caseFileDetail';

export default mixins(caseFileDetail).extend({
  name: 'CaseFileDetails',

  components: {
    PageTemplate,
    CaseFileVerifyIdentityDialog,
    ImpactValidation,
    HouseholdDetailsList,
    RcTooltip,
  },

  setup(props: { id: string }) {
    const caseFile = computed(() => useCaseFileStore().getById(props.id));
    const household = computed(() => useHouseholdStore().getById(caseFile.value.householdId));
    const members = computed(() => usePersonStore().getByIds(household.value?.members || []));

    const { getAddressFirstLine,
    getAddressSecondLine,
    getPrimaryMember,
    getPrimaryMemberFullName,
    hasPhoneNumbers,
    getCountry,
     } = useHouseholdDetails(household, members);
    return { household, members, getAddressFirstLine, getAddressSecondLine, getPrimaryMember, getCountry, getPrimaryMemberFullName, hasPhoneNumbers };
  },

  data() {
    return {
      loading: false,
      showVerifyIdentityDialog: false,
      showImpact: false,
      isDuplicate: null as boolean,
    };
  },

  computed: {
    canEdit(): boolean {
      return this.$hasLevel(UserRoles.level1) && !this.readonly;
    },

    colorValidationImpact() {
      switch (this.caseFile?.impactStatusValidation?.status) {
        case ValidationOfImpactStatus.Impacted: return 'validation-button-success';
        case ValidationOfImpactStatus.NotImpacted: return 'validation-button-error';
        default: return 'validation-button-warning';
      }
    },

    colorValidationImpactIcon() {
      switch (this.caseFile?.impactStatusValidation?.status) {
        case ValidationOfImpactStatus.Impacted: return 'rc-success-background';
        case ValidationOfImpactStatus.NotImpacted: return 'rc-error-background';
        default: return 'rc-warning-background';
      }
    },

    validationImpactStatus() {
      switch (this.caseFile?.impactStatusValidation?.status) {
        case ValidationOfImpactStatus.Impacted: return this.$t('caseFile.beneficiaryImpactValidationStatus.Impacted');
        case ValidationOfImpactStatus.NotImpacted: return this.$t('caseFile.beneficiaryImpactValidationStatus.NotImpacted');
        default: return this.$t('caseFile.beneficiaryImpactValidationStatus.Undetermined');
      }
    },

    validationImpactIcon() {
      switch (this.caseFile?.impactStatusValidation?.status) {
        case ValidationOfImpactStatus.Impacted: return 'mdi-map-check';
        case ValidationOfImpactStatus.NotImpacted: return '$rctech-validation-impact-no';
        default: return '$rctech-validation-impact-undetermined';
      }
    },

    colorVerifyIdentity() {
      switch (this.caseFile?.identityAuthentication?.status) {
        case IdentityAuthenticationStatus.Passed: return 'validation-button-success';
        case IdentityAuthenticationStatus.Failed: return 'validation-button-error';
        default: return 'validation-button-warning';
      }
    },

    colorVerifyIdentityIcon() {
      switch (this.caseFile?.identityAuthentication?.status) {
        case IdentityAuthenticationStatus.Passed: return 'rc-success-background';
        case IdentityAuthenticationStatus.Failed: return 'rc-error-background';
        default: return 'rc-warning-background';
      }
    },

    verifyIdentityStatus() {
      switch (this.caseFile?.identityAuthentication?.status) {
        case IdentityAuthenticationStatus.Passed: return this.$t('caseFile.beneficiaryIdentityVerificationStatus.Passed');
        case IdentityAuthenticationStatus.Failed: return this.$t('caseFile.beneficiaryIdentityVerificationStatus.Failed');
        default: return this.$t('caseFile.beneficiaryIdentityVerificationStatus.NotVerified');
      }
    },

    verifyIdentityIcon() {
      switch (this.caseFile?.identityAuthentication?.status) {
        case IdentityAuthenticationStatus.Passed: return 'mdi-shield-check';
        case IdentityAuthenticationStatus.Failed: return '$rctech-identity-failed';
        default: return '$rctech-identity-not-verified';
      }
    },

    isL0(): boolean {
      return useUserStore().getUser().currentRole() === 'level0';
    },

    recoveryPlanInvisible(): boolean {
      const recoveryPlanInvisibleRoles = ['level0', 'contributorIM', 'contributorFinance', 'readonly'];
      return recoveryPlanInvisibleRoles.indexOf(useUserStore().getUser().currentRole()) > -1;
    },

    tabs(): Array<INavigationTab> {
      const taskTab = {
          text: this.$t('caseFileDetail.menu_tasks') as string,
          test: 'tasks',
          to: routes.caseFile.task.home.name,
          exact: false,
      };

        const tabs = [
          {
            text: this.$t('caseFileDetail.menu_activity') as string,
            test: 'case-file-activity',
            icon: '',
            to: routes.caseFile.activity.name,
          },
          {
            text: this.$t('caseFileDetail.menu_case_note') as string,
            test: 'case-note',
            to: routes.caseFile.note.name,
          },
          {
            text: this.$t('caseFileDetail.menu_assessments') as string,
            test: 'assessments',
            to: routes.caseFile.assessments.home.name,
            exact: false,
            disabled: !this.canL0AccessAssessment,
          },
          {
            text: this.$t('caseFileDetail.menu_financial_assistance') as string,
            test: 'case-financial-assistance',
            to: routes.caseFile.financialAssistance.home.name,
            exact: false,
          },
          !this.isL0 && {
            text: this.$t('caseFileDetail.menu_referrals') as string,
            test: 'referrals',
            to: routes.caseFile.referrals.home.name,
            exact: false,
          },
          {
            text: this.$t('caseFileDetail.menu_impacted_individuals') as string,
            test: 'impacted_individuals',
            to: this.$hasFeature(this.$featureKeys.CaseFileIndividual) ? routes.caseFile.impactedIndividuals.homeV2.name : routes.caseFile.impactedIndividuals.home.name,
            exact: false,
          },
          !this.recoveryPlanInvisible && {
            text: this.$t('caseFileDetail.menu_recoveryPlan') as string,
            test: 'recovery-plan',
            to: this.caseFile.recoveryPlan === null ? routes.caseFile.recoveryPlan.create.name : routes.caseFile.recoveryPlan.details.name,
          },
          !this.isL0 && {
            text: this.$t('caseFileDetail.menu_documents') as string,
            test: 'documents',
            to: routes.caseFile.documents.home.name,
            exact: false,
          },
          this.$hasFeature(this.$featureKeys.TaskManagement) && taskTab,
        ];

        return tabs.filter((t) => t);
    },

    canL0AccessAssessment(): boolean {
      if (useUserStore().getUser().currentRole() === 'level0') {
        return this.event?.assessmentsForL0usersEnabled;
      }
      return true;
    },

    receivingAssistanceMembersCount(): number {
        const receivingAssistanceMembers = (this.$hasFeature(this.$featureKeys.CaseFileIndividual)
          ? this.individuals
            .filter((i) => i.membershipStatus === MembershipStatus.Active && usePersonStore().getById(i.personId)?.status === Status.Active) : this.caseFile.impactedIndividuals)
          ?.filter((m) => m.receivingAssistance);

        return receivingAssistanceMembers?.length || 0;
    },
  },

  watch: {
    async id(newValue, oldValue) {
      if (oldValue === '' || newValue === oldValue) {
        return;
      }
      await this.fetchData();
    },

    household() {
      this.getRelatedHouseholdInfo();
    },
  },

  async created() {
    await this.fetchData();
  },

  methods: {
    async getHouseholdInfo() {
      const { householdId } = this.caseFile;
      await useHouseholdStore().fetch(householdId);
      await this.getRelatedHouseholdInfo();
    },

    async getRelatedHouseholdInfo() {
      if (!this.household?.members) {
        return;
      }
      await usePersonStore().fetchByIds(this.household.members, true);

      const individuals = await useCaseFileIndividualStore().fetchAll({ caseFileId: this.caseFileId });
      await usePersonStore().fetchByIds(individuals.map((i) => i.personId), true);
      this.isDuplicate = (await this.$services.potentialDuplicates.getPotentialDuplicatesCount(this.household.id)) > 0;
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

    async fetchData() {
      this.loading = true;
      try {
        await useCaseFileStore().fetch(this.caseFileId);
        await useEventStore().fetch(this.caseFile.eventId);
        await this.getHouseholdInfo();
        await useCaseFileStore().addRecentlyViewed(this.caseFileId);
      } finally {
        this.loading = false;
      }
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

  .validation-button-success {
    background-color: var(--v-status_success_light-base);
    width: 176px;
    border-radius: 6px;
    border: 1px solid var(--v-status_success-base);
  }

  .validation-button-error {
    background-color: var(--v-status_error_light-base);
    width: 176px;
    border-radius: 6px;
    border: 1px solid var(--v-status_error-base);
  }

  .validation-button-warning {
    background-color: var(--v-status_warning_light-base);
    width: 176px;
    border-radius: 6px;
    border: 1px solid var(--v-status_warning-base);
  }

  .validation-button {
    font-size: 12px !important;
    font-weight: normal !important;
    text-transform: none !important;
  }

</style>
