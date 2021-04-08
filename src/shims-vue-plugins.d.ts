import { IMultilingual } from '@/types';
import { Toasted } from 'vue-toasted';

interface IMFunction {
  (value: IMultilingual): string;
}

declare module 'vue/types/vue' {
  interface Vue {
    $m: IMFunction;
    $toasted: Toasted;
  }
}
