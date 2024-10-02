<template>
  <v-btn
    class="base-btn"
    :class="`${type}-btn`"
    :depressed="isDepressed"
    v-bind="attrs"
    :ripple="false"
    @click="$emit('click')">
    <template v-if="type === 'back' || type === 'back-light'">
      <v-icon left>
        mdi-arrow-left
      </v-icon>
      {{ $t('common.button.back') }}
    </template>
    <template v-else>
      <slot name="default" />
    </template>
  </v-btn>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';

export default Vue.extend({
  name: 'RcBtn',
  props: {
  type: {
    type: String as PropType<
      'primary' | 'secondary' | 'transparent' | 'back' | 'back-light' | 'cancel' | 'icon' | 'icon-light' | 'fab' | 'fab-light'
    >,
    default: 'primary',
    validator(value: string) {
      return ['primary', 'secondary', 'transparent', 'back', 'back-light', 'cancel', 'icon', 'icon-light', 'fab', 'fab-light'].includes(value);
    },
  },
},
  computed: {
    attrs(): Record<string, string> {
      if (this.type.includes('fab')) {
        return {
          ...this.$attrs,
          fab: '',
        };
      }
      if (this.type.includes('icon')) {
        return {
          ...this.$attrs,
          icon: '',
        };
      }
      return this.$attrs;
    },

    isDepressed() : boolean {
      const depressedBtnType = [
        'primary', 'secondary', 'transparent', 'back', 'back-light', 'cancel', 'icon',
      ];
      return depressedBtnType.indexOf(this.type) > -1;
    },
  },
});
</script>

<style scoped lang="scss">
// Common styles for disabled buttons
@mixin disabled-btn-styles($color, $bg-color) {
  opacity: .5;
  color: $color !important;
  background-color: $bg-color !important;

  ::v-deep .v-icon {
    color: $color !important;
  }
}

@mixin fab-shadow {
  box-shadow: 0 3px 5px -1px rgba(0, 0, 0, .2),
              0 6px 10px 0 rgba(0, 0, 0, .14),
              0 1px 18px 0 rgba(0, 0, 0, .12) !important;
}

// Common button size styles
@mixin button-sizes($large, $default, $small) {
  &.v-size--large {
    height: $large;

    & .v-btn__content .v-icon {
      margin-right: 6px;
    }
  }

  &.v-size--default {
    height: $default;

    & .v-btn__content .v-icon {
      margin-right: 4px;
    }
  }

  &.v-size--small {
    height: $small;

    & .v-btn__content .v-icon {
      margin-right: 2px;
    }
  }
}

// Base button styles
.base-btn {
  &:focus {
    outline: 0 !important;
  }

  &:focus-visible {
    gap: 6px;
    outline: 3px solid #35B2E8 !important;
  }

  &:hover::before {
    opacity: 0 !important;
  }
}

// Primary, Secondary, Transparent, and Cancel button styles
@mixin btn-styles($color, $bg, $hover-bg, $active-bg) {
  text-transform: none !important;
  color: $color !important;
  background-color: $bg !important;

  &:hover {
    background-color: $hover-bg !important;
  }

  &:active {
    background-color: $active-bg !important;
  }
}

.primary-btn {
  @include btn-styles(white, var(--v-primary-base), var(--v-primary-darken1), var(--v-primary-darken2));
}

.secondary-btn {
  @include btn-styles(var(--v-primary-base), var(--v-primary-lighten2), #CEE9F5, var(--v-primary-lighten1));
  border: 1px solid var(--v-primary-base);
}

.transparent-btn {
  @include btn-styles(var(--v-primary-darken1), transparent, var(--v-primary-lighten2), var(--v-primary-lighten2));
  text-decoration: underline;
}

.cancel-btn {
  @include btn-styles(var(--v-grey-darken4), var(--v-grey-lighten5), var(--v-grey-lighten3), var(--v-grey-lighten2));
  border: 1px solid var(--v-grey-darken2);
}

// Back button shared styles
@mixin back-btn-styles($color) {
  text-transform: none !important;
  color: $color !important;
  background-color: transparent !important;
  padding: 0px 4px !important;
}

.back-btn {
  @include back-btn-styles(var(--v-primary-darken1));
  @include button-sizes(24px, 20px, 16px);

  &:hover {
    background-color: #CEE9F5 !important;
  }

  &:active {
    background-color: var(--v-primary-lighten1) !important;
  }
}

.back-light-btn {
  @include back-btn-styles(var(--v-primary-lighten1));
  @include button-sizes(24px, 20px, 16px);

  &:hover,
  &:active {
    color: var(--v-primary-lighten2) !important;
    background-color: var(--v-primary-base) !important;
  }
}

// Icon button styles
@mixin icon-btn-sizes($icon-large, $icon-default, $icon-small) {
  &.v-size--large {
    height: 36px;
    width: 36px;

    & ::v-deep .v-btn__content .v-icon {
      height: $icon-large;
      font-size: $icon-large;
      width: $icon-large;
    }
  }

  &.v-size--default {
    height: 30px;
    width: 30px;

    & ::v-deep .v-btn__content .v-icon {
      height: $icon-default;
      font-size: $icon-default;
      width: $icon-default;
    }
  }

  &.v-size--small {
    height: 24px;
    width: 24px;

    & ::v-deep .v-btn__content .v-icon {
      height: $icon-small;
      font-size: $icon-small;
      width: $icon-small;
    }
  }
}

.icon-btn {
  text-transform: none !important;
  color: var(--v-grey-darken3) !important;
  background-color: transparent !important;

  @include icon-btn-sizes(24px, 20px, 16px);

  &:hover {
    background-color: var(--v-grey-lighten3) !important;
  }

  &:active {
    background-color: var(--v-grey-lighten2) !important;
  }
}

.icon-light-btn {
  @include icon-btn-sizes(24px, 20px, 16px);

  &:hover, &:active {
    color: var(--v-primary-lighten2) !important;
    background-color: var(--v-primary-base) !important;
  }
}

// Fab button styles (reuse from previous code)
@mixin fab-sizes($icon-size, $btn-size) {
  height: $btn-size;
  width: $btn-size;

  & ::v-deep .v-btn__content .v-icon {
    height: $icon-size;
    font-size: $icon-size;
    width: $icon-size;
  }
}

.fab-btn, .fab-light-btn {
  &.v-size--large {
    @include fab-sizes(24px, 56px);
  }

  &.v-size--default {
    @include fab-sizes(24px, 40px);
  }

  &.v-size--small {
    @include fab-sizes(16px, 32px);
  }

  @include fab-shadow;
}

.fab-btn {
  background-color: var(--v-primary-base) !important;
  color: white !important;

  &:hover {
    background-color: var(--v-primary-darken1) !important;
  }

  &:active {
    background-color: var(--v-primary-darken2) !important;
  }
}

.fab-light-btn {
  background-color: white !important;
  color: var(--v-primary-darken1) !important;
  border-color: var(--v-primary-base)!important;
  border: 1px solid;

  &:hover {
    background: #CEE9F5 !important;
    border-color: var(--v-primary-darken1)!important;
  }

  &:active {
    background-color: var(--v-primary-lighten1) !important;
  }
}

// Disabled button styles
.primary-btn.v-btn--disabled.v-btn--has-bg {
  @include disabled-btn-styles(white, var(--v-primary-base));
}

.secondary-btn.v-btn--disabled.v-btn--has-bg  {
  @include disabled-btn-styles(var(--v-primary-base), var(--v-primary-lighten2));
}

.transparent-btn.v-btn--disabled.v-btn--has-bg  {
  @include disabled-btn-styles(var(--v-primary-base), transparent);
}

.back-btn.v-btn--disabled.v-btn--has-bg  {
  @include disabled-btn-styles(var(--v-primary-darken1), transparent);
}

.back-light-btn.v-btn--disabled.v-btn--has-bg  {
  @include disabled-btn-styles(var(--v-primary-lighten1), transparent);
}

.cancel-btn.v-btn--disabled.v-btn--has-bg  {
  @include disabled-btn-styles(var(--v-grey-darken4), var(--v-grey-lighten5));
}

.fab-btn.v-btn--disabled.v-btn--has-bg  {
  @include disabled-btn-styles(white, var(--v-primary-base));
}

.fab-light-btn.v-btn--disabled.v-btn--has-bg  {
  @include disabled-btn-styles(var(--v-primary-base), white);
}
</style>
