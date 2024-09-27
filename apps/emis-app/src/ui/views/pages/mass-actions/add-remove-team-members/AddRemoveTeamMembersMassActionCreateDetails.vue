<template>
  <div>
    <div class="rc-body16 fw-bold mb-6">
      {{ $t('massAction.addRemoveTeamMembers.create.details') }}
    </div>
    <div class="grey-container pa-6">
      <v-row>
        <v-col cols="12">
          <v-autocomplete-with-validation
            v-model="formCopy.teamId"
            background-color="white"
            outlined
            :items="teams"
            :item-text="getTeamName"
            :item-value="(item) => item && item.id"
            :loading="loading"
            :search-input.sync="teamSearch"
            async-mode
            :attach="true"
            :rules="{ required: true }"
            :label="`${$t('teams.member.caseFile.team')} *`"
            data-test="create-add-remove-team-members-mass-action-team-select"
            v-bind="$attrs"
            clearable
            @change="$emit('change', $event)"
            @delete="$emit('delete', $event)" />
        </v-col>
      </v-row>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import cloneDeep from 'lodash/cloneDeep';
import isEmpty from 'lodash/isEmpty';
import { CaseFileStatus } from '@libs/entities-lib/case-file';
import { VAutocompleteWithValidation } from '@libs/component-lib/components';
import { UserRoles } from '@libs/entities-lib/user';
import { ITeamEntity } from '@libs/entities-lib/team';
import { useTeamStore } from '@/pinia/team/team';
import helpers from '@/ui/helpers/helpers';
import { MassActionAddRemoveTeamMembersForm } from '@/ui/views/pages/mass-actions/add-remove-team-members/AddRemoveTeamMembersMassActionCreate.vue';
import _debounce from 'lodash/debounce';

export default Vue.extend({
  name: 'AddRemoveTeamMembersMassActionCreateDetails',

  components: {
    VAutocompleteWithValidation,
  },

  props: {
    form: {
      type: Object,
      required: true,
    },
  },

  data() {
    return {
      isEmpty,
      CaseFileStatus,
      UserRoles,
      loading: false,
      teamSearch: '',
      formCopy: { teamId: '' } as MassActionAddRemoveTeamMembersForm,
      teams: [] as ITeamEntity[],
    };
  },

  watch: {
    formCopy: {
      deep: true,
      handler(newVal) {
        this.$emit('update:form', newVal);
      },
    },

    teamSearch(newVal) {
      newVal && newVal.id !== this.formCopy.teamId && this.debounceSearch(newVal);
    },
  },

  async created() {
    this.formCopy = cloneDeep(this.form);
    await this.fetchTeams();
  },

  methods: {
    getTeamName(item: ITeamEntity): string {
      if (item?.name) {
        return item.name;
      }
      return '';
    },

    async fetchTeams(querySearch?: '') {
      this.loading = true;
      const searchParam = helpers.toQuickSearchSql(querySearch);

      const params = {
          orderBy: 'Entity/Name asc',
          filter: {
        ...searchParam,
        },
        top: 5,
      };

      const res = await useTeamStore().search({ params });

      this.teams = res?.values;
      this.loading = false;
    },

    // eslint-disable-next-line
    debounceSearch: _debounce(function func(this: any, query: string) {
      this.fetchTeams(query);
    }, 500),
  },
});
</script>
