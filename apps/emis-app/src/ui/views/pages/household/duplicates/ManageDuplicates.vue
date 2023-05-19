<template>
  <rc-dialog
    :title="$t('householdDetails.manageDuplicates')"
    :cancel-action-label="$t('common.buttons.close')"
    :show.sync="show"
    content-padding="6"
    content-only-scrolling
    fullscreen
    persistent
    show-close
    :show-help="false"
    :show-submit="false"
    :tooltip-label="$t('common.tooltip_label')"
    :loading="submitLoading"
    :init-loading="initLoading"
    @close="allowLeave(false)"
    @cancel="allowLeave(false)">
    <v-row>
      <v-col col="12" md="2" sm="3">
        <v-sheet rounded outlined>
          <div class="household-details-header rc-body14 px-6 py-3">
            {{ $t('householdDetails.manageDuplicates.referenceHousehold') }}
          </div>
          <h5 class="rc-heading-5 px-6 py-3" data-test="householdDetails-manageDuplicate-primaryBeneficiaryFullName">
            {{ primaryBeneficiaryFullName }}
          </h5>

          <div class="px-4 pb-4">
            <div
              class="d-flex flex-row align-start mb-2 rc-body14 break-word">
              <v-icon small class="mr-2 mt-1" color="secondary">
                mdi-clipboard-text
              </v-icon>
              <span data-test="householdDetails-manageDuplicate-registrationNumber">
                {{ $t('household.profile.registration_number') }}:
                {{ household.registrationNumber }}</span>
            </div>
            <v-divider v-if="sortedMembers.length" class="mx-0 mb-3" />

            <div v-if="sortedMembers.length" class="d-flex flex-row align-start mb-2 rc-body14 break-word">
              <v-icon small class="mr-2 mt-1" color="secondary">
                mdi-account
              </v-icon>
              <div data-test="householdDetails-manageDuplicate-householdMembers">
                {{ $t('householdDetails.manageDuplicates.householdMembers') }}:
                <div v-for="member in sortedMembers" :key="member.id" class="d-flex flex-column">
                  {{ member.firstName }} {{ member.lastName }}
                </div>
              </div>
            </div>
            <v-divider v-if="hasPhoneNumbers || addressFirstLine" class="mx-0 mb-3" />

            <household-details-list
              v-if="primaryBeneficiary && household"
              data-test="householdDetails-manageDuplicates-details"
              :primary-beneficiary="primaryBeneficiary"
              :address-first-line="addressFirstLine"
              :address-second-line="addressSecondLine"
              :has-phone-numbers="hasPhoneNumbers"
              :country="country"
              on-duplicate-page />
          </div>
        </v-sheet>
      </v-col>
      <v-col col="12" md="10" sm="9">
        <rc-tabs class="mt-4 mb-0">
          <rc-tab
            v-for="tab in tabs"
            :key="tab"
            :label="getTabLabel(tab)"
            :data-test="`householdDetails-manageDuplicates--${SelectedTab[tab]}`"
            :active="selectedTab === tab"
            @click="allowLeave(true, tab)" />
        </rc-tabs>

        <div v-if="selectedTab !== SelectedTab.FlagNew" class="pa-4 mt-2 rc-body14">
          {{ subtitle }}
        </div>

        <v-divider v-if="selectedTab !== SelectedTab.FlagNew" />

        <manage-duplicates-table
          v-if="selectedTab === SelectedTab.Potential"
          :key="SelectedTab.Potential"
          :loading="initLoading"
          is-potential-table
          :duplicates="potentialDuplicates"
          :current-household-id="household.id"
          data-test="householdDetails-manageDuplicates-potentialDuplicatesTable" />

        <manage-duplicates-table
          v-if="selectedTab === SelectedTab.Resolved"
          :key="SelectedTab.Resolved"
          :loading="initLoading"
          :duplicates="resolvedDuplicates"
          :current-household-id="household.id"
          data-test="householdDetails-manageDuplicates-resolvedDuplicatesTable" />

        <v-row v-if="selectedTab === SelectedTab.FlagNew" justify="center">
          <v-col cols="12" lg="8" class="full-width">
            <div class="py-4 mt-2 rc-body14">
              {{ subtitle }}
            </div>
            <manage-duplicates-flag-new
              ref="flagNew"
              :key="SelectedTab.FlagNew"
              :household-registration-number="household.registrationNumber"
              :household-id="household.id"
              @goToFirstTab="selectedTab = SelectedTab.Potential"
              @fetchDuplicates="fetchDuplicates" />
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </rc-dialog>
</template>

<script lang="ts">
import mixins from 'vue-typed-mixins';
import _orderBy from 'lodash/orderBy';
import { TranslateResult } from 'vue-i18n';
import { RcDialog, RcTab, RcTabs } from '@libs/component-lib/components';
import HouseholdDetailsList from '@/ui/views/pages/case-files/details/components/HouseholdDetailsList.vue';
import { IHouseholdEntity, IHouseholdMetadata, IDuplicateData, IHouseholdDuplicateFullData,
  DuplicateStatus, IHouseholdDuplicate } from '@libs/entities-lib/household';
import { VForm } from '@libs/shared-lib/types';
import helpers from '@/ui/helpers/helpers';
import { UserRoles } from '@libs/entities-lib/user';
import householdDetails from '../householdDetails';
import ManageDuplicatesTable from './ManageDuplicatesTable.vue';
import ManageDuplicatesFlagNew from './ManageDuplicatesFlagNew.vue';

export enum SelectedTab {
  Potential = 1,
  Resolved = 2,
  FlagNew = 3,
}

export default mixins(householdDetails).extend({
  name: 'ManageDuplicates',

  components: {
    RcDialog,
    RcTab,
    RcTabs,
    ManageDuplicatesTable,
    ManageDuplicatesFlagNew,
    HouseholdDetailsList,
  },

  props: {
    show: {
      type: Boolean,
      required: true,
    },
    householdProp: {
      type: Object as () => IHouseholdEntity,
      required: true,
    },
    householdMetadataProp: {
      type: Object as () => IHouseholdMetadata,
      required: true,
    },
  },

  data() {
    return {
      SelectedTab,
      selectedTab: SelectedTab.Potential,
      initLoading: false,
      submitLoading: false,
      duplicateData: [] as IDuplicateData[],
      household: this.householdProp,
      householdMetadata: this.householdMetadataProp,
    };
  },

  computed: {
    tabs() {
      const tabs = [SelectedTab.Potential, SelectedTab.FlagNew];
      if (this.$hasLevel(UserRoles.level5)) {
        tabs.splice(1, 0, SelectedTab.Resolved);
      }
      return tabs;
    },

    potentialDuplicates(): IHouseholdDuplicateFullData[] {
      return this.duplicates?.filter((d) => d.duplicateStatus === DuplicateStatus.Potential) || [];
    },

    resolvedDuplicates(): IHouseholdDuplicateFullData[] {
      return this.duplicates?.filter((d) => d.duplicateStatus === DuplicateStatus.Resolved) || [];
    },

    sortedMembers() {
      if (!this.householdMetadata?.memberMetadata) {
        return [];
      }
      return _orderBy(this.householdMetadata.memberMetadata.filter((m) => m.id !== this.primaryBeneficiary?.id), 'firstName');
    },

    subtitle():TranslateResult {
      // eslint-disable-next-line no-nested-ternary
      return this.selectedTab === SelectedTab.Potential
        ? this.$t('householdDetails.manageDuplicates.potentialDuplicates.subtitle', { name: this.primaryBeneficiaryFullName })
        : this.selectedTab === SelectedTab.Resolved
          ? this.$t('householdDetails.manageDuplicates.resolvedDuplicates')
          : this.$t('householdDetails.manageDuplicates.flagNew.subtitle', { name: this.primaryBeneficiaryFullName }) as TranslateResult;
    },

    duplicates(): IHouseholdDuplicateFullData[] {
      return this.mapDuplicates(this.duplicateData, this.householdProp.potentialDuplicates);
    },
  },

  async created() {
    await this.fetchDuplicates();
  },

  methods: {
    async fetchDuplicates() {
      this.initLoading = true;
      try {
        this.duplicateData = await this.$services.households.getDuplicates(this.household.id);
      } finally {
        this.initLoading = false;
      }
    },

    getTabLabel(tab: SelectedTab): string {
      const count = tab === SelectedTab.FlagNew ? '' : ` (${(tab === SelectedTab.Potential ? this.potentialDuplicates : this.resolvedDuplicates).length})`;
      return this.$t(`householdDetails.manageDuplicates.tab.${SelectedTab[tab]}`) + count;
    },

    async allowLeave(changeTab:boolean, tab:SelectedTab = null) {
      if (this.selectedTab === SelectedTab.FlagNew) {
        const isDirty = ((this.$refs.flagNew as InstanceType<typeof ManageDuplicatesFlagNew>).$refs.form as VForm)?.flags.dirty;
        if (await helpers.confirmBeforeLeaving(this, isDirty)) {
          this.exit(changeTab, tab);
        }
      } else {
        this.exit(changeTab, tab);
      }
    },

    exit(changeTab:boolean, tab:SelectedTab = null) {
      if (changeTab && !!tab) {
        this.selectedTab = tab;
      } else {
        this.$emit('update:show', false);
      }
    },

    mapDuplicates(duplicatesData: IDuplicateData[], duplicatesFromEntity: IHouseholdDuplicate[]): IHouseholdDuplicateFullData[] {
      if (!duplicatesData?.length || !duplicatesFromEntity?.length) {
        return [];
      }

      const fullData = duplicatesFromEntity.map((d) => {
        const duplicateData = duplicatesData.find((dup) => dup.potentialDuplicateId === d.id);
        if (duplicateData) {
          return {
            ...d,
            ...duplicateData,
          };
        }
        return null;
      });

      return fullData.filter((d) => d);
    },

  },
});

</script>

<style scoped lang='scss'>
.household-details-header {
  background-color: var(--v-grey-lighten4);
  border-bottom: 1px solid var(--v-grey-lighten2);
}
  .divider {
    margin: 4px;
    border-top: 1px solid var(--v-grey-lighten2);
  }
</style>
