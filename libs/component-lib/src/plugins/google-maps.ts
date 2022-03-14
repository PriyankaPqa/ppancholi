import { Loader } from '@googlemaps/js-api-loader';

let loader: Loader;

export default {
  getLoader: (apiKey: string) => {
    if (loader) {
      return loader;
    }

    loader = new Loader({
      apiKey,
      version: 'weekly',
      libraries: ['places'],
    });

    return loader;
  },
};
