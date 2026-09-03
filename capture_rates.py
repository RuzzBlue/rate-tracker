#!/usr/bin/env python3
"""
Banco BISA - Automated USDT Exchange Rate Scraper
Captures:
  - USDTs Compra
  - USDTs Venta
  - USDT/USD Compra
  - Supporting rates (Dólar, Euro, UFV, TRe)
Features:
  - Fresh browser instance on every run with strict cache bypass.
  - Page reload & cache-busting query parameter to avoid stale cached rates.
  - Dynamic detection of the marquee animation loop to capture USDT in full view.
  - Visual timestamp overlay on screenshot.
  - Appends structured records to rates.json.
  - Saves screenshot to screenshots/ folder.
  - Detailed logging to logs/capture.log.
"""

import os
import sys
import json
import time
import re
import logging
from datetime import datetime, timezone
from pathlib import Path
from playwright.sync_api import sync_playwright

# Setup directories relative to this script
SCRIPT_DIR = Path(__file__).resolve().parent
SCREENSHOTS_DIR = SCRIPT_DIR / "screenshots"
LOGS_DIR = SCRIPT_DIR / "logs"
DATA_FILE = SCRIPT_DIR / "rates.json"
DATA_FILE_JS = SCRIPT_DIR / "rates.js"

SCREENSHOTS_DIR.mkdir(parents=True, exist_ok=True)
LOGS_DIR.mkdir(parents=True, exist_ok=True)

# Setup logging
log_file = LOGS_DIR / "capture.log"
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler(log_file, encoding="utf-8"),
        logging.StreamHandler(sys.stdout)
    ]
)

def parse_decimal(text: str):
    """Safely parse numbers like '11,74' or '1' to float."""
    if not text:
        return None
    try:
        clean = text.strip().replace(",", ".")
        # Extract first valid numeric float
        match = re.search(r"[-+]?\d*\.?\d+", clean)
        if match:
            return float(match.group())
    except Exception as e:
        logging.warning(f"Could not parse numeric float from '{text}': {e}")
    return None

def capture_exchange_rates():
    now = datetime.now()
    iso_timestamp = now.astimezone().isoformat()
    date_str = now.strftime("%Y-%m-%d")
    time_str = now.strftime("%H:%M:%S")
    file_timestamp = now.strftime("%Y-%m-%d_%H-%M-%S")
    screenshot_filename = f"bisa_{file_timestamp}.png"
    screenshot_path = SCREENSHOTS_DIR / screenshot_filename

    logging.info("=" * 60)
    logging.info(f"Starting exchange rate capture at {date_str} {time_str}")

    with sync_playwright() as p:
        # Launch a brand new browser instance each time (no persistent state)
        logging.info("Launching fresh Chromium instance with cache-busting headers...")
        browser = p.chromium.launch(
            headless=True,
            args=[
                "--no-sandbox",
                "--disable-dev-shm-usage",
                "--disable-gpu",
                "--disable-blink-features=AutomationControlled"
            ]
        )

        context = browser.new_context(
            viewport={"width": 1440, "height": 900},
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
            ignore_https_errors=True,
            extra_http_headers={
                "Cache-Control": "no-cache, no-store, must-revalidate",
                "Pragma": "no-cache",
                "Expires": "0"
            }
        )

        page = context.new_page()

        target_url = "https://www.bisa.com/home"
        logging.info(f"Navigating to {target_url}...")

        # Load page with retry if needed
        max_retries = 3
        loaded = False
        for attempt in range(1, max_retries + 1):
            try:
                response = page.goto(target_url, wait_until="domcontentloaded", timeout=60000)
                status = response.status if response else "Unknown"
                logging.info(f"Attempt {attempt}: Page loaded with HTTP status {status}")
                if status == 200:
                    loaded = True
                    break
            except Exception as e:
                logging.warning(f"Attempt {attempt} failed: {e}. Retrying in 5 seconds...")
                time.sleep(5)

        if not loaded:
            logging.error("Failed to load https://www.bisa.com/home after retries.")
            browser.close()
            sys.exit(1)

        # Force a hard reload to ensure fresh live data as requested
        logging.info("Performing hard reload to guarantee latest exchange rates...")
        try:
            page.reload(wait_until="domcontentloaded", timeout=45000)
        except Exception as e:
            logging.warning(f"Reload notice: {e}")

        # Ensure marquee container is present
        try:
            page.wait_for_selector(".marquee-container", timeout=20000)
            page.wait_for_timeout(1000)
        except Exception as e:
            logging.error("Could not find .marquee-container on page!")
            browser.close()
            sys.exit(1)

        # Extract all exchange rate items from DOM
        logging.info("Extracting exchange rates from marquee elements...")
        extracted_data = page.evaluate("""() => {
            const spans = Array.from(document.querySelectorAll('.marquee-text span'));
            const results = {};
            spans.forEach(s => {
                const b = s.querySelector('b');
                if (b) {
                    const label = b.innerText.trim();
                    const full = s.innerText.trim();
                    // Remove label from full text to get raw value
                    const value = full.replace(label, '').trim();
                    results[label] = value;
                }
            });
            const marqueeTextEl = document.querySelector('.marquee-text');
            return {
                items: results,
                full_text: marqueeTextEl ? marqueeTextEl.innerText.trim() : ''
            };
        }""")

        items = extracted_data.get("items", {})
        full_text = extracted_data.get("full_text", "")
        logging.info(f"Full marquee text captured: {full_text}")

        # Map specific rates requested by user
        usdts_compra_raw = items.get("USDTs Compra", "")
        usdts_venta_raw = items.get("USDTs Venta", "")
        usdt_usd_compra_raw = items.get("USDT/USD Compra", "")

        # Also map additional currencies if available
        dolar_compra_raw = items.get("Dólar Compra", "")
        dolar_venta_raw = items.get("Dólar Venta", "")
        euro_compra_raw = items.get("Euro Compra", "")
        euro_venta_raw = items.get("Euro Venta", "")
        ufv_raw = items.get("UFV", "")

        parsed_rates = {
            "usdts_compra": parse_decimal(usdts_compra_raw),
            "usdts_venta": parse_decimal(usdts_venta_raw),
            "usdt_usd_compra": parse_decimal(usdt_usd_compra_raw),
            "dolar_compra": parse_decimal(dolar_compra_raw),
            "dolar_venta": parse_decimal(dolar_venta_raw),
            "euro_compra": parse_decimal(euro_compra_raw),
            "euro_venta": parse_decimal(euro_venta_raw),
            "ufv": parse_decimal(ufv_raw)
        }

        logging.info(f"Parsed USDTs Compra: {parsed_rates['usdts_compra']} (raw: '{usdts_compra_raw}')")
        logging.info(f"Parsed USDTs Venta:  {parsed_rates['usdts_venta']} (raw: '{usdts_venta_raw}')")
        logging.info(f"Parsed USDT/USD:     {parsed_rates['usdt_usd_compra']} (raw: '{usdt_usd_compra_raw}')")

        # Wait for USDT elements to scroll into view in the marquee ribbon
        logging.info("Waiting for USDT rates to loop into visible viewport inside the marquee...")
        start_wait = time.time()
        is_visible = False

        while time.time() - start_wait < 45:
            visibility = page.evaluate("""() => {
                const container = document.querySelector('.marquee-container');
                if (!container) return { visible: false };
                const containerRect = container.getBoundingClientRect();
                
                const spans = Array.from(document.querySelectorAll('.marquee-text span'));
                const usdtSpan = spans.find(s => s.innerText.includes('USDTs Compra'));
                const usdtUsdSpan = spans.find(s => s.innerText.includes('USDT/USD Compra'));
                
                if (!usdtSpan || !usdtUsdSpan) return { visible: false };
                
                const r1 = usdtSpan.getBoundingClientRect();
                const r2 = usdtUsdSpan.getBoundingClientRect();
                
                // Visible when both start and end of the USDT block are within container bounds
                const visible = (r1.left >= 30 && r2.right <= (containerRect.width - 30));
                return {
                    visible: visible,
                    left: r1.left,
                    right: r2.right
                };
            }""")

            if visibility.get("visible"):
                logging.info(f"USDT items are perfectly visible! (left={visibility.get('left'):.1f}, right={visibility.get('right'):.1f})")
                is_visible = True
                # Pause animation so the screenshot is sharp and not motion-blurred
                page.evaluate("""() => {
                    const text = document.querySelector('.marquee-text');
                    if (text) text.style.animationPlayState = 'paused';
                }""")
                break
            time.sleep(0.2)

        if not is_visible:
            logging.warning("Ribbon loop wait timed out; centering USDT rates into visible area directly...")
            page.evaluate("""() => {
                const text = document.querySelector('.marquee-text');
                const spans = Array.from(document.querySelectorAll('.marquee-text span'));
                const usdtSpan = spans.find(s => s.innerText.includes('USDTs Compra'));
                if (text && usdtSpan) {
                    text.style.animation = 'none';
                    const offset = usdtSpan.offsetLeft;
                    text.style.transform = `translateX(-${offset - 250}px)`;
                }
            }""")

        # Inject visible timestamp overlay onto the page as requested
        display_timestamp = f"{date_str} {time_str}"
        logging.info(f"Injecting visual timestamp badge: 'Captured: {display_timestamp}'")
        page.evaluate(f"""() => {{
            const badge = document.createElement('div');
            badge.id = 'bisa-capture-timestamp-overlay';
            badge.style.position = 'fixed';
            badge.style.bottom = '12px';
            badge.style.right = '12px';
            badge.style.backgroundColor = 'rgba(10, 25, 47, 0.92)';
            badge.style.color = '#00f2fe';
            badge.style.border = '1px solid #4facfe';
            badge.style.padding = '8px 16px';
            badge.style.borderRadius = '8px';
            badge.style.fontFamily = 'system-ui, -apple-system, Segoe UI, Roboto, monospace';
            badge.style.fontSize = '14px';
            badge.style.fontWeight = '700';
            badge.style.boxShadow = '0 8px 24px rgba(0,0,0,0.4)';
            badge.style.zIndex = '9999999';
            badge.innerText = 'Captured: {display_timestamp}';
            document.body.appendChild(badge);
        }}""")

        # Scroll to show the marquee ribbon prominently
        page.evaluate("() => document.querySelector('.marquee-container')?.scrollIntoView({block: 'center'})")
        page.wait_for_timeout(600)

        # Capture screenshot
        logging.info(f"Saving screenshot to {screenshot_path}...")
        page.screenshot(path=str(screenshot_path))
        logging.info("Screenshot successfully captured!")

        browser.close()

    # Prepare structured JSON entry
    relative_screenshot_path = f"screenshots/{screenshot_filename}"
    record = {
        "id": file_timestamp,
        "captured_at": iso_timestamp,
        "date": date_str,
        "time": time_str,
        "rates": parsed_rates,
        "raw": {
            "usdts_compra": usdts_compra_raw,
            "usdts_venta": usdts_venta_raw,
            "usdt_usd_compra": usdt_usd_compra_raw,
            "all_items": items,
            "marquee_full_text": full_text
        },
        "screenshot": relative_screenshot_path
    }

    # Atomic read-append-write to rates.json
    existing_records = []
    if DATA_FILE.exists():
        try:
            with open(DATA_FILE, "r", encoding="utf-8") as f:
                content = f.read().strip()
                if content:
                    existing_records = json.loads(content)
                    if not isinstance(existing_records, list):
                        existing_records = [existing_records]
        except Exception as e:
            logging.error(f"Error reading existing rates.json: {e}. Starting fresh list.")
            existing_records = []

    existing_records.append(record)

    # Write atomically via temp file
    temp_file = DATA_FILE.with_suffix(".tmp")
    with open(temp_file, "w", encoding="utf-8") as f:
        json.dump(existing_records, f, indent=2, ensure_ascii=False)
    temp_file.replace(DATA_FILE)

    # Write companion JS file for zero-CORS browser access
    try:
        temp_js = DATA_FILE_JS.with_suffix(".tmp")
        with open(temp_js, "w", encoding="utf-8") as f:
            f.write("window.BISA_RATES_DATA = " + json.dumps(existing_records, indent=2, ensure_ascii=False) + ";\n")
        temp_js.replace(DATA_FILE_JS)
    except Exception as e:
        logging.warning(f"Failed to write rates.js: {e}")

    logging.info(f"Successfully recorded rate to {DATA_FILE} and {DATA_FILE_JS}. Total records: {len(existing_records)}")
    logging.info("Capture completed successfully.")
    print("\n--- CAPTURE SUMMARY ---")
    print(f"Date/Time:       {date_str} {time_str}")
    print(f"USDTs Compra:    {parsed_rates['usdts_compra']} (Bs)")
    print(f"USDTs Venta:     {parsed_rates['usdts_venta']} (Bs)")
    print(f"USDT/USD Compra: {parsed_rates['usdt_usd_compra']}")
    print(f"Screenshot:      {relative_screenshot_path}")
    print(f"Database File:   {DATA_FILE}")

if __name__ == "__main__":
    capture_exchange_rates()
