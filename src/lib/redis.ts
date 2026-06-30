import Redis from "ioredis";

declare global {
  var redisClient: Redis | undefined;
}

function shouldUseRedis() {
  return process.env.NEXT_PHASE !== "phase-production-build";
}

function createRedisClient() {
  if (!shouldUseRedis()) {
    return null;
  }

  if (global.redisClient) {
    return global.redisClient;
  }

  const client = new Redis({
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

  client.on("connect", () => {
    console.log(
      "✅ Redis Connected"
    );
  });

  client.on("error", (err) => {
    console.log(
      "❌ Redis Error:",
      err
    );
  });

  client.on("close", () => {
    console.log(
      "⚠ Redis Connection Closed"
    );
  });

  client.on("reconnecting", () => {
    console.log(
      "🔄 Redis Reconnecting"
    );
  });

  if (
    process.env.NODE_ENV !==
    "production"
  ) {
    global.redisClient = client;
  }

  return client;
}

export const redis = {
  async get(key: string) {
    const client = createRedisClient();

    if (!client) {
      return null;
    }

    try {
      return await client.get(key);
    } catch (error) {
      console.warn(
        "Redis get failed:",
        error
      );
      return null;
    }
  },

  async set(
    key: string,
    value: string,
    mode?: "EX" | "PX" | "KEEPTTL",
    ttl?: number
  ) {
    const client = createRedisClient();

    if (!client) {
      return null;
    }

    try {
      if (mode && ttl !== undefined) {
        return await (client as any).set(
          key,
          value,
          mode,
          ttl
        );
      }

      if (mode) {
        return await (client as any).set(
          key,
          value,
          mode
        );
      }

      return await (client as any).set(
        key,
        value
      );
    } catch (error) {
      console.warn(
        "Redis set failed:",
        error
      );
      return null;
    }
  },

  async del(key: string | string[]) {
    const client = createRedisClient();

    if (!client) {
      return 0;
    }

    try {
      if (Array.isArray(key)) {
        return await client.del(...key);
      }

      return await client.del(key);
    } catch (error) {
      console.warn(
        "Redis del failed:",
        error
      );
      return 0;
    }
  },

  async incr(key: string) {
    const client = createRedisClient();

    if (!client) {
      return 0;
    }

    try {
      return await client.incr(key);
    } catch (error) {
      console.warn(
        "Redis incr failed:",
        error
      );
      return 0;
    }
  },

  async expire(key: string, seconds: number) {
    const client = createRedisClient();

    if (!client) {
      return 0;
    }

    try {
      return await client.expire(
        key,
        seconds
      );
    } catch (error) {
      console.warn(
        "Redis expire failed:",
        error
      );
      return 0;
    }
  },
};