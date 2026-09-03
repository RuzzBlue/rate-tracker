/**
 * Banco BISA • USDT Capture Portal
 * Features:
 *  - Light mode by default + Dark mode toggle (persisted in localStorage)
 *  - Bilingual i18n support: Spanish & English (detects browser language first, persisted in localStorage)
 *  - 2 Tabs: Dynamic Analytics Chart & Historical Records Table
 *  - Responsive Chart.js graph with time range filters & series toggles
 *  - Photographic audit modal viewer & direct download
 *  - XLSX, CSV, and PNG exports
 */

let allRatesData = [];
let filteredRatesData = [];
let ratesChart = null;
let currentRange = 'all';

// Translation dictionary
const I18N = {
  es: {
    appTitle: "Banco BISA • USDT Capture Portal",
    appSubtitle: "Captura diaria automatizada de tipos de cambio oficiales de USDT en Bolivia y registro fotográfico auditado",
    statusActive: "Automatización Diaria Activa",
    statusLoading: "Cargando datos...",
    lastCapturePrefix: "Última captura:",
    justNow: "Justo ahora",
    minutesAgo: "hace {m}m",
    hoursAgo: "hace {h}h",
    daysAgo: "hace {d}d",

    // KPIs
    kpiCompraTitle: "USDTs Compra",
    kpiCompraTag: "Banco Compra",
    kpiVentaTitle: "USDTs Venta",
    kpiVentaTag: "Banco Venta",
    kpiSpreadTitle: "Spread de Mercado",
    kpiSpreadTag: "Venta - Compra",
    kpiRatioTitle: "Ratio USDT / USD",
    kpiRatioTag: "Paridad Cripto",
    vsPrevious: "vs captura previa",
    spreadMargin: "Margen de spread",
    auditedSnapshots: "Capturas auditadas",
    initialRecord: "Inicial",

    // Tabs
    tabChart: "Gráfico de Análisis Dinámico",
    tabTable: "Historial de Registros y Pruebas",

    // Toolbar
    range7d: "7 Días",
    range30d: "30 Días",
    range90d: "90 Días",
    rangeAll: "Todo el Historial",
    btnChartPng: "Descargar Gráfico (PNG)",
    btnChartXlsx: "Exportar Datos (XLSX)",
    btnChartCsv: "CSV",
    btnTableXlsx: "Exportar Tabla (XLSX)",
    btnTableCsv: "Exportar Tabla (TXT/CSV)",

    // Series toggles
    toggleCompra: "USDTs Compra (Banco Compra)",
    toggleVenta: "USDTs Venta (Banco Venta)",
    toggleSpread: "Spread (Margen)",
    toggleDolar: "Dólar Venta Oficial (Referencia)",

    // Table
    searchPlaceholder: "Buscar por fecha, tipo de cambio o ID...",
    thDateTime: "Fecha y Hora (BOT)",
    thCompra: "USDTs Compra",
    thVenta: "USDTs Venta",
    thSpread: "Spread",
    thRatio: "USDT / USD",
    thDelta: "Cambio Diario (Δ)",
    thProof: "Prueba Fotográfica",
    btnViewProof: "Ver Prueba",
    noRecords: "No se encontraron registros coincidentes.",

    // Bottom documentation bar
    docBarTitle: "¿Deseas conocer cómo funciona la arquitectura de captura?",
    docBarDesc: "Revisa la documentación detallada sobre cómo se capturan los datos sin caché, comandos para ejecutar y guía para GitHub Pages.",
    docBarBtn: "Ver Documentación y Guía →",

    // Modal
    modalTitle: "Prueba Fotográfica • Banco BISA",
    modalCaption: "Capturado: {time} | Ticker Oficial Banco BISA",
    modalDownload: "Descargar Captura Original",

    // Footer
    footerText: "Datos capturados automáticamente desde Banco BISA S.A. | Almacenados en JSON estructurado con prueba fotográfica.",
    themeLight: "Claro",
    themeDark: "Oscuro"
  },
  en: {
    appTitle: "Banco BISA • USDT Capture Portal",
    appSubtitle: "Automated daily capture of official Bolivian USDT exchange rates & photographic audit trail",
    statusActive: "Daily Automation Active",
    statusLoading: "Loading data...",
    lastCapturePrefix: "Last capture:",
    justNow: "Just now",
    minutesAgo: "{m}m ago",
    hoursAgo: "{h}h ago",
    daysAgo: "{d}d ago",

    // KPIs
    kpiCompraTitle: "USDTs Compra",
    kpiCompraTag: "Bank Buys",
    kpiVentaTitle: "USDTs Venta",
    kpiVentaTag: "Bank Sells",
    kpiSpreadTitle: "Market Spread",
    kpiSpreadTag: "Venta - Compra",
    kpiRatioTitle: "USDT / USD Ratio",
    kpiRatioTag: "Crypto Parity",
    vsPrevious: "vs previous capture",
    spreadMargin: "Spread margin",
    auditedSnapshots: "Audited snapshots",
    initialRecord: "Initial",

    // Tabs
    tabChart: "Dynamic Analytics Chart",
    tabTable: "Historical Records & Proofs",

    // Toolbar
    range7d: "7 Days",
    range30d: "30 Days",
    range90d: "90 Days",
    rangeAll: "All Time",
    btnChartPng: "Download Chart (PNG)",
    btnChartXlsx: "Export Chart Data (XLSX)",
    btnChartCsv: "CSV",
    btnTableXlsx: "Export Table (XLSX)",
    btnTableCsv: "Export Table (TXT/CSV)",

    // Series toggles
    toggleCompra: "USDTs Compra (Bank Buys)",
    toggleVenta: "USDTs Venta (Bank Sells)",
    toggleSpread: "Spread (Margin)",
    toggleDolar: "Official Dólar Venta (Benchmark)",

    // Table
    searchPlaceholder: "Search by date, rate, or id...",
    thDateTime: "Date & Time (BOT)",
    thCompra: "USDTs Compra",
    thVenta: "USDTs Venta",
    thSpread: "Spread",
    thRatio: "USDT / USD",
    thDelta: "Daily Change (Δ)",
    thProof: "Audit Proof",
    btnViewProof: "View Proof",
    noRecords: "No matching records found.",

    // Bottom documentation bar
    docBarTitle: "Want to know how the capture architecture works?",
    docBarDesc: "Review detailed documentation on anti-cache capture, execution commands, and GitHub Pages setup.",
    docBarBtn: "View Documentation & Guide →",

    // Modal
    modalTitle: "Photographic Proof • Banco BISA",
    modalCaption: "Captured at: {time} | Official Banco BISA Ticker",
    modalDownload: "Download Original Screenshot",

    // Footer
    footerText: "Data sourced automatically from Banco BISA S.A. | Stored in structured JSON with photographic audit proof.",
    themeLight: "Light",
    themeDark: "Dark"
  }
};

// Current state
let currentLang = 'es';
let currentTheme = 'light';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  initLanguage();
  initTheme();
  initTabs();
  initModal();
  initData();
  setupEventListeners();
});

/**
 * Detect browser language first or use stored preference
 */
function initLanguage() {
  const stored = localStorage.getItem('bisa_lang');
  if (stored && (stored === 'es' || stored === 'en')) {
    currentLang = stored;
  } else {
    // Browser language detection
    const browserLang = (navigator.language || navigator.userLanguage || '').toLowerCase();
    currentLang = browserLang.startsWith('es') ? 'es' : 'en';
  }
  applyTranslations();
  updateLanguageUI();
}

function setLanguage(lang) {
  if (lang !== 'es' && lang !== 'en') return;
  currentLang = lang;
  localStorage.setItem('bisa_lang', lang);
  applyTranslations();
  updateLanguageUI();
  updateKPIs();
  updateSystemStatus();
  renderChart();
  renderTable(document.getElementById('table-search')?.value || '');
}

function updateLanguageUI() {
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === currentLang);
  });
}

function applyTranslations() {
  const t = I18N[currentLang];
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (t[key]) {
      el.textContent = t[key];
    }
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (t[key]) {
      el.placeholder = t[key];
    }
  });

  document.title = t.appTitle;
}

/**
 * Theme Management (Light mode default)
 */
function initTheme() {
  const stored = localStorage.getItem('bisa_theme');
  // Default to light mode as requested
  currentTheme = (stored === 'dark') ? 'dark' : 'light';
  applyTheme();
}

function toggleTheme() {
  currentTheme = (currentTheme === 'light') ? 'dark' : 'light';
  localStorage.setItem('bisa_theme', currentTheme);
  applyTheme();
}

function applyTheme() {
  document.documentElement.setAttribute('data-theme', currentTheme);
  const themeLabel = document.getElementById('theme-toggle-label');
  const t = I18N[currentLang];
  if (themeLabel) {
    themeLabel.textContent = (currentTheme === 'light') ? t.themeLight : t.themeDark;
  }
  const themeIcon = document.getElementById('theme-toggle-icon');
  if (themeIcon) {
    if (currentTheme === 'light') {
      themeIcon.innerHTML = `
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="5"/>
          <line x1="12" y1="1" x2="12" y2="3"/>
          <line x1="12" y1="21" x2="12" y2="23"/>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
          <line x1="1" y1="12" x2="3" y2="12"/>
          <line x1="21" y1="12" x2="23" y2="12"/>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
        </svg>
      `;
    } else {
      themeIcon.innerHTML = `
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
      `;
    }
  }

  // Update chart theme colors if chart exists
  if (ratesChart) {
    renderChart();
  }
}

/**
 * Load data
 */
async function initData() {
  try {
    if (window.BISA_RATES_DATA && Array.isArray(window.BISA_RATES_DATA)) {
      allRatesData = cleanAndSortData(window.BISA_RATES_DATA);
    } else {
      const response = await fetch('rates.json', { cache: 'no-store' });
      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
      const json = await response.json();
      allRatesData = cleanAndSortData(json);
    }

    if (allRatesData.length === 0) {
      showEmptyState();
      return;
    }

    updateKPIs();
    applyRangeFilter(currentRange);
    renderTable();
    updateSystemStatus();
  } catch (err) {
    console.error('Error loading rate data:', err);
    showErrorState(err.message);
  }
}

function cleanAndSortData(records) {
  return records
    .filter(r => r && r.rates && r.rates.usdts_compra != null)
    .sort((a, b) => new Date(a.captured_at || a.date).getTime() - new Date(b.captured_at || b.date).getTime());
}

/**
 * KPI Calculations
 */
function updateKPIs() {
  if (allRatesData.length === 0) return;
  const t = I18N[currentLang];

  const latest = allRatesData[allRatesData.length - 1];
  const prev = allRatesData.length > 1 ? allRatesData[allRatesData.length - 2] : null;

  const compra = latest.rates.usdts_compra;
  const venta = latest.rates.usdts_venta;
  const usdtUsd = latest.rates.usdt_usd_compra || 1.0;
  const spread = (venta != null && compra != null) ? (venta - compra) : null;
  const spreadPct = (spread != null && compra) ? ((spread / compra) * 100) : null;

  // Compra
  document.getElementById('kpi-compra').textContent = formatDecimal(compra);
  if (prev && prev.rates.usdts_compra != null) {
    const delta = compra - prev.rates.usdts_compra;
    const pct = ((delta / prev.rates.usdts_compra) * 100);
    renderDeltaBadge('kpi-compra-badge', delta, pct);
  } else {
    document.getElementById('kpi-compra-badge').textContent = t.initialRecord;
    document.getElementById('kpi-compra-badge').className = 'badge badge-neutral';
  }

  // Venta
  document.getElementById('kpi-venta').textContent = formatDecimal(venta);
  if (prev && prev.rates.usdts_venta != null) {
    const delta = venta - prev.rates.usdts_venta;
    const pct = ((delta / prev.rates.usdts_venta) * 100);
    renderDeltaBadge('kpi-venta-badge', delta, pct);
  } else {
    document.getElementById('kpi-venta-badge').textContent = t.initialRecord;
    document.getElementById('kpi-venta-badge').className = 'badge badge-neutral';
  }

  // Spread
  if (spread != null) {
    document.getElementById('kpi-spread').textContent = spread.toFixed(2);
    document.getElementById('kpi-spread-pct').textContent = `${spreadPct.toFixed(2)}%`;
  }

  // USDT/USD & records
  document.getElementById('kpi-usdt-usd').textContent = formatDecimal(usdtUsd, 2);
  document.getElementById('kpi-total-captures').textContent = `${allRatesData.length}`;
}

function renderDeltaBadge(elementId, delta, pct) {
  const el = document.getElementById(elementId);
  const sign = delta > 0 ? '+' : '';
  const formatted = `${sign}${delta.toFixed(2)} (${sign}${pct.toFixed(2)}%)`;

  el.textContent = formatted;
  if (Math.abs(delta) < 0.001) {
    el.className = 'badge badge-neutral';
    el.textContent = '0.00 (0.0%)';
  } else if (delta > 0) {
    el.className = 'badge badge-up';
  } else {
    el.className = 'badge badge-down';
  }
}

/**
 * Status indicator
 */
function updateSystemStatus() {
  if (allRatesData.length === 0) return;
  const t = I18N[currentLang];

  const latest = allRatesData[allRatesData.length - 1];
  const timeEl = document.getElementById('last-capture-time');
  const captureDate = new Date(latest.captured_at || `${latest.date}T${latest.time}`);

  const now = new Date();
  const diffMinutes = Math.floor((now - captureDate) / (1000 * 60));
  let relativeStr = '';

  if (diffMinutes < 1) {
    relativeStr = t.justNow;
  } else if (diffMinutes < 60) {
    relativeStr = t.minutesAgo.replace('{m}', diffMinutes);
  } else if (diffMinutes < 1440) {
    const hours = Math.floor(diffMinutes / 60);
    relativeStr = t.hoursAgo.replace('{h}', hours);
  } else {
    const days = Math.floor(diffMinutes / 1440);
    relativeStr = t.daysAgo.replace('{d}', days);
  }

  timeEl.textContent = `${t.lastCapturePrefix} ${latest.date} ${latest.time} (${relativeStr})`;
}

/**
 * Range filter
 */
function applyRangeFilter(range) {
  currentRange = range;
  if (range === 'all' || allRatesData.length === 0) {
    filteredRatesData = [...allRatesData];
  } else {
    const daysMap = { '7d': 7, '30d': 30, '90d': 90 };
    const days = daysMap[range] || 30;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    filteredRatesData = allRatesData.filter(r => {
      const d = new Date(r.captured_at || r.date);
      return d >= cutoff;
    });

    if (filteredRatesData.length === 0) {
      filteredRatesData = [...allRatesData];
    }
  }

  renderChart();
}

/**
 * Chart rendering
 */
function renderChart() {
  const canvas = document.getElementById('ratesChart');
  if (!canvas) return;
  const t = I18N[currentLang];

  const ctx = canvas.getContext('2d');
  const labels = filteredRatesData.map(r => `${r.date} ${r.time?.substring(0, 5) || ''}`);

  const compraData = filteredRatesData.map(r => r.rates.usdts_compra);
  const ventaData = filteredRatesData.map(r => r.rates.usdts_venta);
  const spreadData = filteredRatesData.map(r => {
    const c = r.rates.usdts_compra;
    const v = r.rates.usdts_venta;
    return (v != null && c != null) ? +(v - c).toFixed(3) : null;
  });
  const dolarData = filteredRatesData.map(r => r.rates.dolar_venta);

  const showCompra = document.getElementById('toggle-compra').checked;
  const showVenta = document.getElementById('toggle-venta').checked;
  const showSpread = document.getElementById('toggle-spread').checked;
  const showDolar = document.getElementById('toggle-dolar').checked;

  const isDark = (currentTheme === 'dark');
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.06)';
  const tickColor = isDark ? '#9ca3af' : '#64748b';

  const datasets = [];

  if (showCompra) {
    datasets.push({
      label: t.toggleCompra,
      data: compraData,
      borderColor: isDark ? '#06b6d4' : '#0284c7',
      backgroundColor: isDark ? 'rgba(6, 182, 212, 0.08)' : 'rgba(2, 132, 199, 0.08)',
      borderWidth: 2.5,
      fill: true,
      tension: 0.3,
      pointRadius: filteredRatesData.length > 50 ? 2 : 4,
      pointHoverRadius: 6,
      pointBackgroundColor: isDark ? '#06b6d4' : '#0284c7'
    });
  }

  if (showVenta) {
    datasets.push({
      label: t.toggleVenta,
      data: ventaData,
      borderColor: isDark ? '#10b981' : '#059669',
      backgroundColor: isDark ? 'rgba(16, 185, 129, 0.08)' : 'rgba(5, 150, 105, 0.08)',
      borderWidth: 2.5,
      fill: true,
      tension: 0.3,
      pointRadius: filteredRatesData.length > 50 ? 2 : 4,
      pointHoverRadius: 6,
      pointBackgroundColor: isDark ? '#10b981' : '#059669'
    });
  }

  if (showSpread) {
    datasets.push({
      label: t.toggleSpread,
      data: spreadData,
      borderColor: isDark ? '#a855f7' : '#7c3aed',
      backgroundColor: 'transparent',
      borderWidth: 2,
      borderDash: [5, 5],
      tension: 0.3,
      pointRadius: 3,
      yAxisID: 'ySpread'
    });
  }

  if (showDolar) {
    datasets.push({
      label: t.toggleDolar,
      data: dolarData,
      borderColor: isDark ? '#f59e0b' : '#d97706',
      backgroundColor: 'transparent',
      borderWidth: 1.8,
      tension: 0.2,
      pointRadius: 3
    });
  }

  if (ratesChart) {
    ratesChart.destroy();
  }

  ratesChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: datasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: {
          left: 10,
          right: 15,
          top: 10,
          bottom: 10
        }
      },
      interaction: {
        mode: 'index',
        intersect: false,
      },
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: {
            color: tickColor,
            font: { family: 'Inter', size: 12 },
            boxWidth: 12,
            usePointStyle: true
          }
        },
        tooltip: {
          backgroundColor: isDark ? 'rgba(10, 15, 29, 0.95)' : 'rgba(15, 23, 42, 0.95)',
          titleColor: '#ffffff',
          bodyColor: '#e5e7eb',
          borderColor: 'rgba(255, 255, 255, 0.1)',
          borderWidth: 1,
          padding: 12,
          boxPadding: 6,
          usePointStyle: true,
          callbacks: {
            label: function(context) {
              let label = context.dataset.label || '';
              if (label) label += ': ';
              if (context.parsed.y !== null) {
                label += context.parsed.y.toFixed(2) + ' BOB';
              }
              return label;
            }
          }
        }
      },
      scales: {
        x: {
          grid: { color: gridColor },
          ticks: { color: tickColor, font: { family: 'Inter', size: 11 } }
        },
        y: {
          position: 'left',
          afterFit: (axis) => { axis.width = 75; },
          grid: { color: gridColor },
          ticks: {
            color: tickColor,
            font: { family: 'JetBrains Mono', size: 11 },
            callback: (val) => `${Number(val).toFixed(2)} Bs`
          }
        },
        ySpread: {
          position: 'right',
          afterFit: (axis) => { axis.width = 75; },
          display: showSpread,
          grid: { drawOnChartArea: false },
          ticks: {
            color: isDark ? '#a855f7' : '#7c3aed',
            font: { family: 'JetBrains Mono', size: 11 },
            callback: (val) => `${Number(val).toFixed(2)} Bs`
          }
        }
      }
    }
  });
}

/**
 * Historical Table rendering
 */
function renderTable(searchTerm = '') {
  const tbody = document.getElementById('table-body');
  if (!tbody) return;
  const t = I18N[currentLang];

  const term = searchTerm.trim().toLowerCase();
  const records = [...allRatesData].reverse().filter(r => {
    if (!term) return true;
    const str = `${r.date} ${r.time} ${r.id} ${r.rates?.usdts_compra} ${r.rates?.usdts_venta}`.toLowerCase();
    return str.includes(term);
  });

  if (records.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:32px; color:var(--text-dim);">${t.noRecords}</td></tr>`;
    return;
  }

  tbody.innerHTML = records.map((r) => {
    const compra = r.rates?.usdts_compra;
    const venta = r.rates?.usdts_venta;
    const usdtUsd = r.rates?.usdt_usd_compra ?? 1;
    const spread = (venta != null && compra != null) ? (venta - compra).toFixed(2) : '--';
    
    const origIdx = allRatesData.findIndex(item => item.id === r.id);
    let deltaHtml = '<span class="badge badge-neutral">--</span>';
    if (origIdx > 0) {
      const prev = allRatesData[origIdx - 1];
      if (prev && prev.rates?.usdts_venta != null && venta != null) {
        const diff = venta - prev.rates.usdts_venta;
        const sign = diff > 0 ? '+' : '';
        if (Math.abs(diff) < 0.001) {
          deltaHtml = '<span class="badge badge-neutral">0.00</span>';
        } else if (diff > 0) {
          deltaHtml = `<span class="badge badge-up">${sign}${diff.toFixed(2)}</span>`;
        } else {
          deltaHtml = `<span class="badge badge-down">${diff.toFixed(2)}</span>`;
        }
      }
    }

    const screenshotPath = r.screenshot || '';

    return `
      <tr>
        <td><strong>${r.date}</strong> <span class="text-dim">${r.time || ''}</span></td>
        <td class="mono-num" style="color: var(--accent-cyan); font-weight: 700;">${formatDecimal(compra)} Bs</td>
        <td class="mono-num" style="color: var(--accent-emerald); font-weight: 700;">${formatDecimal(venta)} Bs</td>
        <td class="mono-num" style="color: var(--accent-purple); font-weight: 700;">${spread} Bs</td>
        <td class="mono-num">${formatDecimal(usdtUsd)}</td>
        <td>${deltaHtml}</td>
        <td>
          ${screenshotPath ? `
            <button class="btn-proof" onclick="openScreenshotModal('${screenshotPath}', '${r.date} ${r.time}')">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
              </svg>
              ${t.btnViewProof}
            </button>
          ` : '<span class="text-dim">--</span>'}
        </td>
      </tr>
    `;
  }).join('');
}

/**
 * Event listeners
 */
function setupEventListeners() {
  // Language buttons
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      setLanguage(e.currentTarget.dataset.lang);
    });
  });

  // Theme toggle button
  document.getElementById('btn-theme-toggle')?.addEventListener('click', toggleTheme);

  // Range buttons
  document.querySelectorAll('#range-selector .btn-pill').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('#range-selector .btn-pill').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      applyRangeFilter(e.target.dataset.range);
    });
  });

  // Series checkboxes
  ['toggle-compra', 'toggle-venta', 'toggle-spread', 'toggle-dolar'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('change', renderChart);
  });

  // Table search input
  const searchInput = document.getElementById('table-search');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => renderTable(e.target.value));
  }

  // Export Chart PNG
  document.getElementById('btn-export-chart-png')?.addEventListener('click', () => {
    if (!ratesChart) return;
    const link = document.createElement('a');
    link.download = `bisa_usdt_chart_${new Date().toISOString().slice(0,10)}.png`;
    link.href = ratesChart.toBase64Image('image/png', 1.0);
    link.click();
  });

  // Export Chart XLSX
  document.getElementById('btn-export-chart-xlsx')?.addEventListener('click', () => {
    exportDataToXLSX(filteredRatesData, `bisa_usdt_analytics_${new Date().toISOString().slice(0,10)}.xlsx`);
  });

  // Export Chart CSV
  document.getElementById('btn-export-chart-csv')?.addEventListener('click', () => {
    exportDataToCSV(filteredRatesData, `bisa_usdt_analytics_${new Date().toISOString().slice(0,10)}.csv`);
  });

  // Export Table XLSX
  document.getElementById('btn-export-table-xlsx')?.addEventListener('click', () => {
    exportDataToXLSX(allRatesData, `bisa_usdt_full_history_${new Date().toISOString().slice(0,10)}.xlsx`);
  });

  // Export Table CSV
  document.getElementById('btn-export-table-csv')?.addEventListener('click', () => {
    exportDataToCSV(allRatesData, `bisa_usdt_full_history_${new Date().toISOString().slice(0,10)}.csv`);
  });
}

/**
 * Tabs
 */
function initTabs() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      const target = document.getElementById(btn.dataset.tab);
      if (target) target.classList.add('active');

      if (btn.dataset.tab === 'tab-chart' && ratesChart) {
        ratesChart.resize();
      }
    });
  });
}

/**
 * Modal Lightbox
 */
function initModal() {
  const modal = document.getElementById('screenshot-modal');
  const closeBtn = document.getElementById('modal-close-btn');

  if (closeBtn) {
    closeBtn.addEventListener('click', () => modal.classList.remove('active'));
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('active');
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal?.classList.contains('active')) {
      modal.classList.remove('active');
    }
  });
}

window.openScreenshotModal = function(imagePath, caption) {
  const modal = document.getElementById('screenshot-modal');
  const img = document.getElementById('modal-img');
  const meta = document.getElementById('modal-meta');
  const downloadBtn = document.getElementById('modal-download-btn');
  const t = I18N[currentLang];

  if (modal && img) {
    img.src = imagePath;
    meta.textContent = t.modalCaption.replace('{time}', caption);
    downloadBtn.href = imagePath;
    downloadBtn.download = imagePath.split('/').pop() || 'bisa_screenshot.png';
    modal.classList.add('active');
  }
};

/**
 * Exports
 */
function exportDataToXLSX(dataArray, filename) {
  if (typeof XLSX === 'undefined') {
    alert('SheetJS library is still loading. Please try again in a moment.');
    return;
  }

  const rows = dataArray.map(r => {
    const compra = r.rates?.usdts_compra;
    const venta = r.rates?.usdts_venta;
    const spread = (venta != null && compra != null) ? +(venta - compra).toFixed(4) : null;
    return {
      'Date': r.date,
      'Time': r.time,
      'USDT Compra (BOB)': compra,
      'USDT Venta (BOB)': venta,
      'Spread (BOB)': spread,
      'USDT/USD Compra': r.rates?.usdt_usd_compra ?? 1,
      'Dolar Compra': r.rates?.dolar_compra,
      'Dolar Venta': r.rates?.dolar_venta,
      'Euro Compra': r.rates?.euro_compra,
      'Euro Venta': r.rates?.euro_venta,
      'UFV': r.rates?.ufv,
      'Audit Screenshot': r.screenshot,
      'Timestamp ISO': r.captured_at
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'USDT Exchange Rates');

  XLSX.writeFile(workbook, filename);
}

function exportDataToCSV(dataArray, filename) {
  const headers = ['Date', 'Time', 'USDTs Compra', 'USDTs Venta', 'Spread', 'USDT/USD', 'Screenshot'];
  const rows = dataArray.map(r => {
    const compra = r.rates?.usdts_compra ?? '';
    const venta = r.rates?.usdts_venta ?? '';
    const spread = (venta && compra) ? (venta - compra).toFixed(2) : '';
    return [
      r.date,
      r.time,
      compra,
      venta,
      spread,
      r.rates?.usdt_usd_compra ?? 1,
      r.screenshot || ''
    ].join(',');
  });

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function formatDecimal(val, decimals = 2) {
  if (val == null || isNaN(val)) return '--';
  return Number(val).toFixed(decimals);
}

function showEmptyState() {
  const t = I18N[currentLang];
  document.getElementById('table-body').innerHTML = `
    <tr><td colspan="7" style="text-align:center; padding:32px; color:var(--text-dim);">${t.noRecords}</td></tr>
  `;
}

function showErrorState(msg) {
  document.getElementById('table-body').innerHTML = `
    <tr><td colspan="7" style="text-align:center; padding:32px; color:#e11d48;">Failed to load data: ${msg}</td></tr>
  `;
}
