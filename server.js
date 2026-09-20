// cPanel Node.js entry point wrapper
// This allows cPanel's Setup Node.js App to run the server directly
process.env.NODE_ENV = 'production';
process.env.PORT = process.env.PORT || '3000';

require('./dist/server.cjs');
