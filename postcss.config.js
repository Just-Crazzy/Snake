import autoprefixer from 'autoprefixer';
import postcssCalc from 'postcss-calc';
import postcssClipPathPolyfill from 'postcss-clip-path-polyfill';
import postcssCustomProperties from 'postcss-custom-properties';
import postcssFixes from 'postcss-fixes';
import pxtorem from 'postcss-pxtorem';

export default {
  plugins: [
    postcssCustomProperties(),
    postcssCalc({ precision: 5, warnWhenCannotResolve: false }),
    postcssClipPathPolyfill(),
    pxtorem({
      rootValue: 10,
      unitPrecision: 5,
      propList: ['font', 'font-size', 'line-height', 'letter-spacing'],
      selectorBlackList: [/^html$/],
      // replace: true,
      mediaQuery: false,
      exclude: /node_modules/i,
    }),
    autoprefixer({ cascade: false, grid: true }),
    postcssFixes({ preset: 'safe' }),
  ],
};