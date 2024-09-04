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

        <v-btn v-if="canRequestUpdate" class="primary mb-6" @click="showTaskDialog = true">
          {{ $t('impactedIndividuals.requestUpdate') }}
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
          <v-btn v-if="canExtendStay" class="mb-6 ml-4 secondary" @click="startExtendStay()">
            <v-icon class="mr-2">
              mdi-calendar-blank
            </v-icon>
            {{ $t('impactedIndividuals.extendStay') }}
          </v-btn>
        </div>
      </div>
      <div v-for="individual in individuals" :key="individual.id">
        <impacted-individual-card-v2
          :individual="individual"
          :is-primary-member="household && household.primaryBeneficiary === individual.personId"
          :shelter-locations-list="event && event.shelterLocations"
          :case-file-id="caseFileId"
          :user-can-do-bookings="userCanProvideCrcAddress"
          :pending-booking-request="pendingBookingRequest"
          :data-test="household && household.primaryBeneficiary === individual.personId ? 'primary_impacted_individual_card' : 'non_primary_impacted_individual_card'"
          :disable-editing-by-status="disableEditingByStatus"
          @open-edit-address="startEditAddress(individual)" />
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

    <rc-dialog
      v-if="showTaskDialog"
      :title="$t('impactedIndividuals.requestUpdate')"
      :show.sync="showTaskDialog"
      :show-submit="false"
      :show-cancel="false"
      content-only-scrolling
      content-padding="0"
      min-height="620"
      width="1000"
      persistent
      @close="showTaskDialog = false;">
      <create-edit-task :id="caseFileId" task-type="team" :dialog-mode="true" :is-lodging-task="true" @cancel="showTaskDialog = false;" @saved="taskSaved" />
    </rc-dialog>
  </rc-page-content>
</template>

<script lang="ts">
import { RcPageContent, RcPageLoading, RcDialog } from '@libs/component-lib/components';
import { CaseFileStatus } from '@libs/entities-lib/case-file';
import { BookingRequestState, IBookingRequest } from '@libs/entities-lib/booking-request';
import { useBookingRequestStore } from '@/pinia/booking-request/booking-request';
import mixins from 'vue-typed-mixins';
import { UserRoles } from '@libs/entities-lib/user';
import { useTeamStore } from '@/pinia/team/team';
import { ITeamEntity } from '@libs/entities-lib/team';
import { CurrentAddress } from '@libs/entities-lib/household-create';
import { ICaseFileIndividualEntity } from '@libs/entities-lib/case-file-individual';
import { useUserStore } from '@/pinia/user/user';
import caseFileDetail from '../caseFileDetail';
import ImpactedIndividualCardV2 from './components/ImpactedIndividualCardV2.vue';
import SelectIndividualsDialog from './components/SelectIndividualsDialog.vue';
import BookingSetupDialog from '../../../lodging/BookingSetupDialog.vue';
import { LodgingMode } from '../../../lodging/bookingHelper';
import CreateEditTask from '../case-file-task/create-edit/CreateEditTask.vue';

export default mixins(caseFileDetail).extend({
  name: 'ImpactedIndividuals',

  components: {
    ImpactedIndividualCardV2,
    RcPageContent,
    RcPageLoading,
    SelectIndividualsDialog,
    BookingSetupDialog,
    CreateEditTask,
    RcDialog,
  },

  data() {
    return {
      loading: false,
      showBookingDialog: false,
      userCanProvideCrcAddress: false,
      bookingTeams: [] as ITeamEntity[],
      showModifyLodging: false,
      selectedIndividuals: [] as string[],
      showMoveDialog: false,
      showTaskDialog: false,
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

    canAskForHelpFromLodging(): boolean {
      return this.$hasFeature(this.$featureKeys.Lodging) && !this.pendingBookingRequest && !this.readonly && !this.userCanProvideCrcAddress
        && this.$hasLevel(UserRoles.level1) && !this.disableEditingByStatus;
    },

    canRequestBooking(): boolean {
      return this.canAskForHelpFromLodging && !this.individuals.find((i) => i.currentAddress.crcProvided);
    },

    canRequestUpdate(): boolean {
      return this.canAskForHelpFromLodging && !!this.individuals.find((i) => i.currentAddress.crcProvided);
    },

    canMoveToNewAddress(): boolean {
      return this.$hasFeature(this.$featureKeys.Lodging) && (this.userCanProvideCrcAddress || this.canRequestBooking);
    },

    canExtendStay(): boolean {
      return this.$hasFeature(this.$featureKeys.Lodging) && this.userCanProvideCrcAddress
        && !!this.activeIndividuals.find((i) => i.currentAddress.crcProvided);
    },
  },

  async created() {
    this.loading = true;
    await useBookingRequestStore().fetchAll({ caseFileId: this.caseFileId });
    this.bookingTeams = (await useTeamStore().search({ params: { filter: {
          Entity: { Events: { any: { Id: { value: this.caseFile.eventId, type: 'guid' } } } },
          'Entity/UseForLodging': true,
        } } })).values;
    this.userCanProvideCrcAddress = this.$hasFeature(this.$featureKeys.Lodging) && (this.$hasLevel(UserRoles.level6)
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
      const peopleToMove = this.activeIndividuals
          .map((i) => ({
            ...this.members.find((m) => m.id === i.personId),
            caseFileIndividualId: i.id,
            isPrimary: i.personId === this.primaryMember?.id,
          }));
      const userInput = await (dialog.open({
        title: this.$t('impactedIndividuals.selectMove.title'),
        textUserSelection: this.$t('impactedIndividuals.selectMove.content'),
        individuals: peopleToMove,
      })) as { answered: boolean, selectedIndividuals: string[] };

      if (userInput.answered) {
        this.selectedIndividuals = userInput.selectedIndividuals;
        this.lodgingMode = this.userCanProvideCrcAddress ? LodgingMode.MoveCrcProvidedAllowed : LodgingMode.MoveCrcProvidedNotAllowed;
        this.showMoveDialog = true;
      }
      dialog.close();
    },

    async startExtendStay() {
      this.selectedIndividuals = this.activeIndividuals.filter((i) => i.currentAddress.crcProvided).map((i) => i.id);
      this.lodgingMode = LodgingMode.ExtendStay;
      this.showMoveDialog = true;
    },

    async startEditAddress(individual: ICaseFileIndividualEntity) {
      const peopleToMove = this.activeIndividuals.filter((i) => CurrentAddress.areSimilar(individual.currentAddress, i.currentAddress));
      this.selectedIndividuals = peopleToMove.map((p) => p.id);
      // eslint-disable-next-line no-nested-ternary
      this.lodgingMode = individual.currentAddress.crcProvided
        ? (this.userCanProvideCrcAddress ? LodgingMode.EditCrcProvidedAsLodging : LodgingMode.EditCrcProvidedAsNonLodging) : LodgingMode.EditNotCrcProvided;
      this.showMoveDialog = true;
    },

    taskSaved() {
      this.showTaskDialog = false;
      this.$toasted.global.success(this.$t('impactedIndividuals.requestSent'));
    },
  },
});
</script>
