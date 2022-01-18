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
            <span>{{ householdData.entity.registrationNumber }}</span>
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
                v-if="canEdit"
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
            data-test="household-profile-history-btn"
            @click="showProfileHistory = true">
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
              {{ $t('household.profile.household_members') }} ({{ household.primaryBeneficiary? household.additionalMembers.length + 1 : 0 }})
            </h5>
            <div>
              <v-btn v-if="canMove && household.primaryBeneficiary" color="grey lighten-5" small depressed class="mr-4" @click="moveMembers()">
                <v-icon left>
                  mdi-compare-horizontal
                </v-icon>
                <span class="fw-bold"> {{ $t('household.profile.move_members') }} </span>
              </v-btn>
              <v-btn
                v-if="canEdit && household.primaryBeneficiary"
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
            v-if="household.primaryBeneficiary"
            :member="household.primaryBeneficiary"
            is-primary-member
            :shelter-locations="shelterLocations"
            :registration-locations="registrationLocations"
            @reload-household-create="fetchHouseholdData" />

          <household-member-card
            v-for="(member, index) in household.additionalMembers"
            :key="member.id"
            :member="member"
            :index="index"
            :shelter-locations="shelterLocations"
            :registration-locations="registrationLocations"
            @reload-household-create="fetchHouseholdData" />

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
      :index="-1"
      :shelter-locations-list="shelterLocations"
      :i18n="i18n"
      :disable-autocomplete="!enableAutocomplete"
      in-household-profile
      @close="fetchHouseholdData" />
    <edit-household-address-dialog v-if="showEditAddress" :show.sync="showEditAddress" />
    <household-profile-history
      v-if="showProfileHistory && householdData"
      :show.sync="showProfileHistory"
      :household="householdData.entity" />
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
import householdHelpers from '@/ui/helpers/household';
import {
  EEventLocationStatus, EEventStatus, IEventGenericLocation, IEventMainInfo,
} from '@/entities/event';
import HouseholdCaseFileCard from './components/HouseholdCaseFileCard.vue';
import HouseholdMemberCard from './components/HouseholdMemberCard.vue';
import HouseholdProfileHistory from './components/HouseholdProfileHistory.vue';
import EditHouseholdAddressDialog from '@/ui/views/pages/household/components/EditHouseholdAddressDialog.vue';
import routes from '@/constants/routes';
import { FeatureKeys } from '@/entities/tenantSettings';

export default mixins(household).extend({
  name: 'HouseholdProfile',

  components: {
    EditHouseholdAddressDialog,
    RcPageLoading,
    RcPageContent,
    HouseholdCaseFileCard,
    HouseholdMemberCard,
    HouseholdProfileHistory,
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
      moment,
      loading: true,
      caseFileIds: [] as string[],
      events: [] as IEventMainInfo[],
      showAddAdditionalMember: false,
      newAdditionalMember: null,
      disabledAddMembers: false,
      showEditAddress: false,
      showProfileHistory: false,
    };
  },

  watch: {
    householdData() {
      this.fetchMyEvents();
      this.setHouseholdCreate();
    },
  },

  computed: {
    registrationLocations() : IEventGenericLocation[] {
      const locations:IEventGenericLocation[] = [];
      this.activeCaseFiles.forEach((cf) => {
        if (cf.registrationLocations?.length) {
          const activeLocations = cf.registrationLocations.filter((s) => s.status === EEventLocationStatus.Active);
          locations.push(...activeLocations);
        }
      });

      return locations;
    },

    shelterLocations() :IEventGenericLocation[] {
      const locations:IEventGenericLocation[] = [];
      if (this.events) {
        this.events.filter((e) => e.entity?.schedule?.status === EEventStatus.Open).forEach((e) => {
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

    householdData() : IHouseholdCombined {
      return this.$storage.household.getters.get(this.id);
    },

    activeCaseFiles():IHouseholdCaseFile[] {
      return this.caseFiles.filter((c) => c.caseFileStatus === CaseFileStatus.Open || c.caseFileStatus === CaseFileStatus.Inactive);
    },

    inactiveCaseFiles():IHouseholdCaseFile[] {
      return this.caseFiles
        .filter((c) => c.caseFileStatus === CaseFileStatus.Archived || c.caseFileStatus === CaseFileStatus.Closed);
    },

    caseFiles(): IHouseholdCaseFile[] {
      if (this.householdData?.metadata?.caseFiles) {
        return this.householdData.metadata.caseFiles;
      }
      return [];
    },

    addressLine1(): string {
      const line = householdHelpers.getAddressLines(this.household?.homeAddress)[0];
      return line ? `${line},` : '';
    },

    addressLine2(): string {
      return householdHelpers.getAddressLines(this.household?.homeAddress)[1];
    },

    country() : string {
      return householdHelpers.countryName(this.household.homeAddress.country);
    },

    lastUpdated(): string {
      const entityTimestamp = this.householdData?.entity?.timestamp;
      if (!entityTimestamp) {
        return '';
      }

      const metadataTimestamp = this.householdData.metadata?.timestamp;
      let date: Moment;

      if (metadataTimestamp) {
        date = moment.max(moment(entityTimestamp), moment(metadataTimestamp));
      } else {
        date = moment(entityTimestamp);
      }

      return date.format('ll');
    },

    canEdit():boolean {
      return this.$hasLevel('level1');
    },

    canMove():boolean {
      return this.$hasLevel('level2');
    },

    enableAutocomplete(): boolean {
      return this.$hasFeature(FeatureKeys.AddressAutoFill);
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
    await this.fetchMyEvents();
    this.loading = false;
  },

  methods: {
    async fetchMyEvents() {
      const eventIds = this.activeCaseFiles.map((cf) => cf.eventId);
      const filter = `search.in(Entity/Id, '${eventIds.join('|')}', '|')`;
      const eventsData = await this.$services.events.searchMyEvents({
        filter,
        top: 999,
      });

      this.events = eventsData?.value;
    },

    async fetchHouseholdData() {
      this.loading = true;
      try {
        await this.$storage.household.actions.fetch(this.id, { useEntityGlobalHandler: true, useMetadataGlobalHandler: false });
        await this.setHouseholdCreate();
      } finally {
        this.loading = false;
      }
    },

    async setHouseholdCreate() {
      if (this.householdData) {
        const householdCreateData = await this.buildHouseholdCreateData(this.householdData, null);
        this.$storage.registration.mutations.setHouseholdCreate(householdCreateData);
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

    moveMembers() {
      return this.$router.push({ name: routes.household.householdMembersMove.name });
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
