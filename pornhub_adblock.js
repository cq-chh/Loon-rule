let body = $response.body;

/**
 * =========================
 * 1. 注入外部 CSS 隐藏广告容器
 *    CSS 可自行维护在 GitHub 上
 */
body = body.replace(
  /<head>/i,
  `<head><link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/ddgksf2013/Html/pornhub.css" type="text/css">`
);

/**
 * =========================
 * 2. 删除弹窗阻断 onclick
 */
body = body.replace(
  /(<a[^>]*?)onclick\s*=\s*["'][^"']*clearModalCookie[^"']*["']([^>]*>)/gi,
  '$1$2'
);

$done({ body });
