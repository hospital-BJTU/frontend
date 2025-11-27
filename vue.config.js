const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true
})
module.exports = {
  devServer: {
    proxy: {
      '/api': {
<<<<<<< Updated upstream
<<<<<<< HEAD
        target: 'http://localhost:8080', // 后端 Node.js 地址
=======
        target: 'http://localhost:3000',
>>>>>>> 16bd7400f4a7b2f8ed2b379b3664930ebe28314d
=======
        target: 'http://localhost:3000',
>>>>>>> Stashed changes
        changeOrigin: true,
      }
    }
  }
}
