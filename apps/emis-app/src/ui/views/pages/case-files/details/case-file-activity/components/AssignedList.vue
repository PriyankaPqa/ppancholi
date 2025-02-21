<template>
  <div class=" d-flex flex-column">
    <span class="rc-body16 fw-bold pb-4">{{ $t('caseFile.assign.assigned_to') }}</span>

    <div class="rc-body14 pb-2">
      {{ $t('caseFile.assign.assigned_team') }}
    </div>
    <v-sheet rounded outlined height="100%" class="px-4 py-1">
      <v-list v-if="assignedTeams.length" aria-busy="true" data-test="assigned-teams-list">
        <v-list-item-group role="list" :aria-label="$t('caseFile.assign.assigned_team')">
          <v-list-item
            v-for="team in assignedTeams"
            :key="team.id"
            :disabled="isViewOnly"
            role="listitem"
            class="pl-3 assigned-list-item"
            :data-test="`assigned-teams-list-item-${team.id}`">
            <v-list-item-content class="py-1">
              <span class="rc-body14 fw-bold">{{ team.name }}</span>
            </v-list-item-content>

            <v-list-item-action v-if="!isViewOnly" class="my-1">
              <v-tooltip bottom>
                <template #activator="{ on }">
                  <v-btn
                    icon
                    x-small
                    :data-test="`unassign_${team.id}`"
                    :aria-label="$t('caseFile.assign.tooltip.unassign')"
                    @click="$emit('removeTeam', team)"
                    v-on="on">
                    <v-icon>mdi-close</v-icon>
                  </v-btn>
                </template>
                <span>{{ $t('caseFile.assign.tooltip.unassign') }}</span>
              </v-tooltip>
            </v-list-item-action>
          </v-list-item>
        </v-list-item-group>
      </v-list>
      <div v-else class="rc-body14 text--secondary">
        {{ $t('caseFile.assign.no_assigned_team') }}
      </div>
    </v-sheet>

    <div class="rc-body14 pt-4 pb-2">
      {{ $t('caseFile.assign.assigned_individual') }}
    </div>
    <v-sheet rounded outlined height="100%" class="px-4 py-1">
      <v-list v-if="assignedIndividuals.length" aria-busy="true" data-test="assigned-individuals-list">
        <v-list-item-group role="list" :aria-label="$t('caseFile.assign.assigned_individual')">
          <v-list-item
            v-for="individual in assignedIndividuals"
            :key="individual.entity.id"
            :disabled="isViewOnly"
            class="pl-3 assigned-list-item"
            role="listitem"
            :data-test="`assigned-individuals-list-item-${individual.entity.id}`">
            <v-list-item-content class="py-2">
              <span class="rc-body14 fw-bold">{{ individual.metadata.displayName }}</span>
              <span class="rc-body14">{{ individual.assignedTeamName }}</span>
            </v-list-item-content>

            <v-list-item-action v-if="!isViewOnly" class="my-1">
              <v-tooltip bottom>
                <template #activator="{ on }">
                  <v-btn
                    icon
                    x-small
                    :data-test="`unassign_${individual.entity.id}`"
                    :aria-label="$t('caseFile.assign.tooltip.unassign')"
                    @click="$emit('removeIndividual', individual)"
                    v-on="on">
                    <v-icon>mdi-close</v-icon>
                  </v-btn>
                </template>
                <span>{{ $t('caseFile.assign.tooltip.unassign') }}</span>
              </v-tooltip>
            </v-list-item-action>
          </v-list-item>
        </v-list-item-group>
      </v-list>
      <div v-else class="rc-body14 text--secondary">
        {{ $t('caseFile.assign.no_assigned_individual') }}
      </div>
    </v-sheet>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { ITeamEntity, ITeamMember } from '@libs/entities-lib/team';
import { IUserAccountCombined } from '@libs/entities-lib/user-account';

export interface IIndividual extends ITeamMember, IUserAccountCombined {
  translatedRoleName?: string;
  assignedTeamName: string;
  assignedTeamId: string;
}

export default Vue.extend({
  name: 'AssignedList',

  props: {
    assignedTeams: {
      type: Array as ()=> ITeamEntity[],
      required: true,
    },
    assignedIndividuals: {
      type: Array as () => IIndividual[],
      required: true,
    },
    isViewOnly:
    {
      type: Boolean,
      default: false,
    },
  },

});

</script>

<style scoped lang='scss'>

  .divider {
    margin: 0 -16px;
    border-top: 1px solid var(--v-grey-lighten2);
  }

  .assigned-list-item {
  min-height: 36px;
  }

</style>
