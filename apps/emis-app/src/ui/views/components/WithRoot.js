// Component used if you want a conditional rendering for a parent node but still want to display child node

export default {
  functional: true,
  props: ['show'],
  render(h, ctx) {
    const children = ctx.children.filter((vnode) => vnode.tag); // remove unnecessary text nodes
    if (children.length !== 1) {
      return false; // this component accepts only one root node in its slot);
    }
    if (ctx.props.show) {
      return children[0];
    }
    return children[0].children;
  },
};
