import type { ReactNode } from 'react';

export type WebProps = {
  /**
   * sets the component children.
   */
  children?: ReactNode;
};

export function Web({ children }: WebProps) {
  return (
    <div>
      {children}
    </div>
  );
}
