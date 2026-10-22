import time
import os
import sys
import subprocess
import requests
import psutil

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
if os.path.basename(SCRIPT_DIR) == ".agents":
    WORKSPACE_DIR = os.path.dirname(SCRIPT_DIR)
else:
    WORKSPACE_DIR = SCRIPT_DIR
BACKEND_DIR = os.path.join(WORKSPACE_DIR, "backend")
FRONTEND_DIR = os.path.join(WORKSPACE_DIR, "frontend")

BOT_TOKEN = "8793026393:AAFs5kpbPR93zP-xX1GYJkVuf1MUafUCz24"
ALLOWED_CHAT_ID = "5698696225"
BASE_URL = f"https://api.telegram.org/bot{BOT_TOKEN}"

def send_message(text: str, parse_mode: str = "Markdown") -> bool:
    try:
        payload = {"chat_id": ALLOWED_CHAT_ID, "text": text}
        if parse_mode:
            payload["parse_mode"] = parse_mode
        res = requests.post(f"{BASE_URL}/sendMessage", json=payload, timeout=15)
        # If markdown parsing fails on Telegram's side, fallback to plain text
        if not res.ok and parse_mode:
            payload.pop("parse_mode", None)
            res = requests.post(f"{BASE_URL}/sendMessage", json=payload, timeout=15)
        return res.ok
    except Exception as e:
        print(f"Error sending message: {e}")
        return False

def send_photo(photo_path: str, caption: str = "") -> bool:
    try:
        with open(photo_path, "rb") as f:
            res = requests.post(
                f"{BASE_URL}/sendPhoto",
                data={"chat_id": ALLOWED_CHAT_ID, "caption": caption},
                files={"photo": f},
                timeout=30
            )
        return res.ok
    except Exception as e:
        print(f"Error sending photo: {e}")
        return False

def capture_screen(output_path: str):
    # Ensure current thread is attached to active desktop station
    try:
        import ctypes
        user32 = ctypes.windll.user32
        desk = user32.OpenInputDesktop(0, False, 0x01FF)
        if desk:
            user32.SetThreadDesktop(desk)
    except Exception as e:
        print(f"OpenInputDesktop notice: {e}")

    # Primary method: PIL ImageGrab
    try:
        from PIL import ImageGrab
        img = ImageGrab.grab(all_screens=True)
        img.save(output_path)
        if os.path.exists(output_path) and os.path.getsize(output_path) > 0:
            return True, None
    except Exception as e1:
        # Fallback 1: MSS
        try:
            import mss
            with mss.MSS() as sct:
                sct.shot(output=output_path)
            if os.path.exists(output_path) and os.path.getsize(output_path) > 0:
                return True, None
        except Exception as e2:
            # Fallback 2: PowerShell Graphics
            try:
                ps_script = (
                    "Add-Type -AssemblyName System.Windows.Forms,System.Drawing; "
                    "$b = [System.Windows.Forms.Screen]::PrimaryScreen.Bounds; "
                    "$bmp = New-Object System.Drawing.Bitmap ($b.Width), ($b.Height); "
                    "$g = [System.Drawing.Graphics]::FromImage($bmp); "
                    f"$g.CopyFromScreen($b.Location, [System.Drawing.Point]::Empty, $b.Size); "
                    f"$bmp.Save('{output_path}', [System.Drawing.Imaging.ImageFormat]::Png); "
                    "$g.Dispose(); $bmp.Dispose();"
                )
                subprocess.run(["powershell", "-NoProfile", "-Command", ps_script], check=True, timeout=12)
                if os.path.exists(output_path) and os.path.getsize(output_path) > 0:
                    return True, None
            except Exception as e3:
                return False, f"PIL: {e1} | MSS: {e2} | PS: {e3}"

    return False, "Failed to capture desktop image"

def is_port_in_use(port: int) -> bool:
    try:
        for c in psutil.net_connections(kind='inet'):
            if c.laddr and c.laddr.port == port and c.status == 'LISTEN':
                return True
    except Exception:
        pass
    return False

def get_pids_on_port(port: int) -> set:
    pids = set()
    try:
        for c in psutil.net_connections(kind='inet'):
            if c.laddr and c.laddr.port == port and c.pid and c.pid > 0:
                pids.add(c.pid)
    except Exception:
        pass
    return pids

def terminate_servers():
    killed_count = 0
    target_ports = [5000, 5173]
    for port in target_ports:
        for pid in get_pids_on_port(port):
            try:
                p = psutil.Process(pid)
                for child in p.children(recursive=True):
                    try:
                        child.kill()
                    except Exception:
                        pass
                p.kill()
                killed_count += 1
            except Exception:
                subprocess.run(f"taskkill /F /T /PID {pid}", shell=True, capture_output=True)
                killed_count += 1

    # Also clean any node processes running in project folders
    for p in psutil.process_iter(['pid', 'name', 'cmdline']):
        try:
            name = (p.info['name'] or '').lower()
            cmdline = ' '.join(p.info['cmdline'] or []).lower()
            if 'node' in name and ('server.js' in cmdline or 'vite' in cmdline):
                p.kill()
                killed_count += 1
        except Exception:
            pass

    time.sleep(1.5)
    return killed_count

def deploy_servers():
    logs_dir = os.path.join(WORKSPACE_DIR, "logs")
    os.makedirs(logs_dir, exist_ok=True)

    if not is_port_in_use(5000):
        backend_log = open(os.path.join(logs_dir, "backend.log"), "a", encoding="utf-8")
        subprocess.Popen(
            "node server.js",
            cwd=BACKEND_DIR,
            shell=True,
            stdout=backend_log,
            stderr=backend_log,
            creationflags=subprocess.CREATE_NEW_PROCESS_GROUP
        )

    if not is_port_in_use(5173):
        frontend_log = open(os.path.join(logs_dir, "frontend.log"), "a", encoding="utf-8")
        subprocess.Popen(
            "npm run dev",
            cwd=FRONTEND_DIR,
            shell=True,
            stdout=frontend_log,
            stderr=frontend_log,
            creationflags=subprocess.CREATE_NEW_PROCESS_GROUP
        )

    # Poll up to 6 seconds for servers to be reachable
    for _ in range(6):
        time.sleep(1)
        if is_port_in_use(5000) and is_port_in_use(5173):
            break

    return is_port_in_use(5000), is_port_in_use(5173)

def get_system_status() -> str:
    cpu = psutil.cpu_percent(interval=0.5)
    ram = psutil.virtual_memory()
    disk = psutil.disk_usage(WORKSPACE_DIR)

    backend_live = is_port_in_use(5000)
    frontend_live = is_port_in_use(5173)

    return (
        "📊 *BuildLab System Status:*\n\n"
        f"• *CPU Usage:* `{cpu}%`\n"
        f"• *RAM Usage:* `{ram.percent}%` ({round(ram.used / (1024**3), 1)}GB / {round(ram.total / (1024**3), 1)}GB)\n"
        f"• *Disk Usage:* `{disk.percent}%` ({round(disk.free / (1024**3), 1)}GB free)\n\n"
        f"• *Backend (Port 5000):* `{'🟢 RUNNING' if backend_live else '🔴 STOPPED'}`\n"
        f"• *Frontend (Port 5173):* `{'🟢 RUNNING' if frontend_live else '🔴 STOPPED'}`\n\n"
        f"• *Workspace:* `CAPS_LATEST-V`\n"
        f"• *Time:* `{time.strftime('%Y-%m-%d %H:%M:%S')}`"
    )

def handle_command(text: str):
    raw_cmd = text.strip()

    if raw_cmd in ("/start", "/help"):
        help_msg = (
            "🤖 *Sofie — BuildLab Remote Assistant*\n\n"
            "*Available Remote Commands:*\n"
            "• `/status` — View PC stats & server ports\n"
            "• `/screenshot` — Capture live PC desktop\n"
            "• `/deploy` — Start Backend & Frontend servers\n"
            "• `/terminate` — Stop Backend & Frontend servers\n"
            "• `/restart` — Full restart of both servers\n"
            "• `/run <cmd>` — Run any terminal command on PC\n"
            "• `/git` — Check current git branch & status\n"
            "• `/ping` — Quick online check"
        )
        send_message(help_msg)

    elif raw_cmd == "/ping":
        send_message("🏓 *Pong!* PC is online, responsive, and listening.")

    elif raw_cmd == "/status":
        send_message(get_system_status())

    elif raw_cmd == "/screenshot":
        send_message("📸 Capturing PC screen...")
        screenshot_path = os.path.join(WORKSPACE_DIR, "pc_screen.png")
        success, err = capture_screen(screenshot_path)
        if success:
            send_photo(screenshot_path, "🖥️ Live PC Screen Capture")
            try:
                os.remove(screenshot_path)
            except Exception:
                pass
        else:
            send_message(f"❌ Could not capture screen: `{err}`\n_Note: If Windows is locked (Win+L), desktop capture may be blocked by OS security._")

    elif raw_cmd == "/terminate":
        send_message("🛑 Terminating backend and frontend servers...")
        terminate_servers()
        b_up = is_port_in_use(5000)
        f_up = is_port_in_use(5173)
        msg = (
            "🛑 *Servers Terminated:*\n"
            f"• *Backend (Port 5000):* `{'🔴 STOPPED' if not b_up else '⚠️ STILL ACTIVE'}`\n"
            f"• *Frontend (Port 5173):* `{'🔴 STOPPED' if not f_up else '⚠️ STILL ACTIVE'}`"
        )
        send_message(msg)

    elif raw_cmd == "/deploy":
        send_message("🚀 Deploying Backend & Frontend...")
        b_ok, f_ok = deploy_servers()
        msg = (
            "🚀 *Deployment Status:*\n"
            f"• *Backend:* `{'🟢 RUNNING (http://localhost:5000)' if b_ok else '🔴 FAILED TO START'}`\n"
            f"• *Frontend:* `{'🟢 RUNNING (http://localhost:5173)' if f_ok else '🔴 FAILED TO START'}`"
        )
        send_message(msg)

    elif raw_cmd == "/restart":
        send_message("🔄 Restarting servers (terminating then redeploying)...")
        terminate_servers()
        time.sleep(1.5)
        b_ok, f_ok = deploy_servers()
        msg = (
            "🔄 *Restart Completed:*\n"
            f"• *Backend:* `{'🟢 RUNNING (http://localhost:5000)' if b_ok else '🔴 FAILED TO START'}`\n"
            f"• *Frontend:* `{'🟢 RUNNING (http://localhost:5173)' if f_ok else '🔴 FAILED TO START'}`"
        )
        send_message(msg)

    elif raw_cmd.startswith("/run"):
        command_to_run = raw_cmd[4:].strip()
        if not command_to_run:
            send_message("⚠️ Please provide a command to run.\n*Example:* `/run git status` or `/run dir`")
            return

        send_message(f"⏳ *Running:* `{command_to_run}`...")
        try:
            res = subprocess.run(
                command_to_run,
                shell=True,
                cwd=WORKSPACE_DIR,
                capture_output=True,
                text=True,
                timeout=60
            )
            out = (res.stdout + res.stderr).strip()
            if not out:
                out = "(Command executed successfully with no output)"
            if len(out) > 3500:
                out = out[:3500] + "\n... [Output truncated]"

            icon = "✅" if res.returncode == 0 else "⚠️"
            reply = f"{icon} *Exit Code:* `{res.returncode}`\n*Command:* `{command_to_run}`\n```\n{out}\n```"
            send_message(reply)
        except subprocess.TimeoutExpired:
            send_message(f"⏱️ Command timed out after 60s: `{command_to_run}`")
        except Exception as e:
            send_message(f"❌ Execution error: `{e}`")

    elif raw_cmd == "/git":
        try:
            branch = subprocess.check_output(
                ["git", "branch", "--show-current"],
                cwd=WORKSPACE_DIR,
                text=True
            ).strip()
            status = subprocess.check_output(
                ["git", "status", "-s"],
                cwd=WORKSPACE_DIR,
                text=True,
                stderr=subprocess.STDOUT
            ).strip()
            log = subprocess.check_output(
                ["git", "log", "-1", "--oneline"],
                cwd=WORKSPACE_DIR,
                text=True
            ).strip()
            msg = (
                f"📂 *Git Info:*\n"
                f"• *Branch:* `{branch}`\n"
                f"• *Latest Commit:* `{log}`\n"
                f"• *Status:*\n```\n{status if status else 'Working tree clean'}\n```"
            )
            send_message(msg)
        except Exception as e:
            send_message(f"❌ Git error: `{e}`")

    else:
        send_message("❓ Unknown command. Type `/help` to see all available commands.")

def main():
    print("🤖 Sofie Telegram Bot listener started on your PC!")
    send_message(
        "🟢 *Sofie Bot is online and upgraded!*\n\n"
        "New commands active:\n"
        "• `/screenshot` — Live PC screen\n"
        "• `/restart` — Restart dev servers\n"
        "• `/deploy` — Start dev servers\n"
        "• `/terminate` — Stop dev servers\n"
        "• `/run <cmd>` — Run PC commands\n\n"
        "Type `/help` anytime for full menu."
    )

    offset = None
    while True:
        try:
            params = {"timeout": 30}
            if offset:
                params["offset"] = offset

            resp = requests.get(f"{BASE_URL}/getUpdates", params=params, timeout=35)
            data = resp.json()

            if data.get("ok"):
                for update in data.get("result", []):
                    offset = update["update_id"] + 1
                    msg = update.get("message")
                    if not msg:
                        continue

                    sender_id = str(msg.get("chat", {}).get("id"))
                    text = msg.get("text", "")

                    # Security: Only respond to authorized user
                    if sender_id == ALLOWED_CHAT_ID and text:
                        handle_command(text)

        except requests.exceptions.Timeout:
            continue
        except requests.exceptions.ConnectionError:
            time.sleep(5)
            continue
        except Exception as e:
            print(f"Error in poll loop: {e}")
            time.sleep(3)

if __name__ == "__main__":
    main()
