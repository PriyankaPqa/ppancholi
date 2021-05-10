<template>
  <div class="page-container">
    <img v-if="$i18n.locale === 'en'" src="../../../../../../public/img/logos/rc/rc-en.svg" class="logo" alt="logo">
    <img v-else src="../../../../../../public/img/logos/rc/rc-fr.svg" class="logo" alt="logo">
    <div class="rc-body14 pt-8">
      {{ $t('registration.type.individual') }}
    </div>
    <div class="rc-heading-4 pt-4">
      {{ $t('registration.page.confirmation') }}
    </div>
    <v-divider class="py-4 mt-4" />
    <div class="line">
      <div class="rc-body14 ">
        {{ $t('registration.confirmation.registration_id') }}: <span class="fw-bold">{{ $route.query.confirmationID }}</span>
      </div>
      <div class="rc-body14 pl-8">
        {{ $t('registration.confirmation.event') }} <span class="fw-bold">{{ $route.query.eventName }}</span>
      </div>
    </div>
    <div class="rc-body14 text-center footer">
      {{ $t('registration.confirmation.additional_assistance', {phone: $route.query.phoneAssistance}) }}
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'Confirmation',
});
</script>

<style lang="scss">
  .line {
    display:flex;
  }
  .footer {
    position: absolute;
    bottom: 0px;
  }
  .page-container {
    padding: 40px;
    position: relative;
    height: 100%;
  }
.logo {
  max-width: 165px;
}
</style>
