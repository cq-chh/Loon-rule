 * pornhub 去广告脚本（优化版）
 * 功能：移除广告脚本、注入去广告 CSS、处理弹窗跳转
 * 适用：通过 http-response 方式注入 HTML 页面
 */

let body = $response.body;

// =========================
// 1. 高效移除广告脚本（合并正则，减少回溯）
// =========================

// 1.1 移除 src 属性中包含 ads_batch 的脚本标签（支持多种属性顺序）
body = body.replace(
  /<script\s+[^>]*\bsrc\s*=\s*["'][^"']*ads_batch[^"']*["'][^>]*>\s*<\/script>/gi,
  ''
);

// 1.2 移除内联脚本（包含 ads_batch 关键字）—— 使用单次遍历 + 回调，避免正则灾难性回溯
body = body.replace(
  /<script\b[^>]*>([\s\S]*?)<\/script>/gi,
  (match, content) => content && /\bads_batch\b/i.test(content) ? '' : match
);

// =========================
// 2. 注入去广告 CSS（防重复 + 精简样式）
// =========================
const css = `
/* Loon Adblock Inject */
.topAdContainter,
div.topAdContainter,
.adContainer.clearfix,
.adContainer,
div#adSpot,
a[href*="ads"],
.video-wrapper > #player + [class],
.underplayerAd,
.realsex,
.adsbytrafficjunky,
.adLink,
#pb_template,
#main-container > .abovePlayer,
.sponsor-text,
.video-wrapper > div#player~div[class$=" hd clear"],
#hd-rightColVideoPage > .clearfix:first-child,
.playerFlvContainer > div#pb_template[style],
a[href*='livehd'],
[href*='premium_signup?type=PremiumBtn'] {
  display: none !important;
}
.mgp_container .mgp_optionsMenu.mgp_level3 .mgp_subPage>.mgp_content {
  opacity: 0;
  pointer-events: auto;
  transform: translate(-260px, 0) !important;
}
.mgp_preRollSkipButton {
  z-index: 8;
  position: absolute;
  padding: 10px 25px;
  background: rgba(0,0,0,.55);
}
`;

// 避免重复注入（检查标记更可靠）
if (!body.includes('/* Loon Adblock Inject */')) {
  body = body.replace(/<\/head>/i, `<style>${css}</style></head>`);
}

// =========================
// 3. 弹窗自动跳转（更安全的注入脚本 + 降级处理）
// =========================
const redirectScript = `
<script>
(function() {
  // 查找所有带有 onclick="...clearModalCookie..." 的元素
  var candidates = document.querySelectorAll('[onclick*="clearModalCookie"]');
  var targetLink = null;
  // 原脚本逻辑：取索引为 1 的元素（第二个）
  if (candidates.length > 1 && candidates[1].href) {
    targetLink = candidates[1];
  } else if (candidates.length > 0 && candidates[0].href) {
    // 降级：取第一个有效的 a 标签
    targetLink = candidates[0];
  }
  if (targetLink && targetLink.href) {
    // 使用 location.replace 避免产生历史记录，更干净
    window.location.replace(targetLink.href);
  }
})();
</script>
`;

// 注入脚本到 </body> 前（比插入 head 更可靠，保证 DOM 加载完毕）
if (body.includes('</body>')) {
  body = body.replace(/<\/body>/i, redirectScript + '</body>');
} else {
  // 极端情况：没有 body 标签则追加到末尾
  body += redirectScript;
}

$done({ body });
