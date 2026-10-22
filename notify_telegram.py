#!/usr/bin/env python3
import os, sys, requests

BOT_TOKEN = os.getenv('TELEGRAM_TOKEN', '8793026393:AAFs5kpbPR93zP-xX1GYJkVuf1MUafUCz24')
CHAT_ID = os.getenv('TELEGRAM_CHAT_ID', '5698696225')

def send_notification(message: str) -> bool:
    """Send a text message via Telegram Bot API."""
    url = f'https://api.telegram.org/bot{BOT_TOKEN}/sendMessage'
    payload = {'chat_id': CHAT_ID, 'text': message, 'parse_mode': 'Markdown'}
    try:
        resp = requests.post(url, json=payload, timeout=10)
        data = resp.json()
        if data.get('ok'):
            print('Telegram notification sent successfully.')
            return True
        else:
            print(f"Failed to send notification: {data.get('description')}", file=sys.stderr)
            return False
    except requests.RequestException as e:
        print(f'Network error while sending Telegram notification: {e}', file=sys.stderr)
        return False

if __name__ == '__main__':
    if len(sys.argv) > 1:
        msg = ' '.join(sys.argv[1:])
        send_notification(msg)
    else:
        print('Usage: python notify_telegram.py "Your message"')
