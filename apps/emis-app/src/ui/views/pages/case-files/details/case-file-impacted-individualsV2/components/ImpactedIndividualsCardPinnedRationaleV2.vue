<template>
  <v-col class="pinnedInfoBackground border-radius-all py-2 px-4 rc-body14" data-test="impacted-individuals-pinned-activity">
    <v-col class="pa-0" data-test="action_user_information">
      <span class="font-weight-bold" data-test="impacted_individuals_pinned_activity_action">{{
        pinnedDetail.receivingAssistance
          ? $t('impactedIndividuals.pinned_rationale.receiving_assistance') : $t('impactedIndividuals.pinned_rationale.no_longer_receiving_assistance')
      }}</span>
      <span>{{ ` ${ rationaleAndUserInfo }` }}</span>
    </v-col>
    <v-col class="pa-0 " data-test="rationale">
      <span class="font-weight-bold">{{ $t('impactedIndividuals.rationale') + ':' }}</span>
      <span data-test="impacted-individuals-pinned-activity-rationale"> {{ pinnedDetail.rationale }} </span>
    </v-col>
  </v-col>
</template>

<script lang="ts">
import Vue from 'vue';
import { TranslateResult } from 'vue-i18n';
import { parseISO, format } from 'date-fns';
import { ReceivingAssistanceDetail } from '@libs/entities-lib/case-file-individual';
import { useUserAccountMetadataStore, useUserAccountStore } from '@/pinia/user-account/user-account';

export default Vue.extend({
  name: 'ImpactedIndividualsCardPinnedRationale',

  props: {
    pinnedDetail: {
      type: Object as () => ReceivingAssistanceDetail,
      required: true,
    },
  },

  computed: {
    rationaleAndUserInfo(): string | TranslateResult {
      if (this.pinnedDetail) {
        const user = useUserAccountMetadataStore().getById(this.pinnedDetail.createdBy);
        const role = useUserAccountStore().rolesByLevels().filter((r) => r.id === user?.roleId)[0];
        let string = this.$t('impactedIndividuals.pinned_rationale.by');
        string += ` ${user?.displayName}` || '';
        string += role?.name ? ` (${this.$m(role.name)})` : '';
        string += ' -';
        string += ` ${format(parseISO(new Date(this.pinnedDetail.detailDate).toISOString()), 'PP')}`;
        return string;
      }
      return '';
    },
  },

  async created() {
    await useUserAccountMetadataStore().fetchByIds([this.pinnedDetail?.createdBy], true);
    await useUserAccountStore().fetchRoles();
  },
});
</script>

<style scoped lang="scss">
.pinnedInfoBackground{
  background-color: var(--v-status_yellow_pale-base);
}
</style>
