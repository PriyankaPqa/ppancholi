<template>
  <ValidationObserver ref="form" v-slot="{ failed, dirty }" slim>
    <page-template :loading="programLoading" :show-left-menu="false">
      <rc-page-content
        :title="isEditMode ? $t('event.programManagement.updateProgram') : $t('event.programManagement.addNewProgram')"
        :show-help="true"
        :help-link="helpLink">
        <program-form :program.sync="program" :is-edit-mode="isEditMode" :is-name-unique.sync="isNameUnique" :is-dirty.sync="isDirty" />

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
import Vue from 'vue';
import { TranslateResult } from 'vue-i18n';
import { RcPageContent } from '@crctech/component-library';
import { IError } from '@/services/httpClient';
import { VForm } from '@/types';
import { IProgram, Program } from '@/entities/program';
import routes from '@/constants/routes';
import helpers from '@/ui/helpers';
import PageTemplate from '@/ui/views/components/layout/PageTemplate.vue';
import ProgramForm from './ProgramForm.vue';

export default Vue.extend({
  name: 'CreateEditProgram',

  components: {
    PageTemplate,
    RcPageContent,
    ProgramForm,
  },

  props: {
    id: {
      type: String,
      default: '',
    },

    programId: {
      type: String,
      default: '',
    },
  },

  data() {
    return {
      programLoading: false,
      loading: false,
      error: false,
      program: new Program() as IProgram,
      isNameUnique: true,
      isDirty: false,
    };
  },

  computed: {
    isEditMode(): boolean {
      return this.$route.name === routes.programs.edit.name;
    },

    submitLabel(): TranslateResult {
      return this.isEditMode
        ? this.$t('common.save')
        : this.$t('common.buttons.create');
    },

    helpLink(): TranslateResult {
      return this.isEditMode
        ? this.$t('zendesk.help_link.edit_program')
        : this.$t('zendesk.help_link.create_program');
    },
  },

  created() {
    this.program = new Program();
    this.program.eventId = this.$route.params.id;
  },

  methods: {
    back(): void {
      if (this.isEditMode) {
        this.$router.replace({
          name: routes.programs.details.name,
          params: {
            programId: this.programId,
          },
        });
      } else {
        this.$router.replace({
          name: routes.programs.home.name,
        });
      }
    },

    handleSubmitError(errors: IError[]) {
      errors.forEach((error) => {
        if (error.code === 'errors.program-with-this-name-already-exists-for-this-event') {
          this.isNameUnique = false;
        } else {
          this.$toasted.global.error(this.$t(error.code));
        }
      });
    },

    async submit() {
      const isValid = await (this.$refs.form as VForm).validate();

      if (isValid) {
        try {
          this.loading = true;
          let programId;

          if (this.isEditMode) {
            // await this.$storage.event.actions.updateEvent(this.event);
            // eventId = this.event.id;
            // this.$toasted.global.success(this.$t('event_edit.success'));
          } else {
            const newProgram = await this.$storage.program.actions.createProgram(this.program);
            programId = newProgram.id;
            this.$toasted.global.success(this.$t('event.programManagement.created'));
          }
          this.$router.replace({ name: routes.programs.details.name, params: { programId } });
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
