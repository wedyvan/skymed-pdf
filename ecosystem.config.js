module.exports = {
  apps: [
    {
      name: "WTT Service",
      script: "dist/main.js",
      env: {
        NODE_ENV: "development",
        PATH: 'C:\\Program Files\\gs\\gs10.05.1\\bin;' + process.env.PATH,
      },
      env_homolog: {
        NODE_ENV: "homolog",
        PATH: 'C:\\Program Files\\gs\\gs10.05.1\\bin;' + process.env.PATH,
      },
      env_test: {
        NODE_ENV: "test",
        PATH: 'C:\\Program Files\\gs\\gs10.05.1\\bin;' + process.env.PATH,
      },
      env_staging: {
        NODE_ENV: "staging",
        PATH: 'C:\\Program Files\\gs\\gs10.05.1\\bin;' + process.env.PATH,
      },
      env_production: {
        NODE_ENV: "production",
        PATH: 'C:\\Program Files\\gs\\gs10.05.1\\bin;' + process.env.PATH,
      },
    },
  ],
};
