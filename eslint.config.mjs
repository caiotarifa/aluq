import withNuxt from './.nuxt/eslint.config.mjs'
import eslintPluginBetterTailwindcss from 'eslint-plugin-better-tailwindcss'

export default withNuxt(
  // Better Tailwind.
  eslintPluginBetterTailwindcss.configs.recommended,

  {
    settings: {
      'better-tailwindcss': {
        entryPoint: 'app/assets/css/main.css'
      }
    },

    rules: {
      'better-tailwindcss/enforce-consistent-line-wrapping': 'off'
    }
  }
)
