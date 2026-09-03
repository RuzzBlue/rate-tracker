# Banco BISA USDT Transparency Portal & Rate Tracker

An automated system that tracks daily Bolivian USDT exchange rates (`USDTs Compra`, `USDTs Venta`, and `USDT/USD Compra`) from [Banco BISA](https://www.bisa.com/home), maintains an audited historical database in JSON, captures high-resolution photographic proof with on-screen timestamp watermarks, and presents an interactive analytics dashboard for your customers.

---

## 🌟 Key Features

1. **Automated Daily Execution at 11:00 AM**:
   Runs via Windows Task Scheduler. If your computer is off or asleep at 11:00 AM, it triggers automatically as soon as the PC wakes up (`StartWhenAvailable`).
2. **100% Isolated Environment**:
   Playwright and headless Chromium run inside WSL2 Ubuntu (`~/.virtualenvs/bisa-tracker`). Zero packages or dependencies are installed on your Windows host.
3. **Fresh Browser & Anti-Stale Cache Protection**:
   Spawns a clean incognito session every time, sends HTTP cache-busting headers, and executes a forced page reload to eliminate cached rates from prior days.
4. **Photographic Proof & Marquee Loop Detection**:
   Waits dynamically for the 40-second animated ribbon to bring USDT rates into the visible viewport, pauses animation to avoid motion blur, injects a timestamp watermark, and saves full-resolution screenshots.
5. **Interactive Customer Dashboard (`index.html`)**:
   - **KPI Metric Widgets**: Live rates, $\pm$ difference vs. previous capture, spread margin (Bs & %), and automation status.
   - **Tab 1 (Dynamic Analytics Chart)**: Interactive Chart.js graph with range selectors (7D, 30D, 90D, All), series toggles, and direct export to **PNG image**, **Excel (.xlsx)**, and **CSV**.
   - **Tab 2 (Historical Records & Proofs)**: Searchable table with click-to-view photographic proof modal (full high-res screenshot lightbox) and **Excel (.xlsx) / TXT / CSV** export.
   - **Tab 3 (Transparency & Methodology)**: Detailed customer-facing explanation of data authenticity, anti-caching protocols, and verification steps.
6. **Zero-CORS Double-Click & GitHub Pages Compatibility**:
   Generates both `rates.json` and companion `rates.js`. You can open `index.html` locally by double-clicking it in Windows Explorer without needing any local web server, and it deploys directly to GitHub Pages.
7. **1-Click GitHub Pages Publishing**:
   Includes `push_to_github.bat` to push updates and screenshots to GitHub Pages with a single click whenever you wish to refresh client-facing metrics.

---

## 📂 Project Structure

```
bisa-rate-tracker/
├── index.html                # The Main Customer & Analytics Dashboard
├── styles.css                # Premium modern financial dark UI theme
├── app.js                    # Chart.js, KPI calculations, exports, and lightbox modal logic
├── rates.json                # Structured historical database
├── rates.js                  # Zero-CORS companion script for double-click opening
├── capture_rates.py          # Python Playwright scraper (runs in WSL)
├── push_to_github.bat        # 1-Click script to push updates to GitHub Pages
├── run.bat                   # Windows batch launcher (with console output)
├── run_silent.vbs            # Silent background runner (used by Windows Task Scheduler)
├── setup_task.bat            # Installs / updates the daily 11:00 AM scheduled task
├── remove_task.bat           # Removes the scheduled task
├── screenshots/              # Timestamped photographic proofs
│   └── bisa_YYYY-MM-DD_HH-mm-ss.png
├── logs/                     # Execution logs
│   └── capture.log
└── README.md                 # This documentation
```

---

## 🚀 How to Use

### 1. View the Dashboard Locally
Simply **double-click `index.html`** in Windows Explorer. It opens instantly in your default browser.

### 2. Run Capture Manually
- **With terminal output**: Double-click `run.bat`.
- **Silently in background**: Double-click `run_silent.vbs`.

### 3. Publish to GitHub Pages
Whenever you want to update your customer-facing portal:
1. Double-click `push_to_github.bat`.
2. It commits all new screenshots, updated `rates.json`, and `rates.js`, and pushes to GitHub.
3. GitHub Pages will update your live site within 1–2 minutes!

---

## 🌐 Deploying to GitHub Pages (Initial 2-Minute Setup)

1. **Create a GitHub Repository**:
   - Go to [github.com/new](https://github.com/new) and create a repository (e.g. `bisa-rate-tracker`).
2. **Link Your Local Folder**:
   Open PowerShell in `c:\Users\RuzzBlue\Documents\Dev\bisa-rate-tracker\` and run:
   ```powershell
   git init
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/bisa-rate-tracker.git
   ```
3. **Push Files**:
   Double-click `push_to_github.bat`.
4. **Enable GitHub Pages**:
   - In your GitHub repo, go to **Settings > Pages**.
   - Under **Build and deployment > Source**, select **Deploy from a branch**.
   - Select branch **`main`** and folder **`/(root)`**, then click **Save**.
   - Your dashboard will be live at:
     `https://YOUR_USERNAME.github.io/bisa-rate-tracker/`

---

## 💡 Why Local Scraping + GitHub Pages is the Best Architecture

- **Akamai Bot Protection**: Banco BISA uses Akamai edge security, which blocks datacenter IP addresses (like GitHub Actions runners or AWS servers) with HTTP 503 errors.
- **Residential Reliability**: By running the scraper locally on your Windows machine via isolated WSL, it uses your residential/office connection, which Akamai trusts 100%.
- **Zero Ongoing Cost**: Hosting on GitHub Pages is completely free with high global availability, CDN caching, and SSL certificates included out of the box.
