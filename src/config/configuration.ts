export default () => ({
  app: {
    port: process.env.PORT,
  },
  token: {
    accessSecret: process.env.ACCESS_SECRET,
    accessExpireIn: +process.env.ACCESS_EXPIRE_IN,
    refreshSecret: process.env.REFRESH_SECRET,
    refreshExpireIn: +process.env.REFRESH_EXPIRE_IN,
  },
  redis: {
    url: process.env.REDIS_URL,
  },
})
