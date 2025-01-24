import { Spin } from 'antd';
import React from 'react';
import { createRoot } from 'react-dom/client';

import { BgCenter } from '../bg-center';

export class Loading {
  private static container: HTMLDivElement | null = null;
  private static root: ReturnType<typeof createRoot> | null = null;

  private static createContainer() {
    if (this.container) return this.container;

    this.container = document.createElement('div');
    document.body.appendChild(this.container);
    this.root = createRoot(this.container);
    return this.container;
  }

  static open(config?: React.ComponentProps<typeof Spin>) {
    this.createContainer();

    this.root?.render(
      <BgCenter>
        <Spin {...config} />
      </BgCenter>,
    );
  }

  static close() {
    if (this.root) {
      this.root.unmount();

      if (this.container) {
        document.body.removeChild(this.container);
        this.container = null;
        this.root = null;
      }
    }
  }
}
