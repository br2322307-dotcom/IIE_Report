import os
import requests
from dotenv import load_dotenv

load_dotenv()

NINZA_API_KEY = os.environ.get("NINZA_API_KEY")

def test_sms():
    url = "https://ninzasms.in.net/auth/send_sms"
    headers = {
        "Authorization": NINZA_API_KEY,
        "Content-Type": "application/json"
    }
    payload = {
        "route": "sms",
        "sender_id": "15985",
        "message": "123456",
        "variables_values": "123456",
        "numbers": "919000000000"
    }
    
    print(f"Testing API Key: {NINZA_API_KEY[:10]}...")
    try:
        response = requests.post(url, json=payload, headers=headers)
        print("Status Code:", response.status_code)
        print("Response JSON:", response.text)
    except Exception as e:
        print("Error:", str(e))

if __name__ == "__main__":
    test_sms()
