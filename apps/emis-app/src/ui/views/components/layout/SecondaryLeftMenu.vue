<template>
  <div class="secondary-left-menu" v-bind="$attrs">
    <div class="top-container">
      <rc-tooltip v-if="!hideBackButton" right>
        <template #activator="{ on }">
          <v-btn
            class="mb-4"
            elevation="2"
            color="white"
            fab
            small
            data-test="back-button"
            v-on="on"
            @click="$emit('backButtonClicked')">
            <v-icon>mdi-arrow-left</v-icon>
          </v-btn>
        </template>
        {{ $t('common.buttons.back') }}
      </rc-tooltip>
      <div class="rc-body12 fw-bold" data-test="subtitle-title-left-menu">
        {{ subtitle }}
      </div>
      <div class="rc-heading-5 mb-4 text-break" data-test="title-left-menu">
        {{ title }}
      </div>
      <slot name="default" />
    </div>
    <template v-if="tabsToShow">
      <slot name="navigation" />
      <v-navigation-drawer
        v-if="!$slots['navigation']"
        data-test="navigationWithoutValidation"
        floating
        color="grey lighten-5"
        width="100%"
        style="height: auto;"
        :value="true"
        permanent>
        <v-divider v-if="!hideDividers" />
        <v-list class="full-width">
          <template v-if="groupMode">
            <template v-for="(group, groupIndex) in tabs">
              <div :key="groupIndex" class="rc-body12 grey--text ml-5 my-1">
                {{ group.name }}
              </div>
              <v-list-item
                v-for="(tab, index) in group.items"
                :key="`${group.name}_${index}`"
                :class="{
                  'secondaryLeftMenuTab': true,
                  'secondaryLeftMenuTab__active--manual': tab.active,
                  'v-list-item--active': tab.active,
                }"
                dense
                :data-test="tab.test"
                :disabled="tab.disabled"
                link
                :exact="typeof tab.exact === 'undefined' ? true : tab.exact"
                :to="tab.to ? { name: tab.to } : null"
                replace
                active-class="secondaryLeftMenuTab__active"
                @click="$emit('click:tab', tab.onClick)">
                <v-list-item-icon v-if="tab.icon" class="mr-2">
                  <v-icon data-test="item-icon" color="primary darken-1">
                    {{ tab.icon }}
                  </v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title :data-test="`item-text-${index}`">
                    {{ tab.text }}
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </template>
          </template>
          <v-list-item
            v-for="(tab, index) in tabs"
            v-else
            :key="index"
            :class="{
              'secondaryLeftMenuTab': true,
              'secondaryLeftMenuTab__active--manual': tab.active,
              'v-list-item--active': tab.active,
            }"
            dense
            :data-test="tab.test"
            :disabled="tab.disabled"
            link
            :exact="typeof tab.exact === 'undefined' ? true : tab.exact"
            :to="tab.to ? { name: tab.to } : null"
            replace
            active-class="secondaryLeftMenuTab__active"
            @click="$emit('click:tab', index)">
            <v-list-item-icon v-if="tab.icon" class="mr-2">
              <v-icon data-test="item-icon" color="primary darken-1">
                {{ tab.icon }}
              </v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title :data-test="`item-text-${index}`">
                {{ tab.text }}
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>
        <v-divider v-if="!hideDividers" />
      </v-navigation-drawer>
    </template>
    <slot name="bottom" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { RcTooltip } from '@libs/component-lib/components';
import { INavigationTab } from '@/types';

export default Vue.extend({
  name: 'SecondaryLeftMenu',

  components: {
    RcTooltip,
  },

  props: {
    /*
     * Title shown on the secondary left menu
     */
    title: {
      type: String,
      required: true,
    },
    /*
     * Whether to show or not the back button
     */
    hideBackButton: {
      type: Boolean,
      default: false,
    },
    /*
     * List of tabs to display
     * @values tab.text : text to be displayed
     * @values tab.test : data-test attribute with for QA
     * @values tab.icon : left icon if needed
     * @values tab.disabled : disables the tab
     * @values tab.to : route name to be redirected to
     */
    tabs: {
      type: Array,
      default: () => [] as Array<INavigationTab>,
    },

    backgroundClass: {
      type: String,
      default: 'light_grey',
    },

    subtitle: {
      type: String,
      default: '',
    },

    hideDividers: {
      type: Boolean,
      default: false,
    },
    groupMode: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    tabsToShow(): boolean {
      return this.tabs.length > 0;
    },
  },
});
</script>

<style scoped lang="scss">
.secondary-left-menu {
  width: 208px;
  background-color: var(--v-grey-lighten5);
}

.top-container {
  padding-top:24px ;
  padding-left: 16px;
  padding-right: 16px;
  width:100%;
}

.secondaryLeftMenuTab {
  border-left: 4px solid transparent;
}

::v-deep .v-list-item--link:before {
    background-color: transparent;
  }

.secondaryLeftMenuTab.secondaryLeftMenuTab__active,
.secondaryLeftMenuTab.secondaryLeftMenuTab__active--manual {
  background: var(--v-grey-lighten4);
  border-left: 4px solid var(--v-secondary-base);
  & ::v-deep .v-list-item__icon > i {
    color: var(--v-secondary-base) !important;
  }
}
</style>
