import sys
import requests

BOT_TOKEN = "8793026393:AAFs5kpbPR93zP-xX1GYJkVuf1MUafUCz24"
CHAT_ID = "5698696225"

def send_telegram_alert(message: str):
    url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage"
    payload = {
        "chat_id": CHAT_ID,
        "text": message,
        "parse_mode": "Markdown"
    }
    try:
        response = requests.post(url, json=payload, timeout=10)
        res_json = response.json()
        if res_json.get("ok"):
            print("[Telegram] Notification sent successfully!")
            return True
        else:
            # Fallback to plain text if markdown parsing failed
            payload.pop("parse_mode", None)
            fallback_res = requests.post(url, json=payload, timeout=10).json()
            if fallback_res.get("ok"):
                print("[Telegram] Notification sent successfully (plain text fallback)!")
                return True
            print(f"[Telegram] Failed: {res_json}")
            return False
    except Exception as e:
        print(f"[Telegram] Error: {e}")
        return False

if __name__ == "__main__":
    msg = sys.argv[1] if len(sys.argv) > 1 else "✅ BuildLab task finished successfully!"
    send_telegram_alert(msg)
