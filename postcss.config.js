module.exports = {
  plugins: [
    require('tailwindcss'),
    require('autoprefixer'),
    require('cssnano')({ preset: 'default' }), // Enable CSS minification
  ],
}