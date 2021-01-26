<template>
  <ValidationObserver ref="form" v-slot="{ failed }" slim>
    <page-template ref="pageTemplate" :loading="false" :show-left-menu="false">
      <page-content :title="isEditMode ? $t('event.edit.title') : $t('event.create.title')" :help-link="helpLink">
        <event-form :event.sync="event" :is-edit-mode="isEditMode" />

        <template slot="actions">
          <v-btn data-test="cancel" @click="back()">
            {{ $t('common.cancel') }}
          </v-btn>

          <v-btn color="primary" data-test="save" :loading="loading" :disabled="isEditMode ? failed || !isEventDirty : false" @click="submit">
            {{ submitLabel }}
          </v-btn>
        </template>
      </page-content>
    </page-template>
  </ValidationObserver>
</template>

<script lang="ts">
import Vue from 'vue';
import { TranslateResult } from 'vue-i18n';
import { PageTemplate, PageContent } from '@/ui/views/components/layout';
import EventForm from '@/ui/views/pages/events/create-edit/EventForm.vue';
import routes from '@/constants/routes';
import { Event } from '@/entities/event';
import { VForm } from '@/types';

export default Vue.extend({
  name: 'CreateEditEvent',

  components: {
    PageTemplate,
    PageContent,
    EventForm,
  },

  data() {
    return {
      loading: false,
      event: new Event(),
    };
  },

  computed: {
    isEditMode(): boolean {
      return this.$route.name === routes.events.edit.name;
    },

    isEventDirty(): boolean {
      return false;
    },

    submitLabel(): TranslateResult {
      return this.isEditMode ? this.$t('common.save') : this.$t('common.buttons.create');
    },

    helpLink(): TranslateResult {
      return this.$t('zendesk.help_link.createEvent');
    },
  },

  methods: {
    back(): void {
      this.$router.go(-1);
    },

    async submit() {
      const isValid = await (this.$refs.form as VForm).validate();

      if (isValid) {
        try {
          this.loading = true;
          await this.$storage.event.actions.createEvent(this.event);
        } finally {
          this.loading = false;
        }
      }
    },
  },
});
</script>
