const appID = require("ibmcloud-appid");
const WebAppStrategy = appID.WebAppStrategy;

const CALLBACK_URL = "/auth/callback";

/**
 * Get IBM App ID configuration
 * Tries to load from local config file or environment variables
 */
function getAppIDConfig() {
  let config;
  
  try {
    // Try loading local development config
    config = require('../../localdev-config.json');
    console.log('✅ Loaded App ID config from localdev-config.json');
  } catch (e) {
    // Check for Kubernetes environment
    if (process.env.APPID_SERVICE_BINDING) {
      config = JSON.parse(process.env.APPID_SERVICE_BINDING);
      config.redirectUri = process.env.REDIRECT_URI;
      console.log('✅ Loaded App ID config from Kubernetes environment');
    } 
    // Check for Cloud Foundry environment
    else if (process.env.VCAP_APPLICATION) {
      let vcapApplication = JSON.parse(process.env.VCAP_APPLICATION);
      config = {
        redirectUri: "https://" + vcapApplication["application_uris"][0] + CALLBACK_URL
      };
      console.log('✅ Loaded App ID config from Cloud Foundry environment');
    } else {
      console.error('❌ ERROR: No App ID configuration found!');
      throw new Error('App ID configuration not found');
    }
  }
  
  return config;
}

module.exports = {
  WebAppStrategy,
  CALLBACK_URL,
  getAppIDConfig
};
