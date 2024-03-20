"use server"
import redis from '../lib/redis'

export async function getAllDataFromRedis() {
    try {
      // Get all keys
      const keys = await redis.keys("*");
  
      const keysWithTypes = await Promise.all(
        keys.map(async (key:any) => {
          const type = await redis.type(key);
          return { key, type };
        })
      );
      console.log(keysWithTypes);
      
  
      // Log the keys
      return keysWithTypes;
    } catch (error) {
      console.error("Error:", error);
    }
  }

  export async function getData(key:string, type:string) {
// console.log(key, type);

  switch (type) {
    case "string":
      return await redis.get(key);
    case "hash":
      return await redis.hgetall(key);
    case "list":
      return await redis.lrange(key, 0, -1);
    case "set":
      return await redis.smembers(key);
    case "zset":
      return await redis.zrange(key, 0, -1, "WITHSCORES");
    case "stream":
      return await redis.xrange(key, "-", "+");
    case "ReJSON-RL":
      const res = await redis.call("JSON.GET", key);
      return JSON.parse(res);
    default:
      return "";
  }
}

  // export async function buildFolderStructure(keys : any) {
  //   const root = {};
  
  //   keys.forEach(key => {
  //     const parts = key.split(":"); // Split the key into parts
  //     let currentNode = root;
  
  //     parts.forEach(part => {
  //       if (!currentNode[part]) {
  //         currentNode[part] = {}; // Create a new folder if it doesn't exist
  //       }
  //       currentNode = currentNode[part]; // Move to the next level
  //     });
  //   });
  
  //   return root;
  // }

  // export async function showcaseRedisKeys() {
  //   const keys = await getAllDataFromRedis();
  //   const folderStructure = buildFolderStructure(keys);
  //   console.log(folderStructure); // Output the folder structure
  //   return folderStructure;
  // }