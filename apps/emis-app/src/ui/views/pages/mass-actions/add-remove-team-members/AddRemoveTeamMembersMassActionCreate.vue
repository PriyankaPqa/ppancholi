<template>
  <mass-action-base-create
    ref="base"
    :title="title"
    :apply-to-label="$t('massAction.addRemoveTeamMembers.upload.title')"
    :upload-url="uploadUrl"
    :mode="MassActionMode.File"
    :form-data="formData"
    :loading="loading"
    @back="back()"
    @upload:start="onUploadStart()"
    @upload:success="onSuccess($event)">
    <template #form>
      <add-remove-team-members-mass-action-create-details :form.sync="form" />
    </template>
  </mass-action-base-create>
</template>

<script lang="ts">
import Vue from 'vue';
import routes from '@/constants/routes';
import MassActionBaseCreate from '@/ui/views/pages/mass-actions/components/MassActionBaseCreate.vue';
import { IMassActionEntity, MassActionMode } from '@libs/entities-lib/mass-action';

import AddRemoveTeamMembersMassActionCreateDetails from '@/ui/views/pages/mass-actions/add-remove-team-members/AddRemoveTeamMembersMassActionCreateDetails.vue';

export interface MassActionAddRemoveTeamMembersForm {
  teamId: string,
}

export default Vue.extend({
  name: 'AddRemoveTeamMembersMassActionCreate',

  components: {
    MassActionBaseCreate,
    AddRemoveTeamMembersMassActionCreateDetails,
  },

  data() {
    return {
      MassActionMode,
      formData: new FormData(),
      loading: false,
      form: {
        teamId: null,
      } as MassActionAddRemoveTeamMembersForm,
    };
  },

  computed: {
    title(): string {
      return this.$route.query.action === 'add'
        ? this.$t('massAction.addRemoveTeamMembers.create.title.add') as string
        : this.$t('massAction.addRemoveTeamMembers.create.title.remove') as string;
    },

    uploadUrl(): string {
      return this.$route.query.action === 'add'
        ? 'case-file/mass-actions/add-team-members'
        : 'case-file/mass-actions/remove-team-members';
    },
  },

  created() {
    if (this.$route.query.teamId) {
      this.form.teamId = this.$route.query.teamId as string;
    }
  },

  methods: {
    back() {
      this.$router.replace({ name: routes.massActions.addRemoveTeamMembers.home.name });
    },

    onSuccess(entity: IMassActionEntity) {
      this.$router.push({ name: routes.massActions.addRemoveTeamMembers.details.name, params: { id: entity.id } });
    },

    /**
     * Triggered when creating a mass action from a file
     */
    async onUploadStart() {
      this.formData.set('teamId', this.form.teamId || '');
      this.loading = true;
      await (this.$refs.base as InstanceType<typeof MassActionBaseCreate>).upload();
      this.loading = false;
    },
  },
});
</script>
