<template>
  <v-sheet
    rounded
    outlined
    class="mb-4">
    <div class="px-4 py-2 rc-body18 fw-bold d-flex align-center justify-space-between background">
      <div>
        <v-icon size="22" class="pr-2 rc-body14" :color="isReceivingAssistance ? 'secondary' : 'grey'">
          mdi-account
        </v-icon>
        <span data-test="impacted_individual_card_display_name">
          {{ displayName }}
        </span>
      </div>

      <div class="d-flex align-center">
        <template v-if="isPrimaryMember">
          <v-chip
            class="px-2 mr-4"
            small
            label
            color="grey darken-2"
            outlined
            data-test="primary_member_label">
            <v-icon color="secondary" small class="mr-1">
              mdi-account
            </v-icon>
            <span class="text-uppercase"> {{ $t('household.profile.member.primary_member') }} </span>
          </v-chip>
          <v-divider vertical />
        </template>
        <v-switch
          v-model="isReceivingAssistance"
          :disabled="disableEditing"
          class="mt-1 ml-3"
          data-test="receiving_assistance_toggle"
          @change="onToggleChange($event)" />
        <span class="rc-body12">
          {{ isReceivingAssistance ? $t('impactedIndividuals.receiving_assistance') : $t('impactedIndividuals.not_receiving_assistance') }}
        </span>
      </div>
    </div>
    <impacted-individuals-card-pinned-activity v-if="pinnedActivity" :pinned-activity="pinnedActivity" />
    <impacted-individual-address-template
      :address="member.currentAddress"
      show-edit-button
      :disable-editing="disableEditing"
      @open-edit-temporary-address-dialog="showEditMemberDialog = true" />

    <div v-if="reorderedAddressHistory.length > 0" data-test="previous-address-row">
      <div class="px-4 py-0 rc-body14 fw-bold background">
        <v-btn icon>
          <v-icon data-test="previous-address-icon" @click="showPreviousTemporaryAddress = !showPreviousTemporaryAddress">
            {{ showPreviousTemporaryAddress ? 'mdi-chevron-up' : 'mdi-chevron-down' }}
          </v-icon>
        </v-btn>
        {{ $t('impactedIndividuals.Previous_temporary_address') }}
      </div>
      <template v-if="showPreviousTemporaryAddress">
        <div v-for="(address, $index) in reorderedAddressHistory" :key="$index">
          <impacted-individual-address-template :address="address" is-previous-temporary-address />
        </div>
      </template>
    </div>
    <impacted-individuals-edit-address-dialog
      v-if="showEditMemberDialog"
      :show.sync="showEditMemberDialog"
      :member="member"
      :index="index"
      :is-primary-member="isPrimaryMember"
      :shelter-locations-list="shelterLocationsList" />

    <impacted-individuals-require-rationale-dialog
      v-if="showRequireRationaleDialog"
      :person-id="member.id"
      :case-file-id="caseFileId"
      :is-receiving-assistance-change-to="isReceivingAssistance"
      :show.sync="showRequireRationaleDialog"
      @close="onCloseDialog()" />
  </v-sheet>
</template>
<script lang="ts">
import Vue from 'vue';
import { ICurrentAddress, IMember, IShelterLocationData } from '@libs/entities-lib/household-create';
import ImpactedIndividualAddressTemplate from '@/ui/views/pages/case-files/details/case-file-impacted-individuals/components/ImpactedIndividualAddressTemplate.vue';
import ImpactedIndividualsEditAddressDialog from '@/ui/views/pages/case-files/details/case-file-impacted-individuals/components/ImpactedIndividualsEditAddressDialog.vue';
import { CaseFileActivityType, ICaseFileActivity, IImpactedIndividual } from '@libs/entities-lib/case-file';
import { UserRoles } from '@libs/entities-lib/user';
import ImpactedIndividualsCardPinnedActivity
  from '@/ui/views/pages/case-files/details/case-file-impacted-individuals/components/ImpactedIndividualsCardPinnedActivity.vue';
import ImpactedIndividualsRequireRationaleDialog
  from '@/ui/views/pages/case-files/details/case-file-impacted-individuals/components/ImpactedIndividualsRequireRationaleDialog.vue';

interface IndividualActivityDetailMember {
    id: string,
    name: string,
}

export default Vue.extend({
  name: 'ImpactedIndividualCard',

  components: {
    ImpactedIndividualAddressTemplate,
    ImpactedIndividualsEditAddressDialog,
    ImpactedIndividualsCardPinnedActivity,
    ImpactedIndividualsRequireRationaleDialog,
  },

  props: {
    isPrimaryMember: {
      type: Boolean,
      default: false,
    },

    member: {
      type: Object as () => IMember,
      required: true,
    },

    shelterLocationsList: {
      type: Array as () => IShelterLocationData[],
      default: null,
    },

    impactedIndividuals: {
      type: Array as () => IImpactedIndividual[],
      required: true,
    },

    index: {
      type: Number,
      default: -1,
    },

    caseFileId: {
      type: String,
      required: true,
    },

    impactedIndividualActivities: {
      type: Array as () => ICaseFileActivity[],
      default: () => [] as ICaseFileActivity[],
    },

    disableEditingByStatus: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      showPreviousTemporaryAddress: false,
      showEditMemberDialog: false,
      isReceivingAssistance: true,
      showRequireRationaleDialog: false,
      backUpIsReceivingAssistance: false,
      UserRoles,
    };
  },

  computed: {
    displayName(): string {
      return `${this.member.identitySet.firstName} ${this.member.identitySet.lastName}`;
    },

    reorderedAddressHistory(): ICurrentAddress[] {
      const reorderedAddressHistory = [...this.member.addressHistory];
      reorderedAddressHistory.reverse().shift();
      return reorderedAddressHistory;
    },

    pinnedActivity(): ICaseFileActivity {
      const lastActivity = this.impactedIndividualActivities.filter((a) => (a.details.member as IndividualActivityDetailMember).id === this.member.id)[0];

      // when we move people between households and back, they can have the last activity for them not match their current state
      if ((this.isReceivingAssistance && lastActivity?.activityType === CaseFileActivityType.ImpactedIndividualReceivingAssistance)
        || (!this.isReceivingAssistance && lastActivity?.activityType === CaseFileActivityType.ImpactedIndividualNoLongerReceivingAssistance)) {
          return lastActivity;
      }
      return null;
    },

    disableEditing(): boolean {
      if (this.$hasLevel(UserRoles.level6)) {
        return false;
      }
      return this.disableEditingByStatus || !this.$hasLevel(UserRoles.level1);
    },
  },

  async created() {
    this.isReceivingAssistance = this.impactedIndividuals.find((i) => i.personId === this.member.id)?.receivingAssistance;
    this.backUpIsReceivingAssistance = this.isReceivingAssistance;
  },

  methods: {
     async onToggleChange(isReceivingAssistanceChangeTo: boolean) {
       this.isReceivingAssistance = isReceivingAssistanceChangeTo;
       this.showRequireRationaleDialog = true;
    },

    onCloseDialog() {
      this.isReceivingAssistance = this.backUpIsReceivingAssistance;
      this.showRequireRationaleDialog = false;
    },
  },
});
</script>

<style scoped lang="scss">
.background {
  background: var(--v-grey-lighten4);
}
</style>
