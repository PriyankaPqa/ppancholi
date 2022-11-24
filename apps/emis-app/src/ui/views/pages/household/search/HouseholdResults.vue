<template>
  <div>
    <v-col cols="12">
      <div class="rc-heading-5 mb-2">
        <template v-if="items.length > 0">
          {{ $t('registration.isRegistered.search_result', { length: items.length }) }}
        </template>
        <template v-else>
          {{ $t('registration.isRegistered.no_result') }}
        </template>
      </div>
    </v-col>
    <v-col cols="12">
      <v-data-table
        class="elevation-0 full-width"
        data-test="resultsTable"
        :headers="headers"
        :items="formattedItems"
        :hide-toolbar="true"
        :custom-columns="['name', 'actions', 'birthDate', 'phone', 'isRegisteredToEvent', 'registrationNumber', 'emailAddress']"
        must-sort
        :hide-header="true"
        disable-pagination
        hide-default-footer
        :count="items.length"
        @update:sort-desc="sortDesc = $event">
        <template #item.name="{ item: household }">
          <div class="mt-1 max-width break-spaces">
            <v-icon data-test="iconType" small class="icon success--text mr-1">
              mdi-account-box
            </v-icon>
            <router-link
              v-if="linkToHousehold"
              class="rc-link14 font-weight-bold px-1"
              :to="getHouseholdRoute(household)">
              {{ household.primaryBeneficiary.firstName }} {{ household.primaryBeneficiary.lastName }}
            </router-link>
            <span v-else data-test="name" class="fw-bold">
              {{ household.primaryBeneficiary.firstName }} {{ household.primaryBeneficiary.lastName }}
            </span>
          </div>
          <div v-for="(member, i) in household.additionalMembers" :key="i" class="ml-5 my-2">
            <v-icon data-test="iconType" small color="grey" class="mr-1">
              mdi-account-supervisor
            </v-icon>
            <span :data-test="`name__houseHoldMember_${i}`" class="fw-bold ">
              {{ member.firstName }}  {{ member.lastName }}
            </span>
          </div>
        </template>
        <template #item.emailAddress="{ item: household }">
          <div class="no-wrap ">
            <span data-test="emailAddress">
              {{ household.primaryBeneficiary.email || '-' }}
            </span>
            <div v-for="(member) in household.additionalMembers" :key="member.id">
              <span>-</span>
            </div>
          </div>
        </template>
        <template #item.phone="{ item: household }">
          <div>
            <span data-test="phoneNumber" class=" no-wrap">
              {{ getPhone(household) }}
            </span>
            <div v-for="(member) in household.additionalMembers" :key="member.id">
              <span>-</span>
            </div>
          </div>
        </template>
        <template #item.birthDate="{ item: household }">
          <div>
            <span data-test="birthDate" class="no-wrap">
              {{ moment(household.primaryBeneficiary.dateOfBirth).utc().format('ll') }}
            </span>
          </div>
          <div v-if="hasAdditionalMember(household)">
            <div v-for="(member, i) in household.additionalMembers" :key="i">
              <span :data-test="`birthdate__houseHoldMember_${i}`">
                {{ moment(member.dateOfBirth).utc().format('ll') }}
              </span>
            </div>
          </div>
        </template>
        <template #item.registrationNumber="{ item: household }">
          <div>
            <span data-test="registrationNumber">
              {{ household.primaryBeneficiary.registrationNumber }}
            </span>
          </div>
          <div v-if="hasAdditionalMember(household)">
            <div v-for="(member, i) in household.additionalMembers" :key="i">
              <span :data-test="`registrationNumber__houseHoldMember_${i}`">
                {{ member.registrationNumber }}
              </span>
            </div>
          </div>
        </template>
        <template #item.isRegisteredToEvent="{ item: household }">
          <v-icon v-if="isRegisteredInCurrentEvent(household)" width="48" data-test="isRegistered" small>
            mdi-check-circle-outline
          </v-icon>
        </template>
        <template #item.actions="{ item: household }">
          <div>
            <v-btn
              small
              color="primary"
              data-test="details__button"
              :loading="detailsLoading && detailsId === household.id"
              @click="viewDetails(household)">
              {{ $t('registration.isRegistered.details') }}
            </v-btn>
          </div>
        </template>
      </v-data-table>
      <div class="legend">
        <div class="mr-4 rc-body12">
          <v-icon small class="status success--text mr-1">
            mdi-account-box
          </v-icon>
          {{ $t('registration.isRegistered.primary_account') }}
        </div>
        <div class="rc-body12">
          <v-icon small color="grey" class="mr-1">
            mdi-account-supervisor
          </v-icon>
          {{ $t('registration.isRegistered.household_member') }}
        </div>
        <div v-if="!hideEventInfo && !isSplitMode" class="rc-body12">
          <v-icon small color="grey" class="ml-2 mr-1 ">
            mdi-check-circle-outline
          </v-icon>
          {{ $t('registration.isRegistered.registered_current_event') }}
        </div>
      </div>
    </v-col>
  </div>
</template>

<script lang="ts">
import moment from 'moment';
import { IHouseholdCombined } from '@libs/entities-lib/household';
import { RcDataTable } from '@libs/component-lib/components';
import mixins from 'vue-typed-mixins';
import { tabs } from '@/store/modules/registration/tabs';
import household from '@/ui/mixins/household';
import householdResults, { IFormattedHousehold } from '@/ui/mixins/householdResults';

export default mixins(household, householdResults).extend({
  name: 'HouseholdResults',
  components: {
    RcDataTable,
  },
  props: {
    items: {
      type: Array as () => IHouseholdCombined[],
      required: true,
    },
    isSplitMode: {
      type: Boolean,
      default: false,
    },
    hideDetailsButton: {
      type: Boolean,
      default: false,
    },
    linkToHousehold: {
      type: Boolean,
      default: false,
    },
    hideEventInfo: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      moment,
      detailsLoading: false,
      detailsId: '',
    };
  },
  computed: {
    headers(): Array<Record<string, unknown>> {
      const headers = [
        {
          text: this.$t('registration.isRegistered.table.name'),
          value: 'name',
          sortable: true,
          width: '30%',
        },
        {
          text: this.$t('registration.isRegistered.table.email'),
          value: 'emailAddress',
          sortable: false,
          width: '20%',
        },
        {
          text: this.$t('registration.isRegistered.table.phone'),
          value: 'phone',
          sortable: false,
          width: '150px',
        },
        {
          text: this.$t('registration.isRegistered.table.birthDate'),
          value: 'birthDate',
          sortable: false,
          width: '130px',
        },
        {
          text: this.$t('registration.isRegistered.table.registrationNumber'),
          value: 'registrationNumber',
          sortable: false,
          width: '110px',
        },
      ];

      if (!this.isSplitMode && !this.hideEventInfo) {
        headers.push({
          text: '',
          value: 'isRegisteredToEvent',
          sortable: false,
          width: '10px',
        });
      }

      if (!this.hideDetailsButton) {
        headers.push({
          text: '',
          value: 'actions',
          sortable: false,
          width: '100px',
        });
      }
      return headers;
    },

    currentEventId(): string {
      return this.$storage.registration.getters.event().id;
    },
  },

  methods: {
    async viewDetails(household: IFormattedHousehold) {
      try {
        this.detailsLoading = true;
        this.detailsId = household.id;

        const householdCreateData = await this.fetchHouseholdCreate(household.id, null);
        this.$storage.registration.mutations.setHouseholdCreate(householdCreateData);
      } finally {
        this.detailsLoading = false;
      }

      // when this component is rendered in the search stage of the split flow, the household is not selected for registration,
      // only a dialog is opened with the household details
      if (this.isSplitMode) {
        this.$emit('showDetails', household.id);
      } else {
        this.$storage.registration.mutations.setHouseholdAlreadyRegistered(this.isRegisteredInCurrentEvent(household));
        this.$storage.registration.mutations.setHouseholdAssociationMode(true);
        this.$storage.registration.mutations.setCurrentTabIndex(tabs().findIndex((t) => t.id === 'review'));
      }

      return true;
    },

    isRegisteredInCurrentEvent(household: IFormattedHousehold) {
      return household.eventIds.includes(this.currentEventId);
    },

    hasAdditionalMember(household: IFormattedHousehold) {
      if (household.additionalMembers) {
        return household.additionalMembers.length > 0;
      }
      return false;
    },

  },
});
</script>

<style lang="scss" scoped>
.icon {
  margin-top: -3px;
}
.legend {
  display:flex;
  margin-left: 16px;
  margin-top: 20px;
}
.no-wrap{
      white-space: nowrap;
}

.break-spaces{
    white-space: break-spaces;
    word-break: initial;
}

 .max-width {
   max-width: 200px;
 }

</style>
