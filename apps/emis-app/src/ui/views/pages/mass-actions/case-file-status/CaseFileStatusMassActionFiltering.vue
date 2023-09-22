  <!-- DONE in a later story, no need to review -->

<template>
  <rc-dialog
    :title="$t('massAction.caseFileStatus.table.add.list')"
    :show.sync="show"
    :cancel-action-label="$t('common.buttons.cancel')"
    :submit-action-label="$t('common.buttons.next')"
    :submit-button-disabled="!filtersOn || tableData.length === 0"
    :loading="fetchAllCaseFileLoading"
    :persistent="true"
    fullscreen
    content-padding="0"
    @cancel="onCancel()"
    @close="onClose()"
    @submit="onSubmit()" />
</template>

<script lang="ts">
import mixins from 'vue-typed-mixins';
import { RcDialog } from '@libs/component-lib/components';
import routes from '@/constants/routes';
import massActionCaseFileFiltering from '@/ui/views/pages/mass-actions/mixins/massActionCaseFileFiltering';
import { MassActionMode } from '@libs/entities-lib/mass-action';

export default mixins(massActionCaseFileFiltering).extend({

  name: 'CaseFileStatusMassActionFiltering',

  components: {
    RcDialog,
  },

  methods: {
    async onSubmit() {
      this.$router.push({
        name: routes.massActions.caseFileStatus.create.name,
        query: { azureSearchParams: JSON.stringify(this.azureSearchParams), mode: MassActionMode.List, total: this.itemsCount.toString() },
      });

      this.$emit('update:show', false);
    },
  },

});
</script>
