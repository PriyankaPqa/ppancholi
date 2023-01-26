/* eslint-disable */
import Vue from "vue";
import {useRegistrationStore} from "@/pinia/registration/registration";

declare module 'vue/types/options' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ComponentOptions<V extends Vue> {
    $registrationStore?: ReturnType<typeof useRegistrationStore>
  }
}

declare module 'vue/types/vue' {
  interface Vue {
    $registrationStore: ReturnType<typeof useRegistrationStore>
  }
}
