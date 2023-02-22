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
      <v-row v-if="household && householdEntity" class="fill-height no-gutters">
        <v-col cols="2" class="border-right px-6 rc-body14">
          <div class="pt-6  d-flex flex-column" data-test="household_profile_registration_number">
            <div class="fw-bold">
              <v-icon size="16" class="pr-2" color="secondary">
                mdi-clipboard-text
              </v-icon>
              {{ $t('household.profile.registration_number') }}:
            </div>
            <span data-test="registrationNumber">{{ householdEntity.registrationNumber }}</span>
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
            <span>{{ moment(householdEntity.created).format('ll') }}</span>
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
            {{ $t('household.profile.active_in_events', { x: activeCaseFiles.length }) }}
          </h5>

          <v-row class="pt-4">
            <v-col v-for="caseFile in activeCaseFiles" :key="caseFile.id" cols="12" md="6">
              <household-case-file-card :my-events="myEvents" :event-names="eventNames" :case-file="caseFile" :is-active="true" />
            </v-col>
          </v-row>

          <v-row class="no-gutters pt-8 pb-4 d-flex justify-space-between">
            <h5 class="rc-heading-5 ">
              {{ $t('household.profile.household_members') }} ({{ household.primaryBeneficiary ? household.additionalMembers.length + 1 : 0 }})
            </h5>
            <div>
              <v-btn
                v-if="canMove && household.primaryBeneficiary"
                color="grey lighten-5"
                small
                depressed
                class="mr-4"
                data-test="household_profile_move_members"
                @click="moveMembers()">
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
                data-test="household_profile_add_new_member"
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
            :shelter-locations="makeShelterLocationsListForMember(household.primaryBeneficiary)"
            :registration-locations="registrationLocations"
            @reload-household-create="fetchHouseholdData" />

          <household-member-card
            v-for="(member, index) in household.additionalMembers"
            :key="member.id"
            :member="member"
            :index="index"
            :shelter-locations="makeShelterLocationsListForMember(member)"
            :registration-locations="registrationLocations"
            @reload-household-create="fetchHouseholdData" />

          <h5 v-if="inactiveCaseFiles.length" class="rc-heading-5 pt-4 pb-4">
            {{ $t('household.profile.registered_previous_events') }} ({{ inactiveCaseFiles.length }})
          </h5>
          <v-row>
            <v-col v-for="caseFile in inactiveCaseFiles" :key="caseFile.id" cols="12" md="6">
              <household-case-file-card :event-names="eventNames" :case-file="caseFile" :is-active="false" />
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </template>

    <add-edit-additional-members-lib
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
      v-if="showProfileHistory && householdEntity"
      :show.sync="showProfileHistory"
      :household="householdEntity" />
  </rc-page-content>
</template>

<script lang="ts">

import moment, { Moment } from 'moment';
import mixins from 'vue-typed-mixins';
import _isEmpty from 'lodash/isEmpty';

import { MAX_ADDITIONAL_MEMBERS } from '@libs/registration-lib/constants/validations';
import { RcPageContent, RcPageLoading } from '@libs/component-lib/components';
import { IHouseholdCreate, IMember, Member } from '@libs/entities-lib/household-create';
import { IHouseholdEntity, IHouseholdMetadata } from '@libs/entities-lib/household';
import AddEditAdditionalMembersLib from '@libs/registration-lib/components/additional-members/AddEditAdditionalMembersLib.vue';
import { CaseFileStatus, ICaseFileEntity } from '@libs/entities-lib/case-file';
import household from '@/ui/mixins/household';
import householdHelpers from '@/ui/helpers/household';
import {
  EEventLocationStatus, IEventGenericLocation, IEventMetadata,
} from '@libs/entities-lib/event';
import EditHouseholdAddressDialog from '@/ui/views/pages/household/components/EditHouseholdAddressDialog.vue';
import routes from '@/constants/routes';
import { FeatureKeys } from '@libs/entities-lib/tenantSettings';
import { IAzureSearchResult, ICombinedIndex, IMultilingual } from '@libs/shared-lib/types';
import { useRegistrationStore } from '@/pinia/registration/registration';
import { IEventData } from '@libs/entities-lib/registration-event';
import { UserRoles } from '@libs/entities-lib/user';
import { useHouseholdMetadataStore, useHouseholdStore } from '@/pinia/household/household';
import HouseholdCaseFileCard from './components/HouseholdCaseFileCard.vue';
import HouseholdMemberCard from './components/HouseholdMemberCard.vue';
import HouseholdProfileHistory from './components/HouseholdProfileHistory.vue';

export default mixins(household).extend({
  name: 'HouseholdProfile',

  components: {
    EditHouseholdAddressDialog,
    RcPageLoading,
    RcPageContent,
    HouseholdCaseFileCard,
    HouseholdMemberCard,
    HouseholdProfileHistory,
    AddEditAdditionalMembersLib,
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
      allEvents: [] as ICombinedIndex<IEventData, IEventMetadata>[],
      showAddAdditionalMember: false,
      newAdditionalMember: null,
      disabledAddMembers: false,
      showEditAddress: false,
      showProfileHistory: false,
    };
  },

  watch: {
    householdEntity: {
      handler(newValue) {
        if (newValue && !_isEmpty(newValue)) {
          this.fetchMyEvents();
          this.fetchAllEvents();
          this.setHouseholdCreate();
        }
      },
      deep: true,
    },
  },

  computed: {
    registrationLocations() : IEventGenericLocation[] {
      // active registration locations from events associated with active case files
      const locations: IEventGenericLocation[] = [];
      if (!this.allEvents) {
        return locations;
      }

      this.activeCaseFiles.forEach((cf) => {
        const event = this.allEvents.find((e) => e.entity.id === cf.eventId)?.entity;
        event?.registrationLocations?.forEach((rl) => {
          if (rl.status === EEventLocationStatus.Active) {
            locations.push(rl);
          }
        });
      });

      return locations;
    },

    household(): IHouseholdCreate {
      return useRegistrationStore().getHouseholdCreate();
    },

    householdEntity() : IHouseholdEntity {
      return useHouseholdStore().getById(this.id);
    },

    householdMetadata() : IHouseholdMetadata {
      return useHouseholdMetadataStore().getById(this.id);
    },

    inactiveCaseFiles(): ICaseFileEntity[] {
      if (this.caseFiles) {
        return this.caseFiles.filter((c) => c.caseFileStatus === CaseFileStatus.Archived || c.caseFileStatus === CaseFileStatus.Closed);
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
      const entityTimestamp = this.householdEntity?.timestamp;
      if (!entityTimestamp) {
        return '';
      }

      const metadataTimestamp = this.householdMetadata?.timestamp;
      let date: Moment;

      if (metadataTimestamp) {
        date = moment.max(moment(entityTimestamp), moment(metadataTimestamp));
      } else {
        date = moment(entityTimestamp);
      }

      return date.format('ll');
    },

    canEdit():boolean {
      return this.$hasLevel(this.$hasFeature(FeatureKeys.L0Access) ? UserRoles.level0 : UserRoles.level1);
    },

    canMove():boolean {
      return this.$hasLevel(UserRoles.level2);
    },

    enableAutocomplete(): boolean {
      return this.$hasFeature(FeatureKeys.AddressAutoFill);
    },

    eventNames(): Record<string, IMultilingual> {
      const names: Record<string, IMultilingual> = {};
      this.allEvents?.forEach((e) => {
        names[e.entity.id] = e.entity.name;
      });
      return names;
    },
  },

  async created() {
    await Promise.all([
      useRegistrationStore().fetchGenders(),
      useRegistrationStore().fetchPreferredLanguages(),
      useRegistrationStore().fetchPrimarySpokenLanguages(),
      useRegistrationStore().fetchIndigenousCommunities(),
    ]);
    useRegistrationStore().resetHouseholdCreate();
    await this.fetchCaseFiles();
    await this.fetchMyEvents();
    await this.fetchShelterLocations();
    await this.fetchHouseholdData();
    await this.fetchAllEvents();
    this.loading = false;
  },

  methods: {
    async fetchAllEvents() {
      if (this.caseFiles?.length) {
        const eventIds = this.caseFiles.map((cf) => cf.eventId);
        const results = await this.$services.publicApi.searchEventsById(eventIds) as IAzureSearchResult<ICombinedIndex<IEventData, IEventMetadata>>;
        this.allEvents = results?.value;
      }
    },

    async fetchHouseholdData() {
      this.loading = true;
      try {
        await useHouseholdStore().fetch(this.id);
        await useHouseholdMetadataStore().fetch(this.id, false);
        await this.setHouseholdCreate();
      } finally {
        this.loading = false;
      }
    },

    async setHouseholdCreate() {
      if (this.householdEntity) {
        const householdCreateData = await this.buildHouseholdCreateData(this.householdEntity);
        useRegistrationStore().setHouseholdCreate(householdCreateData);
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

    makeShelterLocationsListForMember(m: IMember) {
      if (m.currentAddress?.shelterLocation) {
        return [m.currentAddress.shelterLocation, ...this.shelterLocations];
      }
      return this.shelterLocations;
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
