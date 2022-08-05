<template>
  <mass-action-base-create
    ref="base"
    :title="$t('massActions.fundingRequest.create.title')"
    :mode="MassActionMode.NoAttachment"
    :loading="loading"
    @back="back()"
    @post="onPost($event)" />
</template>

<script lang="ts">
import Vue from 'vue';

import routes from '@/constants/routes';
import MassActionBaseCreate from '@/ui/views/pages/mass-actions/components/MassActionBaseCreate.vue';
import { MassActionMode, MassActionType } from '@libs/entities-lib/mass-action';

export default Vue.extend({
  name: 'FundingRequestCreate',

  components: {
    MassActionBaseCreate,
  },

  data() {
    return {
      showConfirmation: false,
      MassActionMode,
      loading: false,
    };
  },

  methods: {
    back() {
      this.$router.replace({ name: routes.massActions.fundingRequest.home.name });
    },

    goToDetail(id: string) {
      this.$router.push({ name: routes.massActions.fundingRequest.details.name, params: { id } });
    },

    async onPost({ name, description }: {name: string; description: string}) {
      this.loading = true;
      const entity = await this.$storage.massAction.actions.create(MassActionType.GenerateFundingRequest, { name, description });
      this.loading = false;
      if (entity) {
        this.goToDetail(entity.id);
      }
    },

  },
});
</script>
