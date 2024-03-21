<template>
  <rc-page-content
    :title="$t('household.profile.title')"
    :show-add-button="false"
    show-back-button
    :show-edit-button="false"
    content-padding="0"
    outer-scroll
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
                :aria-label="$t('common.edit')"
                :disabled="editingDisabled"
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
              <div v-if="addressLine1" data-test="household_profile_home_address_line1">
                {{ addressLine1 }}
              </div>
              <div v-if="addressLine2" data-test="household_profile_home_address_line2">
                {{ addressLine2 }}
              </div>
              <div v-if="country" data-test="household_profile_home_address_country">
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
            <span>{{ householdEntity && householdEntity.created ? format(new Date(householdEntity.created), 'PP') : '-' }}</span>
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
          <div class="d-flex flex-row">
            <status-select
              data-test="household-profile-status"
              :value="householdEntity.householdStatus"
              :statuses="statuses"
              status-name="HouseholdStatus"
              :disabled="!canChangeStatus"
              @input="onStatusChangeInit($event)" />

            <v-divider
              vertical
              class="ml-4 mr-4" />

            <div class="flex-row rc-body12 align-center">
              <v-icon
                class="mr-2"
                data-test="household-profile-duplicatesIcon"
                :color="duplicateCount > 0 ? 'secondary' : ''">
                $rctech-duplicate
              </v-icon>
              <span data-test="household-profile-duplicateCount" class="fw-bold rc-body14">
                {{ duplicateCount }} {{ $t('householdDetails.potentialDuplicates') }} </span>

              <v-btn
                v-if="canManageDuplicates"
                color="primary"
                small
                class="mx-4"
                data-test="household-profile-manageDuplicatesBtn"
                @click="showDuplicatesDialog = true">
                {{ $t("householdDetails.manageDuplicates") }}
              </v-btn>
            </div>
          </div>
          <v-divider class="mt-4 mb-6" />
          <pinned-status
            :pinned-household-status-activity="pinnedHouseholdStatusActivity" />

          <div class="rc-heading-5">
            {{ $t('household.profile.active_in_events', { x: activeCaseFiles.length }) }}
          </div>

          <v-row class="pt-4">
            <v-col v-for="caseFile in activeCaseFiles" :key="caseFile.id" cols="12" md="6">
              <household-case-file-card :my-events="myEvents" :event-names="eventNames" :case-file="caseFile" :is-active="true" />
            </v-col>
          </v-row>

          <v-row class="no-gutters pt-8 pb-4 d-flex justify-space-between">
            <div class="rc-heading-5 ">
              {{ $t('household.profile.household_members') }} ({{ household.primaryBeneficiary ? household.additionalMembers.length + 1 : 0 }})
            </div>
            <div>
              <v-btn
                v-if="canMove && household.primaryBeneficiary"
                color="grey lighten-5"
                small
                depressed
                class="mr-4"
                data-test="household_profile_move_members"
                :disabled="editingDisabled"
                @click="moveMembers()">
                <v-icon left>
                  mdi-compare-horizontal
                </v-icon>
                <span class="fw-bold"> {{ $t('household.profile.move_members') }} </span>
              </v-btn>
              <v-btn
                v-if="canEdit && household.primaryBeneficiary"
                :disabled="disabledAddMembers || editingDisabled"
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
            :editing-disabled="editingDisabled"
            data-test="household_profile_primary_member_card"
            @reload-household-create="fetchHouseholdData" />

          <household-member-card
            v-for="(member, index) in household.additionalMembers"
            :key="member.id"
            :member="member"
            :index="index"
            :shelter-locations="makeShelterLocationsListForMember(member)"
            :registration-locations="registrationLocations"
            :editing-disabled="editingDisabled"
            data-test="household_profile_member_card"
            @reload-household-create="fetchHouseholdData" />

          <household-member-card
            v-for="(member, index) in movedMembers"
            :key="member.personId"
            data-test="moved_member_card"
            :member="member"
            :index="index"
            :moved-status="member.status"
            moved-member />

          <div v-if="inactiveCaseFiles.length" class="rc-heading-5 pt-4 pb-4">
            {{ $t('household.profile.registered_previous_events') }} ({{ inactiveCaseFiles.length }})
          </div>
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
      submit-changes-to-service
      @close="fetchHouseholdData" />
    <edit-household-address-dialog v-if="showEditAddress" :show.sync="showEditAddress" />

    <household-profile-history
      v-if="showProfileHistory && activityItemsData"
      :show.sync="showProfileHistory"
      :activity-items-data="activityItemsData" />

    <household-status-dialog
      v-if="showHouseholdStatusDialog"
      data-test="household-status-dialog"
      :show.sync="showHouseholdStatusDialog"
      :to-status="newStatus"
      @submit="onStatusChange($event)" />

    <manage-duplicates
      v-if="showDuplicatesDialog"
      :show.sync="showDuplicatesDialog"
      data-test="manage-duplicates-dialog"
      :household="householdEntity"
      :household-metadata="householdMetadata"
      @close="fetchMetadataAndClose" />
  </rc-page-content>
</template>

<script lang="ts">

import mixins from 'vue-typed-mixins';
import _isEmpty from 'lodash/isEmpty';

import { MAX_ADDITIONAL_MEMBERS } from '@libs/registration-lib/constants/validations';
import { RcPageContent, RcPageLoading } from '@libs/component-lib/components';
import { CurrentAddress, EIndigenousTypes, ICurrentAddress, IEventGenericLocationWithEventName, IHouseholdCreate, IIdentitySet,
    IMember, Member } from '@libs/entities-lib/household-create';
import { HouseholdStatus, IHouseholdEntity, IHouseholdMetadata } from '@libs/entities-lib/household';
import AddEditAdditionalMembersLib from '@libs/registration-lib/components/additional-members/AddEditAdditionalMembersLib.vue';
import { CaseFileStatus, ICaseFileEntity } from '@libs/entities-lib/case-file';
import household from '@/ui/mixins/household';
import householdHelpers from '@/ui/helpers/household';
import { EEventLocationStatus, IEventGenericLocation, IEventSummary } from '@libs/entities-lib/event';
import EditHouseholdAddressDialog from '@/ui/views/pages/household/components/EditHouseholdAddressDialog.vue';
import routes from '@/constants/routes';
import { FeatureKeys } from '@libs/entities-lib/tenantSettings';
import { IMultilingual } from '@libs/shared-lib/types';
import { useRegistrationStore } from '@/pinia/registration/registration';
import { UserRoles } from '@libs/entities-lib/user';
import { useHouseholdMetadataStore, useHouseholdStore } from '@/pinia/household/household';
import StatusSelect from '@/ui/shared-components/StatusSelect.vue';
import { HouseholdActivityType, IHouseholdActivity, IHouseholdActivityMembers } from '@libs/entities-lib/value-objects/household-activity';
import PinnedStatus from '@/ui/views/pages/household/components/PinnedStatus.vue';
import _debounce from 'lodash/debounce';
import { format, max } from 'date-fns';
import HouseholdCaseFileCard from './components/HouseholdCaseFileCard.vue';
import HouseholdMemberCard from './components/HouseholdMemberCard.vue';
import HouseholdProfileHistory from './components/HouseholdProfileHistory.vue';
import HouseholdStatusDialog from './components/HouseholdStatusDialog.vue';
import ManageDuplicates from './duplicates/ManageDuplicates.vue';

export interface IMovedMember {
  personId: string;
  identitySet: IIdentitySet;
  currentAddress: ICurrentAddress;
  genderName: IMultilingual;
  indigenousIdentityInfo: {
    communityType: EIndigenousTypes,
    name: string,
  };
  shelterLocationName: IMultilingual;
  status: HouseholdActivityType.HouseholdMoved | HouseholdActivityType.OriginalHouseholdSplit;
}

export default mixins(household).extend({
  name: 'HouseholdProfile',

  components: {
    PinnedStatus,
    EditHouseholdAddressDialog,
    RcPageLoading,
    RcPageContent,
    HouseholdCaseFileCard,
    HouseholdMemberCard,
    HouseholdProfileHistory,
    AddEditAdditionalMembersLib,
    StatusSelect,
    HouseholdStatusDialog,
    ManageDuplicates,
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
      format,
      loading: true,
      allEvents: [] as IEventSummary[],
      showAddAdditionalMember: false,
      newAdditionalMember: null,
      disabledAddMembers: false,
      showEditAddress: false,
      showProfileHistory: false,
      FeatureKeys,
      showHouseholdStatusDialog: false,
      newStatus: null as HouseholdStatus,
      activityItemsData: [] as IHouseholdActivity[],
      showDuplicatesDialog: false,
    };
  },

  watch: {
    householdEntity: {
      async handler(newValue) {
        if (this.showDuplicatesDialog) {
          this.loading = true;
          this.showDuplicatesDialog = false;
          await this.fetchData();
        } else if (newValue && !_isEmpty(newValue)) {
          this.fetchMyEvents();
          this.fetchAllEvents();
          this.setHouseholdCreate();
        }
      },
      deep: true,
    },
  },

  computed: {
    registrationLocations(): IEventGenericLocationWithEventName[] {
      // active registration locations from events associated with active case files
      const locations: IEventGenericLocationWithEventName[] = [];
      if (!this.allEvents) {
        return locations;
      }

      this.activeCaseFiles.forEach((cf) => {
        const event = this.allEvents.find((e) => e.id === cf.eventId);
        event?.registrationLocations?.forEach((rl) => {
          if (rl.status === EEventLocationStatus.Active) {
            locations.push({ ...rl, eventName: event.name });
          }
        });
      });

      return locations;
    },

    household(): IHouseholdCreate {
      return useRegistrationStore().getHouseholdCreate();
    },

    householdEntity(): IHouseholdEntity {
      return useHouseholdStore().getById(this.id);
    },

    householdMetadata(): IHouseholdMetadata {
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

    country(): string {
      return householdHelpers.countryName(this.household.homeAddress.country);
    },

    lastUpdated(): string {
      const entityTimestamp = this.householdEntity?.timestamp;
      if (!entityTimestamp) {
        return '';
      }

      const metadataTimestamp = this.householdMetadata?.timestamp;
      let date;

      if (metadataTimestamp) {
        const maxDate = max([new Date(entityTimestamp), new Date(metadataTimestamp)]);
        date = format(maxDate, 'PP');
      } else {
        date = format(new Date(entityTimestamp), 'PP');
      }

      return date;
    },

    canEdit(): boolean {
      return this.$hasLevel(UserRoles.level0);
    },

    canMove(): boolean {
      return this.$hasLevel(UserRoles.level2);
    },

    canManageDuplicates(): boolean {
      const statusAllowsDuplicate = this.householdEntity?.householdStatus !== HouseholdStatus.Archived;
      return this.$hasLevel(UserRoles.level6) || (this.$hasLevel(UserRoles.level1) && statusAllowsDuplicate);
    },

    enableAutocomplete(): boolean {
      return this.$hasFeature(FeatureKeys.AddressAutoFill);
    },

    eventNames(): Record<string, IMultilingual> {
      const names: Record<string, IMultilingual> = {};
      this.allEvents?.forEach((e) => {
        names[e.id] = e.name;
      });
      return names;
    },

    hasLinkedCasefiles(): boolean {
      if (this.caseFiles && this.myEvents) {
        const eventsIdsInCasefiles = this.caseFiles.map((e) => e.eventId);
        for (const myEvent of this.myEvents) {
          if (eventsIdsInCasefiles.includes(myEvent.id)) {
            return true;
          }
        }
      }
      return false;
    },

    canChangeStatus(): boolean {
      switch (this.householdEntity.householdStatus) {
        case HouseholdStatus.Open:
          return this.$hasLevel(UserRoles.level2) && this.hasLinkedCasefiles;

        case HouseholdStatus.Archived:
          return this.$hasLevel(UserRoles.level5) && this.householdEntity.members.length > 0;

        case HouseholdStatus.Closed:
          return this.$hasLevel(UserRoles.level3);

        default:
          return false;
      }
    },

    statuses(): HouseholdStatus[] {
      switch (this.householdEntity.householdStatus) {
        case HouseholdStatus.Open:
          return [HouseholdStatus.Archived, HouseholdStatus.Closed];

        case HouseholdStatus.Closed:
        case HouseholdStatus.Archived:
          return [HouseholdStatus.Open];

        default:
          return [];
      }
    },

    movedMembers(): IMovedMember[] {
      const moveSplitMemberActivities = this.activityItemsData.filter((e) => e.activityType === HouseholdActivityType.HouseholdMoved
        || e.activityType === HouseholdActivityType.OriginalHouseholdSplit);
      let movedMembers = [] as IMovedMember[];

      moveSplitMemberActivities.reverse().forEach((e) => {
        if (e.activityType === HouseholdActivityType.OriginalHouseholdSplit) {
          (e.previousDetails as IHouseholdActivityMembers).memberDetails.forEach((m) => {
            movedMembers.push({ ...m, status: HouseholdActivityType.OriginalHouseholdSplit });
          });
        } else if ((e.previousDetails as IHouseholdActivityMembers).memberDetails.length > 0) {
          (e.previousDetails as IHouseholdActivityMembers).memberDetails.forEach((m) => {
            movedMembers.push({ ...m, status: HouseholdActivityType.HouseholdMoved });
          });
        } else {
          (e.newDetails as IHouseholdActivityMembers).memberDetails.forEach((m) => {
            movedMembers = movedMembers.filter((i) => i.personId !== m.personId);
          });
        }
      });

      // parse identitySet
      movedMembers.forEach((m) => {
        m.currentAddress = new CurrentAddress(m.currentAddress);
        if (m.shelterLocationName?.translation?.en) {
          m.currentAddress.shelterLocation = { name: m.shelterLocationName } as IEventGenericLocation;
        }
        m.identitySet.gender.name = m.genderName;
        m.identitySet.birthDate = householdHelpers.convertBirthDateStringToObject(m.identitySet.dateOfBirth);
        m.identitySet.indigenousType = m.indigenousIdentityInfo?.communityType;
        m.identitySet.indigenousCommunityId = m.identitySet?.indigenousIdentity?.indigenousCommunityId;
      });

      return movedMembers;
    },

    pinnedHouseholdStatusActivity(): IHouseholdActivity {
      return this.activityItemsData.filter((e) => e.activityType === HouseholdActivityType.StatusChanged)[0];
    },

    duplicateCount(): number {
      return this.householdMetadata?.potentialDuplicatesCount || 0;
    },

    editingDisabled(): boolean {
      return (this.householdEntity.householdStatus === HouseholdStatus.Closed
          || this.householdEntity.householdStatus === HouseholdStatus.Archived)
        && !this.$hasLevel(UserRoles.level6);
    },
  },

  async created() {
    await Promise.all([
      useRegistrationStore().fetchGenders(),
      useRegistrationStore().fetchPreferredLanguages(),
      useRegistrationStore().fetchPrimarySpokenLanguages(),
      useRegistrationStore().fetchIndigenousCommunities(),
    ]);
    await this.fetchData();
    this.attachToChanges(true);
  },

  destroyed() {
    this.attachToChanges(false);
  },

  methods: {
    async fetchData() {
      useRegistrationStore().resetHouseholdCreate();
      await this.fetchCaseFiles();
      await this.fetchMyEvents();
      await this.fetchShelterLocations();
      await this.fetchHouseholdData();
      await this.fetchAllEvents();
      this.activityItemsData = await this.$services.households.getHouseholdActivity(this.id);
      this.loading = false;
    },

    async fetchAllEvents() {
      if (this.caseFiles?.length) {
        const eventIds = this.caseFiles.map((cf) => cf.eventId);
        const results = await this.$services.publicApi.searchEventsById(eventIds);
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

    async fetchMetadataAndClose() {
      await useHouseholdMetadataStore().fetch(this.id, false);
      this.showDuplicatesDialog = false;
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

    onStatusChangeInit(status: HouseholdStatus) {
      this.newStatus = status;
      this.showHouseholdStatusDialog = true;
    },

    async onStatusChange({ status, rationale }: { status: HouseholdStatus, rationale: string }) {
      try {
        await this.$services.households.setHouseholdStatus(this.id, status, rationale);
      } finally {
        this.showHouseholdStatusDialog = false;
      }
      return null;
    },

    attachToChanges(on: boolean) {
      if (this.$signalR.connection) {
        if (on) {
          this.$signalR.connection.on('household.HouseholdActivityCreated', this.householdActivityChanged);
          this.$signalR.connection.on('household.HouseholdActivityUpdated', this.householdActivityChanged);
        } else {
          this.$signalR.connection.off('household.HouseholdActivityCreated', this.householdActivityChanged);
          this.$signalR.connection.off('household.HouseholdActivityUpdated', this.householdActivityChanged);
        }
      }
    },

    householdActivityChanged: _debounce(async function func(this:any, item: IHouseholdActivity) {
      if (this.id === item?.householdId) {
        this.activityItemsData = await this.$services.households.getHouseholdActivity(this.id);
      }
    }, 1000),
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
