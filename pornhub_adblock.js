let body = $response.body;

/**
 * =========================
 * 1. 删除广告 script（增强匹配）
 * =========================
 */
body = body.replace(
  /<script[^>]*src=["'][^"']*(ads_batch|ad|doubleclick|trafficjunky|exoclick)[^"']*["'][^>]*><\/script>/gi,
  ''
);

/**
 * 删除内联广告脚本（更宽松）
 */
body = body.replace(
  /<script[^>]*>([\s\S]*?)(ads_batch|doubleclick|trafficjunky|exoclick)([\s\S]*?)<\/script>/gi,
  ''
);

/**
 * =========================
 * 2. CSS 注入（防重复 + 更稳）
 * =========================
 */
const css = `
/* ===== Ads Container ===== */
.topAdContainter,
.adContainer,
.adContainer.clearfix,
div#adSpot,
.underplayerAd,
.realsex,
.adsbytrafficjunky,
.adLink,
#pb_template,
.sponsor-text {
  display: none !important;
}

/* ===== Video page ads ===== */
.video-wrapper > #player + *,
#main-container > .abovePlayer,
#hd-rightColVideoPage > .clearfix:first-child {
  display: none !important;
}

/* ===== Premium / redirect ===== */
a[href*="premium_signup"],
a[href*="livehd"],
a[href*="ads"] {
  display: none !important;
}

/* ===== Player overlays ===== */
.mgp_preRollSkipButton {
  z-index: 9999 !important;
  position: absolute;
  padding: 10px 25px;
  background: rgba(0,0,0,.6);
}
`;

/**
 * 防止重复注入 style
 */
if (!body.includes("/* Loon Adblock Inject */")) {
  body = body.replace(
    /<\/head>/i,
    `<style>/* Loon Adblock Inject */${css}</style></head>`
  );
}

/**
 * =========================
 * 3. 修复弹窗跳转（更安全）
 * =========================
 */
body = body.replace(
  /onclick=["'][^"']*clearModalCookie[^"']*["']/gi,
  ''
);

/**
 * 将弹窗链接直接放行（避免 JS 阻断）
 */
body = body.replace(
  /<a([^>]*?)onclick=["'][^"']*clearModalCookie[^"']*["']([^>]*?)href=["']([^"']+)["']([^>]*)>/gi,
  '<a href="$3"$1$2$4>'
);

$done({ body });
