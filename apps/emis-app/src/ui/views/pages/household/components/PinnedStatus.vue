<template>
  <v-col v-if="pinnedHouseholdStatusActivity" class="pinnedInfoBackground border-radius-all pa-4 mb-8 rc-body14">
    <v-col class="pa-0" data-test="action_user_information">
      {{ householdStatusActionAndUserInfo }}
    </v-col>
    <v-col class="pa-0 pt-1" data-test="rationale">
      {{
        $m(pinnedHouseholdStatusActivity.details.rationale) || pinnedHouseholdStatusActivity.details.rationale.translation[$i18n.fallbackLocale]
      }}
    </v-col>
  </v-col>
</template>

  <script lang="ts">
  import mixins from 'vue-typed-mixins';
  import { CaseFileActivityType, ICaseFileActivity } from '@libs/entities-lib/case-file';
  import { HouseholdStatus } from '@libs/entities-lib/household';
  import moment from '@libs/shared-lib/plugins/moment';
  import caseFileActivity from '@/ui/mixins/caseFileActivity';

  export default mixins(caseFileActivity).extend({
    name: 'PinnedStatus',

    props: {
      /**
       * The id of the case file
       */
      id: {
        type: String,
        required: true,
      },
    },

    data() {
      return {
        moment,
      };
    },

    computed: {
      pinnedHouseholdStatusActivity(): ICaseFileActivity {
        return this.caseFileActivities.filter((e) => e.activityType === CaseFileActivityType.HouseholdStatusChanged)[0];
      },

      householdStatusActionAndUserInfo(): string {
        const user = ` ${this.pinnedHouseholdStatusActivity?.user?.name || ''}`;
        const role = this.pinnedHouseholdStatusActivity?.role?.name ? ` (${this.$m(this.pinnedHouseholdStatusActivity?.role?.name)})` : '';
        if (this.pinnedHouseholdStatusActivity?.details) {
          let string = `${this.$t(`household.status.pinned_information.${HouseholdStatus[(this.pinnedHouseholdStatusActivity.details.newHouseholdStatus) as HouseholdStatus]}`)
             }`;
            string += user;
            string += role;
            string += ` - ${this.moment(this.pinnedHouseholdStatusActivity?.created).local().format('ll')}`;
          return string;
        }
        return '';
      },
    },

    async created() {
      await this.fetchCaseFileActivities();
      this.attachToChanges(true);
    },

    destroyed() {
      this.attachToChanges(false);
    },
    });
  </script>

  <style scoped lang="scss">
  .pinnedInfoBackground{
    background-color: var(--v-status_yellow_pale-base);
  }
  </style>
