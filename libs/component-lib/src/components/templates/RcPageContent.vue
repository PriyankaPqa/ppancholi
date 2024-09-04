<template>
  <div
    :class="{ 'outer-scroll': outerScroll, 'pageContent grey lighten-4': true, fullscreen: fullscreen }"
    v-bind="$attrs"
    class="pa-0">
    <rc-page-loading v-if="loading" />
    <div v-else :class="`d-flex flex-grow-1 flex-column fill-height pageContentCard__container ${fullscreen ? '' : 'pa-sm-4'}`">
      <slot name="top" />

      <v-card :class="{ 'pageContentCard full-width pageContent__card': true, height100: fullHeight }">
        <v-toolbar v-if="showTitle" color="primary darken-1" dark flat class="flex-grow-0 toolbar">
          <rc-tooltip v-if="showAddButton" bottom>
            <template #activator="{ on }">
              <v-btn
                :data-test="addButtonDataTest"
                class="mr-3"
                fab
                color="white"
                small
                :aria-label="$t('common.buttons.add')"
                v-on="on"
                @click="$emit('add-button')">
                <v-icon color="primary">
                  mdi-plus
                </v-icon>
              </v-btn>
            </template>
            {{ addButtonLabel }}
          </rc-tooltip>

          <rc-tooltip v-if="showBackButton" bottom>
            <template #activator="{ on }">
              <v-btn
                class="mr-3"
                elevation="0"
                color="white"
                fab
                small
                :aria-label="$t('common.button.back')"
                data-test="pageContent_backButton"
                v-on="on"
                @click="$emit('back')">
                <v-icon color="primary">
                  mdi-arrow-left
                </v-icon>
              </v-btn>
            </template>
            {{ $t('common.buttons.back') }}
          </rc-tooltip>

          <v-toolbar-title>
            <div class="rc-caption12 fw-light white--text">
              {{ subtitle }}
            </div>
            <h1 class="rc-title-3 white--text" data-test="page-title">
              {{ title }}
            </h1>
          </v-toolbar-title>

          <v-spacer />

          <v-toolbar-items>
            <slot name="toolbarItems" />
            <v-text-field
              v-if="showSearch"
              v-model="search"
              class="pageContent__search border-radius-all"
              data-test="pageContent__search"
              filled
              flat
              dense
              :label="$t('common.inputs.quick_search')"
              prepend-inner-icon="mdi-magnify"
              background-color="primary"
              single-line
              hide-details
              clearable
              @input="emitSearchEvent" />
          </v-toolbar-items>

          <slot name="buttons" />

          <rc-tooltip v-if="showEditButton" bottom>
            <template #activator="{ on }">
              <v-btn
                icon
                data-test="pageContent_editButton"
                :aria-label="$t('common.edit')"
                v-on="on"
                @click="$emit('edit')">
                <v-icon color="primary lighten-2">
                  mdi-pencil
                </v-icon>
              </v-btn>
            </template>
            <span>{{ $t('common.edit') }}</span>
          </rc-tooltip>

          <rc-tooltip v-if="showHelp" bottom>
            <template #activator="{ on }">
              <v-btn :aria-label="$t('common.tooltip_label')" class="ml-2" icon data-test="pageContent__opeHelp" v-on="on" @click="openHelp()">
                <v-icon color="primary lighten-2">
                  mdi-help-circle-outline
                </v-icon>
              </v-btn>
            </template>
            <span>{{ $t('common.tooltip_label') }}</span>
          </rc-tooltip>
        </v-toolbar>

        <div id="scrollAnchor" class="pageContentCard__content">
          <div :class="`full-width pa-${contentPadding}`">
            <slot name="default" />
          </div>
        </div>

        <div v-if="!!$slots.actions" :class="`pageContent__actions pa-${actionsPadding}`">
          <slot name="actions" />
        </div>
      </v-card>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import helpers from '@libs/component-lib/helpers';
import RcTooltip from '@libs/component-lib/components/atoms/RcTooltip.vue';
import RcPageLoading from '../atoms/RcPageLoading.vue';

export default Vue.extend({
  name: 'RcPageContent',

  components: {
    RcPageLoading,
    RcTooltip,
  },

  props: {
    /**
     * This is the title of page content section
     */
    title: {
      type: String,
      required: true,
    },
    /**
     * This is the smaller title that appears above title
     */
    subtitle: {
      type: String,
      default: '',
    },
    /**
     * The amount of padding around the inner content, default 4 * 4px
     */
    contentPadding: {
      type: String,
      default: '4',
    },
    /**
     * The amount of padding around the actions footer, default 6 * 4px
     */
    actionsPadding: {
      type: String,
      default: '6',
    },
    /**
     * Whether or not to show the help button
     */
    showHelp: {
      type: Boolean,
      default: false,
    },
    /**
     * Link which is open when clicking on help
     */
    helpLink: {
      type: String,
      default: '',
    },
    /**
     * Whether or not to show the plus button
     */
    showAddButton: {
      type: Boolean,
      default: false,
    },
    addButtonLabel: {
      type: String,
      default: 'Add',
    },
    /**
     * Data test attribute to put on the add button
     */
    addButtonDataTest: {
      type: String,
      default: 'pageContent__addBtn',
    },
    /**
     * Whether or not to show the search input
     */
    showSearch: {
      type: Boolean,
      default: false,
    },
    /**
     * Turn on/off outerScroll mode. When on, the inner content is not scrollable. but the card itself is
     */
    outerScroll: {
      type: Boolean,
      default: false,
    },
    /**
     * Whether or not to show the back button
     */
    showBackButton: {
      type: Boolean,
      default: false,
    },
    /**
     * Puts this component in fullscreen mode, removing padding and border radius
     */
    fullscreen: {
      type: Boolean,
      default: false,
    },
    /**
     * Card takes 100% height of the screen
     */
    fullHeight: {
      type: Boolean,
      default: true,
    },
    /**
     * Whether or not to show the edit button
     */
    showEditButton: {
      type: Boolean,
      default: false,
    },
    loading: {
      type: Boolean,
      default: false,
    },
    showTitle: {
      type: Boolean,
      default: true,
    },
  },

  data() {
    return {
      search: '',
    };
  },

  /**
   * Will open a new window containing an contextual help
   * @public
   */
  methods: {
    openHelp() {
      helpers.openHelpCenterWindow(this.helpLink, 300);
    },

    emitSearchEvent() {
      this.$emit('search', this.search);
    },
  },
});
</script>

<style lang="scss" scoped>

@import "@libs/shared-lib/assets/styles/breakpoints";

.outer-scroll {
  &.pageContent {
    overflow-y: auto;
    max-height: 100%;
  }
  & .pageContentCard__content {
    overflow-y: unset;
  }
  & .pageContent__actions {
    position: static;
  }
}

.pageContent {
  height: 100%;
  flex: 1;
  max-height: calc(100vh - 64px); /* 64px is height of app header */
}

.fullscreen {
  min-height: 100%;

  .pageContentCard {
    border-radius: 0;
  }
}

.pageContent__card {
  display: flex;
  flex-direction: column;
}

.pageContentCard__content {
  height: 100%;
  display: flex;
  overflow-y: auto;
}

.pageContent__actions {
  width: 100%;
  border-top: 1px solid var(--v-grey-lighten3);
  display: flex;
  justify-content: flex-end;
  align-items: center;
  & button {
    margin: 0 0 0 16px;
  }
}

.v-toolbar__items {
  align-items: center;
}

.pageContent__actions {
  & ::v-deep button {
    margin: 0 0 0 16px!important;
  }
}

.pageContent__search {
  & ::v-deep .v-input__slot::before {
    display: none;
  }
}

  @media only screen and (min-width: $breakpoint-xs-min) and (max-width: $breakpoint-xs-max) {
    .toolbar {
      height: 64px;
    }
  }
  @media only screen and (min-width: $breakpoint-sm-min) and (max-width: $breakpoint-md-max) {
    .toolbar {
      height: 62px;
    }
  }
  @media only screen and (min-width: $breakpoint-lg-min) {
    .toolbar {
      height: 72px;
    }
  }

.height100 {
  height: 100%;
}

::v-deep .v-text-field__slot > .theme--dark.v-label {
  color: white !important;
  font-size: 14px;
}
</style>
