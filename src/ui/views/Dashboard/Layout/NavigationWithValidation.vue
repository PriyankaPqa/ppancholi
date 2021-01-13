<template>
  <v-navigation-drawer
    width="100%"
    color="grey lighten-5"
    style="height: auto;"
    floating
    :value="true"
    permanent>
    <v-list>
      <v-list-item
        v-for="(tab, index) in tabs"
        :key="index"
        dense
        :data-test="tab.test"
        :disabled="tab.disabled"
        link
        :input-value="activeTabIndex === index"
        active-class="white"
        @click="$emit('update-tab', index)">
        <v-list-item-icon v-if="tab.icon" class="mr-2">
          <v-icon data-test="item-icon" color="primary darken-1">
            {{ tab.icon }}
          </v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title data-test="item-text">
            {{ tab.text }}
          </v-list-item-title>
        </v-list-item-content>
        <v-list-item-icon>
          <v-icon v-if="showErrorIcon(index)" small class="float-icon-right status_error--text" :data-test="`item-tab-error-${tab.test}`">
            mdi-alert-circle
          </v-icon>
          <v-icon v-if="showSuccessIcon(index)" small class="float-icon-right status_success--text" :data-test="`item-tab-success-${tab.test}`">
            mdi-checkbox-marked-circle
          </v-icon>
        </v-list-item-icon>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'NavigationWithValidation',
  props: {
    tabs: {
      type: Array,
      required: true,
    },
    /**
     * The module to store validation state
     */
    validationStore: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
    };
  },
  computed: {
    activeTabIndex(): number {
      return this.$store.state[this.validationStore].activeTabIndex;
    },
  },
  methods: {
    showErrorIcon(tabIndex: number): boolean {
      return this.$store.getters[`${this.validationStore}/showErrorIcon`](tabIndex);
    },
    showSuccessIcon(tabIndex: number): boolean {
      return this.$store.getters[`${this.validationStore}/showSuccessIcon`](tabIndex);
    },
  },
});
</script>
