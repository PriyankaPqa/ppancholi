import { IMultilingual } from '@/types';

interface IMFunction {
  (value: IMultilingual): string;
}

declare module 'vue/types/vue' {
  interface Vue {
    $m: IMFunction;
  }
}
