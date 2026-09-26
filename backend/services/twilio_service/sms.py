from .client import twilio_wrapper
import logging

logger = logging.getLogger(__name__)

class SMSService:
    @staticmethod
    def send_message(to_number: str, message: str) -> bool:
        if twilio_wrapper.is_mock_mode:
            logger.info(f"[MOCK SMS] To: {to_number} | Message: {message}")
            return True
            
        try:
            msg = twilio_wrapper.client.messages.create(
                from_=twilio_wrapper.get_phone_number(),
                body=message,
                to=to_number
            )
            logger.info(f"SMS sent via Twilio: {msg.sid}")
            return True
        except Exception as e:
            logger.error(f"Failed to send SMS message: {e}")
            return False
