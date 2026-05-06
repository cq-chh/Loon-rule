// Loon http-response 脚本
// 功能：移除广告脚本、注入去广告样式、自动跳转弹窗页面

let body = $response.body;

// =========================
// 1. 移除带 "ads_batch" 的脚本标签（src 或内联内容）
// =========================
// 移除 src 中包含 ads_batch 的脚本
body = body.replace(
  /<script\s+[^>]*src\s*=\s*["'][^"']*ads_batch[^"']*["'][^>]*>\s*<\/script>/gi,
  ''
);
// 移除内联脚本中包含 ads_batch 的脚本（跨行匹配）
body = body.replace(
  /<script[^>]*>([\s\S]*?)<\/script>/gi,
  function(match, content) {
    if (content && /\bads_batch\b/i.test(content)) {
      return '';
    }
    return match;
  }
);

// =========================
// 2. 注入去广告 CSS（与原始样式保持一致，并避免重复注入）
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

// 防止重复注入（检查是否已有标记）
if (!body.includes("/* Loon Adblock Inject */")) {
  body = body.replace(
    /<\/head>/i,
    `<style>${css}</style></head>`
  );
}

// =========================
// 3. 处理弹窗跳转（带 clearModalCookie 的链接）
// =========================
// 方式1：移除所有 onclick 属性中含有 clearModalCookie 的 a 标签的 onclick，避免阻止跳转
body = body.replace(
  /(<a[^>]*?)onclick\s*=\s*["'][^"']*clearModalCookie[^"']*["']([^>]*?>)/gi,
  '$1$2'
);

// 方式2：对于无法清理 onclick 的情况，直接提取 href 并延迟跳转（通过注入脚本实现）
// 注意：Loon 不能直接执行 setTimeout 和修改 window.location，
// 因此需要注入一段 JavaScript 到页面中，让浏览器自行执行跳转。
const redirectScript = `
<script>
(function() {
  // 查找包含 clearModalCookie 的链接
  var elems = document.querySelectorAll('[onclick*="clearModalCookie"]');
  if (elems.length > 1 && elems[1].href) {
    window.location = elems[1].href;
  } else {
    // 备用：查找任意带有该 onclick 的 a 标签
    var links = document.querySelectorAll('a[onclick*="clearModalCookie"]');
    if (links.length && links[0].href) {
      window.location = links[0].href;
    }
  }
})();
</script>
`;

// 将跳转脚本注入到 </body> 之前（延迟执行，避免阻塞页面渲染）
body = body.replace(
  /<\/body>/i,
  redirectScript + '</body>'
);

$done({ body });
