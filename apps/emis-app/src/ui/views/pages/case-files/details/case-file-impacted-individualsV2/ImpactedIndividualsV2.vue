<template>
  <rc-page-content
    :title="$t('impactedIndividuals.impactedIndividuals')"
    outer-scroll
    :show-help="false"
    content-padding="6"
    actions-padding="2">
    <rc-page-loading v-if="loading" />
    <template v-else>
      <div class="d-flex full-width">
        <v-btn v-if="canRequestBooking" class="primary mb-6" @click="openBookingRequest()">
          <v-icon class="mr-2">
            mdi-bed
          </v-icon>
          {{ $t('impactedIndividuals.bookingRequest') }}
        </v-btn>
        <div class="ml-auto mb-6 d-flex">
          <v-chip v-if="pendingBookingRequest" label color="orange">
            <v-icon class="mr-2" small>
              mdi-clock-outline
            </v-icon>
            {{ $t('impactedIndividuals.pendingRequest') }}
          </v-chip>
          <v-btn v-if="canMoveToNewAddress" class="mb-6 ml-4 secondary" @click="startMoveProcess()">
            <v-icon class="mr-2">
              mdi-account-multiple
            </v-icon>
            {{ $t('impactedIndividuals.moveNewAddress') }}
          </v-btn>
        </div>
      </div>
      <div v-for="individual in individuals" :key="individual.id">
        <impacted-individual-card-v2
          :individual="individual"
          :is-primary-member="household && household.primaryBeneficiary === individual.personId"
          :shelter-locations-list="event && event.shelterLocations"
          :case-file-id="caseFileId"
          :user-can-do-bookings="userCanDoBookings"
          :pending-booking-request="pendingBookingRequest"
          :data-test="household && household.primaryBeneficiary === individual.personId ? 'primary_impacted_individual_card' : 'non_primary_impacted_individual_card'"
          :disable-editing-by-status="disableEditingByStatus" />
      </div>
    </template>
    <booking-request-dialog
      v-if="showBookingDialog"
      :id="caseFileId"
      :show.sync="showBookingDialog"
      :shelter-locations-list="event && event.shelterLocations"
      @close="onCloseDialog()" />

    <select-individuals-dialog ref="selectIndividualsDialog" />

    <booking-setup-dialog
      v-if="showMoveDialog"
      :id="caseFileId"
      :preselected-individuals="selectedIndividuals"
      :show.sync="showMoveDialog"
      :lodging-mode="lodgingMode"
      @close="showMoveDialog = false;" />
  </rc-page-content>
</template>

<script lang="ts">
import { RcPageContent, RcPageLoading } from '@libs/component-lib/components';
import { CaseFileStatus } from '@libs/entities-lib/case-file';
import { BookingRequestState, IBookingRequest } from '@libs/entities-lib/booking-request';
import { useBookingRequestStore } from '@/pinia/booking-request/booking-request';
import mixins from 'vue-typed-mixins';
import { UserRoles } from '@libs/entities-lib/user';
import { useTeamStore } from '@/pinia/team/team';
import { ITeamEntity } from '@libs/entities-lib/team';
import { MembershipStatus } from '@libs/entities-lib/case-file-individual';
import { Status } from '@libs/shared-lib/types';
import { useUserStore } from '@/pinia/user/user';
import caseFileDetail from '../caseFileDetail';
import ImpactedIndividualCardV2 from './components/ImpactedIndividualCardV2.vue';
import SelectIndividualsDialog from './components/SelectIndividualsDialog.vue';
import BookingSetupDialog, { LodgingMode } from '../../../lodging/BookingSetupDialog.vue';

export default mixins(caseFileDetail).extend({
  name: 'ImpactedIndividuals',

  components: {
    ImpactedIndividualCardV2,
    RcPageContent,
    RcPageLoading,
    SelectIndividualsDialog,
    BookingSetupDialog,
  },

  data() {
    return {
      loading: false,
      showBookingDialog: false,
      userCanDoBookings: false,
      bookingTeams: [] as ITeamEntity[],
      showModifyLodging: false,
      selectedIndividuals: [] as string[],
      showMoveDialog: false,
      lodgingMode: null as LodgingMode,
    };
  },

  computed: {
    disableEditingByStatus(): boolean {
      const caseFileStatusReadOnly = [CaseFileStatus.Closed, CaseFileStatus.Archived, CaseFileStatus.Inactive];
      return caseFileStatusReadOnly.indexOf(this.caseFile.caseFileStatus) > -1;
    },

    pendingBookingRequest(): IBookingRequest {
      return useBookingRequestStore().getByCaseFile(this.caseFileId).find((b) => b.state === BookingRequestState.Pending);
    },

    canRequestBooking(): boolean {
      return this.$hasFeature(this.$featureKeys.Lodging) && !this.individuals.find((i) => i.personId === this.primaryMember.id && i.currentAddress.crcProvided)
        && !this.pendingBookingRequest && !this.readonly && !this.userCanDoBookings && this.$hasLevel(UserRoles.level1) && !this.disableEditingByStatus;
    },

    canMoveToNewAddress(): boolean {
      return this.$hasFeature(this.$featureKeys.Lodging) && (this.userCanDoBookings || this.canRequestBooking);
    },
  },

  async created() {
    this.loading = true;
    await useBookingRequestStore().fetchAll({ caseFileId: this.caseFileId });
    this.bookingTeams = (await useTeamStore().search({ params: { filter: {
          Entity: { Events: { any: { Id: { value: this.caseFile.eventId, type: 'guid' } } } },
          'Entity/UseForLodging': true,
        } } })).values;
    this.userCanDoBookings = this.$hasFeature(this.$featureKeys.Lodging) && (this.$hasLevel(UserRoles.level6)
      || (!this.disableEditingByStatus && !!this.bookingTeams.find((t) => !!t.teamMembers.find((tm) => tm.id === useUserStore().getUserId()))));

    this.loading = false;
  },

  methods: {
    openBookingRequest() : void {
      this.showBookingDialog = true;
    },
    onCloseDialog() : void {
      this.showBookingDialog = false;
    },

    async startMoveProcess() {
      const dialog = this.$refs.selectIndividualsDialog as any;
      const peopleToMove = this.individuals.filter((i) => i.membershipStatus === MembershipStatus.Active)
          .map((i) => ({
            ...this.members.find((m) => m.id === i.personId && m.status === Status.Active),
            caseFileIndividualId: i.id,
            isPrimary: i.personId === this.primaryMember?.id,
          })).filter((m) => m.id);
      const userInput = await (dialog.open({
        title: this.$t('impactedIndividuals.selectMove.title'),
        textUserSelection: this.$t('impactedIndividuals.selectMove.content'),
        individuals: peopleToMove,
      })) as { answered: boolean, selectedIndividuals: string[] };

      if (userInput.answered) {
        this.selectedIndividuals = userInput.selectedIndividuals;
        this.lodgingMode = this.userCanDoBookings ? LodgingMode.MoveCrcProvidedAllowed : LodgingMode.MoveCrcProvidedNotAllowed;
        this.showMoveDialog = true;
      }
      dialog.close();
    },
  },
});
</script>
