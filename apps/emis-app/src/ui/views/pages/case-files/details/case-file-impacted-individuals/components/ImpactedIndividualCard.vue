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
        <v-switch v-model="isReceivingAssistance" class="mt-1 ml-3" data-test="receiving_assistance_toggle" @change="onToggleChange($event)" />
        <span class="rc-body12">
          {{ $t('impactedIndividuals.receiving_assistance') }}
        </span>
      </div>
    </div>

    <impacted-individual-address-template :address="member.currentAddress" can-edit @open-edit-temporary-address-dialog="showEditMemberDialog = true" />

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
  </v-sheet>
</template>
<script lang="ts">
import Vue from 'vue';
import { ICurrentAddress, IMember, IShelterLocationData } from '@libs/entities-lib/household-create';
import ImpactedIndividualAddressTemplate from '@/ui/views/pages/case-files/details/case-file-impacted-individuals/components/ImpactedIndividualAddressTemplate.vue';
import ImpactedIndividualsEditAddressDialog from '@/ui/views/pages/case-files/details/case-file-impacted-individuals/components/ImpactedIndividualsEditAddressDialog.vue';
import { IImpactedIndividual } from '@libs/entities-lib/case-file';

export default Vue.extend({
  name: 'ImpactedIndividualCard',

  components: {
    ImpactedIndividualAddressTemplate,
    ImpactedIndividualsEditAddressDialog,
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
  },

  data() {
    return {
      showPreviousTemporaryAddress: false,
      showEditMemberDialog: false,
      isReceivingAssistance: true,
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
  },

  async created() {
      this.isReceivingAssistance = this.impactedIndividuals.find((i) => i.personId === this.member.id)?.receivingAssistance;
  },

  methods: {
     onToggleChange(receiveAssistance: boolean) {
      // TODO will be done in 5453
      const params = {
        receiveAssistance,
        personId: this.member.id,
      };
      this.$services.caseFiles.setPersonReceiveAssistance(this.caseFileId, params);
    },

  },
});
</script>

<style scoped lang="scss">
.background {
  background: var(--v-grey-lighten4);
}
</style>
