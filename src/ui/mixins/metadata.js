/**
 * Mixin to inject metadata for each page
 */

export default {
  metaInfo() {
    return {
      title: this.metaTitle,
      meta: [
        { vmid: 'description', name: 'description', content: this.metaDescription },
      ],
    };
  },
};
