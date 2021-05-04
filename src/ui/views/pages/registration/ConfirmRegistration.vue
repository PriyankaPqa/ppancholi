<template>
  <div class="fixed-height pb-12">
    <template v-if="success">
      <div class="fixed-height mb-n8">
        <v-row no-gutters>
          <v-col cols="12" class="rc-body16 fw-bold mb-3">
            Thank you John
          </v-col>

          <v-col cols="12" sm="6" class="grey-container pt-6 pl-6">
            <span class="rc-body12">Registration number</span>
            <br>
            <span class="registration-result">123456</span>
          </v-col>
          <v-col cols="12" sm="6" class="grey-container pa-6">
            <span class="rc-body12">Registration number</span>
            <br>
            <span class="registration-result">Registration number</span>
          </v-col>

          <v-col cols="12" class="rc-body14 mt-3">
            If you need <span class="fw-bold">1880000</span>
          </v-col>
        </v-row>
      </div>

      <v-icon>mdi-information</v-icon>
      <span class="rc-body14 ml-2">A copy of this page</span>
    </template>

    <div v-else>
      <h3>Unable to complete registration</h3>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'ConfirmRegistration',

  computed: {
    success() {
      return true;
    },
  },
  methods: {},
});
</script>

<style scoped lang="scss">
.fixed-height {
  height: 100%;
}
.registration-result {
  font-size: 24px;
  font-weight: 500;
}
</style>
