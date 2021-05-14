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
    </div>

    <v-card class="item border-radius-bottom" elevation="0">
      <div class="item__sideBar">
        <v-icon color="secondary" data-test="caseFileItem__sideBarIcon">
          {{ sidebarIcon }}
        </v-icon>
      </div>

      <div class="item__content ">
        <slot name="content" />
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

</style>
