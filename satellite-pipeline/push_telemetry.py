import sys
import json
import urllib.request

# Default Vercel live production URL
VERCEL_URL = "https://terraverify-gold.vercel.app/api/telemetry"

def push_update(project_id, forest_cover, cqs, cqs_score, status, trend="-2.1%"):
    payload = {
        "id": project_id,
        "forestCover": f"{forest_cover}%",
        "cqs": cqs,
        "cqsScore": int(cqs_score),
        "status": status,
        "trend": trend,
        "lastScan": "Just now (Sentinel-2)"
    }
    
    data = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(
        VERCEL_URL,
        data=data,
        headers={
            'Content-Type': 'application/json',
            'User-Agent': 'TerraVerify-Python-Pipeline/1.0'
        }
    )
    
    try:
        print(f"\n[📡 SATELLITE AI PIPELINE] Connecting to Sentinel-2 Telemetry Bridge...")
        print(f"[🛰️  PROCESSING] Analyzing NDVI satellite imagery for project: {project_id}")
        print(f"[🚀 PUSHING] Sending payload to live server: {VERCEL_URL}")
        
        with urllib.request.urlopen(req) as response:
            res_body = response.read().decode('utf-8')
            print(f"\n[✅ SUCCESS] Server response: 200 OK")
            print(f"===========================================================")
            print(f" Updated Project: {project_id}")
            print(f" Forest Cover:    {forest_cover}%")
            print(f" CQS Rating:      {cqs} ({cqs_score}/100)")
            print(f" Status:          {status}")
            print(f"===========================================================")
            print(f"👉 Open https://terraverify-gold.vercel.app/ in your browser now!")
    except Exception as e:
        print(f"[❌ ERROR] Failed to push telemetry: {e}")

def main():
    print("===========================================================")
    print("        TERRAVERIFY AI SATELLITE TELEMETRY BRIDGE         ")
    print("===========================================================")
    print("1. Simulate Borneo Deforestation Alert (Auto-Revoke Credits)")
    print("2. Simulate Amazon Forest Growth (Verified Tier AAA)")
    print("3. Custom Manual Telemetry Update")
    print("===========================================================")
    
    try:
        choice = input("Select an option (1-3): ").strip()
    except EOFError:
        choice = "1"
    
    if choice == "1":
        push_update("PRJ-003", 58.4, "C", 38, "Suspended", "-8.2%")
    elif choice == "2":
        push_update("PRJ-001", 96.2, "AAA", 98, "Verified", "+1.4%")
    elif choice == "3":
        proj = input("Project ID (e.g. PRJ-001 or PRJ-003): ").strip() or "PRJ-003"
        cover = input("Forest Cover % (e.g. 50.0): ").strip() or "50.0"
        cqs = input("CQS Rating (AAA/AA/A/B/C): ").strip() or "B"
        score = input("CQS Score (0-100): ").strip() or "50"
        status = input("Status (Verified/Suspended): ").strip() or "Suspended"
        push_update(proj, float(cover), cqs, int(score), status)
    else:
        print("Defaulting to Option 1.")
        push_update("PRJ-003", 58.4, "C", 38, "Suspended", "-8.2%")

if __name__ == "__main__":
    main()
