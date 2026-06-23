import os
import random
import time
import requests
from flask import Blueprint, request, jsonify
from database import otp_collection

auth_bp = Blueprint("auth_bp", __name__)

NINZA_API_KEY = os.environ.get("NINZA_API_KEY")

@auth_bp.route("/send-otp", methods=["POST"])
def send_otp():
    data = request.get_json()
    if not data or "mobile" not in data:
        return jsonify({"error": "Mobile number is required"}), 400
    
    mobile = data["mobile"]
    is_test_mode = data.get("isTestMode", False)

    # Format mobile number to include 91 if it's 10 digits for SMS API ONLY
    if mobile.startswith("+91"):
        sms_mobile = mobile[1:]
    elif mobile.startswith("91") and len(mobile) == 12:
        sms_mobile = mobile
    elif len(mobile) == 10:
        sms_mobile = "91" + mobile
    else:
        sms_mobile = mobile

    # Rate limiting: Check if an OTP was requested recently (within 60 seconds)
    existing_record = otp_collection.find_one({"mobile": mobile})
    current_time = int(time.time())
    if existing_record:
        last_requested = existing_record.get("requested_at", 0)
        if current_time - last_requested < 60:
            return jsonify({"error": "Please wait 60 seconds before requesting another OTP"}), 429
    
    # Generate 6-digit OTP (Fixed for Test Mode)
    otp = "123456" if is_test_mode else f"{random.randint(0, 999999):06d}"
    
    # Save OTP to database with expiration timestamp (e.g., 5 minutes)
    expiration = current_time + 300
    otp_collection.update_one(
        {"mobile": mobile},
        {"$set": {"otp": otp, "expiration": expiration, "requested_at": current_time}},
        upsert=True
    )
    
    # If in test mode, return success immediately without calling API
    if is_test_mode:
        return jsonify({"success": True, "message": f"Test Mode: OTP is {otp}"}), 200
        
    # Call NinzaSMS API securely
    url = "https://ninzasms.in.net/auth/send_sms"
    headers = {
        "Authorization": NINZA_API_KEY,
        "Content-Type": "application/json"
    }
    payload = {
        "route": "sms",
        "sender_id": "15985",
        "message": "123456",
        "variables_values": otp,
        "numbers": sms_mobile
    }
    
    try:
        response = requests.post(url, json=payload, headers=headers)
        response_data = response.json()
        
        if response.status_code == 200 and response_data.get("status") == 1:
            return jsonify({"success": True, "message": "OTP sent successfully"}), 200
        else:
            return jsonify({"error": "Failed to send OTP via SMS provider", "details": response_data}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500

from database import otp_collection, workers_collection, contractors_collection
from datetime import datetime

# ... (omitting top part, let's just do a proper replace on verify_otp) ...

@auth_bp.route("/verify-otp", methods=["POST"])
def verify_otp():
    data = request.get_json()
    if not data or "mobile" not in data or "enteredOtp" not in data:
        return jsonify({"error": "Mobile and enteredOtp are required"}), 400
        
    mobile = data["mobile"]
    entered_otp = data["enteredOtp"]
    
    record = otp_collection.find_one({"mobile": mobile})
    
    if not record:
        return jsonify({"success": False, "message": "OTP not found for this mobile"}), 404
        
    if int(time.time()) > record.get("expiration", 0):
        return jsonify({"success": False, "message": "OTP has expired"}), 400
        
    if record.get("otp") == entered_otp:
        # OTP matched, clean it up
        otp_collection.delete_one({"mobile": mobile})
        
        # Step 1 & 2: Check User Profile in both collections
        user = workers_collection.find_one({"phone_number": mobile}, {"_id": 0})
        role = "worker"
        
        if not user:
            user = contractors_collection.find_one({"phone_number": mobile}, {"_id": 0})
            role = "contractor" if user else None
            
        if user:
            # Check Blocked or Deleted
            is_blocked = user.get("is_blocked", False)
            is_deleted = user.get("is_deleted", False)
            
            if is_blocked:
                return jsonify({"success": True, "exists": True, "blocked": True, "deleted": is_deleted, "message": "Your account has been blocked by Admin."}), 403
            
            if is_deleted:
                return jsonify({"success": True, "exists": True, "blocked": False, "deleted": True, "message": "Your account is deleted."}), 403

            # Update last_login
            now_iso = datetime.utcnow().isoformat()
            if role == "worker":
                workers_collection.update_one({"phone_number": mobile}, {"$set": {"last_login": now_iso}})
            else:
                contractors_collection.update_one({"phone_number": mobile}, {"$set": {"last_login": now_iso}})
            
            return jsonify({
                "success": True,
                "exists": True,
                "blocked": False,
                "deleted": False,
                "role": role,
                "profile_completed": user.get("profile_completed", True),
                "user": {
                    "name": user.get("name", ""),
                    "photo_url": user.get("profile_photo_url", ""),
                    "location": user.get("location", ""),
                    "skills": user.get("categories", []),
                    "about": user.get("about", ""),
                    "experience": user.get("experience", "")
                }
            }), 200
        else:
            # User does not exist, prompt registration
            return jsonify({
                "success": True, 
                "exists": False,
                "blocked": False,
                "deleted": False
            }), 200
    else:
        return jsonify({"success": False, "message": "Invalid OTP"}), 400

@auth_bp.route("/delete-account", methods=["POST"])
def delete_account():
    data = request.get_json()
    if not data or "mobile" not in data or "role" not in data:
        return jsonify({"success": False, "message": "Mobile and role required"}), 400
        
    mobile = data["mobile"]
    role = data["role"]
    
    update_data = {
        "is_deleted": True,
        "deleted_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat()
    }
    
    if role == "worker":
        result = workers_collection.update_one({"phone_number": mobile}, {"$set": update_data})
    else:
        result = contractors_collection.update_one({"phone_number": mobile}, {"$set": update_data})
        
    if result.matched_count == 0:
        return jsonify({"success": False, "message": "User not found"}), 404
        
    return jsonify({"success": True, "message": "Account deleted successfully"})
