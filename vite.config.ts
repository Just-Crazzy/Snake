import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, type Plugin } from 'vite';
import sassDts from 'vite-plugin-sass-dts';
import svgr from 'vite-plugin-svgr';

const resolvePath = (path: string) => fileURLToPath(new URL(path, import.meta.url))

const dirDev = resolvePath('src');
const dirProd = resolvePath('dist');

function performanceBudget(maxKb = 512): Plugin {
  return {
    name: 'performance-budget',
    generateBundle(_, bundle) {
      for (const [name, chunk] of Object.entries(bundle)) {
        const size = 'code' in chunk ? chunk.code.length : 0;
        if (size > maxKb * 1024) {
          this.error(`Asset "${name}" exceeds budget: ${(size / 1024).toFixed(1)}KB > ${maxKb}KB`);
        }
      }
    },
  };
}

export default defineConfig(({ mode }) => {
  const isProd = mode === 'production';

  return {
    base: '/',
    root: dirDev,

    resolve: {
      alias: {
        '@': dirDev,
        '@public': path.resolve('./public'),
      },
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
    },

    plugins: [
      react(),
      performanceBudget(512),

      sassDts({
        enabledMode: ['development', 'production'],
        sourceDir: dirDev,
        legacyFileFormat: true,
        esmExport: true,
      }),

      svgr({
        svgrOptions: {
          exportType: 'default',
          svgo: true,
        },
      }),
    ],

    server: {
      port: 2700,
      open: true,
      hmr: {
        overlay: true,
      },
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
          secure: false,
          rewrite: (p) => p.replace(/^\/api/, ''),
        },
      },
    },

    css: {
      devSourcemap: true,
      modules: {
        generateScopedName: '[local]__[hash:base64:6]',
      },
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler',
          quietDeps: true,
          loadPaths: [
            resolvePath('src/app/styles/'),
          ],
        },
      },
    },

    build: {
      outDir: dirProd,
      emptyOutDir: true,
      target: 'es2015',
      sourcemap: false,
      chunkSizeWarningLimit: 512,
      minify: 'oxc',
      cssMinify: 'lightningcss',

      // Инлайнинг SVG до 24KB, картинки всегда файлы.
      assetsInlineLimit: (filePath, content) => {
        if (filePath.endsWith('.svg')) return content.length < 24 * 1024;
        return false;
      },


      rolldownOptions: {
        output: {
          entryFileNames: 'js/[name].[hash].js',
          chunkFileNames: 'js/chunks/[name].[hash].js',


          minify: {
            compress: {
              dropConsole: isProd ? true : false,
              dropDebugger: isProd ? true : false,
            },
          },

          assetFileNames: (assetInfo) => {
            const name = (assetInfo.names && assetInfo.names[0]) || assetInfo.name || '';
            if (name.endsWith('.css')) return 'css/[name].[hash].css';
            if (/\.(woff2?|ttf)$/.test(name)) return 'fonts/[name][extname]';
            if (/\.ico$/.test(name)) return 'favicons/[name][extname]';
            if (/\.svg$/.test(name)) return 'svg/[name][extname]';
            if (/\.(jpe?g|png|webp|avif)$/.test(name)) return 'img/[name][extname]';
            return 'assets/[name][extname]';
          },

          codeSplitting: {
            groups: [
              {
                name: 'vendor',
                test: /[\\/]node_modules[\\/]/,
                priority: -10,
              },
              {
                name: 'common',
                minSize: 0,
                minShareCount: 2,
                priority: -20,
              },
            ],
          },
        },
      },
    },
  };
});