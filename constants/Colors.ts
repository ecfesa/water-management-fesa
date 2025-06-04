/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#2f95dc';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#000',
    background: '#fff',
    tint: tintColorLight,
    icon: '#666',
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorLight,
    componentBase: '#f5f5f5',
    detailsBase: '#e0e0e0',
    highlight: '#2f95dc',
    danger: '#ff3b30',
    chartColors: [
      '#2f95dc', // blue
      '#34c759', // green
      '#ff9500', // orange
      '#ff2d55', // pink
      '#5856d6', // purple
      '#ffcc00', // yellow
      '#007aff', // light blue
      '#ff3b30', // red
    ],
  },
  dark: {
    text: '#fff',
    background: '#000',
    tint: tintColorDark,
    icon: '#999',
    tabIconDefault: '#666',
    tabIconSelected: tintColorDark,
    componentBase: '#1c1c1e',
    detailsBase: '#2c2c2e',
    highlight: '#0a84ff',
    danger: '#ff453a',
    chartColors: [
      '#0a84ff', // blue
      '#30d158', // green
      '#ff9f0a', // orange
      '#ff375f', // pink
      '#5e5ce6', // purple
      '#ffd60a', // yellow
      '#64d2ff', // light blue
      '#ff453a', // red
    ],
  },
};
