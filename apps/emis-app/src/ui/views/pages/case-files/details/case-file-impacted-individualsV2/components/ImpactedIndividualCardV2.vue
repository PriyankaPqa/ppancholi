<template>
  <v-sheet
    v-if="member.status === Status.Active"
    rounded
    outlined
    class="mb-4">
    <div class="px-4 py-2 rc-body18 fw-bold d-flex align-center justify-space-between background">
      <div>
        <v-icon size="22" class="pr-2 rc-body14" :color="isReceivingAssistance && individual.membershipStatus === MembershipStatus.Active ? 'secondary' : 'grey'">
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
        <template v-if="individual.membershipStatus === MembershipStatus.Removed">
          <v-chip
            class="px-2 mr-4"
            small
            label
            color="grey darken-2"
            outlined
            data-test="household_profile_member_moved_member_label">
            <span class="text-uppercase rc-body10">
              {{ $t('household.profile.member.moved_member') }}
            </span>
          </v-chip>
        </template>
        <v-switch
          v-model="isReceivingAssistance"
          :disabled="disableEditing"
          class="mt-1 ml-3"
          :aria-label="$t('impactedIndividuals.receiving_assistance')"
          data-test="receiving_assistance_toggle"
          @change="onToggleChange($event)" />
        <span class="rc-body12">
          {{ isReceivingAssistance ? $t('impactedIndividuals.receiving_assistance') : $t('impactedIndividuals.not_receiving_assistance') }}
        </span>
      </div>
    </div>
    <impacted-individuals-card-pinned-rationale-V2
      v-if="lastReceivingAssistanceChange"
      :key="lastReceivingAssistanceChange.id"
      :pinned-detail="lastReceivingAssistanceChange" />
    <impacted-individual-address-template-v2
      :address="individual.currentAddress"
      :shelter-locations-list="shelterLocationsList"
      show-edit-button
      :disable-editing="disableEditing"
      @open-edit-temporary-address-dialog="showEditMemberDialog = true" />

    <div v-if="reorderedAddressHistory.length > 0" data-test="previous-address-section">
      <div class="px-4 py-0 rc-body14 fw-bold background">
        <v-btn
          icon
          :aria-label="$t('impactedIndividuals.Previous_temporary_address')"
          data-test="previous-address-icon"
          @click="showPreviousTemporaryAddress = !showPreviousTemporaryAddress">
          <v-icon>
            {{ showPreviousTemporaryAddress ? 'mdi-chevron-up' : 'mdi-chevron-down' }}
          </v-icon>
        </v-btn>
        {{ $t('impactedIndividuals.Previous_temporary_address') }}
      </div>
      <template v-if="showPreviousTemporaryAddress">
        <div v-for="address in reorderedAddressHistory" :key="address.id" data-test="previous-address-row">
          <impacted-individual-address-template-v2
            :address="address"
            :shelter-locations-list="shelterLocationsList"
            is-previous-temporary-address />
        </div>
      </template>
    </div>
    <impacted-individuals-edit-address-dialog-v2
      v-if="showEditMemberDialog"
      :id="individual.caseFileId"
      :show.sync="showEditMemberDialog"
      :individual="individual"
      :member="member"
      :is-primary-member="isPrimaryMember"
      :shelter-locations-list="shelterLocationsList" />

    <impacted-individuals-require-rationale-dialog-v2
      v-if="showRequireRationaleDialog"
      :case-file-individual-id="individual.id"
      :case-file-id="caseFileId"
      :is-receiving-assistance-change-to="isReceivingAssistance"
      :show.sync="showRequireRationaleDialog"
      @close="onCloseDialog()" />
  </v-sheet>
</template>
<script lang="ts">
import Vue from 'vue';
import { IMemberEntity } from '@libs/entities-lib/household-create';
import { UserRoles } from '@libs/entities-lib/user';
import { Status } from '@libs/shared-lib/types';
import { IEventGenericLocation } from '@libs/entities-lib/src/event';
import { CaseFileIndividualEntity, MembershipStatus, ReceivingAssistanceDetail, TemporaryAddress } from '@libs/entities-lib/case-file-individual';
import { usePersonStore } from '@/pinia/person/person';
import ImpactedIndividualsRequireRationaleDialogV2 from './ImpactedIndividualsRequireRationaleDialogV2.vue';
import ImpactedIndividualsCardPinnedRationaleV2 from './ImpactedIndividualsCardPinnedRationaleV2.vue';
import ImpactedIndividualsEditAddressDialogV2 from './ImpactedIndividualsEditAddressDialogV2.vue';
import ImpactedIndividualAddressTemplateV2 from './ImpactedIndividualAddressTemplateV2.vue';

export default Vue.extend({
  name: 'ImpactedIndividualCard',

  components: {
    ImpactedIndividualAddressTemplateV2,
    ImpactedIndividualsEditAddressDialogV2,
    ImpactedIndividualsCardPinnedRationaleV2,
    ImpactedIndividualsRequireRationaleDialogV2,
  },

  props: {
    isPrimaryMember: {
      type: Boolean,
      default: false,
    },

    individual: {
      type: Object as () => CaseFileIndividualEntity,
      required: true,
    },

    shelterLocationsList: {
      type: Array as () => IEventGenericLocation[],
      default: null,
    },

    caseFileId: {
      type: String,
      required: true,
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
      MembershipStatus,
      Status,
    };
  },

  computed: {
    member(): IMemberEntity {
      return usePersonStore().getById(this.individual.personId);
    },

    displayName(): string {
      return `${this.member.identitySet.firstName} ${this.member.identitySet.lastName}`;
    },

    reorderedAddressHistory(): TemporaryAddress[] {
      const reorderedAddressHistory = [...this.individual.temporaryAddressHistory];
      reorderedAddressHistory.sort((a, b) => (new Date(a.from).getTime() > new Date(b.from).getTime() ? -1 : 1)).shift();
      return reorderedAddressHistory;
    },

    lastReceivingAssistanceChange(): ReceivingAssistanceDetail {
      const details = [...this.individual.receivingAssistanceDetails];
      const lastChange = details.sort((a, b) => (new Date(a.detailDate).getTime() > new Date(b.detailDate).getTime() ? -1 : 1))[0];
      return this.individual.receivingAssistanceDetails.length > 1 ? lastChange : null;
    },

    disableEditing(): boolean {
      if (this.individual.membershipStatus === MembershipStatus.Removed) {
        return true;
      }
      if (this.$hasLevel(UserRoles.level6)) {
        return false;
      }
      return this.disableEditingByStatus || !this.$hasLevel(UserRoles.level1);
    },
  },

  async created() {
    this.isReceivingAssistance = this.individual.receivingAssistance;
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
