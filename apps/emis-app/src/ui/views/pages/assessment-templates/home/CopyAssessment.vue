<template>
  <rc-dialog
    :title="$t('assessmentTemplate.add_assessment')"
    :cancel-action-label="$t('common.buttons.close')"
    :show.sync="show"
    :show-submit="false"
    content-padding="6"
    content-only-scrolling
    fullscreen
    persistent
    show-close
    :loading="loading"
    @close="close"
    @cancel="close">
    <v-row>
      <v-col cols="12" md="6" class="px-6 mx-auto">
        <div>
          <v-text-field
            v-model="search"
            clearable
            outlined
            prepend-inner-icon="mdi-magnify"
            data-test="search-input"
            :placeholder="$t('assessmentTemplate.search_assessment')" />
        </div>
        <div>
          <v-data-table-a11y
            data-test="table"
            must-sort
            hide-default-footer
            class="bordered"
            :headers="headers"
            :items="items"
            :items-per-page="Math.max(items.length, 1)">
            <template #[`item.name`]="{ item }">
              {{ $m(item.name) }}
            </template>
            <template #[`item.copy`]="{ item }">
              <v-btn
                class="mr-4"
                color="primary"
                small
                :data-test="`copy_${item.id}`"
                @click="copy(item)">
                {{ $t('common.copy') }}
              </v-btn>
            </template>
          </v-data-table-a11y>
        </div>
      </v-col>
    </v-row>
  </rc-dialog>
</template>

<script lang="ts">
import Vue from 'vue';
import { RcDialog, VDataTableA11y } from '@libs/component-lib/components';
import { DataTableHeader } from 'vuetify';
import _debounce from 'lodash/debounce';
import { Status } from '@libs/entities-lib/base';
import { IAssessmentBaseEntity, IAssessmentTemplateEntity, IdParams } from '@libs/entities-lib/assessment-template';
import helpers from '@/ui/helpers/helpers';
import { CombinedStoreFactory } from '@libs/stores-lib/base/combinedStoreFactory';
import { useAssessmentTemplateStore } from '@/pinia/assessment-template/assessment-template';

const DEBOUNCE_RATE = 500;
const debouncedSearch = _debounce((context) => {
  context.doSearch();
}, DEBOUNCE_RATE);

export default Vue.extend({
  name: 'CopyAssessment',

  components: {
    RcDialog,
    VDataTableA11y,
  },

  props: {
    show: {
      type: Boolean,
      required: true,
    },
  },

  data() {
    return {
      search: '',
      searchResultIds: [] as Array<string>,
      loading: false,
      combinedTemplateStore: new CombinedStoreFactory <IAssessmentTemplateEntity, null, IdParams>(useAssessmentTemplateStore()),
    };
  },

  computed: {
    headers(): Array<DataTableHeader> {
      return [
        {
          text: this.$t('assessmentTemplate.assessmentTemplateName') as string,
          value: 'name',
          sortable: false,
          width: '100%',
        },
        {
          text: this.$t('common.copy') as string,
          class: 'rc-transparent-text',
          value: 'copy',
          sortable: false,
        },
      ];
    },

    items() : Array<IAssessmentBaseEntity> {
      return useAssessmentTemplateStore().getByIds(this.searchResultIds, true);
    },
  },

  watch: {
    search() {
      debouncedSearch(this);
    },
  },

  created() {
    this.doSearch();
  },

  methods: {
    close() {
      this.$emit('update:show', false);
    },

    async doSearch() {
      const assessments = await this.combinedTemplateStore.search({
        search: helpers.toQuickSearch(this.search),
        filter: { 'Entity/Status': Status.Active },
        top: 50,
        queryType: 'full',
        orderBy: `Entity/Name/Translation/${this.$i18n.locale}`,
      });
      this.searchResultIds = assessments.ids;
    },

    copy(item: IAssessmentBaseEntity) {
      this.$emit('selected', item);
      this.close();
    },
  },
});
</script>
