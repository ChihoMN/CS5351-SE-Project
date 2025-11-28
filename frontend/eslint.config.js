//  @ts-check

import {tanstackConfig} from "@tanstack/eslint-config";

const config = [
  ...tanstackConfig,
  {
    rules: {
      "no-shadow": "off",
    },
  },
];
export default config;
