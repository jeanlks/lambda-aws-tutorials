const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { getUserByEmail } = require("../lib/db");
const redis = require('async-redis');
const Promise = require('bluebird')
const redisReadyTimeoutMs = 100;

var clientRedis = null;
getRedisClient(redisReadyTimeoutMs)
    .then(redisClient => {
        clientRedis = redisClient;
    }, error => {
        console.log("Unable to connect to redis", error);
});

async function signToken(user) {
  const secret = Buffer.from(process.env.JWT_SECRET, "base64");

  return jwt.sign({ email: user.email, id: user.id, roles: ["USER"] }, secret, {
    expiresIn: 86400 // expires in 24 hours
  });
}

async function getUserFromToken(token) {
  const secret = Buffer.from(process.env.JWT_SECRET, "base64");

  const decoded = jwt.verify(token.replace("Bearer ", ""), secret);

  return decoded;
}

async function login(args) {
  try {
    let user = null;
    if(clientRedis != null){
      console.info("clientRedis != null");
      user =  await clientRedis.get(args.email).catch(error => {
        user = null;
        console.info("error getting from clientRedis", error);
      });
    }

    if (user == null) {
      user = await getUserByEmail(args.email);
      setRedisKey(args.email, JSON.stringify(user));
      console.info("user from db", user);
    } else {
      user = JSON.parse(user);
      console.info("user from redis", user);
    }
    const isValidPassword = await comparePassword(
      args.password,
      user.passwordHash
    );

    console.info("passord valid" ,isValidPassword);
    if (isValidPassword) {
      const token = await signToken(user);
      return Promise.resolve({ auth: true, token: token, status: "SUCCESS" });
    }

  } catch (err) {
    console.error(err);
    return Promise.reject(new Error(err));
  }
}

function comparePassword(eventPassword, userPassword) {
  return bcrypt.compare(eventPassword, userPassword);
}
async function setRedisKey(key, value){
  if(clientRedis!=null) clientRedis.set(key, value).catch(error => {});
}

function getRedisClient(timeoutMs){
  return new Promise((resolve, reject) => {
      const redisClient = redis.createClient(process.env.REDIS_PORT, process.env.REDIS_URL);
      const timer = setTimeout(() => reject('timeout'), timeoutMs);
      redisClient.on("ready", () => {
          clearTimeout(timer);
          resolve(redisClient);
      });
      redisClient.on("error", (err) => {
          clearTimeout(timer);
          reject(err);
      });
  });
};

module.exports = {
  signToken,
  getUserFromToken,
  login
};