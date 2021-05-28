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
      <div class="caseNote__filter">
        <v-toolbar elevation="1" color="grey lighten-5" />
      </div>

      <case-note-form v-if="isBeingCreated" :action-title="$t('caseNote.create.rowTitle')" @close-case-note-form="isBeingCreated = false" />

      <case-file-list-wrapper :loading="loading" :empty="caseNotes.length === 0">
        <case-notes-list-item v-for="item in caseNotes" :key="item.id" :item="item" @saved="onSaved($event)" />
      </case-file-list-wrapper>
    </template>

    <template v-if="!loading" #actions>
      <v-data-footer v-if="false" :options.sync="options" :pagination.sync="pagination" :items-per-page-options="[5, 10, 15, 20]" />
    </template>
  </rc-page-content>
</template>

<script lang="ts">
import Vue from 'vue';
import { RcPageContent, RcPageLoading } from '@crctech/component-library';
import { EFilterKey } from '@/entities/user';
import { ICaseNote } from '@/entities/case-file/case-note';
import CaseNoteForm from './components/CaseNoteForm.vue';
import CaseNotesListItem from './components/CaseNotesListItem.vue';
import CaseFileListWrapper from '../components/CaseFileListWrapper.vue';

export default Vue.extend({
  name: 'CaseNote',
  components: {
    RcPageContent,
    RcPageLoading,
    CaseNoteForm,
    CaseFileListWrapper,
    CaseNotesListItem,
  },

  data() {
    return {
      caseNotes: [] as ICaseNote[],
      loading: false,
      isBeingCreated: false,
      EFilterKey,
      totalCount: 0,
      options: {
        page: 1,
        itemsPerPage: 10,
      },
    };
  },
  computed: {
    title(): string {
      return `${this.$t('caseNote.caseNotes')} (${this.totalCount})`;
    },
    filterOptions(): Array<Record<string, unknown>> {
      return [];
    },
    pagination(): Record<string, number> {
      return { };
    },
  },

  async created() {
    try {
      this.loading = true;

      await this.$storage.caseFile.actions.fetchActiveCaseNoteCategories();

      const res = await this.$storage.caseFile.actions.searchCaseNotes({
        filter: {
          CaseFileId: this.$route.params.id,
        },
        count: true,
      });

      this.caseNotes = res.value;
      this.totalCount = res.odataCount;
    } finally {
      this.loading = false;
    }
  },

  methods: {
    onSaved() {
      // TODO
    },
  },
});
</script>

<style scoped lang="scss">
.caseNote__filter {
  margin: -24px;
  margin-bottom: 16px;
}
</style>
