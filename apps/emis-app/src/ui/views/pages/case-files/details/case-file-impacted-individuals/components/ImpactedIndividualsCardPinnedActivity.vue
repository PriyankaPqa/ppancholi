<template>
  <v-col class="pinnedInfoBackground border-radius-all py-2 px-4 rc-body14" data-test="impacted-individuals-pinned-activity">
    <v-col class="pa-0" data-test="action_user_information">
      <span class="font-weight-bold" data-test="impacted_individuals_pinned_activity_action">{{
        pinnedActivity.activityType === CaseFileActivityType.ImpactedIndividualReceivingAssistance
          ? $t('impactedIndividuals.pinned_rationale.receiving_assistance') : $t('impactedIndividuals.pinned_rationale.no_longer_receiving_assistance')
      }}</span>
      <span>{{ ` ${ rationaleAndUserInfo }` }}</span>
    </v-col>
    <v-col class="pa-0 " data-test="rationale">
      <span class="font-weight-bold">{{ $t('impactedIndividuals.rationale') + ':' }}</span>
      <span data-test="impacted-individuals-pinned-activity-rationale"> {{ pinnedActivity.details.rationale }} </span>
    </v-col>
  </v-col>
</template>

<script lang="ts">
import Vue from 'vue';
import { ICaseFileActivity, CaseFileActivityType } from '@libs/entities-lib/case-file';
import { TranslateResult } from 'vue-i18n';
import { parseISO, format } from 'date-fns';

export default Vue.extend({
  name: 'ImpactedIndividualsCardPinnedActivity',

  props: {
    pinnedActivity: {
      type: Object as () => ICaseFileActivity,
      required: true,
    },
  },

  data() {
    return {
      CaseFileActivityType,
    };
  },

  computed: {
    rationaleAndUserInfo(): string | TranslateResult {
      if (this.pinnedActivity) {
        const user = ` ${this.pinnedActivity.user?.name || ''}`;
        const role = this.pinnedActivity.role?.name ? ` (${this.$m(this.pinnedActivity.role.name)})` : '';
        let string = this.$t('impactedIndividuals.pinned_rationale.by');
        string += user;
        string += role;
        string += ' -';
        string += ` ${format(parseISO(this.pinnedActivity.created as string), 'PP')}`;
        return string;
      }
      return '';
    },
  },
});
</script>

<style scoped lang="scss">
.pinnedInfoBackground{
  background-color: var(--v-status_yellow_pale-base);
}
</style>
