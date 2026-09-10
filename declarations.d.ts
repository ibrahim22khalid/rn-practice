declare module "*.svg" {
  import React from "react";
  import { SvgProps } from "react-native-svg";
  const content: React.FC<SvgProps>;
  export default content;
}

declare namespace require {
  function context(
    directory: string,
    useSubdirectories?: boolean,
    regExp?: RegExp
  ): {
    keys(): string[];
    <T>(id: string): T;
    resolve(id: string): string;
    id: string;
  };
}
