<template>
  <div class="container pa-4 pt-12">
    <div class="title" data-test="registration-title">
      {{ title }}
    </div>

    <slot />

    <v-card class="registrationCard pa-12">
      <svg
        width="80px"
        height="80px"
        viewBox="0 0 80 80"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink">
        <title>individual</title>
        <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
          <g
            transform="translate(-682.000000, -307.000000)"
            fill="#EE0000"
            fill-rule="nonzero">
            <g transform="translate(243.000000, 115.000000)">
              <g transform="translate(328.0, 164.0)">
                <path
                  d="M151,28
                      C173.09139,28 191,45.90861 191,68 C191,90.09139
                      173.09139,108 151,108 C128.90861,108 111,90.09139 111,68
                      C111,45.90861 128.90861,28 151,28 Z M151,29 C129.460895,29
                      112,46.4608948 112,68 C112,89.5391052 129.460895,107
                      151,107 C172.539105,107 190,89.5391052 190,68
                      C190,46.4608948 172.539105,29 151,29 Z M169,66
                      C174.522847,66 179,70.4771525 179,76 L179,88 L149,88
                      L149,76 C149,70.4771525 153.477153,66 159,66 L169,66 Z
                      M169,68 L159,68 C154.581722,68 151,71.581722 151,76
                      L151,86 L177,86 L177,76 C177,71.581722 173.418278,68
                      169,68 Z M135,71 C139.418278,71 143,74.581722 143,79
                      L143,85 L121,85 L121,79 C121,74.581722 124.581722,71
                      129,71 L135,71 Z M135,73 L129,73 C125.686292,73
                      123,75.6862915 123,79 L123,83 L141,83 L141,79
                      C141,75.6862915 138.313708,73 135,73 Z M132,57
                      C135.313708,57 138,59.6862915 138,63 C138,66.3137085
                      135.313708,69 132,69 C128.686292,69 126,66.3137085 126,63
                      C126,59.6862915 128.686292,57 132,57 Z M132,59
                      C129.790861,59 128,60.790861 128,63 C128,65.209139
                      129.790861,67 132,67 C134.209139,67 136,65.209139 136,63
                      C136,60.790861 134.209139,59 132,59 Z M164,47
                      C168.418278,47 172,50.581722 172,55 C172,59.418278
                      168.418278,63 164,63 C159.581722,63 156,59.418278 156,55
                      C156,50.581722 159.581722,47 164,47 Z M164,49
                      C160.686292,49 158,51.6862915 158,55 C158,58.3137085
                      160.686292,61 164,61 C167.313708,61 170,58.3137085 170,55
                      C170,51.6862915 167.313708,49 164,49 Z" />
              </g>
            </g>
          </g>
        </g>
      </svg>

      <div class="rc-title-2 mt-6" data-test="registration__title">
        {{ $t(`registration.landingpage.individual.title`) }}
      </div>

      <div class="rc-body12 grey--text text--darken-2" data-test="registration__subtitle`">
        {{ $t(`registration.landingpage.individual.subtitle`) }}
      </div>

      <v-btn
        class="mt-12"
        color="primary"
        :disabled="!canRegister"
        :aria-label="$t('registration.landingpage.beginbutton')"
        data-test="startRegistration-individual-button"
        @click="$emit('redirect')">
        {{ $t("registration.landingpage.beginbutton") }}
      </v-btn>

      <div v-if="phoneNumber" class="rc-body12 pt-2" data-test="registration__phoneNumber">
        {{ $t("registration.landingpage.call") }}
        <rc-phone-display :value="phoneNumber" />
      </div>
    </v-card>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import RcPhoneDisplay from '../../atoms/RcPhoneDisplay.vue';

export default Vue.extend({
  name: 'RcRegistrationLandingPage',
  components: {
    RcPhoneDisplay,
  },

  props: {
    title: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      default: '',
    },
    canRegister: {
      type: Boolean,
      default: true,
    },
  },
});
</script>

<style scoped lang="scss">

.container {
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
  align-items: center;
}

.title {
  font-size: 18px;
  font-weight: bold;
  color: var(--v-grey-darken4);
  text-align: center;
  margin-bottom: 40px;
}

.registrationCard {
  display: flex;
  text-align: center;
  width: 100%;
  overflow: hidden;
  flex-direction: column;
  align-items: center;
  max-width: 960px;
}

</style>
