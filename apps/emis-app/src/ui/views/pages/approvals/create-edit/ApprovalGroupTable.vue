<template>
  <validation-observer ref="form" v-slot="{failed }" slim>
    <v-container fluid :data-test="dataTest" class="approvals_group_table">
      <v-row class="rcnestedtable__header" align="center">
        <v-col
          v-for="(header, $headerIndex) in headers"
          :key="$headerIndex"
          :class="{
            right: header.align === 'right',
            left: header.align === 'left',
            center: header.align === 'center',
            rcNestedTable__col: true,
            'pl-6': $headerIndex === 0,
            'pr-3': $headerIndex === headers.length - 1,
          }"
          :cols="header.cols">
          <span class="rc-body14 fw-bold break-word" :data-test="`${dataTest}__header--${$headerIndex}`">
            {{ header.text }}
          </span>
        </v-col>
      </v-row>

      <template v-for="(group, $index) in approval.groups">
        <v-row
          :key="`item__${$index}`"
          :class="{rcnestedtable__row: true, rcnestedtable__parentRow: true, large: isRowOpened(group)}"
          align="center">
          <v-col :key="`item__${$index}__group`" class="pl-6" :cols="2">
            {{ $t('approvals.nestedTable.group', {x: $index + 1 }) }}
          </v-col>

          <v-col :key="`item__${$index}__roles`" class="pr-3" :cols="4">
            <v-select-with-validation
              v-if="group.addMode || group.editMode"
              :value="group.roles"
              dense
              small
              outlined
              :label="`${$t('approvals.nestedTable.headers.roles')}*`"
              multiple
              :rules="{required: true}"
              :attach="false"
              data-test="user_roleId"
              :item-value="(group) => group.id"
              :item-text="(group) => $m(group.name)"
              :items="availableRoles"
              @delete="group.setRoles($event)"
              @change="group.setRoles($event)" />
            <div v-else>
              {{ buildRoleString(group) }}
            </div>
          </v-col>

          <v-col :key="`item__${$index}__minimum`" class="pr-3" :cols="2">
            <rc-item-amount
              v-if="group.addMode || group.editMode"
              :value="group.minimumAmount"
              :disabled="$index > 0"
              :rules="{required: true, min_value: 0.01, max_value: 9999999.99, customValidator: getMinAmountRules(group.minimumAmount, $index)}"
              :label="`${$t('approvals.nestedTable.headers.minimum')}*`"
              :data-test="`approvals_item${$index}__minimum`"
              @input="group.setMinimum($event)" />
            <div v-else>
              {{ $formatCurrency(group.minimumAmount) }}
            </div>
          </v-col>

          <v-col :key="`item__${$index}__maximum`" class="pr-3" :cols="2">
            <rc-item-amount
              v-if="group.addMode || group.editMode"
              :value="group.maximumAmount"
              :disabled="$index < approval.groups.length - 1"
              :rules="{required: true, max_value: 9999999.99, customValidator: getMaxAmountRules(group.maximumAmount, $index)}"
              :label="`${$t('approvals.nestedTable.headers.maximum')}*`"
              :data-test="`approvals_item${$index}__maximum`"
              @input="group.setMaximum($event)" />
            <div v-else>
              {{ $formatCurrency(group.maximumAmount) }}
            </div>
          </v-col>

          <v-col :cols="2">
            <div style="float: right;">
              <template v-if="group.editMode">
                <v-btn color="primary" :disabled="failed || groupSameAsBackup(group)" :loading="editGroupLoading" small @click="applyEdit($index)">
                  {{ $t('common.apply') }}
                </v-btn>

                <v-btn class="ml-3" icon data-test="cancel" @click="cancelEdit($index)">
                  <v-icon size="20">
                    mdi-close
                  </v-icon>
                </v-btn>
              </template>

              <template v-if="group.addMode">
                <v-btn color="primary" :disabled="failed" :loading="addGroupLoading" small @click="addGroup(group)">
                  {{ $t('common.add') }}
                </v-btn>

                <v-btn class="ml-3" icon data-test="cancel" @click="deleteGroup($index)">
                  <v-icon size="20">
                    mdi-delete
                  </v-icon>
                </v-btn>
              </template>

              <template v-if="!group.addMode && !group.editMode">
                <v-btn icon data-test="cancel" :disabled="disableAction($index)" @click="editGroup(group, $index)">
                  <v-icon size="20">
                    mdi-pencil
                  </v-icon>
                </v-btn>
                <v-btn
                  icon
                  data-test="cancel"
                  :loading="deleteGroupLoadingIndex === $index"
                  :disabled="disableAction($index) || editMode && hasOnlyOneGroup"
                  @click="deleteGroupWithConfirmation($index)">
                  <v-icon size="20">
                    mdi-delete
                  </v-icon>
                </v-btn>
              </template>
            </div>
          </v-col>
        </v-row>
      </template>

      <v-row :class="{rcnestedtable__row: true, rcnestedtable__parentRow: false }">
        <v-col>
          <v-btn color="primary" small :disabled="disableAddGroup" @click="addNewGroupRow()">
            <v-icon left>
              mdi-plus
            </v-icon>
            {{ $t('approvals.nestedTable.add_group.button') }}
          </v-btn>
        </v-col>
      </v-row>
    </v-container>
  </validation-observer>
</template>

<script lang="ts">
import { INestedTableHeader } from '@libs/component-lib/types/INestedTableHeader';
import { IApprovalBaseEntity } from '@libs/entities-lib/approvals/approvals-base';
import { IApprovalGroup } from '@libs/entities-lib/approvals/approvals-group';
import {
  VSelectWithValidation,
} from '@libs/component-lib/components';
import RcItemAmount from '@libs/component-lib/components/atoms/RcItemAmount.vue';
import { VForm } from '@libs/shared-lib/types';
import mixins from 'vue-typed-mixins';
import approvalRoles from '@/ui/views/pages/approvals/mixins/approvalRoles';
import isEqual from 'lodash/isEqual';

export default mixins(approvalRoles).extend({
  name: 'ApprovalGroupTable',

  components: {
    VSelectWithValidation,
    RcItemAmount,
  },

  props: {
    approval: {
      type: Object as () => IApprovalBaseEntity,
      required: true,
    },
    editMode: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      dataTest: 'approvals_group_table',
      lines: [] as Array<IApprovalGroup>,
      roles: [],
      addGroupLoading: false,
      deleteGroupLoadingIndex: -1,
      editGroupLoading: false,
      editBackup: null as IApprovalGroup,
      groupIndexBeingEdited: -1,
    };
  },

  watch: {
    groupBeingEdited(groupHasChanged) {
      this.$emit('group:changed', groupHasChanged);
    },
  },

  computed: {
    headers(): Array<INestedTableHeader> {
      return [
        {
          text: this.$t('approvals.nestedTable.headers.group') as string,
          cols: 2,
          align: 'left',
        },
        {
          text: this.$t('approvals.nestedTable.headers.roles') as string,
          cols: 4,
          align: 'left',
        },
        {
          text: this.$t('approvals.nestedTable.headers.minimum') as string,
          cols: 2,
          align: 'left',
        },
        {
          text: this.$t('approvals.nestedTable.headers.maximum') as string,
          cols: 2,
          align: 'left',
        },
        {
          text: '',
          cols: 2,
          align: 'right',
        },
      ];
    },

    disableAddGroup(): boolean {
      return this.approval.groups.some((i) => i.editMode || i.addMode);
    },

    hasOnlyOneGroup(): boolean {
      const groups = this.approval.groups.filter((g) => !g.addMode && !g.editMode);
      return groups.length === 1;
    },

    groupBeingEdited(): boolean { // If a group is being editing with a change in it
      if (this.editBackup === null) {
        return false;
      }
      return this.approval.groups.map((group) => group.editMode && !this.groupSameAsBackup(group)).includes(true);
    },
  },

  async created() {
    this.roles = await this.$storage.userAccount.actions.fetchRoles();
    this.localApproval = this.approval; // For mixin approvalRoles
  },

  methods: {
    async addNewGroupRow() {
      this.approval.addGroup();
    },

    deleteGroup(index: number) {
      this.approval.deleteGroup(index);
    },

    async deleteGroupWithConfirmation(index:number) {
      const doDelete = await this.$confirm({
        title: this.$t('common.deletion.title'),
        messages: this.$t('approvals.delete.group.message'),
      });

      if (doDelete) {
        if (this.editMode) {
          this.deleteGroupLoadingIndex = index;
          const res = await this.$storage.approvalTable.actions.removeGroup(this.approval.id, this.approval.groups[index].id);
          this.deleteGroupLoadingIndex = -1;
          if (res) {
            this.$toasted.global.success(this.$t('approval_table.group.remove.success'));
            this.$emit('edit:success', res);
          }
        } else {
          await this.deleteGroup(index);
        }
      }
    },

    editGroup(group: IApprovalGroup, index: number) {
      group.setEditMode(true);
      this.editBackup = { ...group };
      this.groupIndexBeingEdited = index;
    },

    cancelEdit(index: number) {
      const group = this.approval.setGroup(this.editBackup, index);
      group.setEditMode(false);
      this.groupIndexBeingEdited = -1;
    },

    async applyEdit(index: number) {
      if (this.editMode) {
        this.editGroupLoading = true;
        const res = await this.$storage.approvalTable.actions.editGroup(this.approval.id, this.approval.groups[index]);
        this.editGroupLoading = false;
        if (res) {
          this.$toasted.global.success(this.$t('approval_table.group.edit.success'));
          this.$emit('edit:success', res);
          this.groupIndexBeingEdited = -1;
        }
      } else {
        this.approval.groups[index].setEditMode(false);
        this.groupIndexBeingEdited = -1;
      }
    },

    async addGroup(group: IApprovalGroup) {
      const isValid = await (this.$refs.form as VForm).validate();
      if (isValid) {
        if (this.editMode) {
          this.addGroupLoading = true;
          const res = await this.$storage.approvalTable.actions.addGroup(this.approval.id, group);
          this.addGroupLoading = false;
          if (res) {
            this.$toasted.global.success(this.$t('approval_table.group.add.success'));
            this.$emit('edit:success', res);
          }
        } else {
          group.setAddMode(false);
        }
      }
    },

    getMinAmountRules(value: string, index: number): Record<string, unknown> {
      let isValid = true;
      let messageKey = '';
      const currentGroup = this.approval.groups[index];
      const previousGroup = this.approval.groups[index - 1];

      if (Number(value) >= currentGroup.maximumAmount && currentGroup.maximumAmount !== 0) {
        isValid = false;
        messageKey = 'approvals.rules.cannot_equal_max';
        return { isValid, messageKey };
      }

      if (previousGroup) {
        if (Number(value) <= previousGroup.maximumAmount) {
          isValid = false;
          messageKey = 'approvals.rules.greater_than_previous';
          return { isValid, messageKey };
        }

        const difference = (Number(value) - previousGroup.maximumAmount).toFixed(2);
        if (previousGroup && Number(difference) > 0.01) {
          isValid = false;
          messageKey = 'approvals.rules.minimum_next_cent';
          return { isValid, messageKey };
        }
      }

      return { isValid: true };
    },

    getMaxAmountRules(value: string, index: number): Record<string, unknown> {
      let isValid = true;
      let messageKey = '';
      let injection = null;
      const nextGroup = this.approval.groups[index + 1];
      const currentGroup = this.approval.groups[index];

      if (Number(value) <= currentGroup.minimumAmount) {
        isValid = false;
        messageKey = 'validations.minValueStrict';
        injection = { value: currentGroup.minimumAmount };
        return { isValid, messageKey, injection };
      }

      if (nextGroup) {
        if (Number(value) >= nextGroup.minimumAmount) {
          isValid = false;
          messageKey = 'approvals.rules.cannot_greater_than_next';
          return { isValid, messageKey };
        }

        const difference = (Number(value) - nextGroup.maximumAmount).toFixed(2);
        if (Number(difference) < 0.01) {
          isValid = false;
          messageKey = 'approvals.rules.maximum_next_cent';
          return { isValid, messageKey };
        }
      }
      return {
        isValid: true,
      };
    },

    isRowOpened(group: IApprovalGroup) {
      return group.addMode || group.editMode;
    },

    disableAction(index: number) {
      return (this.groupIndexBeingEdited !== -1 && this.groupIndexBeingEdited !== index);
    },

    groupSameAsBackup(group: IApprovalGroup) {
      return isEqual(group.roles, this.editBackup.roles)
        && this.editBackup.minimumAmount === group.minimumAmount
        && this.editBackup.maximumAmount === group.maximumAmount;
    },
  },
});
</script>

<style scoped lang="scss">
.rcnestedtable__header {
  min-height: 56px;
  border-top: 1px solid var(--v-grey-lighten2);
  border-bottom: 1px solid var(--v-grey-lighten2);
  box-shadow: 0px 2px 3px 0px rgba(0, 0, 0, 0.12);
}

.rcnestedtable__parentRow {
  &.active {
    background-color: var(--v-primary-lighten2);

    .rcnestedtable__row {
      background-color: white;
    }
  }
}

.rcnestedtable__row {
  min-height: 48px;
  border-bottom: 1px solid var(--v-grey-lighten2);

  &.active {
    background-color: var(--v-primary-lighten2);
  }

  &:first-child {
    border-top: 1px solid var(--v-grey-lighten2);
  }
}

.right {
  text-align: right;
}

.left {
  text-align: left;
}

.center {
  text-align: center;
}
.rcNestedTable__col {
  padding-left: 6px;
  padding-right: 6px;
}

.rcnestedtable__parentRow {
  &.large {
    min-height: 90px; // If we want to see error details
    & .col {
      min-height: 90px;
    }
  }
}
</style>
