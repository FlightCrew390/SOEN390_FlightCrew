const React = require("react");
const { View } = require("react-native");

const Animated = {
  View: ({ children, style }) => React.createElement(View, { style }, children),
  Text: ({ children, style }) => React.createElement(View, { style }, children),
  ScrollView: ({ children, style }) =>
    React.createElement(View, { style }, children),
  createAnimatedComponent: (component) => component,
};

module.exports = {
  __esModule: true,
  default: Animated,
  useSharedValue: (value) => ({ value }),
  useAnimatedStyle: (fn) => {
    try {
      return fn();
    } catch {
      return {};
    }
  },
  withTiming: (value) => value,
  withSpring: (value) => value,
  runOnJS: (fn) => fn,
  Easing: { linear: (t) => t, ease: (t) => t, bezier: () => (t) => t },
};
