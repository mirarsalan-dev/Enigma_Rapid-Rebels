from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
import uuid
from pydantic import BaseModel
from schemas import AppointmentCreate, Appointment, CommunicationMessage
from services.twilio_service.whatsapp import WhatsAppService
from services.twilio_service.sms import SMSService
from services.twilio_service.voice import VoiceService
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/communications", tags=["Communications"])

mock_appointments: Dict[str, Appointment] = {}

class InitiateContactRequest(BaseModel):
    exchange_id: str
    source_company_id: str
    target_company_id: str
    target_phone_number: str
    message: str
    channel: str # 'whatsapp', 'sms', 'voice'

@router.post("/initiate")
async def initiate_contact(req: InitiateContactRequest):
    """
    Step 3 & 4: Company A initiates contact, Company B receives message.
    """
    success = False
    if req.channel == 'whatsapp':
        success = WhatsAppService.send_message(req.target_phone_number, req.message)
    elif req.channel == 'sms':
        success = SMSService.send_message(req.target_phone_number, req.message)
    elif req.channel == 'voice':
        # Use the TwiML URL provided by the user for speech recognition
        success = VoiceService.initiate_call(req.target_phone_number, "https://webhooks.twilio.com/v1/Voice/Template/voice_speech_recognition")
    else:
        raise HTTPException(status_code=400, detail="Invalid communication channel")

    if not success:
        raise HTTPException(status_code=500, detail="Failed to send message via Twilio layer")

    return {"status": "success", "message": f"Message sent to {req.target_company_id} via {req.channel}"}


@router.post("/appointments", response_model=Appointment)
async def create_appointment(app_req: AppointmentCreate):
    """
    Step 6 & 7: Appointment/pickup slot created and Exchange status updated.
    """
    app_id = f"apt_{uuid.uuid4().hex[:8]}"
    
    new_app = Appointment(
        **app_req.dict(),
        appointment_id=app_id
    )
    
    # Simulate a communication log of the agreement
    new_app.communication_history.append(CommunicationMessage(
        sender="System",
        message=f"Appointment created for {app_req.date} at {app_req.time} located at {app_req.location}"
    ))

    # Trigger Twilio SMS Appointment Reminder 
    # (assuming we had the real target phone number from the companies DB; using a placeholder/default for demo)
    reminder_message = f"sms_appointment_reminders: You have a SYMBIO pickup scheduled on {app_req.date} at {app_req.time}."
    # We use a default env target number or log it if not available
    import os
    test_target_number = os.getenv("TWILIO_TEST_TARGET_NUMBER", "+919653203776") 
    SMSService.send_message(test_target_number, reminder_message)

    mock_appointments[app_id] = new_app
    return new_app


@router.get("/appointments/{appointment_id}", response_model=Appointment)
async def get_appointment(appointment_id: str):
    if appointment_id not in mock_appointments:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return mock_appointments[appointment_id]


class ReplyRequest(BaseModel):
    sender: str
    message: str

@router.post("/appointments/{appointment_id}/reply")
async def add_communication(appointment_id: str, reply: ReplyRequest):
    """
    Step 5: Parties communicate
    """
    if appointment_id not in mock_appointments:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    msg = CommunicationMessage(sender=reply.sender, message=reply.message)
    mock_appointments[appointment_id].communication_history.append(msg)
    
    return mock_appointments[appointment_id]
