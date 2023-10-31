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
        v-if="getPrimaryMember() && getPrimaryMember().email"
        class="d-flex flex-row align-start mb-2 rc-body14 break-word">
        <v-icon small class="mr-2 mt-1" color="gray darken-2">
          mdi-email
        </v-icon>
        <span data-test="caseFileDetails-email">{{ getPrimaryMember().email }}</span>
      </div>

      <household-details-list
        v-if="household && getPrimaryMember()"
        :primary-beneficiary="getPrimaryMember()"
        :address-first-line="getAddressFirstLine()"
        :address-second-line="getAddressSecondLine()"
        :has-phone-numbers="hasPhoneNumbers()"
        :country="$hasFeature(FeatureKeys.ManageDuplicates) ? getCountry() : ''" />

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
import { INavigationTab } from '@libs/shared-lib/types';
import routes from '@/constants/routes';
import { FeatureKeys } from '@libs/entities-lib/tenantSettings';
import { UserRoles } from '@libs/entities-lib/user';
import { useEventStore } from '@/pinia/event/event';
import { useHouseholdMetadataStore, useHouseholdStore } from '@/pinia/household/household';
import { useCaseFileMetadataStore, useCaseFileStore } from '@/pinia/case-file/case-file';
import { useUserStore } from '@/pinia/user/user';
import { useHouseholdDetails } from '@/ui/views/pages/household/useHouseholdDetails';
import { IHouseholdMetadata } from '@libs/entities-lib/household';
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
    const householdMetadata = computed(() => useHouseholdMetadataStore().getById(caseFile.value.householdId));

    const { getAddressFirstLine,
    getAddressSecondLine,
    getPrimaryMember,
    getPrimaryMemberFullName,
    hasPhoneNumbers,
    getCountry,
     } = useHouseholdDetails(household, householdMetadata);
    return { household, householdMetadata, getAddressFirstLine, getAddressSecondLine, getPrimaryMember, getCountry, getPrimaryMemberFullName, hasPhoneNumbers };
  },

  data() {
    return {
      loading: false,
      showVerifyIdentityDialog: false,
      showImpact: false,
      FeatureKeys,
    };
  },

  computed: {
    canEdit(): boolean {
      return this.$hasLevel(UserRoles.level1) && !this.readonly;
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

    isL0(): boolean {
      return useUserStore().getUser().currentRole() === 'level0';
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
            to: routes.caseFile.impactedIndividuals.home.name,
            exact: false,
          },
          !this.isL0 && {
            text: this.$t('caseFileDetail.menu_recoveryPlan') as string,
            test: 'recovery-plan',
            disabled: true,
          },
          !this.isL0 && {
            text: this.$t('caseFileDetail.menu_documents') as string,
            test: 'documents',
            to: routes.caseFile.documents.home.name,
            exact: false,
          },
          this.$hasFeature(FeatureKeys.TaskManagement) && taskTab,
        ];

        return tabs.filter((t) => t);
    },

    canL0AccessAssessment(): boolean {
      if (useUserStore().getUser().currentRole() === 'level0') {
        return this.event?.assessmentsForL0usersEnabled;
      }
      return true;
    },

    isDuplicate(): boolean {
      return this.$hasFeature(FeatureKeys.ManageDuplicates) && (this.householdMetadata as unknown as IHouseholdMetadata)?.potentialDuplicatesCount > 0;
    },

    receivingAssistanceMembersCount(): number {
        const receivingAssistanceMembers = this.caseFile.impactedIndividuals?.filter((m) => m.receivingAssistance);
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
  },

  async created() {
    await this.fetchData();
  },

  methods: {
    async getHouseholdInfo() {
      const { householdId } = this.caseFile;
      await useHouseholdStore().fetch(householdId);
      await useHouseholdMetadataStore().fetch(householdId, false);
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
        await useCaseFileMetadataStore().fetch(this.caseFileId, false);
        await useEventStore().fetch(this.caseFile.eventId);
        await this.getHouseholdInfo();
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

</style>
