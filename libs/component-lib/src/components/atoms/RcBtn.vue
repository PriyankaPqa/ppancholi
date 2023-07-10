<template>
  <v-btn
    :id="idName"
    class="base-btn"
    :class="type + '-btn'"
    :depressed="isDepressed"
    v-bind="$attrs"
    @click="$emit('click')">
    <slot name="default" />
  </v-btn>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';

export default Vue.extend({
  name: 'RcBtn',
  props: {
    type: {
      type: String as PropType<
        'primary' | 'secondary' | 'transparent' | 'back' | 'back-dark' | 'cancel' | 'inline-icon' | 'inline-icon-dark' | 'fab-primary' | 'fab-secondary'
        >,
      default: 'primary',
    },
  },
  computed: {
    idName() :string {
      // this id is used to override the disabled style
      type buttonIdObjectType = {
        [key: string]: string;
      };
      const buttonIdObj: buttonIdObjectType = {
        primary: 'custom-primary-btn-disabled',
        secondary: 'custom-secondary-btn-disabled',
        transparent: 'custom-transparent-btn-disabled',
        back: 'custom-back-btn-disabled',
        'back-dark': 'custom-back-btn-dark-disabled',
        cancel: 'custom-cancel-btn-disabled',
        'fab-primary': 'custom-fab-primary-btn-disabled',
        'fab-secondary': 'custom-fab-secondary-btn-disabled',
      };
        return buttonIdObj[this.type];
    },

    isDepressed() : boolean {
      const depressedBtnType = [
        'primary', 'secondary', 'transparent', 'back', 'back-dark', 'cancel', 'inline-icon',
      ];
      return depressedBtnType.indexOf(this.type) > -1;
    },
  },
});
</script>

<style scoped lang="scss">
// base button style
.base-btn {
  .v-size--default{
    height: 40px !important;
  }
  &:focus {
    outline: 0 !important;
  }

  &:focus-visible {
    gap: 6px;
    outline: 3px solid #35B2E8 !important;
  }
}

// override vuetify button size
.v-btn:not(.v-btn--round).v-size--default{
  height: 40px;
  font-size: 16px;
}

.v-btn:not(.v-btn--round).v-size--small{
  height: 32px;
  font-size: 14px;
}

.v-btn:not(.v-btn--round).v-size--x-small{
  height: 24px;
  border-radius: 4px !important;
  font-size: 14px;
}

// primary button
.primary-btn {
  text-transform: none !important;
  background-color: var(--v-primary-base) !important;
  color: white !important;
  border-radius: 6px !important;

  &:hover{
    background-color: var(--v-primary-darken1) !important;
  }

  &:active {
    background-color: var(--v-primary-darken2) !important;
  }
}

#custom-primary-btn-disabled.v-btn--disabled{
  opacity: .5;
  background-color: var(--v-primary-base) !important;
  color: white !important;
  ::v-deep .v-icon{
    color: white !important;
  }
}

// secondary button
.secondary-btn {
  text-transform: none !important;
  color: var(--v-primary-base) !important;
  background-color: var(--v-primary-lighten2) !important;
  border-radius: 6px !important;
  border: 1px solid var(--v-primary-base);

  &:hover {
    background-color: #CEE9F5 !important;
  }

  &:active {
    background-color: var(--v-primary-lighten1) !important;
  }
}

#custom-secondary-btn-disabled.v-btn--disabled{
  opacity: .5;
  color: var(--v-primary-base) !important;
  background-color: var(--v-primary-lighten2) !important;
  ::v-deep .v-icon{
    color: var(--v-primary-base) !important;
  }
}

// transparent button
.transparent-btn {
  text-transform: none !important;
  color: var(--v-primary-darken1) !important;
  background-color: rgba(0,0,0,0) !important;
  border-radius: 6px !important;

  &:hover {
    color: var(--v-primary-darken2) !important;
  }

  &:active {
    color: var(--v-primary-darken2) !important;
  }
}

#custom-transparent-btn-disabled.v-btn--disabled{
  opacity: .5;
  background-color: rgba(0,0,0,0) !important;
  color: var(--v-primary-base) !important;
  ::v-deep .v-icon{
    color: var(--v-primary-base) !important;
    text-decoration: none !important;
  }
}

// back button light
.back-btn {
  text-transform: none !important;
  color: var(--v-primary-darken1) !important;
  background-color: rgba(0,0,0,0) !important;
  border-radius: 6px !important;

  &:hover {
    color: var(--v-primary-darken1) !important;
    background-color: #CEE9F5 !important;
  }

  &:active {
    background-color: var(--v-primary-lighten1) !important;
  }
}

#custom-back-btn-disabled.v-btn--disabled{
  opacity: .5;
  color: var(--v-primary-darken1) !important;
  background-color: rgba(0,0,0,0) !important;
  border-radius: 6px !important;
  ::v-deep .v-icon{
    color: var(--v-primary-darken1) !important;
  }
}

// back button dark
.back-dark-btn {
  text-transform: none !important;
  color: var(--v-primary-lighten1) !important;
  background-color: rgba(0,0,0,0) !important;
  border-radius: 6px !important;

  &:hover {
    color: var(--v-primary-lighten2) !important;
  }

  &:active {
    color: var(--v-primary-lighten2) !important;
    background-color: #007093 !important;
  }
}

#custom-back-btn-dark-disabled.v-btn--disabled{
  opacity: 0.5;
  color: var(--v-primary-lighten1) !important;
  background-color: rgba(0,0,0,0) !important;
  border-radius: 6px !important;
  ::v-deep .v-icon{
    color: var(--v-primary-lighten1) !important;
  }
}

// cancel button
.cancel-btn {
  text-transform: none !important;
  color: var(--v-grey-darken4) !important;
  background-color: var(--v-grey-lighten5) !important;
  border: 1px solid var(--v-grey-darken2) !important;
  border-radius: 6px !important;

  &:hover {
    background-color: var(--v-grey-lighten3) !important;
  }

  &:active {
    background-color: var(--v-grey-lighten2) !important;
  }
}

#custom-cancel-btn-disabled.v-btn--disabled{
  opacity: .5;
  color: var(--v-grey-darken4) !important;
  background-color: var(--v-grey-lighten5) !important;
  border: 1px solid var(--v-grey-darken2) !important;
  border-radius: 6px !important;
  ::v-deep .v-icon{
    color: var(--v-grey-darken4) !important;
  }
}

// inline icon button
.inline-icon-btn {
  text-transform: none !important;
  color: var(--v-grey-darken3) !important;
  background-color: rgba(0,0,0,0) !important;

  &:hover {
    background-color: var(--v-grey-lighten3) !important;
  }

  &:active {
    background-color: var(--v-grey-lighten2) !important;
  }
}

// inline icon dark button
.inline-icon-dark-btn {
  text-transform: none !important;
  color: var(--v-primary-ligthen1) !important;
  background-color: rgba(0,0,0,0) !important;
  &:hover {
    color: var(--v-primary-ligthen2) !important;
  }

  &:active {
    color: var(--v-primary-lighten2) !important;
    background-color: #007093 !important;  }
}

// fab primary button
.fab-primary-btn {
  @extend .primary-btn;
  border-radius: 50% !important;
  box-shadow: 0 3px 5px -1px rgba(0,0,0,.2), 0 6px 10px 0 rgba(0,0,0,.14), 0 1px 18px 0 rgba(0,0,0,.12) !important;
}

#custom-fab-primary-btn-disabled.v-btn--disabled{
  opacity: .5;
  background-color: var(--v-primary-base) !important;
  color: white !important;
  ::v-deep .v-icon{
    color: white !important;
  }
}

// fab secondary button
.fab-secondary-btn {
  @extend .secondary-btn;
  border-radius: 50% !important;
  background-color: white !important;
  box-shadow: 0 3px 5px -1px rgba(0,0,0,.2), 0 6px 10px 0 rgba(0,0,0,.14), 0 1px 18px 0 rgba(0,0,0,.12) !important;
}

#custom-fab-secondary-btn-disabled.v-btn--disabled{
  opacity: .5;
  color: var(--v-primary-base) !important;
  background-color: var(--v-primary-lighten2) !important;
  ::v-deep .v-icon{
    color: var(--v-primary-base) !important;
  }
}

</style>
