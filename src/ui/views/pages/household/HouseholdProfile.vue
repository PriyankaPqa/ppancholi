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
            <v-col v-for="caseFile in activeCaseFiles" :key="caseFile.caseFileId" cols="12" md="6">
              <household-case-file-card :my-events="events" :case-file="caseFile" :is-active="true" />
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
              <v-btn
                :disabled="disabledAddMembers"
                color="primary"
                small
                @click.native="addAdditionalMember()">
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
            <v-col v-for="caseFile in inactiveCaseFiles" :key="caseFile.caseFileId" cols="12" md="6">
              <household-case-file-card :case-file="caseFile" :is-active="false" />
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </template>

    <add-edit-additional-members
      v-if="showAddAdditionalMember"
      :show.sync="showAddAdditionalMember"
      :member="newAdditionalMember"
      :household-id="household.id"
      :index="index"
      :shelter-locations-list="shelterLocations"
      :i18n="i18n"
      in-household-profile />
    <edit-household-address-dialog v-if="showEditAddress" :show.sync="showEditAddress" />
  </rc-page-content>
</template>

<script lang="ts">

import moment, { Moment } from 'moment';
import mixins from 'vue-typed-mixins';

import { MAX_ADDITIONAL_MEMBERS } from '@crctech/registration-lib/src/constants/validations';
import { RcPageContent, RcPageLoading } from '@crctech/component-library';
import { IHouseholdCreate, Member } from '@crctech/registration-lib/src/entities/household-create';
import { IHouseholdCombined, IHouseholdCaseFile } from '@crctech/registration-lib/src/entities/household';
import { AddEditAdditionalMembers } from '@crctech/registration-lib';
import { CaseFileStatus } from '@/entities/case-file';
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
    AddEditAdditionalMembers,
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
      i18n: this.$i18n,
      index: -1,
      moment,
      loading: false,
      householdData: null as IHouseholdCombined,
      caseFileIds: [] as string[],
      events: [] as IEventMainInfo[],
      showAddAdditionalMember: false,
      newAdditionalMember: null,
      disabledAddMembers: false,
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

    activeCaseFiles():IHouseholdCaseFile[] {
      return this.caseFiles.filter((c) => c.caseFileStatus === CaseFileStatus.Open || c.caseFileStatus === CaseFileStatus.Inactive);
    },

    inactiveCaseFiles():IHouseholdCaseFile[] {
      return this.caseFiles
        .filter((c) => c.caseFileStatus === CaseFileStatus.Archived || c.caseFileStatus === CaseFileStatus.Closed);
    },

    caseFiles(): IHouseholdCaseFile[] {
      if (this.householdData?.metadata) {
        return this.householdData.metadata.caseFiles;
      }
      return [];
    },

    addressLine1(): string {
      const line = helpers.getAddressLines(this.household?.homeAddress)[0];
      return line ? `${line},` : '';
    },

    addressLine2(): string {
      return helpers.getAddressLines(this.household?.homeAddress)[1];
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
  },

  async created() {
    await Promise.all([
      this.$storage.registration.actions.fetchGenders(),
      this.$storage.registration.actions.fetchPreferredLanguages(),
      this.$storage.registration.actions.fetchPrimarySpokenLanguages(),
      this.$storage.registration.actions.fetchIndigenousCommunities(),
    ]);
    await this.fetchHouseholdData();
    await this.fetchActiveEvents();
  },

  methods: {
    async fetchActiveEvents() {
      const eventIds = this.activeCaseFiles.map((cf) => cf.eventId);
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

    addAdditionalMember() {
      if (this.household.additionalMembers.length < MAX_ADDITIONAL_MEMBERS) {
        this.newAdditionalMember = new Member();
        this.showAddAdditionalMember = true;
      } else {
        this.$toasted.global.warning(this.$t('warning.MAX_ADDITIONAL_MEMBERS_reached', { x: MAX_ADDITIONAL_MEMBERS }));
        this.disabledAddMembers = true;
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
