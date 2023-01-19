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
      <v-col cols="12" md="8" class="px-6 mx-auto">
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
          <v-data-table
            data-test="table"
            must-sort
            hide-default-footer
            class="bordered"
            :headers="headers"
            :items="items"
            :items-per-page="Math.max(items.length, 1)">
            <template #[`item.name`]="{ item }">
              {{ $m(item.entity.name) }}
            </template>
            <template #[`item.program`]="{ item }">
              {{ item.metadata ? $m(item.metadata.programName) : '' }}
            </template>
            <template #[`item.select`]="{ item }">
              <v-btn
                class="mr-4"
                color="primary"
                small
                :data-test="`select_${item.id}`"
                @click="select(item)">
                {{ $t('common.add') }}
              </v-btn>
            </template>
          </v-data-table>
        </div>
      </v-col>
    </v-row>
  </rc-dialog>
</template>

<script lang="ts">
import Vue from 'vue';
import { RcDialog } from '@libs/component-lib/components';
import { DataTableHeader } from 'vuetify';
import _debounce from 'lodash/debounce';
import { Status } from '@libs/entities-lib/base';
import {
  IAssessmentFormCombined, IAssessmentResponseCreateRequest, AssociationType, IAssessmentFormEntity, IAssessmentFormMetadata,
} from '@libs/entities-lib/assessment-template';
import helpers from '@/ui/helpers/helpers';
import { useAssessmentFormStore, useAssessmentFormMetadataStore } from '@/pinia/assessment-form/assessment-form';
import { useAssessmentResponseStore } from '@/pinia/assessment-response/assessment-response';
import { CombinedStoreFactory } from '@libs/stores-lib/base/combinedStoreFactory';

const DEBOUNCE_RATE = 500;
const debouncedSearch = _debounce((context) => {
  context.doSearch();
}, DEBOUNCE_RATE);

export default Vue.extend({
  name: 'AddCaseFileAssessment',

  components: {
    RcDialog,
  },

  props: {
    show: {
      type: Boolean,
      required: true,
    },
    caseFileId: {
      type: String,
      required: true,
    },
    eventId: {
      type: String,
      required: true,
    },
    excludedIds: {
      type: Array as () => string[],
      default: null,
    },
  },

  data() {
    return {
      search: '',
      searchResultIds: [] as Array<string>,
      loading: false,
      combinedFormStore: new CombinedStoreFactory<IAssessmentFormEntity, IAssessmentFormMetadata>(useAssessmentFormStore(), useAssessmentFormMetadataStore()),
    };
  },

  computed: {
    headers(): Array<DataTableHeader> {
      return [
        {
          text: this.$t('assessmentTemplate.name') as string,
          value: 'name',
          sortable: false,
          width: '50%',
        },
        {
          text: this.$t('assessmentTemplate.program') as string,
          value: 'program',
          sortable: false,
          width: '50%',
        },
        {
          text: '',
          value: 'select',
          sortable: false,
        },
      ];
    },

    items() : Array<IAssessmentFormCombined> {
      return this.combinedFormStore.getByIds(this.searchResultIds, { onlyActive: true });
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
      const assessments = await this.combinedFormStore.search({
        search: helpers.toQuickSearch(this.search),
        filter: { 'Entity/EventId': this.eventId, 'Entity/Status': Status.Active, 'Entity/Id': { notSearchIn_az: this.excludedIds || [] } },
        top: 50,
        queryType: 'full',
        orderBy: `Entity/Name/Translation/${this.$i18n.locale}`,
      });
      this.searchResultIds = assessments.ids;
    },

    async select(item: IAssessmentFormCombined) {
      const response: IAssessmentResponseCreateRequest = {
        assessmentFormId: item.entity.id, association: { id: this.caseFileId, type: AssociationType.CaseFile },
      };

      const result = await useAssessmentResponseStore().create(response);

      if (result) {
        this.$toasted.global.success(this.$t('assessment.create.success'));
        this.close();
      }
    },
  },
});
</script>
