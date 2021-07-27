<template>
  <v-sheet
    v-if="caseFile"
    rounded
    :outlined="!isActive"
    class="pa-3"
    :class="{ 'background': isActive }">
    <table>
      <tbody class="rc-body14">
        <tr>
          <td>
            <v-icon :size="isActive? '22':'16'" class="pr-2" color="secondary">
              mdi-calendar
            </v-icon>
          </td>

          <td>
            <button
              :is="isActive ? 'span': 'button'"
              class="fw-bold"
              :class="[isActive? 'rc-body18': 'rc-link14' ]"
              data-test="household_profile_case_file_event_name"
              @click="openCaseFileSummary = true">
              {{ $m(caseFile.metadata.event.name) }}
            </button>
          </td>
        </tr>

        <tr>
          <td />
          <td>
            <router-link
              :is="isActive ? 'router-link': 'span'"
              :to="caseFileRoute"
              data-test="household_profile_case_file_number"
              :class="{'rc-link14': isActive}">
              {{ `${$t('household.profile.case_file')}: ${caseFile.entity.caseFileNumber}` }}
            </router-link>
          </td>
        </tr>

        <tr>
          <td />
          <td data-test="household_profile_case_file_registered_date">
            {{ `${$t('household.profile.registered')}: ${moment(caseFile.entity.created).format('ll')}` }}
          </td>
        </tr>
      </tbody>
    </table>
  </v-sheet>
</template>

<script lang="ts">
import Vue from 'vue';
import moment from 'moment';

import routes from '@/constants/routes';
import { CaseFileStatus, ICaseFileCombined } from '@/entities/case-file';

export default Vue.extend({
  name: 'HouseholdCaseFileCard',

  props: {
    /**
     * The case file of the household
     */
    caseFile: {
      type: Object as ()=> ICaseFileCombined,
      required: true,
    },
  },

  data() {
    return {
      moment,
      openCaseFileSummary: false,
    };
  },
  computed: {
    caseFileRoute(): {name: string, params: {id: string} } {
      return {
        name: routes.caseFile.activity.name,
        params: {
          id: this.caseFile.entity?.id,
        },
      };
    },

    isActive():boolean {
      return this.caseFile.entity.caseFileStatus === CaseFileStatus.Open;
    },
  },
});
</script>

<style scoped lang="scss">
  .background {
    background: var(--v-primary-lighten2);
  }
</style>
