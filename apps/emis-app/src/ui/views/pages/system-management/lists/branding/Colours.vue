<template>
  <v-row no-gutters>
    <v-col cols="12" class="rc-body18 fw-bold mb-4">
      <v-row>
        <v-col cols="11" class="py-4">
          {{ $t('system_management.branding.colours') }}
        </v-col>
        <v-col v-if="!isEditing" class="d-flex justify-end">
          <v-btn data-test="colours__editBtn" icon :aria-label="$t('common.edit')" :disabled="disableEditBtn" @click="toggleEditMode(true)">
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
        </v-col>
      </v-row>
    </v-col>

    <v-col v-for="(colour, index) in colours" :key="colour.labelKey" :class="{ 'ml-4': index !== 0 }">
      <span class="rc-body14 fw-medium">
        {{ $t(colour.labelKey) }}
      </span>
      <div class="border-radius-all colour-container px-1 rc-body14 " :style="{ backgroundColor: colour.value }">
        <input v-if="isEditing" v-model="colour.value" class="border-radius-all mb-1 colour-input bottom-element">
        <span v-else :class="`bottom-element ${ colour.value === '#A7D0E1' ? 'primary-darken1-text' : 'white--text' }`">
          {{ colour.value }}
        </span>
      </div>
      <div class="error-box error--text v-messages">
        {{ $t(colour.errorMsgKey) }}
      </div>
    </v-col>

    <v-col v-if="isEditing" cols="12" class="mt-6 d-flex justify-end">
      <v-btn data-test="cancel" :disabled="loading" @click.stop="toggleEditMode(false)">
        {{ $t('common.cancel') }}
      </v-btn>

      <v-btn color="primary" data-test="save" class="ml-4" :disabled="!isValid || !isDirty" :loading="loading" @click.stop="saveEdit()">
        {{ $t('common.save') }}
      </v-btn>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import Vue from 'vue';
import { useTenantSettingsStore } from '@/pinia/tenant-settings/tenant-settings';

type ColourViewModel = {
  labelKey: string;
  value: string;
  errorMsgKey: string;
};

export default Vue.extend({
  name: 'Colours',

  props: {
    disableEditBtn: {
      type: Boolean,
      required: true,
    },
  },

  data() {
    return {
      isEditing: false,
      loading: false,
      isValid: true,
      colours: [
        {
          labelKey: 'system_management.branding.colour.primary',
          value: '',
          errorMsgKey: '',
        },
        {
          labelKey: 'system_management.branding.colour.primaryLight',
          value: '',
          errorMsgKey: '',
        },
        {
          labelKey: 'system_management.branding.colour.primaryDark',
          value: '',
          errorMsgKey: '',
        },
        {
          labelKey: 'system_management.branding.colour.secondary',
          value: '',
          errorMsgKey: '',
        },
      ] as ColourViewModel[],
    };
  },

  computed: {
    isDirty(): boolean {
      const colors = useTenantSettingsStore().currentTenantSettings.branding.colours;
      return (
        this.colours[0].value !== colors.primary
        || this.colours[1].value !== colors.primaryLight
        || this.colours[2].value !== colors.primaryDark
        || this.colours[3].value !== colors.secondary
      );
    },
  },

  watch: {
    colours: {
      handler(colours: ColourViewModel[]) {
        let isValid = true;
        colours.forEach((c) => {
          if (/^#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/.test(c.value)) {
            c.errorMsgKey = null;
          } else {
            c.errorMsgKey = 'system_management.branding.colour.errorMessage';
            isValid = false;
          }
        });

        this.isValid = isValid;
      },
      deep: true,
    },
  },

  created() {
    this.resetColours();
  },

  methods: {
    toggleEditMode(isEditing: boolean) {
      this.isEditing = isEditing;
      this.$emit('update:is-editing-colours', this.isEditing);

      if (!this.isEditing) {
        this.resetColours();
      }
    },

    resetColours() {
      const colors = useTenantSettingsStore().currentTenantSettings.branding.colours;
      this.colours[0].value = colors.primary;
      this.colours[1].value = colors.primaryLight;
      this.colours[2].value = colors.primaryDark;
      this.colours[3].value = colors.secondary;
    },

    async saveEdit() {
      this.loading = true;

      const result = await useTenantSettingsStore().updateColours({
        colours: {
          primary: this.colours[0].value,
          primaryLight: this.colours[1].value,
          primaryDark: this.colours[2].value,
          secondary: this.colours[3].value,
        },
      });

      this.loading = false;

      if (result) {
        this.toggleEditMode(false);
      }
    },
  },
});
</script>

<style scoped lang="scss">
.colour-container {
  border: 1px solid var(--v-grey-lighten2);
  height: 104px;
  display: flex;
}
.colour-input {
  width: 100%;
  display: block;
  padding: 0px;
  border-style: inherit;
  border-color: var(--v-grey-lighten2);
  outline: none;
  background-color: var(--v-white-lighten1);
}
.bottom-element {
  align-self: flex-end;
}
.error-box {
  height: 20px;
}
.primary-darken1-text {
  color: var(--v-primary-darken1) !important;
}
</style>
