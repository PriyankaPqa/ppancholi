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
            <component
              :is="isActive ? 'span': 'button'"
              class="fw-bold"
              :class="[isActive? 'rc-body18': 'rc-link14' ]"
              data-test="household_profile_case_file_event_name"
              @click="openCaseFileSummary = true">
              {{ $m(caseFile.eventName) }}
            </component>
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
            {{ `${$t('household.profile.registered')}: ${moment(caseFile.registeredDate).format('ll')}` }}
          </td>
        </tr>
      </tbody>
    </table>
  </v-sheet>
</template>

<script lang="ts">
import Vue from 'vue';
import moment from 'moment';
import { IHouseholdCaseFile } from '@crctech/registration-lib/src/entities/household';
import routes from '@/constants/routes';
import { IEventMainInfo } from '@/entities/event';

export default Vue.extend({
  name: 'HouseholdCaseFileCard',

  props: {
    /**
     * The case file of the household
     */
    caseFile: {
      type: Object as ()=> IHouseholdCaseFile,
      required: true,
    },
    /**
     * The list of events to which the user has access
     */
    myEvents: {
      type: Array as ()=> IEventMainInfo[],
      default: () => [] as IEventMainInfo[],
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
          id: this.caseFile.caseFileId,
        },
      };
    },

    hasAccessToEvent():boolean {
      const { eventId } = this.caseFile;
      return this.myEvents.map((e) => e.entity.id).includes(eventId);
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
