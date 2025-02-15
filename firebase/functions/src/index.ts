// firebase deploy --only functions
// firebase deploy --only functions:createUserProfile
// firebase deploy --only functions:handleCoupleRequestAccepted
// firebase deploy --only functions:createApiKey
// firebase deploy --only functions:uploadBackground
// firebase deploy --only functions:getLatestBackground

import { createUserProfile } from './functions/auth/createUserProfile';
import { handleCoupleRequestAccepted } from './functions/couples/handleCoupleRequestAccepted';
import { createApiKey } from './functions/apiKeys/createApiKey';
import { uploadBackground } from './functions/backgrounds/uploadBackground';
import { getLatestBackground } from './functions/backgrounds/getLatestBackground';

export {
  createUserProfile,
  createApiKey,
  uploadBackground, 
  getLatestBackground,
  handleCoupleRequestAccepted,
};
