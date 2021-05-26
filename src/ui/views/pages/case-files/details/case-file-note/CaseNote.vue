<template>
  <rc-page-content
    :title="title"
    outer-scroll
    show-search
    show-add-button
    add-button-data-test="caseNote__createBtn"
    show-help
    content-padding="6"
    actions-padding="2"
    :help-link="$t('caseNote.help_link')"
    @search="searchString = $event"
    @add-button="isBeingCreated = true">
    <rc-page-loading v-if="loading" />
    <template v-else>
      <filter-toolbar class="caseNote__filter" :filter-options="filterOptions" :count="filterCount" :filter-key="EFilterKey.CaseNotes">
        <template #toolbarActions>
          <div class="flex-row">
            <span class="rc-body14 mr-4 noselect pointer" data-test="caseNote__sortBtn">
              {{ $t('caseNote.sortByDate') }}
              <!-- TODO: implement the sort icon dyamically -->
              <v-icon>{{ true ? 'mdi-menu-down' : ' mdi-menu-up' }}</v-icon>
            </span>
          </div>
        </template>
      </filter-toolbar>
      <case-note-form v-if="isBeingCreated" :action-title="$t('caseNote.create.rowTitle')" @close-case-note-form="isBeingCreated = false" />
    </template>
  </rc-page-content>
</template>

<script lang="ts">
import Vue from 'vue';
import { RcPageContent, RcPageLoading } from '@crctech/component-library';
import { EFilterKey } from '@/entities/user';
import FilterToolbar from '@/ui/shared-components/FilterToolbar.vue';
import CaseNoteForm from './components/CaseNoteForm.vue';

export default Vue.extend({
  name: 'CaseNote',
  components: {
    RcPageContent,
    RcPageLoading,
    FilterToolbar,
    CaseNoteForm,
  },

  data() {
    return {
      loading: false,
      isBeingCreated: false,
      EFilterKey,
      filterCount: 0,
    };
  },
  computed: {
    title(): string {
      return `${this.$t('caseNote.caseNotes')}`;
    },
    filterOptions(): Array<Record<string, unknown>> {
      return [];
    },
  },

  async created() {
    try {
      this.loading = true;
      await this.$storage.caseFile.actions.fetchActiveCaseNoteCategories();
    } finally {
      this.loading = false;
    }
  },
});
</script>

<style scoped lang="scss">
.caseNote__filter {
  margin: -24px;
  margin-bottom: 16px;
}
</style>
