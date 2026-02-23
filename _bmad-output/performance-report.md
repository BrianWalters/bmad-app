# Performance Report — localhost:4000

**Date:** 2026-02-23  
**URL:** http://localhost:4000/  
**Environment:** Local development (no CPU or network throttling)  
**Tool:** Chrome DevTools Performance Trace

---

## Core Web Vitals Summary

| Metric | Value | Rating |
|--------|-------|--------|
| **LCP** (Largest Contentful Paint) | **58 ms** | 🟢 Good (< 2500 ms) |
| **CLS** (Cumulative Layout Shift) | **0.00** | 🟢 Good (< 0.1) |

---

## LCP Breakdown

The LCP element is an **H1 text node** (not a network-loaded resource like an image).

| Phase | Duration | % of LCP |
|-------|----------|----------|
| Time to First Byte (TTFB) | 8 ms | 14.5% |
| Element Render Delay | 50 ms | 85.5% |

Since the LCP element is text, there are only 2 phases (no resource load or resource render delay). The render delay accounts for most of the LCP time but is still negligible in absolute terms.

---

## Document Latency

| Check | Result |
|-------|--------|
| No redirects | ✅ Passed |
| Server responded quickly (< 600 ms) | ✅ Passed |
| Compression applied | ❌ Failed |

**Details:**
- Document request total duration: **24 ms**
- Download time: **0.7 ms**
- Main thread processing: **16 ms**
- Protocol: HTTP/1.1

**Finding:** The HTML document response does **not** have compression (gzip/brotli) enabled. While the impact is negligible on localhost, this should be enabled for production to reduce transfer size (~2.2 kB estimated savings).

---

## Render-Blocking Resources

Two render-blocking requests were identified:

| Resource | Duration | Protocol |
|----------|----------|----------|
| Google Fonts CSS (`fonts.googleapis.com/css2?family=Merriweather...`) | 8 ms | h2 |
| `/styles.css` (local) | 8 ms | http/1.1 |

**Estimated impact on LCP:** 0 ms (not currently a bottleneck).

Both stylesheets are loaded with `VeryHigh` priority and block rendering. On faster connections this is fine, but on slower networks Google Fonts could become a bottleneck.

---

## Network Dependency Tree

**Max critical path latency: 31 ms**

```
localhost:4000/ (24 ms)
├── fonts.googleapis.com/css2?...Merriweather... (23 ms)
│   └── fonts.gstatic.com/.../merriweather.woff2 (31 ms)  ← longest chain
└── localhost:4000/styles.css (23 ms)
```

**Preconnect hints** are correctly configured for:
- `https://fonts.googleapis.com/`
- `https://fonts.gstatic.com/`

This is good — the preconnect hints reduce connection setup time for the font chain.

---

## Third-Party Resources

| Third Party | Transfer Size | Main Thread Time |
|-------------|--------------|------------------|
| Google Fonts | 102 kB | negligible |

Google Fonts is the only third-party dependency. The 102 kB transfer is mostly the font file itself (woff2).

---

## Recommendations

### Production-Ready (should fix before deploy)

1. **Enable gzip/brotli compression on the HTML document.**  
   The server is not compressing the HTML response. Configure your production server (or build tool) to enable compression. Estimated savings: ~2.2 kB.

### Optimization Opportunities (nice to have)

2. **Consider self-hosting the Merriweather font.**  
   This eliminates the 3-request dependency chain (`document → Google Fonts CSS → font file`) and removes a third-party dependency. Tools like [google-webfonts-helper](https://gwfh.mranftl.com/fonts) or `@fontsource/merriweather` make this easy.

3. **Consider using `font-display: optional` or preloading the font.**  
   The Google Fonts URL already uses `display=swap`, which is good. If self-hosting, preloading the woff2 file with `<link rel="preload">` would eliminate the CSS→font waterfall.

4. **Upgrade to HTTP/2 in production.**  
   The local server uses HTTP/1.1. Production deployments should use HTTP/2 (or HTTP/3) for multiplexing benefits.

### No Action Needed

- **LCP** is excellent at 58 ms.
- **CLS** is perfect at 0.00.
- **Preconnect hints** are already properly configured.
- **No unnecessary redirects** on the document request.

---

## Overall Assessment

**The page performs very well.** All Core Web Vitals are solidly in the "good" range. The main areas for improvement are production-environment concerns (compression, HTTP/2) and an optional optimization to self-host fonts. No critical performance issues were found.
