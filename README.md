# TerraVerify: AI-Satellite Carbon Credit Protocol

> Don't Trust. Verify from Space.

TerraVerify is a decentralized carbon offset protocol built on **Solana** that bridges the gap between digital assets and ecological reality. By integrating continuous **ESA Sentinel-2 satellite AI telemetry** with **Solana Token-2022 Transfer Hooks**, TerraVerify introduces real-time oracle verification and automatic on-chain credit revocation when deforestation occurs.

---

## 🚀 Key Features

* **Continuous AI Audits:** Our Python pipeline analyzes near-infrared and red bands from Copernicus Sentinel-2 satellite scans to calculate forest canopy index (NDVI) in real-time.
* **On-Chain Oracle Accounts:** Every registered project has its own public, queryable Solana account containing the latest ecological ratings and validation stamps.
* **Token-2022 Auto-Revocation:** Utilizes Solana's newest Token Extensions (Transfer Hooks) to automatically freeze token transfers and halt marketplace trading if the Oracle reports canopy damage.
* **Corporate LCA Calculator:** Built-in Product Lifecycle Assessment (LCA) simulator that helps corporations calculate and retire precise emissions offsets.
* **In-App Devnet Faucet:** Header balances are scanned dynamically; low-balance wallets get an immediate background Devnet SOL airdrop button to simplify testing.
* **Verification QR Codes:** Retired credit certificates automatically render dynamic QR codes, allowing auditors to scan and view ledger validation proofs on Solana Explorer.

---

## 📦 Repository Structure

```bash
terraverify/
├── frontend/                 # Next.js 16.2 (Turbopack) Web Application
│   ├── src/
│   │   ├── app/              # Router, Layouts, & Global Style overrides
│   │   ├── components/       # Header, Interactive Leaflet GIS maps, Map overlays
│   │   └── api/              # Telemetry web bridge (polling state)
│   └── package.json
└── satellite-pipeline/       # Python Satellite Ingestion & Simulation Engine
    ├── push_telemetry.py     # Sentinel-2 NDVI score calculator & emulator
    └── requirements.txt
```

---

## 🛠️ Setup & Running

### 1. Web Application (Frontend)

Prerequisites: Node.js (v18+).

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Run the local development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your web browser. 

*Make sure your Phantom Wallet default Solana network setting is set to **Devnet**.*

### 2. Telemetry simulator (Python Engine)

Prerequisites: Python 3.8+.

```bash
# Navigate to the pipeline directory
cd satellite-pipeline

# Install telemetry requirements
pip install -r requirements.txt

# Run the satellite telemetry pipeline simulator
python push_telemetry.py
```

---

## 📡 The Demonstration Flow (For Pitching/Testing)

Follow this 3-step script to showcase the live Web3 + AI functionality:

1. **The Baseline:** Load the web dashboard. Click the **Explorer** tab and choose **Borneo Peatlands**. Open the **View On-Chain Oracle Report** to show the live radar-sweeping JSON diagnostics panel (NDVI: `0.621`, Status: `Verified`).
2. **Deforestation Detection:** In your terminal running the Python script, select **Option 1 (Simulate Deforestation Alert)**. 
3. **Smart Freeze Verification:** Instantly look back at your browser. You will see the Borneo card flash, canopy drop to `58.4%`, and status turn to **Suspended/Revoked**. 
4. **On-Chain Registry:** Connect your Phantom wallet. Grab a test SOL using the navbar faucet. Navigate to the **Marketplace** or **Retire** tabs to buy or burn credits. View the transaction signature on Solana Explorer or scan the dynamic certificate QR code using your phone camera!

---

## 🛡️ License

TerraVerify is licensed under the MIT License.
