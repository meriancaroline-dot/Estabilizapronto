// src/global.d.ts
import React from 'react';

declare global {
  namespace JSX {
    type Element = React.ReactElement | null;
    type ElementClass = React.Component<any> | React.PureComponent<any>;
    interface IntrinsicElements {
      // qualquer tag válida de React Native
      View: React.ComponentProps<typeof React.NativeComponent>;
      Text: React.ComponentProps<typeof React.NativeComponent>;
      // (adicione mais se precisar)
      [key: string]: any;
    }
  }
}
