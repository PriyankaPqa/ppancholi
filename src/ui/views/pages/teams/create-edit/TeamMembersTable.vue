<template>
  <div>
    <div
      :class="['table_top_header', isEditMode? 'border-radius-top no-bottom-border' : 'border-radius-all']">
      <v-btn color="primary" data-test="add-new-member" :disabled="!isEditMode" @click="openDialog()">
        {{ $t('teams.add_new_members') }}
      </v-btn>
    </div>
    <v-data-table
      v-if="isEditMode"
      class="table border-radius-bottom"
      data-test="teamMembers__table"
      hide-default-footer
      :headers="headers"
      :items="teamMembers" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { DataTableHeader } from 'vuetify';

export default Vue.extend({
  name: 'TeamMembersTable',
  props: {
    teamMembers: {
      type: Array,
      required: true,
    },
    isEditMode: {
      type: Boolean,
      required: true,
    },
  },
  computed: {
    headers(): Array<DataTableHeader> {
      return [
        {
          text: this.$t('teams.member_name') as string,
          class: 'team_member_header',
          filterable: false,
          sortable: false,
          value: '',
        },
        {
          text: this.$t('teams.member_email') as string,
          class: 'team_member_header',
          filterable: false,
          sortable: false,
          value: '',
        },
        {
          text: this.$t('teams.phone_number') as string,
          class: 'team_member_header',
          filterable: false,
          sortable: false,
          value: '',
        },
        {
          text: this.$t('teams.member_role') as string,
          class: 'team_member_header',
          filterable: false,
          sortable: false,
          value: '',
        },
      ];
    },
  },

  methods: {
    openDialog() {
      // TODO in another story
      return false;
    },
  },
});
</script>

<style lang="scss">

.table_top_header {
  border: solid 1px var(--v-grey-lighten2);
  padding: 10px 15px;
}

.table {
  border: solid 1px var(--v-grey-lighten2);
}

.team_member_header {
  font-size: 14px !important;
  font-weight: 700 !important;
  color: var(--v-grey-darken4) !important;;
}

.no-bottom-border {
  border-bottom: none;
}

</style>
