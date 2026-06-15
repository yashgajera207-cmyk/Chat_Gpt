import Redis from "ioredis";

declare global {
  var redis: Redis | undefined;
}

export const redis =
  global.redis ||
  new Redis({
    host:
      process.env.REDIS_HOST ||
      "127.0.0.1",

    port: Number(
      process.env.REDIS_PORT
    ) || 6379,

    maxRetriesPerRequest: null,

    retryStrategy(times) {
      return Math.min(
        times * 50,
        2000
      );
    },
  });

if (
  process.env.NODE_ENV !==
  "production"
) {
  global.redis = redis;
}

// EVENTS

redis.on("connect", () => {
  console.log(
    "✅ Redis Connected"
  );
});

redis.on("error", (err) => {
  console.log(
    "❌ Redis Error:",
    err
  );
});

redis.on("close", () => {
  console.log(
    "⚠ Redis Connection Closed"
  );
});

redis.on("reconnecting", () => {
  console.log(
    "🔄 Redis Reconnecting"
  );
});