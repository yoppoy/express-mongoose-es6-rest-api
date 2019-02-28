const Joi = require('joi');

// require and configure dotenv, will load vars in .env in PROCESS.ENV
require('dotenv').config();

// define validation for all the env vars
const envVarsSchema = Joi.object({
  NODE_ENV: Joi.string()
    .allow(['development', 'production', 'test', 'provision'])
    .default('development'),
  PORT: Joi.number()
    .default(4040),
  MONGOOSE_DEBUG: Joi.boolean()
    .when('NODE_ENV', {
      is: Joi.string().equal('development'),
      then: Joi.boolean().default(true),
      otherwise: Joi.boolean().default(false)
    }),
  JWT_SECRET: Joi.string().required()
    .description('JWT Secret required to sign')
    .default('0a6b943d-d2fb-46zc-a85e-0295c986cd9z'),
  MONGO_HOST: Joi.string().required()
    .description('Mongo DB host url'),
  MONGO_PORT: Joi.number()
    .default(27017),
  SESSION_SECRET: Joi.string()
    .description('Session Secret required to sign')
    .default('0a6bfeld-d3zb-23zc-a85e-029hjs86cd9z'),
  SESSION_DURATION: Joi.number()
    .description('Session Duration required to sign')
    .default(2),
}).unknown()
  .required();

const { error, value: envVars } = Joi.validate(process.env, envVarsSchema);
if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const config = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  mongooseDebug: envVars.MONGOOSE_DEBUG,
  jwtSecret: envVars.JWT_SECRET,
  sessionSecret: envVars.SESSION_SECRET,
  sessionDuration: envVars.SESSION_DURATION,
  mongo: {
    host: `${envVars.MONGO_HOST}-${envVars.NODE_ENV}`,
    port: envVars.MONGO_PORT
  }
};

module.exports = config;
