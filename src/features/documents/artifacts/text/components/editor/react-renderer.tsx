import { createRoot } from 'react-dom/client';

export const ReactRenderer = {
  render(component: React.ReactElement, dom: HTMLElement) {
    const root = createRoot(dom);
    root.render(component);

    return {
      destroy: () => root.unmount(),
    };
  },
};
