import Vue, { ComponentOptions } from "vue";

declare module '*.vue' {

  export default Vue;

  export type VForm = Vue & {
    validate: (type?: { silent?: boolean }) => boolean;
    reset: () => void;
  }
}
