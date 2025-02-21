<template>
  <rc-page-content :title="$t('approvalTables.tableDetails')" :loading="loading">
    <v-container>
      <v-row no-gutters justify="center" class="mt-12">
        <v-col xl="10" lg="10" md="11" sm="12" xs="12">
          <v-row no-gutters>
            <v-col cols="8">
              <div v-if="program" class="rc-body14 mb-2" data-test="approvalDetail_programName">
                {{ $t('approvalsTable.programName') }}: {{ $m(program.name) }}
              </div>
              <div class="rc-heading-5 mb-2" data-test="approvalDetail_approval_name">
                {{ $m(approval.name) }}
              </div>
            </v-col>
            <v-col cols="4" align-self="end">
              <v-row no-gutters align="center" justify="end">
                <status-chip status-name="Status" data-test="approvalDetail_approval_status" :status="approval.approvalBaseStatus" />
                <v-btn icon class="ml-2" data-test="approval_edit_button" :aria-label="$t('common.edit')" @click="goToEdit()">
                  <v-icon>
                    mdi-pencil
                  </v-icon>
                </v-btn>
              </v-row>
            </v-col>
          </v-row>

          <v-row no-gutters class="grey-container pa-4 mt-4 rc-body14">
            <span class="fw-bold mr-4">
              {{ $t('approvals.aggregated_by') }}
            </span>
            <span data-test="approvalDetail_approval_aggregatedBy">>
              <v-icon color="primary">
                mdi-check-circle-outline
              </v-icon>
              {{ getAggregatedByText }}
            </span>
          </v-row>

          <v-row no-gutters class="table_top_header mt-8 pa-2">
            <v-col offset-sm="6" offset-md="8" offset-xl="8" xl="4" md="4" sm="6">
              <v-text-field
                v-model="search"
                data-test="search"
                :placeholder="$t('common.search')"
                clearable
                prepend-inner-icon="mdi-magnify"
                background-color="grey lighten-4"
                outlined
                hide-details
                dense
                @click:clear="search = ''" />
            </v-col>
          </v-row>
          <v-data-table-a11y
            class="approval_group_table"
            data-test="approvalDetail_groupTable"
            :headers="headers"
            :items="filteredGroups"
            hide-default-footer />
        </v-col>
      </v-row>
    </v-container>

    <template #actions>
      <v-btn color="primary" data-test="back-btn" @click="back()">
        {{ $t('approvalTables.details.back') }}
      </v-btn>
    </template>
  </rc-page-content>
</template>

<script lang="ts">
import { TranslateResult } from 'vue-i18n';
import { RcPageContent, VDataTableA11y } from '@libs/component-lib/components';
import StatusChip from '@/ui/shared-components/StatusChip.vue';
import routes from '@/constants/routes';
import { IApprovalTableEntity } from '@libs/entities-lib/approvals/approvals-table';
import { IApprovalGroup } from '@libs/entities-lib/approvals/approvals-group';
import helpers from '@/ui/helpers/helpers';
import sharedHelpers from '@libs/shared-lib/helpers/helpers';
import { ApprovalAggregatedBy } from '@libs/entities-lib/approvals/approvals-base';
import mixins from 'vue-typed-mixins';
import approvalRoles from '@/ui/views/pages/approvals/mixins/approvalRoles';
import { useApprovalTableStore } from '@/pinia/approval-table/approval-table';
import { useUserAccountStore } from '@/pinia/user-account/user-account';
import { useProgramStore } from '@/pinia/program/program';
import { IProgramEntity } from '@libs/entities-lib/program';

export interface IFilteredGroups {
  groupIndex: string;
  roles: string;
  minimum: string;
  maximum: string;
}

export default mixins(approvalRoles).extend({
  name: 'ApprovalsDetails',

  components: {
    RcPageContent,
    StatusChip,
    VDataTableA11y,
  },

  data() {
    return {
      search: '',
      approval: {} as IApprovalTableEntity, // TODO replace IApprovalBaseEntity by IApprovalTemplate when working on this story
      roles: [],
      program: {} as IProgramEntity,
      loading: false,
    };
  },

  computed: {
    title(): TranslateResult {
      return this.$t('approvalsTable.tableDetails');
    },

    approvalId(): string {
      return this.$route.params.approvalId;
    },

    aggregatedBy() {
      return helpers.enumToTranslatedCollection(ApprovalAggregatedBy, 'enums.ApprovalAggregatedBy');
    },

    usedRolesIds(): Set<string> {
      const roleIds = this.approval.groups.reduce((acc, group) => acc.concat(group.roles), []);
      return new Set(roleIds);
    },

    filteredGroups(): IFilteredGroups[] {
      if (this.approval.groups) {
        const dataTable = this.approval.groups.map((g: IApprovalGroup, index: number) => ({
          groupIndex: this.$t('approvals.nestedTable.group', { x: index + 1 }),
          roles: this.buildRoleString(g),
          minimum: this.$formatCurrency(g.minimumAmount),
          maximum: this.$formatCurrency(g.maximumAmount),
        }));
        return sharedHelpers.filterCollectionByValue(dataTable, this.search, false, ['groupIndex', 'roles'], true);
      }
      return [];
    },

    getAggregatedByText(): string {
      return this.aggregatedBy.find((a) => a.value === this.approval.aggregatedByType)?.text;
    },

    headers(): Record<string, unknown> [] {
      return [
        {
          text: this.$t('approvals.nestedTable.headers.group'),
          value: 'groupIndex',
          sortable: false,
        },
        {
          text: this.$t('approvals.nestedTable.headers.roles'),
          value: 'roles',
          sortable: false,
        },
        {
          text: this.$t('approvals.nestedTable.headers.minimum'),
          value: 'minimum',
          sortable: false,
        },
        {
          text: this.$t('approvals.nestedTable.headers.maximum'),
          value: 'maximum',
          sortable: false,
        },
      ];
    },
  },

  async mounted() {
    this.loadData();
  },

  methods: {
    goToEdit() {
      this.$router.push({
        name: routes.events.approvals.edit.name,
        params: {
          approvalId: this.approvalId,
        },
      });
    },

    back(): void {
      this.$router.replace({ name: routes.events.approvals.home.name });
    },

    async loadData() {
      this.loading = true;
      const approval = await useApprovalTableStore().fetch(this.approvalId);

      if (approval) {
        this.approval = approval as IApprovalTableEntity;
        this.localApproval = this.approval; // For mixin approvalRoles

        this.program = useProgramStore().getById(this.approval.programId);
        if (!this.program?.id) {
          this.program = await useProgramStore().fetch({ id: this.approval.programId, eventId: this.approval.eventId });
        }
      }

      this.roles = await useUserAccountStore().fetchRoles();
      this.loading = false;
    },

  },
});
</script>

<style scoped lang="scss">

.table_top_header {
  border: solid 1px var(--v-grey-lighten2);
  border-radius: 4px 4px 0px 0px;
  border-bottom: none;
}

.approval_group_table {
  border: solid 1px var(--v-grey-lighten2);
  border-radius: 0px 0px 4px 4px;
}
</style>
