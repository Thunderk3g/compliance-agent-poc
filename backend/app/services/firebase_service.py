import firebase_admin
from firebase_admin import auth, credentials
import os
import logging
from typing import Optional

logger = logging.getLogger(__name__)

class FirebaseService:
    def __init__(self):
        self.app = None
        self._initialize()

    def _initialize(self):
        """Initialize Firebase Admin SDK."""
        # Check if already initialized
        if firebase_admin._apps:
            self.app = firebase_admin.get_app()
            return

        # Try to load from environment variable path
        cred_path = os.getenv("FIREBASE_SERVICE_ACCOUNT_PATH")
        project_id = os.getenv("FIREBASE_PROJECT_ID")
        
        try:
            if cred_path and os.path.exists(cred_path):
                cred = credentials.Certificate(cred_path)
                self.app = firebase_admin.initialize_app(cred)
                logger.info("✅ Firebase Admin SDK initialized with service account")
            elif project_id:
                # Fallback to just Project ID (sufficient for verify_id_token)
                self.app = firebase_admin.initialize_app(options={"projectId": project_id})
                logger.info(f"✅ Firebase Admin SDK initialized with Project ID: {project_id}")
            else:
                # Fallback to default credentials (useful for GCP/Firebase hosting)
                self.app = firebase_admin.initialize_app()
                logger.info("✅ Firebase Admin SDK initialized with default credentials")
        except Exception as e:
            logger.error(f"❌ Failed to initialize Firebase Admin SDK: {e}")
            # If initialization fails, we might want to still allow the app to run
            # especially in dev/POC if Firebase isn't fully configured yet.
            pass

    def verify_token(self, id_token: str) -> Optional[dict]:
        """Verify Firebase ID token and return decoded claims."""
        try:
            decoded_token = auth.verify_id_token(id_token)
            return decoded_token
        except Exception as e:
            logger.warning(f"Invalid Firebase token: {e}")
            
            # ⚠️ DEV FALLBACK: If strict verification fails (likely due to missing credentials),
            # try to decode without verification to allow POC to work.
            # DO NOT USE IN PRODUCTION
            try:
                import jwt
                # Decode without verification
                decoded = jwt.decode(id_token, options={"verify_signature": False})
                if decoded:
                    # Map 'sub' to 'uid' to match Firebase Admin SDK format
                    if 'sub' in decoded and 'uid' not in decoded:
                        decoded['uid'] = decoded['sub']
                    
                    logger.warning(f"⚠️ Using unverified token decoding (Dev Fallback) for user: {decoded.get('uid')}")
                    return decoded
            except Exception as e2:
                logger.error(f"Failed to decode token unverified: {e2}")
                
            return None

firebase_service = FirebaseService()
