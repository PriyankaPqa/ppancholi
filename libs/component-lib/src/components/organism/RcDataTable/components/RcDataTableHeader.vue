<template>
  <v-toolbar
    tag="div"
    v-bind="$attrs"
    class="dataTableHeader__container border-radius-top">
    <div class="d-flex flex-column">
      <div class="d-flex align-center">
        <slot name="headerLeft" />
        <h1
          v-if="labels.title"
          class="rc-title-3 white--text"
          data-test="table_title">
          {{ labels.title }}
        </h1>
      </div>

      <div id="dataTableHeader__left_anchor" />
    </div>

    <v-spacer />

    <v-toolbar-items>
      <v-text-field
        v-if="!hideSearch"
        class="dataTableHeader__search border-radius-all"
        data-test="dataTableHeader__search"
        :clearable="true"
        :value="search"
        filled
        flat
        :label="labels.searchPlaceholder"
        prepend-inner-icon="mdi-magnify"
        background-color="primary"
        single-line
        hide-details
        dense
        @input="emitSearchEvent" />

      <rc-tooltip v-if="showHelp" bottom>
        <template #activator="{ on }">
          <v-btn
            text
            icon
            class="ml-2"
            data-test="dataTableHeader__helpButton"
            :aria-label="$t('common.help')"
            v-on="on"
            @click="openHelpCenter">
            <v-icon color="primary lighten-1">
              mdi-help-circle-outline
            </v-icon>
          </v-btn>
        </template>
        {{ $t('common.help') }}
      </rc-tooltip>
      <slot name="headerRight" />
    </v-toolbar-items>
  </v-toolbar>
</template>

<script lang="ts">
import Vue from 'vue';
import helpers from '@libs/component-lib/helpers';
import RcTooltip from '@libs/component-lib/components/atoms/RcTooltip.vue';

export default Vue.extend({
  name: 'RcDataTableHeader',

  components: {
    RcTooltip,
  },

  props: {
    showHelp: {
      type: Boolean,
    },

    helpLink: {
      type: String,
      default: '',
    },

    search: {
      type: String,
      default: null,
    },

    hideSearch: {
      type: Boolean,
    },

    labels: {
      type: Object,
      default: null,
    },
  },
  methods: {
    openHelpCenter() {
      helpers.openHelpCenterWindow(this.helpLink, 500);
    },

    emitSearchEvent(search: string) {
      this.$emit('update:search', search);
    },
  },
});
</script>

<style scoped  lang="scss">
.v-toolbar__items {
  align-items: center;
}

.dataTableHeader__search {
  & ::v-deep .v-input__slot::before {
    display: none;
  }
}

.dataTableHeader__container {
  z-index: 3;
}

#dataTableHeader__left_anchor {
  min-width: 100%;
  & ::v-deep .v-menu__content {
    top: 50px !important;
  }
}

::v-deep .v-text-field__slot > .theme--dark.v-label {
  color: white !important;
  font-size: 14px;
}
</style>
