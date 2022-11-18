<template>
  <v-sheet
    v-if="caseFile"
    rounded
    :outlined="!isActive"
    class="pa-3"
    :class="{ 'activeBackground': isActive, 'noAccessBackground':isActive && !hasAccessToEvent }">
    <table>
      <tbody class="rc-body14">
        <tr>
          <td>
            <v-icon :size="isActive? '22':'16'" class="pr-2" color="secondary">
              mdi-calendar
            </v-icon>
          </td>
          <td style="width:100%">
            <span
              v-if="isActive"
              class="fw-bold rc-body18"
              data-test="household_profile_case_file_event_name">
              {{ eventName? $m(eventName): '-' }}
            </span>
            <button
              v-else
              class="fw-bold rc-link14"
              data-test="household_profile_case_file_event_name"
              @click="openCaseFileSummary = true">
              {{ eventName? $m(eventName): '-' }}
            </button>
          </td>
          <td class="icon">
            <v-tooltip v-if="isActive && !hasAccessToEvent" bottom data-test="household-profile-no-access-icon">
              <template #activator="{ on }">
                <v-icon size="24" color="red" v-on="on">
                  mdi-cancel
                </v-icon>
              </template>
              <span>{{ $t('household.profile.event.no_access.message') }}</span>
            </v-tooltip>
          </td>
        </tr>

        <tr>
          <td />
          <td>
            <component
              :is="isActive && hasAccessToEvent? 'router-link': 'span'"
              :to="caseFileRoute"
              data-test="household_profile_case_file_number"
              :class="{'rc-link14': isActive && hasAccessToEvent, 'fw-bold': !hasAccessToEvent}">
              {{ `${$t('household.profile.case_file')}: ${caseFile.caseFileNumber}` }}
            </component>
          </td>
        </tr>

        <tr>
          <td />
          <td data-test="household_profile_case_file_registered_date">
            {{ `${$t('household.profile.registered')}: ${moment(caseFile.created).format('ll')}` }}
          </td>
        </tr>
      </tbody>
    </table>

    <rc-dialog
      v-if="openCaseFileSummary"
      :title="$t('casefile.summary.title')"
      :show="openCaseFileSummary"
      :cancel-action-label="$t('common.buttons.close')"
      max-width="1250"
      min-height="600"
      :fullscreen="$vuetify.breakpoint.mdAndDown"
      persistent
      :show-submit="false"
      @close="openCaseFileSummary = false"
      @cancel="openCaseFileSummary = false">
      <case-file-summary :case-file-id="caseFile.id" />
    </rc-dialog>
  </v-sheet>
</template>

<script lang="ts">
import Vue from 'vue';
import moment from 'moment';
import { ICaseFileEntity } from '@libs/entities-lib/case-file';
import { RcDialog } from '@libs/component-lib/components';
import routes from '@/constants/routes';
import { IEventMainInfo } from '@libs/entities-lib/event';
import { IMultilingual } from '@libs/shared-lib/types';
import CaseFileSummary from '../../case-files/details/CaseFileSummary.vue';

export default Vue.extend({
  name: 'HouseholdCaseFileCard',

  components: {
    RcDialog,
    CaseFileSummary,
  },

  props: {
    /**
     * The case file of the household
     */
    caseFile: {
      type: Object as () => ICaseFileEntity,
      required: true,
    },
    /**
     * The list of events to which the user has access
     */
    myEvents: {
      type: Array as () => IEventMainInfo[],
      default: () => [] as IEventMainInfo[],
    },
    /**
     * Names of events in the context, whether the user has access or not
     */
    eventNames: {
      type: Object as () => Record<string, IMultilingual>,
      default: () => ({}),
    },
    /**
     * Whether the case file is active
     */
    isActive: {
      type: Boolean,
      required: true,
    },
  },

  data() {
    return {
      moment,
      openCaseFileSummary: false,
      noAccessDialogVisible: false,
    };
  },
  computed: {
    caseFileRoute(): {name: string, params: {id: string} } {
      return {
        name: routes.caseFile.activity.name,
        params: {
          id: this.caseFile.id,
        },
      };
    },

    hasAccessToEvent():boolean {
      const { eventId } = this.caseFile;
      return this.myEvents.map((e) => e.entity.id).includes(eventId);
    },

    eventName():IMultilingual {
      return this.eventNames[this.caseFile.eventId];
    },
  },
});
</script>

<style scoped lang="scss">
  .activeBackground {
    background: var(--v-primary-lighten2);
  }
  .noAccessBackground {
    background: var(--v-grey-lighten4);
  }

</style>
