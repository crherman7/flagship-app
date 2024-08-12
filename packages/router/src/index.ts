import "react-native-url-polyfill/auto";

import FlagshipAppRouter from "./FlagshipAppRouter";

export * from "./hooks";

export default {
  register: FlagshipAppRouter.shared.register,
};
