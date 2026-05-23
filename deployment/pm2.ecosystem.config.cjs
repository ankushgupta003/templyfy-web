module.exports = {
  apps: [
    {
      name: "templyfy-api",
      cwd: "/var/www/templyfy",
      script: "npm",
      args: "run start:server",
      env: {
        NODE_ENV: "production",
        PORT: 4000,
      },
    },
  ],
};
