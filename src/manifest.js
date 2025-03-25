import { defineManifest } from '@crxjs/vite-plugin'
import packageData from '../package.json' assert { type: 'json' }

const isDev = process.env.NODE_ENV == 'development'

// Define your extension ID explicitly
const extensionId = 'IDmnhfoohciklpclngkhefijohdffidlif';

export default defineManifest({
  name: `${packageData.displayName || packageData.name}${isDev ? ` ➡️ Dev` : ''}`,
  description: packageData.description,
  version: packageData.version,
  manifest_version: 3,
  icons: {
    16: 'img/logo-16.png',
    32: 'img/logo-34.png',
    48: 'img/logo-48.png',
    128: 'img/logo-128.png',
  },
  action: {
    default_popup: 'popup.html',
    default_icon: 'img/logo-48.png',
  },
  options_page: 'options.html',
  devtools_page: 'devtools.html',
  background: {
    service_worker: 'src/background/index.js',
    type: 'module',
  },
  content_scripts: [
    {
      matches: ['http://*/*', 'https://*/*'],
      js: ['src/contentScript/index.js'],
    },
  ],
  side_panel: {
    default_path: 'sidepanel.html',
  },
  web_accessible_resources: [
    {
      resources: ['img/logo-16.png', 'img/logo-34.png', 'img/logo-48.png', 'img/logo-128.png'],
      matches: ['<all_urls>'],
    },
  ],
  key: "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...", // Add your extension's public key here if you have one
  permissions: [
    'sidePanel', 
    'storage', 
    'identity'  // For Google auth
  ],
  // Add OAuth2 configuration for Google Sign-In
  oauth2: {
    // The client ID is now correctly set:
    client_id: '1058551987296-8c69uue3t4uti9kiaqf637hq4cdp39ui.apps.googleusercontent.com',
    scopes: [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile'
    ]
  },
  // Add content security policy to allow Firebase connections
  content_security_policy: {
    extension_pages: "script-src 'self'; object-src 'self'; connect-src 'self' https://*.firebaseio.com https://*.googleapis.com https://accounts.google.com https://*.firebaseauth.com wss://*.firebaseio.com https://sprinty-fyp-default-rtdb.firebaseio.com https://sprinty-fyp.firebasestorage.app"
  }
})
