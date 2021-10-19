<template>
  <ValidationObserver ref="form" v-slot="{ failed, dirty }" slim>
    <page-template ref="pageTemplate" :loading="eventLoading" :show-left-menu="false">
      <rc-page-content :title="isEditMode ? $t('event.edit.title') : $t('event.create.title')" :show-help="true" :help-link="helpLink">
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
  </ValidationObserver>
</template>

<script lang="ts">
import { TranslateResult } from 'vue-i18n';
import { RcPageContent } from '@crctech/component-library';
import mixins from 'vue-typed-mixins';
import PageTemplate from '@/ui/views/components/layout/PageTemplate.vue';
import routes from '@/constants/routes';
import { EventEntity } from '@/entities/event';
import { VForm } from '@/types';
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
      error: false,
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
      } catch {
        this.error = true;
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

      if (isValid) {
        try {
          this.loading = true;
          let eventId;

          if (this.isEditMode) {
            await this.$storage.event.actions.updateEvent(this.event);
            eventId = this.event.id;
            this.$toasted.global.success(this.$t('event_edit.success'));
          } else {
            const newEvent = await this.$storage.event.actions.createEvent(this.event);
            eventId = newEvent.id;
            this.event = new EventEntity(newEvent);
            this.$toasted.global.success(this.$t('event_create.success'));
          }
          this.$router.replace({ name: routes.events.summary.name, params: { id: eventId } });
        } catch (e) {
          this.handleSubmitError(e);
        } finally {
          this.loading = false;
        }
      } else {
        helpers.scrollToFirstError('scrollAnchor');
      }
    },
  },
});
</script>
