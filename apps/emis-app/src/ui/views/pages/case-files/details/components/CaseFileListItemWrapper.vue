<template>
  <div class="mt-4">
    <div :class="{ item__header: true, 'item__header--pinned': item.pinned }" data-test="caseFileItem__header">
      <div>
        <template v-if="displaySystemAdminOnly">
          <span class="rc-caption12 fw-bold" data-test="caseFileItem__systemAdmin">
            {{ $m(listItem.roleName) }}
          </span>
        </template>

        <template v-else>
          <span class="rc-caption12 fw-bold" data-test="caseFileItem__userName">
            {{ listItem.userName }}
          </span>
          <span v-if="listItem.roleName" class="rc-caption12 fw-bold mr-1" data-test="caseFileItem__roleName">
            ({{ $m(listItem.roleName) }})
          </span>
        </template>
        <span class="rc-caption12" data-test="caseFileItem__created">
          {{ format(new Date(listItem.created), 'PPp') }}
        </span>
      </div>

      <div>
        <v-icon v-if="listItem.isPinned" size="medium" color="primary" class="ml-1" data-test="caseFileItem__pinIcon">
          mdi-pin
        </v-icon>

        <v-menu v-if="showMenu" offset-y data-test="caseFileItem__menu">
          <template #activator="{ on }">
            <v-btn icon x-small class="ml-1" data-test="items__menuButton" v-on="on">
              <v-icon size="medium">
                mdi-dots-vertical
              </v-icon>
            </v-btn>
          </template>

          <v-list>
            <slot name="menu" />
          </v-list>
        </v-menu>
      </div>
    </div>

    <v-card class="item border-radius-bottom" elevation="0">
      <div class="item__sideBar">
        <v-icon color="secondary" data-test="caseFileItem__sideBarIcon">
          {{ sidebarIcon }}
        </v-icon>
      </div>

      <div class="item__content ">
        <slot name="content" />

        <div v-if="listItem.lastModifiedByFullName || listItem.lastModifiedDate" class="item__footer">
          <div class="item__editedBy rc-caption10">
            {{ $t('item.lastEditBy') }}
            <strong class="mr-2" data-test="caseFileItem__lastEditBy">{{ listItem.lastModifiedByFullName }}</strong>
            <span data-test="caseFileItem__lastModifiedDate">{{ format(new Date(listItem.lastModifiedDate), 'PP') }}</span>
          </div>
        </div>
      </div>
    </v-card>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { useUserAccountStore } from '@/pinia/user-account/user-account';
import { ICaseFileActivity } from '@libs/entities-lib/case-file';
import { ICaseNoteCombined } from '@libs/entities-lib/case-note';
import { UserRolesNames } from '@libs/entities-lib/user';
import { system } from '@/constants/system';
import { format } from 'date-fns';

/**
 * Template used for case note and case file activity items
 */
export default Vue.extend({
  name: 'CaseFileListItemWrapper',

  props: {
    item: {
      type: Object as () => ICaseFileActivity | ICaseNoteCombined,
      required: true,
    },
    /**
     * Name of the icon to display
     */
    sidebarIcon: {
      type: String,
      default: 'mdi-message-text',
    },
    showMenu: {
      type: Boolean,
      default: false,
    },
    isCaseNote: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      format,
    };
  },

  computed: {
    listItem() {
      if (this.isCaseNote) {
        const item = this.item as ICaseNoteCombined;
        return {
          userName: item.entity.userCreatedBy.userName,
          roleName: item.entity.userCreatedBy.roleName,
          isPinned: item.entity.isPinned,
          lastModifiedByFullName: item.entity.userUpdatedBy
            ? item.entity.userUpdatedBy.userName
            : item.entity.userCreatedBy.userName,
          lastModifiedDate: item.entity.userUpdatedBy
            ? item.entity.updatedDate
            : item.entity.created,
          created: item.entity.created,
        };
      }

      const cfActivity = (this.item as ICaseFileActivity);
      let userName = cfActivity.user?.name;
      if (cfActivity.user?.id === system.public_user_id) {
        userName = this.$t('system.public_user_id') as string;
      }
      if (cfActivity.user?.id === system.system_user_id) {
        userName = this.$t('system.system_user_id') as string;
      }

      return {
        userName,
        roleName: (this.item as ICaseFileActivity).role?.name,
        created: (this.item as ICaseFileActivity).created,
      };
    },

    displaySystemAdminOnly() : boolean {
      const L6RoleIds = useUserAccountStore().rolesByLevels([UserRolesNames.level6])?.map((r) => r.id);
      const userIsL6 = L6RoleIds && L6RoleIds.includes((this.item as ICaseFileActivity).role?.id);
      return userIsL6 && (this.item as ICaseFileActivity).triggeredByMassAction;
    },
  },

  async created() {
    await useUserAccountStore().fetchRoles();
  },
});
</script>

<style scoped lang="scss">
.item__header {
  background: var(--v-grey-lighten4);
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  border-radius: 4px 4px 0 0;
  padding: 0 8px 0 16px;
}

.item__header--pinned {
  background: var(--v-status_yellow_pale-base);
}

.item {
  display: flex;
  flex-direction: row;
  border: 1px solid var(--v-grey-lighten2);
}

.item__sideBar {
  background-color: var(--v-primary-lighten2);
  width: 54px;
  text-align: center;
  padding-top: 16px;
  border-radius: 0 0 0 4px;
}

.item__content {
  flex: 1;
  padding: 16px 0 16px 24px;
  word-break: break-word;
}

.item__footer {
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  margin-top: 16px;
  margin-bottom: -16px;
}

.item__editedBy {
  background: var(--v-grey-lighten4);
  padding: 0 8px;
  border-radius: 3px 0;
}
</style>
