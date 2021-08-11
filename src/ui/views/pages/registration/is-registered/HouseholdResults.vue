<template>
  <div>
    <v-col cols="12">
      <div class="rc-heading-5 mb-8">
        <template v-if="items.length > 0">
          {{ $t('registration.isRegistered.search_result', { length: items.length }) }}
        </template>
        <template v-else>
          {{ $t('registration.isRegistered.no_result') }}
        </template>
      </div>
    </v-col>
    <v-col cols="12">
      <rc-data-table
        class="elevation-0 rc-body14 full-width"
        data-test="resultsTable"
        :headers="headers"
        :items="formattedItems"
        :hide-toolbar="true"
        :custom-columns="['name', 'actions', 'birthDate', 'phone', 'isRegisteredToEvent', 'registrationNumber', 'emailAddress']"
        sort-by="name"
        :hide-header="true"
        :hide-footer="true"
        :count="items.length">
        <template #item.name="{ item: household }">
          <div>
            <v-icon data-test="iconType" small class="icon success--text mr-2">
              mdi-account-box
            </v-icon>
            <span data-test="name" class="fw-bold">
              {{ household.primaryBeneficiary.firstName }} {{ household.primaryBeneficiary.lastName }}
            </span>
          </div>
          <div v-for="(member,i) in household.additionalMembers" :key="i">
            <v-icon data-test="iconType" small color="grey" class="mr-2">
              mdi-account-supervisor
            </v-icon>
            <span :data-test="`name__houseHoldMember_${i}`" class="fw-bold">
              {{ member.firstName }}  {{ member.lastName }}
            </span>
          </div>
        </template>
        <template #item.emailAddress="{ item: household }">
          <div>
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
            <span data-test="phoneNumber">
              {{ getPhone(household) }}
            </span>
            <div v-for="(member) in household.additionalMembers" :key="member.id">
              <span>-</span>
            </div>
          </div>
        </template>
        <template #item.birthDate="{ item: household }">
          <div>
            <span data-test="birthDate">
              {{ moment(household.primaryBeneficiary.dateOfBirth).utc().format('ll') }}
            </span>
          </div>
          <div v-if="hasAdditionalMember(household)">
            <div v-for="(member,i) in household.additionalMembers" :key="i">
              <span :data-test="`birthdate__houseHoldMember_${i}`">
                {{ moment(member.dateOfBirth).utc().format('ll') }}
              </span>
            </div>
          </div>
        </template>
        <template #item.registrationNumber="{item: household}">
          <div>
            <span data-test="registrationNumber">
              {{ household.primaryBeneficiary.registrationNumber }}
            </span>
          </div>
          <div v-if="hasAdditionalMember(household)">
            <div v-for="(member,i) in household.additionalMembers" :key="i">
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
        <template #item.actions="{item: household}">
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
      </rc-data-table>
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
        <div class="rc-body12">
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
import { IHouseholdCombined } from '@crctech/registration-lib/src/entities/household';
import { IPhoneNumber } from '@crctech/registration-lib/src/entities/value-objects/contact-information';
import { RcDataTable } from '@crctech/component-library';
import mixins from 'vue-typed-mixins';
import { tabs } from '@/store/modules/registration/tabs';
import household from '@/ui/mixins/household';

export interface IMember {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  email?: string;
  homePhoneNumber?: IPhoneNumber;
  mobilePhoneNumber?: IPhoneNumber;
  alternatePhoneNumber?: IPhoneNumber;
  isPrimary: boolean;
  registrationNumber: string;
}

export interface IFormattedHousehold {
  id: string;
  primaryBeneficiary: IMember;
  additionalMembers: IMember[];
  eventIds: string[];
}

export default mixins(household).extend({
  name: 'HouseholdResults',
  components: {
    RcDataTable,
  },
  props: {
    items: {
      type: Array as () => IHouseholdCombined[],
      required: true,
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
      return [
        {
          text: this.$t('registration.isRegistered.table.name'),
          value: 'name',
          sortable: false,
        },
        {
          text: this.$t('registration.isRegistered.table.email'),
          value: 'emailAddress',
          sortable: false,
        },
        {
          text: this.$t('registration.isRegistered.table.phone'),
          value: 'phone',
          sortable: false,
          width: '180px',
        },
        {
          text: this.$t('registration.isRegistered.table.birthDate'),
          value: 'birthDate',
          sortable: false,
          width: '150px',
        },
        {
          text: this.$t('registration.isRegistered.table.registrationNumber'),
          value: 'registrationNumber',
          sortable: false,
          width: '170px',
        },
        {
          text: '',
          value: 'isRegisteredToEvent',
          sortable: false,
          width: '10px',
        },
        {
          text: '',
          value: 'actions',
          sortable: false,
          width: '110px',
        },
      ];
    },
    formattedItems(): IFormattedHousehold[] {
      return this.items.map((household: IHouseholdCombined) => {
        const final = {
          primaryBeneficiary: {},
          additionalMembers: [],
          id: household.entity.id,
          eventIds: household.metadata.eventIds,
        } as IFormattedHousehold;

        household.metadata.memberMetadata.forEach((member) => {
          if (household.entity.primaryBeneficiary === member.id) {
            final.primaryBeneficiary = {
              ...member,
              isPrimary: true,
              registrationNumber: household.entity.registrationNumber,
            };
          } else {
            final.additionalMembers.push({
              ...member,
              isPrimary: false,
              registrationNumber: household.entity.registrationNumber,
            });
          }
        });
        return final;
      });
    },
    currentEventId(): string {
      return this.$storage.registration.getters.event().id;
    },
  },
  methods: {
    hasAdditionalMember(household: IFormattedHousehold) {
      if (household.additionalMembers) return household.additionalMembers.length > 0;
      return false;
    },

    async viewDetails(household: IFormattedHousehold) {
      try {
        this.detailsLoading = true;
        this.detailsId = household.id;

        const householdCreateData = await this.fetchHousehold(household.id);
        this.$storage.registration.mutations.setHouseholdCreate(householdCreateData);
      } finally {
        this.detailsLoading = false;
      }

      this.$storage.registration.mutations.setHouseholdAssociationMode(true);
      this.$storage.registration.mutations.setHouseholdAlreadyRegistered(this.isRegisteredInCurrentEvent(household));
      this.$storage.registration.mutations.setCurrentTabIndex(tabs().findIndex((t) => t.id === 'review'));

      return true;
    },

    getPhone(household: IFormattedHousehold): string {
      const mPhone = household.primaryBeneficiary.mobilePhoneNumber;
      if (mPhone) return mPhone.number;
      const hPhone = household.primaryBeneficiary.homePhoneNumber;
      if (hPhone) return hPhone.number;
      const oPhone = household.primaryBeneficiary.alternatePhoneNumber;
      if (oPhone) return oPhone.number;
      return '';
    },

    isRegisteredInCurrentEvent(household: IFormattedHousehold) {
      return household.eventIds.includes(this.currentEventId);
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
</style>
