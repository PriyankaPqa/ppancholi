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
  import { IHouseholdActivity } from '@libs/entities-lib/value-objects/household-activity';
  import { IMultilingual } from '@libs/shared-lib/types';
  import { format, parseISO } from 'date-fns';
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
            string += ` - ${format(parseISO(this.pinnedHouseholdStatusActivity.timestamp as string), 'MMM d, yyyy')}`;
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
