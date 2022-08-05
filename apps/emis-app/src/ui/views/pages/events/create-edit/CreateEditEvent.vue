<template>
  <validation-observer ref="form" v-slot="{ failed, dirty }" slim>
    <page-template ref="pageTemplate" :loading="eventLoading" :show-left-menu="false">
      <rc-page-content :title="isEditMode ? $t('event.edit.title') : $t('event.create.title')" :show-help="false" :help-link="helpLink">
        <event-form
          :event.sync="event"
          :is-edit-mode="isEditMode"
          :is-name-unique.sync="isNameUnique"
          :is-dirty.sync="isDirty" />

        <template slot="actions">
          <v-btn data-test="cancel" @click.stop="back()">
            {{ $t('common.cancel') }}
          </v-btn>

          <v-btn color="primary" data-test="save" :loading="loading" :disabled="failed || (!dirty && !isDirty)" @click.stop="submit">
            {{ submitLabel }}
          </v-btn>
        </template>
      </rc-page-content>
    </page-template>
  </validation-observer>
</template>

<script lang="ts">
import { TranslateResult } from 'vue-i18n';
import { RcPageContent } from '@libs/component-lib/components';
import mixins from 'vue-typed-mixins';
import PageTemplate from '@/ui/views/components/layout/PageTemplate.vue';
import routes from '@/constants/routes';
import { EventEntity } from '@libs/entities-lib/event';
import { VForm, IServerError } from '@libs/core-lib/types';
import helpers from '@/ui/helpers/helpers';
import handleUniqueNameSubmitError from '@/ui/mixins/handleUniqueNameSubmitError';
import EventForm from './EventForm.vue';

export default mixins(handleUniqueNameSubmitError).extend({
  name: 'CreateEditEvent',

  components: {
    PageTemplate,
    RcPageContent,
    EventForm,
  },

  props: {
    id: {
      type: String,
      default: '',
    },
  },

  data() {
    return {
      eventLoading: false,
      loading: false,
      event: new EventEntity(),
      isNameUnique: true,
      isDirty: false, // Need to manually sync dirty state because v-switch doesn't work with vee-validate
    };
  },

  computed: {
    isEditMode(): boolean {
      return this.$route.name === routes.events.edit.name;
    },

    submitLabel(): TranslateResult {
      return this.isEditMode ? this.$t('common.save') : this.$t('common.buttons.create');
    },

    helpLink(): TranslateResult {
      if (this.isEditMode) {
        return this.$t('zendesk.help_link.editEvent');
      }
      return this.$t('zendesk.help_link.createEvent');
    },
  },

  async created() {
    if (this.isEditMode) {
      this.eventLoading = true;

      try {
        const storeEvent = await this.$storage.event.actions.fetch(this.id);
        this.event = new EventEntity(storeEvent.entity);
      } finally {
        this.eventLoading = false;
      }
    } else {
      this.event = new EventEntity();
    }
  },

  methods: {
    back(): void {
      if (this.isEditMode) {
        this.$router.replace({
          name: routes.events.summary.name,
          params: {
            id: this.id,
          },
        });
      } else {
        this.$router.replace({
          name: routes.events.home.name,
        });
      }
    },

    async submit() {
      const isValid = await (this.$refs.form as VForm).validate();

      if (!isValid) {
        helpers.scrollToFirstError('scrollAnchor');
        return;
      }

      try {
        this.loading = true;
        this.isEditMode ? await this.submitEdit() : await this.submitCreate();
      } catch (e) {
        this.$appInsights.trackTrace('Event submit error', { error: (e as IServerError).response?.data?.errors }, 'CreateEditEvent', 'submit');
        this.handleSubmitError(e);
      } finally {
        this.loading = false;
      }
    },

    async submitEdit() {
      const res = await this.$storage.event.actions.updateEvent(this.event);
      if (res) {
        this.$toasted.global.success(this.$t('event_edit.success'));
        this.$router.replace({ name: routes.events.summary.name, params: { id: this.event.id } });
      }
    },

    async submitCreate() {
      const newEvent = await this.$storage.event.actions.createEvent(this.event);
      if (newEvent) {
        this.event = new EventEntity(newEvent);
        this.$toasted.global.success(this.$t('event_create.success'));
        this.$router.replace({ name: routes.events.summary.name, params: { id: newEvent.id } });
      }
    },
  },
});
</script>
