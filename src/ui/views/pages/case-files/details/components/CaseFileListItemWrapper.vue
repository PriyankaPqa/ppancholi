<template>
  <div class="mt-4">
    <div class="item__header">
      <div>
        <span class="rc-caption12 fw-bold" data-test="caseFileItem__userName">
          {{ item.user.name }}
        </span>

        <span v-if="item.role && $m(item.role.name)" class="rc-caption12 fw-bold mr-1" data-test="caseFileItem__roleName">
          ({{ $m(item.role.name) }})
        </span>

        <span class="rc-caption12" data-test="caseFileItem__created">
          {{ moment.utc(item.created).local().format('lll') }}
        </span>
      </div>

      <div>
        <v-icon v-if="item.isPinned" size="medium" color="primary" class="ml-1" data-test="caseFileItem__pinIcon">
          mdi-pin
        </v-icon>

        <v-menu v-if="showMenu" offest-y data-test="caseFileItem__menu">
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

        <div v-if="item.lastModifiedByFullName || item.lastModifiedDate" class="item__footer">
          <div class="item__editedBy rc-caption10">
            {{ $t('item.lastEditBy') }}
            <strong class="mr-2" data-test="caseFileItem__lastEditBy">{{ item.lastModifiedByFullName }}</strong>
            <span data-test="caseFileItem__lastModifiedDate">{{ moment(item.lastModifiedDate).format('ll') }}</span>
          </div>
        </div>
      </div>
    </v-card>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import moment from '@/ui/plugins/moment';

/**
 * Template used for case note and case file activity items
 */
export default Vue.extend({
  name: 'CaseFileListItemWrapper',

  props: {
    item: {
      type: Object,
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
  },

  data() {
    return {
      moment,
    };
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
