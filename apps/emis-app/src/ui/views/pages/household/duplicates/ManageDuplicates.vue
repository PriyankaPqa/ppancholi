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
          <div class="rc-heading-5 px-6 py-3" data-test="householdDetails-manageDuplicate-primaryBeneficiaryFullName">
            {{ getPrimaryMemberFullName() }}
          </div>

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
                  {{ member.identitySet.firstName }} {{ member.identitySet.lastName }}
                </div>
              </div>
            </div>
            <v-divider v-if="hasPhoneNumbers || getAddressFirstLine()" class="mx-0 mb-3" />

            <household-details-list
              v-if="getPrimaryMember() && household"
              data-test="householdDetails-manageDuplicates-details"
              :primary-beneficiary="getPrimaryMember()"
              :address-first-line="getAddressFirstLine()"
              :address-second-line="getAddressSecondLine()"
              :has-phone-numbers="hasPhoneNumbers()"
              :country="getCountry()"
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
              @fetchDuplicateHouseholds="fetchDuplicateHouseholds" />
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </rc-dialog>
</template>

<script lang="ts">
import Vue, { toRef } from 'vue';
import _orderBy from 'lodash/orderBy';
import { TranslateResult } from 'vue-i18n';
import { RcDialog, RcTab, RcTabs } from '@libs/component-lib/components';
import HouseholdDetailsList from '@/ui/views/pages/case-files/details/components/HouseholdDetailsList.vue';
import { IHouseholdEntity } from '@libs/entities-lib/household';
import { VForm } from '@libs/shared-lib/types';
import helpers from '@/ui/helpers/helpers';
import { IDuplicateHousehold, IPotentialDuplicateEntity, DuplicateStatus, IPotentialDuplicateExtended } from '@libs/entities-lib/potential-duplicate';
import { UserRoles } from '@libs/entities-lib/user';
import { usePotentialDuplicateStore } from '@/pinia/potential-duplicate/potential-duplicate';
import { IMemberEntity } from '@libs/entities-lib/household-create';
import { useHouseholdDetails } from '../useHouseholdDetails';
import ManageDuplicatesTable from './ManageDuplicatesTable.vue';
import ManageDuplicatesFlagNew from './ManageDuplicatesFlagNew.vue';

export enum SelectedTab {
  Potential = 1,
  Resolved = 2,
  FlagNew = 3,
}

export default Vue.extend({
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
    household: {
      type: Object as () => IHouseholdEntity,
      required: true,
    },
    members: {
      type: Array as () => IMemberEntity[],
      required: true,
    },
  },

  setup(props) {
    const { getAddressFirstLine,
    getAddressSecondLine,
    getPrimaryMember,
    getPrimaryMemberFullName,
    hasPhoneNumbers,
    getCountry,
     } = useHouseholdDetails(toRef(props, 'household'), toRef(props, 'members'));
    return { getAddressFirstLine, getAddressSecondLine, getPrimaryMember, getCountry, getPrimaryMemberFullName, hasPhoneNumbers };
  },

  data() {
    return {
      SelectedTab,
      selectedTab: SelectedTab.Potential,
      initLoading: false,
      submitLoading: false,
      duplicateHouseholds: [] as IDuplicateHousehold[],
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

    potentialDuplicates(): IPotentialDuplicateExtended[] {
      return this.duplicates?.filter((d) => d.duplicateStatus === DuplicateStatus.Potential) || [];
    },

    resolvedDuplicates(): IPotentialDuplicateExtended[] {
      return this.duplicates?.filter((d) => d.duplicateStatus === DuplicateStatus.Resolved) || [];
    },

    sortedMembers(): IMemberEntity[] {
      if (!this.members) {
        return [];
      }
      return _orderBy(this.members.filter((m) => m.id !== this.getPrimaryMember()?.id), (item) => item.identitySet?.firstName);
    },

    subtitle():TranslateResult {
      // eslint-disable-next-line no-nested-ternary
      return this.selectedTab === SelectedTab.Potential
        ? this.$t('householdDetails.manageDuplicates.potentialDuplicates.subtitle', { name: this.getPrimaryMemberFullName() })
        : this.selectedTab === SelectedTab.Resolved
          ? this.$t('householdDetails.manageDuplicates.resolvedDuplicates')
          : this.$t('householdDetails.manageDuplicates.flagNew.subtitle', { name: this.getPrimaryMemberFullName() }) as TranslateResult;
    },

    duplicates(): IPotentialDuplicateExtended[] {
      const entities = usePotentialDuplicateStore().getAll();
      const duplicatesOfCurrentHousehold = entities.filter((d) => d.householdIds.includes(this.household.id));
      return this.mapDuplicates(duplicatesOfCurrentHousehold, this.duplicateHouseholds);
    },
  },

  async created() {
      this.initLoading = true;
      try {
       // eslint-disable-next-line @typescript-eslint/no-unused-vars
       const [_, households] = await Promise.all([
          usePotentialDuplicateStore().getDuplicates(this.household.id),
          this.$services.potentialDuplicates.getHouseholds(this.household.id),
        ]);
        this.duplicateHouseholds = households;
      } finally {
        this.initLoading = false;
      }
  },

  methods: {
    async fetchDuplicateHouseholds() {
      this.initLoading = true;
      try {
        this.duplicateHouseholds = await this.$services.potentialDuplicates.getHouseholds(this.household.id);
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
        this.$emit('close');
      }
    },

    mapDuplicates(duplicates: IPotentialDuplicateEntity[], households: IDuplicateHousehold[]): IPotentialDuplicateExtended[] {
      if (!duplicates?.length || !households?.length) {
        return [];
      }

      return duplicates.map((d) => {
          const duplicateHouseholdId = d.householdIds.find((id) => id !== this.household.id);
          const duplicateHousehold = households.find((h) => h.householdId === duplicateHouseholdId) || {
            registrationNumber: '-',
            caseFiles: [],
            primaryBeneficiaryFullName: '-',
            householdId: '',
          } as IDuplicateHousehold;

          return {
            ...d,
            duplicateHousehold,
          };
      });
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
