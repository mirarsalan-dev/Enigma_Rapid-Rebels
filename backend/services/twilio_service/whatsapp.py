from .client import twilio_wrapper
import logging

logger = logging.getLogger(__name__)

class WhatsAppService:
    @staticmethod
    def send_message(to_number: str, message: str) -> bool:
        if twilio_wrapper.is_mock_mode:
            logger.info(f"[MOCK WHATSAPP] To: whatsapp:{to_number} | Message: {message}")
            return True
            
        try:
            msg = twilio_wrapper.client.messages.create(
                from_=f"whatsapp:{twilio_wrapper.get_phone_number()}",
                body=message,
                to=f"whatsapp:{to_number}"
            )
            logger.info(f"WhatsApp sent via Twilio: {msg.sid}")
            return True
        except Exception as e:
            logger.error(f"Failed to send WhatsApp message: {e}")
            return False
