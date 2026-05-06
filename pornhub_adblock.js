let body = $response.body;

/**
 * =========================
 * 1. 删除外部广告脚本
 * 仅删除 src 包含广告关键字
 */
body = body.replace(
  /<script[^>]*\bsrc\s*=\s*["'][^"']*(ads_batch|doubleclick|trafficjunky|exoclick)[^"']*["'][^>]*>\s*<\/script>/gi,
  ''
);

/**
 * =========================
 * 2. 注入精简去广告 CSS
 * 只隐藏广告容器，不碰播放器
 */
const css = `
/* Loon Adblock Inject */
.topAdContainter,
.adContainer.clearfix,
.underplayerAd,
.adsbytrafficjunky,
.adLink,
#pb_template,
.sponsor-text,
a[href*="premium_signup"],
a[href*="livehd"] {
  display: none !important;
}

/* 播放器上的预览广告按钮微调 */
.mgp_preRollSkipButton {
  z-index: 9999 !important;
  position: absolute;
  padding: 10px 25px;
  background: rgba(0,0,0,.6);
}
`;

if (!body.includes('/* Loon Adblock Inject */')) {
  body = body.replace(/<\/head>/i, `<style>${css}</style></head>`);
}

/**
 * =========================
 * 3. 删除弹窗阻断 onclick
 */
body = body.replace(
  /(<a[^>]*?)onclick\s*=\s*["'][^"']*clearModalCookie[^"']*["']([^>]*>)/gi,
  '$1$2'
);

$done({ body });
