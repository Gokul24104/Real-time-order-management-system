export default {
  server: {
    proxy: {
      '/api': 'http://localhost:8080', // Assuming Spring Boot is on 8080
    },
  },
};
