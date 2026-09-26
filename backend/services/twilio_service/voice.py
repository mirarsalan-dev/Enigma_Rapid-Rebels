from .client import twilio_wrapper
import logging

logger = logging.getLogger(__name__)

class VoiceService:
    @staticmethod
    def initiate_call(to_number: str, twiml_url: str) -> bool:
        """
        Initiates a voice call using Twilio.
        twiml_url should point to a TwiML document or endpoint that returns TwiML 
        to dictate what happens when the call connects (e.g., `<Response><Say>Hello</Say></Response>`).
        """
        if twilio_wrapper.is_mock_mode:
            logger.info(f"[MOCK VOICE CALL] To: {to_number} | TwiML URL: {twiml_url}")
            return True
            
        try:
            call = twilio_wrapper.client.calls.create(
                to=to_number,
                from_=twilio_wrapper.get_phone_number(),
                url=twiml_url
            )
            logger.info(f"Voice call initiated via Twilio: {call.sid}")
            return True
        except Exception as e:
            logger.error(f"Failed to initiate voice call: {e}")
            return False
