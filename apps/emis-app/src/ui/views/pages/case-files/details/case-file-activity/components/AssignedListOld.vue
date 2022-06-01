<template>
  <div class=" d-flex flex-column">
    <span class="rc-body16 fw-bold pb-4">{{ $t('caseFile.assign.assigned_to') }}</span>

    <v-sheet rounded outlined height="100%" class="px-4 py-2">
      <v-list v-if="assignedTeams.length" data-test="assigned-teams-list">
        <span class="rc-body14 pb-4">
          {{ $t('caseFile.assign.assigned_team') }}
        </span>
        <v-list-item-group>
          <v-list-item
            v-for="team in assignedTeams"
            :key="team.id"
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

      <div v-if="isViewOnly && assignedTeams.length && assignedIndividuals.length" class="divider" />

      <v-list v-if="assignedIndividuals.length" data-test="assigned-individuals-list">
        <span class="rc-body14 pt-6 pb-3">
          {{ $t('caseFile.assign.assigned_individual') }}
        </span>
        <v-list-item-group>
          <v-list-item
            v-for="individual in assignedIndividuals"
            :key="individual.entity.id"
            class="pl-3 assigned-list-item"
            :data-test="`assigned-individuals-list-item-${individual.entity.id}`">
            <v-list-item-content class="py-1">
              <span class="rc-body14 fw-bold">{{ individual.metadata.displayName }}</span>
            </v-list-item-content>

            <v-list-item-action v-if="!isViewOnly" class="my-1">
              <v-tooltip bottom>
                <template #activator="{ on }">
                  <v-btn
                    icon
                    x-small
                    :data-test="`unassign_${individual.entity.id}`"
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
    </v-sheet>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { ITeamEntity, ITeamMemberAsUser } from '@/entities/team';

export default Vue.extend({
  name: 'AssignedList',

  props: {
    assignedTeams: {
      type: Array as ()=> ITeamEntity[],
      required: true,
    },
    assignedIndividuals: {
      type: Array as () => ITeamMemberAsUser[],
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
