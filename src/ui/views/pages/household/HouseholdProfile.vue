<template>
  <rc-page-content
    :title="$t('household.profile.title')"
    :show-add-button="false"
    show-back-button
    :show-edit-button="false"
    content-padding="0"
    @back="navigateBack">
    <rc-page-loading v-if="loading" />
    <template v-else slot="default">
      <v-row v-if="household && householdData" class="fill-height no-gutters">
        <v-col cols="2" class="border-right px-6 rc-body14">
          <div class="pt-6  d-flex flex-column" data-test="household_profile_registration_number">
            <div class="fw-bold">
              <v-icon size="16" class="pr-2" color="secondary">
                mdi-clipboard-text
              </v-icon>
              {{ $t('household.profile.registration_number') }}:
            </div>
            <span>{{ household.registrationNumber }}</span>
          </div>

          <div v-if="household.homeAddress" class="pt-6 d-flex flex-column" data-test="household_profile_home_address">
            <div class="fw-bold d-flex justify-space-between">
              <div>
                <v-icon size="16" class="pr-2" color="secondary">
                  mdi-map-marker
                </v-icon>
                {{ $t('household.profile.address') }}:
              </div>
              <v-btn
                icon
                x-small
                data-test="member_address_edit_btn"
                @click="editAddress()">
                <v-icon color="gray darken-2">
                  mdi-pencil
                </v-icon>
              </v-btn>
            </div>
            <template v-if="household.noFixedHome">
              {{ $t('registration.addresses.noFixedHomeAddress') }}
            </template>
            <template v-else>
              <div v-if="addressLine1">
                {{ addressLine1 }}
              </div>
              <div v-if="addressLine2">
                {{ addressLine2 }}
              </div>
              <div v-if="country">
                {{ country }}
              </div>
            </template>
          </div>

          <div class="pt-6  d-flex flex-column" data-test="household_profile_created_date">
            <div class="fw-bold">
              <v-icon size="16" class="pr-2" color="secondary">
                mdi-account-check
              </v-icon>
              {{ $t('household.profile.account_created') }}:
            </div>
            <span>{{ moment(householdData.entity.created).format('ll') }}</span>
          </div>

          <div class="pt-6  d-flex flex-column" data-test="household_profile_last_updated_date">
            <div class="fw-bold">
              <v-icon size="16" class="pr-2" color="secondary">
                mdi-update
              </v-icon>
              {{ $t('household.profile.last_updated') }}:
            </div>
            <span>{{ lastUpdated }}</span>
          </div>

          <v-btn
            small
            color="primary"
            class="my-4"
            data-test="household-profile-history-btn">
            {{ $t('household.profile.profile_history') }}
          </v-btn>
        </v-col>
        <v-col cols="10" class="pa-6">
          <h5 class="rc-heading-5">
            {{ $t('household.profile.active_in_events', {x : activeCaseFiles.length}) }}
          </h5>

          <v-row class="pt-4">
            <v-col v-for="caseFile in activeCaseFiles" :key="caseFile.entity.id" cols="12" md="6">
              <household-case-file-card :case-file="caseFile" />
            </v-col>
          </v-row>

          <v-row class="no-gutters pt-8 pb-4 d-flex justify-space-between">
            <h5 class="rc-heading-5 ">
              {{ $t('household.profile.household_members') }} ({{ householdData.entity.members.length }})
            </h5>
            <div>
              <v-btn color="grey lighten-5" small depressed class="mr-4">
                <v-icon left>
                  mdi-compare-horizontal
                </v-icon>
                <span class="fw-bold"> {{ $t('household.profile.move_members') }} </span>
              </v-btn>
              <v-btn color="primary" small>
                <v-icon left>
                  mdi-plus
                </v-icon>
                {{ $t('household.profile.add_new_member') }}
              </v-btn>
            </div>
          </v-row>

          <household-member-card
            :member="household.primaryBeneficiary"
            is-primary-member
            :shelter-locations="shelterLocations" />

          <household-member-card
            v-for="(member, index) in household.additionalMembers"
            :key="member.id"
            :member="member"
            :index="index"
            :shelter-locations="shelterLocations" />

          <h5 v-if="inactiveCaseFiles.length" class="rc-heading-5 pt-4 pb-4">
            {{ $t('household.profile.registered_previous_events') }} ({{ inactiveCaseFiles.length }})
          </h5>
          <v-row>
            <v-col v-for="caseFile in inactiveCaseFiles" :key="caseFile.entity.id" cols="12" md="6">
              <household-case-file-card :case-file="caseFile" />
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </template>
    <edit-household-address-dialog v-if="showEditAddress" :show.sync="showEditAddress" />
  </rc-page-content>
</template>

<script lang="ts">

import moment, { Moment } from 'moment';
import mixins from 'vue-typed-mixins';

import { RcPageContent, RcPageLoading } from '@crctech/component-library';
import { IHouseholdCreate } from '@crctech/registration-lib/src/entities/household-create';
import { IHouseholdCombined } from '@crctech/registration-lib/src/entities/household';
import { ECanadaProvinces } from '@/types';

import { CaseFileStatus, ICaseFileCombined } from '@/entities/case-file';
import household from '@/ui/mixins/household';
import helpers from '@/ui/helpers';
import {
  EEventLocationStatus, EEventStatus, IEventGenericLocation, IEventMainInfo,
} from '@/entities/event';
import HouseholdCaseFileCard from './components/HouseholdCaseFileCard.vue';
import HouseholdMemberCard from './components/HouseholdMemberCard.vue';
import EditHouseholdAddressDialog from '@/ui/views/pages/household/components/EditHouseholdAddressDialog.vue';

export default mixins(household).extend({
  name: 'HouseholdProfile',

  components: {
    EditHouseholdAddressDialog,
    RcPageLoading,
    RcPageContent,
    HouseholdCaseFileCard,
    HouseholdMemberCard,
  },

  props: {
    /**
     * The id of the household
     */
    id: {
      type: String,
      required: true,
    },
  },

  data() {
    return {
      moment,
      loading: false,
      householdData: null as IHouseholdCombined,
      caseFileIds: [] as string[],
      events: [] as IEventMainInfo[],
      showEditAddress: false,
    };
  },

  computed: {
    shelterLocations() {
      const locations:IEventGenericLocation[] = [];
      if (this.events) {
        this.events.forEach((e) => {
          if (e.entity.shelterLocations) {
            const activeLocations = e.entity.shelterLocations.filter((s: IEventGenericLocation) => s.status === EEventLocationStatus.Active);
            locations.push(...activeLocations);
          }
        });
      }

      return locations;
    },

    household() : IHouseholdCreate {
      return this.$storage.registration.getters.householdCreate();
    },

    activeCaseFiles():ICaseFileCombined[] {
      return this.caseFiles.filter((c) => c.entity.caseFileStatus === CaseFileStatus.Open || c.entity.caseFileStatus === CaseFileStatus.Inactive);
    },

    inactiveCaseFiles():ICaseFileCombined[] {
      return this.caseFiles.filter((c) => c.entity.caseFileStatus === CaseFileStatus.Archived || c.entity.caseFileStatus === CaseFileStatus.Closed);
    },

    addressLine1(): string {
      if (!this.household?.homeAddress) return '';
      const { homeAddress } = this.household;
      const suite = homeAddress.unitSuite ? `${homeAddress.unitSuite}-` : '';
      return homeAddress.streetAddress ? `${suite + homeAddress.streetAddress},` : '';
    },

    addressLine2(): string {
      if (!this.household?.homeAddress) return '';
      const { homeAddress } = this.household;
      const city = homeAddress.city ? `${homeAddress.city}, ` : '';
      const province = this.provinceCodeName ? `${this.provinceCodeName}, ` : '';
      return city + province + (homeAddress.postalCode || '');
    },

    caseFiles(): ICaseFileCombined[] {
      if (this.caseFileIds) {
        return this.$storage.caseFile.getters.getByIds(this.caseFileIds) || [];
      }
      return [];
    },

    country() : string {
      return helpers.countryName(this.household.homeAddress.country);
    },

    lastUpdated(): string {
      const entityTimestamp = this.householdData?.entity?.timestamp;
      if (!entityTimestamp) return '';

      const metadataTimestamp = this.householdData.metadata?.timestamp;
      let date: Moment;

      if (metadataTimestamp) {
        date = moment.max(moment(entityTimestamp), moment(metadataTimestamp));
      } else {
        date = moment(entityTimestamp);
      }

      return date.format('ll');
    },

    provinceCodeName(): string {
      const provinceCode = this.household.homeAddress?.province;
      if (!provinceCode) return '';
      if (provinceCode === ECanadaProvinces.OT) {
        return this.household?.homeAddress?.specifiedOtherProvince;
      }
      return ECanadaProvinces[provinceCode];
    },
  },

  async created() {
    await Promise.all([
      this.$storage.registration.actions.fetchGenders(),
      this.$storage.registration.actions.fetchPreferredLanguages(),
      this.$storage.registration.actions.fetchPrimarySpokenLanguages(),
      this.$storage.registration.actions.fetchIndigenousCommunities(),
      this.fetchCaseFilesInformation(),
    ]);
    await this.fetchActiveEvents();
    this.fetchHouseholdData();
  },

  methods: {
    async fetchActiveEvents() {
      const eventIds = this.activeCaseFiles.map((cf) => cf.entity.eventId);
      const filter = `search.in(Entity/Id, '${eventIds.join('|')}', '|') and Entity/Schedule/Status eq ${EEventStatus.Open}`;
      const eventsData = await this.$services.events.searchMyEvents({
        filter,
        top: 999,
      });

      this.events = eventsData?.value;
    },

    async fetchHouseholdData() {
      this.loading = true;
      try {
        this.householdData = await this.$storage.household.actions.fetch(this.id);
        if (this.householdData) {
          const householdCreateData = await this.buildHouseholdCreateData(this.householdData, this.shelterLocations);

          this.$storage.registration.mutations.setHouseholdCreate(householdCreateData);
        }
      } finally {
        this.loading = false;
      }
    },

    async fetchCaseFilesInformation() {
      const filter = {
        Entity: { HouseholdId: this.id },
      };
      this.loading = true;
      try {
        const caseFilesData = await this.$storage.caseFile.actions.search({
          filter,
        });
        this.caseFileIds = caseFilesData?.ids;
      } finally {
        this.loading = false;
      }
    },

    navigateBack() {
      this.$router.back();
    },

    editAddress() {
      this.showEditAddress = true;
    },
  },
});
</script>

<style scoped lang="scss">
  .border-right {
    border-right: 1px solid var(--v-grey-lighten2);
  }

  ::v-deep .v-btn.v-size--small {
    height: auto;
  }

  ::v-deep .v-btn__content {
    width: 100%;
    white-space: normal;
    padding: 8px 4px;
  }
</style>
