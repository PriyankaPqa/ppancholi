/* eslint-disable */
import Vue from "vue";
import {storeFactory} from "@libs/stores-lib/src/registration/registration";

declare module 'vue/types/options' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ComponentOptions<V extends Vue> {
    $registrationStore?: ReturnType<typeof storeFactory>
  }
}

declare module 'vue/types/vue' {
  interface Vue {
    $registrationStore: ReturnType<typeof storeFactory>
  }
}
