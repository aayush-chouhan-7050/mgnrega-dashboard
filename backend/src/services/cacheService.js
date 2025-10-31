import { getRedisClient } from '../config/redis.js';

const CACHE_TTL = 86400; // 24 hours

export const getCachedData = async (key) => {
  try {
    const client = getRedisClient();
    const data = await client.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Cache get error:', error);
    return null;
  }
};

export const setCachedData = async (key, data, ttl = CACHE_TTL) => {
  try {
    const client = getRedisClient();
    await client.setEx(key, ttl, JSON.stringify(data));
  } catch (error) {
    console.error('Cache set error:', error);
  }
};