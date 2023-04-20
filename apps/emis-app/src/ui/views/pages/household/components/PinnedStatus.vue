<template>
  <v-col v-if="pinnedHouseholdStatusActivity" class="pinnedInfoBackground border-radius-all pa-4 mb-8 rc-body14">
    <v-col class="pa-0" data-test="action_user_information">
      {{ householdStatusActionAndUserInfo }}
    </v-col>
    <v-col class="pa-0 pt-1" data-test="rationale">
      {{
        $m(pinnedHouseholdStatusActivity.newDetails.rationale) || pinnedHouseholdStatusActivity.newDetails.rationale.translation[$i18n.fallbackLocale]
      }}
    </v-col>
  </v-col>
</template>

  <script lang="ts">
  import { HouseholdStatus } from '@libs/entities-lib/household';
  import moment from '@libs/shared-lib/plugins/moment';
  import { IHouseholdActivity } from '@libs/entities-lib/value-objects/household-activity';
  import { IMultilingual } from '@libs/shared-lib/types';
  import Vue from 'vue';

  interface IHouseholdStatusUpdatedDetail {
    status: HouseholdStatus;
    rationale: IMultilingual;
  }

  export default Vue.extend({
    name: 'PinnedStatus',

    props: {
      pinnedHouseholdStatusActivity: {
        type: Object as () => IHouseholdActivity,
        default: null,
      },
    },

    data() {
      return {
        moment,
      };
    },

    computed: {
      householdStatusActionAndUserInfo(): string {
        if (this.pinnedHouseholdStatusActivity) {
          const user = ` ${this.pinnedHouseholdStatusActivity.user?.name || ''}`;
          const role = this.pinnedHouseholdStatusActivity.role?.name ? ` (${this.$m(this.pinnedHouseholdStatusActivity.role.name)})` : '';
          let string = `${
            this.$t(`household.status.pinned_information.${HouseholdStatus[((this.pinnedHouseholdStatusActivity.newDetails as IHouseholdStatusUpdatedDetail).status)]}`)
             }`;
            string += user;
            string += role;
            string += ` - ${this.moment(this.pinnedHouseholdStatusActivity.timestamp).local().format('ll')}`;
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
