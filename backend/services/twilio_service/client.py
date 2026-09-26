import os
from twilio.rest import Client
import logging
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

class TwilioClientWrapper:
    def __init__(self):
        # Pull from environment variables. Do NOT expose to frontend.
        self.account_sid = os.getenv("TWILIO_ACCOUNT_SID")
        self.auth_token = os.getenv("TWILIO_AUTH_TOKEN")
        self.phone_number = os.getenv("TWILIO_PHONE_NUMBER")
        
        self.is_mock_mode = not (self.account_sid and self.auth_token)
        
        if self.is_mock_mode:
            logger.warning("Twilio credentials not found in environment. Running in DEMO/MOCK mode.")
            self.client = None
        else:
            self.client = Client(self.account_sid, self.auth_token)

    def get_client(self):
        return self.client
        
    def get_phone_number(self):
        return self.phone_number or "+15550000000"

twilio_wrapper = TwilioClientWrapper()
