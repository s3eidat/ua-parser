/* User Agent Parser — ordered regex rules, no lookups to any service. */
(function () {
  "use strict";
  var $ = S3.$, $$ = S3.$$;

  var BOTS = [
    [/Googlebot-Image/i, "Googlebot Image"], [/Googlebot-Video/i, "Googlebot Video"], [/Googlebot/i, "Googlebot"], [/Google-InspectionTool/i, "Google Inspection Tool"],
    [/AdsBot-Google/i, "Google AdsBot"], [/Mediapartners-Google/i, "Google AdSense"], [/Storebot-Google/i, "Google StoreBot"], [/Google-Extended/i, "Google-Extended"],
    [/bingbot/i, "Bingbot"], [/BingPreview/i, "Bing Preview"], [/msnbot/i, "MSNBot"], [/DuckDuckBot/i, "DuckDuckBot"], [/Baiduspider/i, "Baiduspider"],
    [/YandexBot|YandexMobileBot|YandexImages/i, "YandexBot"], [/Applebot/i, "Applebot"], [/facebookexternalhit|facebookcatalog|meta-externalagent/i, "Facebook crawler"],
    [/Twitterbot/i, "Twitterbot"], [/LinkedInBot/i, "LinkedInBot"], [/Slackbot/i, "Slackbot"], [/Discordbot/i, "Discordbot"], [/TelegramBot/i, "TelegramBot"],
    [/WhatsApp/i, "WhatsApp link preview"], [/Pinterest(bot)?/i, "Pinterestbot"], [/redditbot/i, "Redditbot"], [/AhrefsBot/i, "AhrefsBot"], [/SemrushBot/i, "SemrushBot"],
    [/MJ12bot/i, "MJ12bot"], [/DotBot/i, "DotBot"], [/PetalBot/i, "PetalBot"], [/GPTBot/i, "GPTBot (OpenAI)"], [/ChatGPT-User/i, "ChatGPT-User (OpenAI)"],
    [/OAI-SearchBot/i, "OAI-SearchBot (OpenAI)"], [/ClaudeBot/i, "ClaudeBot (Anthropic)"], [/Claude-User/i, "Claude-User (Anthropic)"], [/Claude-SearchBot/i, "Claude-SearchBot (Anthropic)"],
    [/anthropic-ai/i, "anthropic-ai"], [/PerplexityBot/i, "PerplexityBot"], [/Perplexity-User/i, "Perplexity-User"], [/CCBot/i, "Common Crawl (CCBot)"], [/Bytespider/i, "Bytespider (ByteDance)"],
    [/Amazonbot/i, "Amazonbot"], [/archive\.org_bot|ia_archiver/i, "Internet Archive"], [/UptimeRobot/i, "UptimeRobot"], [/Pingdom/i, "Pingdom"],
    [/Chrome-Lighthouse|Lighthouse/i, "Lighthouse"], [/HeadlessChrome/i, "Headless Chrome (automation)"], [/PhantomJS/i, "PhantomJS"], [/Seznam/i, "SeznamBot"],
    [/Qwantify|Qwantbot/i, "Qwantbot"], [/Sogou/i, "Sogou spider"], [/Exabot/i, "Exabot"], [/coccoc/i, "Coc Coc bot"]
  ];
  var GENERIC_BOT = /bot\b|crawler|spider|crawl|slurp|scraper|fetcher|preview|monitor|validator|checker/i;
  var CLIENTS = [
    [/^curl\/([\d.]+)/i, "curl"], [/^Wget\/([\d.]+)/i, "Wget"], [/python-requests\/([\d.]+)/i, "Python requests"], [/Python-urllib\/([\d.]+)/i, "Python urllib"],
    [/python-httpx\/([\d.]+)/i, "Python httpx"], [/aiohttp\/([\d.]+)/i, "Python aiohttp"], [/Scrapy\/([\d.]+)/i, "Scrapy"], [/okhttp\/([\d.]+)/i, "OkHttp"],
    [/Go-http-client\/([\d.]+)/i, "Go net/http"], [/axios\/([\d.]+)/i, "axios"], [/node-fetch\/?([\d.]*)/i, "node-fetch"], [/undici/i, "Node.js (undici / fetch)"],
    [/PostmanRuntime\/([\d.]+)/i, "Postman"], [/insomnia\/([\d.]+)/i, "Insomnia"], [/HTTPie\/([\d.]+)/i, "HTTPie"], [/Java-http-client\/([\d.]+)/i, "Java HttpClient"],
    [/^Java\/([\d._]+)/i, "Java"], [/Apache-HttpClient\/([\d.]+)/i, "Apache HttpClient"], [/libwww-perl\/([\d.]+)/i, "Perl LWP"], [/Dart\/([\d.]+)/i, "Dart"],
    [/^Deno\/([\d.]+)/i, "Deno"], [/^Bun\/([\d.]+)/i, "Bun"], [/WindowsPowerShell\/([\d.]+)/i, "PowerShell"], [/PowerShell\/([\d.]+)/i, "PowerShell"],
    [/GuzzleHttp\/([\d.]+)/i, "Guzzle (PHP)"], [/Faraday v?([\d.]+)/i, "Faraday (Ruby)"], [/^Ruby/i, "Ruby"], [/RestSharp\/([\d.]+)/i, "RestSharp"],
    [/^Dalvik\/([\d.]+)/i, "Android Dalvik HTTP"], [/CFNetwork\/([\d.]+)/i, "Apple CFNetwork"], [/^Mozilla\/[\d.]+$/i, "Bare Mozilla string"]
  ];
  var BROWSERS = [
    [/Opera Mini\/([\d.]+)/, "Opera Mini"], [/OPiOS\/([\d.]+)/, "Opera"], [/OPR\/([\d.]+)/, "Opera"], [/Opera.*Version\/([\d.]+)/, "Opera"], [/Opera[\/ ]([\d.]+)/, "Opera"],
    [/EdgiOS\/([\d.]+)/, "Edge"], [/EdgA\/([\d.]+)/, "Edge"], [/Edg\/([\d.]+)/, "Edge"], [/Edge\/([\d.]+)/, "Edge (legacy)"],
    [/SamsungBrowser\/([\d.]+)/, "Samsung Internet"], [/YaBrowser\/([\d.]+)/, "Yandex Browser"], [/Vivaldi\/([\d.]+)/, "Vivaldi"],
    [/UCBrowser\/([\d.]+)/, "UC Browser"], [/(?:DuckDuckGo|Ddg)\/([\d.]+)/, "DuckDuckGo"], [/FBAV\/([\d.]+)/, "Facebook in-app"],
    [/Instagram ([\d.]+)/, "Instagram in-app"], [/ Line\/([\d.]+)/, "LINE in-app"], [/Snapchat\/([\d.]+)/, "Snapchat in-app"], [/MiuiBrowser\/([\d.]+)/, "MIUI Browser"],
    [/HuaweiBrowser\/([\d.]+)/, "Huawei Browser"], [/Whale\/([\d.]+)/, "Naver Whale"], [/Electron\/([\d.]+)/, "Electron"], [/FxiOS\/([\d.]+)/, "Firefox"],
    [/Firefox\/([\d.]+)/, "Firefox"], [/CriOS\/([\d.]+)/, "Chrome"], [/Silk\/([\d.]+)/, "Amazon Silk"],
    [/; wv\).*Chrome\/([\d.]+)/, "Android WebView"], [/HeadlessChrome\/([\d.]+)/, "Headless Chrome"], [/Chromium\/([\d.]+)/, "Chromium"],
    [/Chrome\/([\d.]+)/, "Chrome"], [/Version\/([\d.]+).*Mobile.*Safari/, "Mobile Safari"], [/Version\/([\d.]+).*Safari/, "Safari"],
    [/(?:iPhone|iPad|iPod).*AppleWebKit(?!.*Safari)/, "iOS WebView"], [/MSIE ([\d.]+)/, "Internet Explorer"], [/Trident\/.*rv:([\d.]+)/, "Internet Explorer"]
  ];
  var WIN = { "10.0": "10 or 11", "6.3": "8.1", "6.2": "8", "6.1": "7", "6.0": "Vista", "5.2": "XP x64", "5.1": "XP", "5.0": "2000" };

  function first(list, ua) { for (var i = 0; i < list.length; i++) { var m = list[i][0].exec(ua); if (m) return { name: list[i][1], version: m[1] || "" }; } return null; }
  function major(v) { return (v || "").split(".")[0]; }

  function parseUA(ua) {
    ua = (ua || "").trim();
    var r = { ua: ua, browser: "", browserVersion: "", engine: "", engineVersion: "", os: "", osVersion: "", type: "desktop", vendor: "", model: "", bot: "", client: "" };
    if (!ua) { r.type = "unknown"; return r; }
    var bot = first(BOTS, ua);
    if (!bot && GENERIC_BOT.test(ua) && !/Mobile Safari|Chrome\/[\d.]+ (Mobile )?Safari\/[\d.]+$/.test(ua)) bot = { name: "Unknown bot" };
    var client = !bot && first(CLIENTS, ua);
    if (bot) { r.type = "bot"; r.bot = bot.name; }
    else if (client) { r.type = "client"; r.client = client.name; r.browser = client.name; r.browserVersion = client.version; }
    // browser
    if (!client) {
      var b = first(BROWSERS, ua);
      if (b) { r.browser = b.name; r.browserVersion = b.version; }
    }
    // engine
    var m;
    if (/Edge\/[\d.]+/.test(ua) && !/Edg\//.test(ua)) { r.engine = "EdgeHTML"; r.engineVersion = (/Edge\/([\d.]+)/.exec(ua) || [])[1] || ""; }
    else if ((m = /Trident\/([\d.]+)/.exec(ua))) { r.engine = "Trident"; r.engineVersion = m[1]; }
    else if ((m = /Presto\/([\d.]+)/.exec(ua))) { r.engine = "Presto"; r.engineVersion = m[1]; }
    else if (/iPhone|iPad|iPod/.test(ua) && (m = /AppleWebKit\/([\d.]+)/.exec(ua))) { r.engine = "WebKit"; r.engineVersion = m[1]; }
    else if ((m = /Chrome\/([\d.]+)/.exec(ua)) && /AppleWebKit/.test(ua)) { r.engine = "Blink"; r.engineVersion = m[1]; }
    else if ((m = /AppleWebKit\/([\d.]+)/.exec(ua))) { r.engine = "WebKit"; r.engineVersion = m[1]; }
    else if ((m = /rv:([\d.]+)\) Gecko/.exec(ua))) { r.engine = "Gecko"; r.engineVersion = m[1]; }
    // operating system
    if ((m = /Windows Phone(?: OS)? ([\d.]+)/.exec(ua))) { r.os = "Windows Phone"; r.osVersion = m[1]; }
    else if (/Xbox/.test(ua)) r.os = "Xbox";
    else if ((m = /Windows NT ([\d.]+)/.exec(ua))) { r.os = "Windows"; r.osVersion = WIN[m[1]] || "NT " + m[1]; }
    else if (/Windows/.test(ua)) r.os = "Windows";
    else if ((m = /(?:iPhone|iPod|iPad).*? OS (\d+(?:_\d+)*)/.exec(ua))) { r.os = /iPad/.test(ua) ? "iPadOS" : "iOS"; r.osVersion = m[1].replace(/_/g, "."); }
    else if (/iPhone|iPad|iPod/.test(ua)) r.os = /iPad/.test(ua) ? "iPadOS" : "iOS";
    else if ((m = /HarmonyOS[ \/]?([\d.]*)/.exec(ua))) { r.os = "HarmonyOS"; r.osVersion = m[1]; }
    else if ((m = /Android[ \/]?([\d.]*)/.exec(ua))) { r.os = "Android"; r.osVersion = m[1]; }
    else if ((m = /CrOS \S+ ([\d.]+)/.exec(ua))) { r.os = "ChromeOS"; r.osVersion = m[1]; }
    else if ((m = /Mac OS X (\d+(?:[_.]\d+)*)/.exec(ua))) { r.os = "macOS"; r.osVersion = m[1].replace(/_/g, "."); }
    else if (/Macintosh|Mac OS/.test(ua)) r.os = "macOS";
    else if ((m = /KAIOS\/([\d.]+)/i.exec(ua))) { r.os = "KaiOS"; r.osVersion = m[1]; }
    else if ((m = /Tizen[ \/]?([\d.]*)/.exec(ua))) { r.os = "Tizen"; r.osVersion = m[1]; }
    else if (/Web0S|webOS/.test(ua)) r.os = "webOS";
    else if ((m = /PlayStation (?:\d+ )?(\w+)?/i.exec(ua))) r.os = "PlayStation";
    else if (/Nintendo/.test(ua)) r.os = "Nintendo";
    else if (/FreeBSD/.test(ua)) r.os = "FreeBSD";
    else if (/OpenBSD/.test(ua)) r.os = "OpenBSD";
    else if (/Ubuntu/.test(ua)) r.os = "Ubuntu";
    else if (/Fedora/.test(ua)) r.os = "Fedora";
    else if (/Linux|X11/.test(ua)) r.os = "Linux";
    // device type (bots and HTTP clients keep their type)
    if (!bot && !client) {
      if (/SmartTV|SMART-TV|Smart-TV|HbbTV|AppleTV|GoogleTV|Android TV|AndroidTV|AFT[A-Z]|BRAVIA|Roku|CrKey|NetCast|Viera|AQUOS|Web0S|webOS.*TV|Tizen.*TV|DTV|\bTV\b/i.test(ua)) r.type = "tv";
      else if (/PlayStation|Xbox|Nintendo/i.test(ua)) r.type = "console";
      else if (/iPad|Tablet|Kindle|Silk|PlayBook|KF[A-Z]{2,4}\b/.test(ua) || (/Android/.test(ua) && !/Mobile/.test(ua))) r.type = "tablet";
      else if (/Mobi|iPhone|iPod|Android|Windows Phone|BlackBerry|BB10|Opera Mini|KaiOS|IEMobile/i.test(ua)) r.type = "mobile";
      else r.type = "desktop";
    }
    // vendor and model
    if ((m = /\((iPhone|iPad|iPod)/.exec(ua))) { r.vendor = "Apple"; r.model = m[1]; }
    else if (/Macintosh/.test(ua)) { r.vendor = "Apple"; r.model = "Mac"; }
    else if ((m = /Android[ \/]?[\d.]*;(?: [a-z]{2}[-_][a-zA-Z]{2};)?(?: U;)? ([^;)]+?)(?: Build\/[^;)]*)?(?:;|\))/.exec(ua))) {
      var model = m[1].trim();
      if (/^(wv|K|Linux|Mobile|Tablet)$/i.test(model)) r.model = model === "K" ? "(hidden by reduced UA)" : "";
      else r.model = model.replace(/^SAMSUNG /i, "");
      var V = [[/^(SM-|SAMSUNG|Galaxy|GT-|SCH-|SGH-)/i, "Samsung"], [/^Pixel|^Nexus/i, "Google"], [/^(Redmi|Mi |MI |M2\d|POCO|Xiaomi|2\d{3}[A-Z0-9]{4,})/i, "Xiaomi"],
        [/^(CPH|OPPO|PB|PC|PD|PE)/i, "OPPO"], [/^RMX/i, "realme"], [/^(vivo|V2\d)/i, "vivo"], [/^(moto|XT\d)/i, "Motorola"], [/^(ONEPLUS|IN20|KB20|LE2|NE2)/i, "OnePlus"],
        [/^(HUAWEI|ELE-|VOG-|ANA-|LYA-|MAR-|JNY-|NOH-)/i, "Huawei"], [/^(Nokia|TA-)/i, "Nokia"], [/^(LG-|LM-)/i, "LG"], [/^(SO-|Xperia|G8|XQ-)/i, "Sony"],
        [/^KF[A-Z]/, "Amazon"], [/^(Infinix)/i, "Infinix"], [/^(TECNO)/i, "Tecno"], [/^(itel)/i, "itel"], [/^(HONOR|HNY|LGE-)/i, "Honor"], [/^(ASUS|ZS\d|AI\d)/i, "ASUS"]];
      for (var i = 0; i < V.length; i++) if (V[i][0].test(r.model)) { r.vendor = V[i][1]; break; }
    }
    return r;
  }
  function describe(r) {
    return {
      browser: r.bot ? r.bot : (r.browser ? r.browser + (r.browserVersion ? " " + r.browserVersion : "") : "Unknown"),
      engine: r.engine ? r.engine + (r.engineVersion ? " " + r.engineVersion : "") : "—",
      os: r.os ? r.os + (r.osVersion ? " " + r.osVersion : "") : "—",
      device: [r.vendor, r.model].filter(Boolean).join(" ") || "—"
    };
  }

  // ================= your browser =================
  var TYPE_LABEL = { desktop: "Desktop", mobile: "Mobile", tablet: "Tablet", tv: "TV", console: "Console", bot: "Bot", client: "HTTP client", unknown: "Unknown" };
  function tile(label, value) { return S3.h("div", { "class": "ua-tile" }, [S3.h("span", { "class": "ua-k", text: label }), S3.h("span", { "class": "ua-v", text: value })]); }
  function renderMine() {
    var ua = navigator.userAgent, r = parseUA(ua), d = describe(r), box = $("#mine");
    box.innerHTML = "";
    [["Browser", d.browser], ["Engine", d.engine], ["Operating system", d.os], ["Device type", TYPE_LABEL[r.type]], ["Device", d.device],
      ["Screen", screen.width + " × " + screen.height + " @" + (window.devicePixelRatio || 1) + "x"], ["Language", navigator.language || "—"]].forEach(function (x) { box.appendChild(tile(x[0], x[1])); });
    $("#raw").textContent = ua;
    var hb = $("#hints"), uad = navigator.userAgentData;
    hb.innerHTML = "";
    if (!uad) { hb.appendChild(S3.h("p", { "class": "faint", text: "This browser doesn't offer User-Agent Client Hints (navigator.userAgentData), so the string above is all it reports." })); return; }
    var rows = [["Brands", uad.brands.map(function (b) { return b.brand + " " + b.version; }).join(", ")], ["Mobile", String(uad.mobile)], ["Platform", uad.platform || "—"]];
    function draw(extra) {
      hb.innerHTML = "";
      hb.appendChild(S3.h("h3", { "class": "ua-h3", text: "Client hints (navigator.userAgentData)" }));
      var t = S3.h("table", { "class": "tbl" }), tb = S3.h("tbody");
      rows.concat(extra || []).forEach(function (x) { tb.appendChild(S3.h("tr", null, [S3.h("th", { text: x[0] }), S3.h("td", { "class": "mono", text: x[1] })])); });
      t.appendChild(tb); hb.appendChild(S3.h("div", { "class": "tbl-wrap" }, [t]));
      hb.appendChild(S3.h("p", { "class": "faint", text: "Chromium browsers freeze parts of the user agent string (for example the Windows and Android versions); client hints carry the real values. Read from this browser only, never sent anywhere." }));
    }
    draw();
    if (uad.getHighEntropyValues) {
      uad.getHighEntropyValues(["platformVersion", "architecture", "bitness", "model", "fullVersionList", "uaFullVersion"]).then(function (h) {
        var extra = [];
        if (h.platformVersion) {
          var pv = h.platformVersion, label = pv;
          if (uad.platform === "Windows") label = pv + (parseInt(pv, 10) >= 13 ? " (Windows 11)" : parseInt(pv, 10) > 0 ? " (Windows 10)" : "");
          extra.push(["Platform version", label]);
        }
        if (h.architecture) extra.push(["Architecture", h.architecture + (h.bitness ? " " + h.bitness + "-bit" : "")]);
        if (h.model) extra.push(["Model", h.model]);
        if (h.fullVersionList) extra.push(["Full versions", h.fullVersionList.map(function (b) { return b.brand + " " + b.version; }).join(", ")]);
        draw(extra);
      }, function () { /* hints refused: keep the low-entropy ones */ });
    }
  }

  // ================= bulk parsing =================
  var input = $("#input"), state = { view: "table", rows: [] };
  function render() {
    var lines = input.value.split(/\r?\n/).map(function (l) { return l.trim().replace(/^"|"$/g, ""); }).filter(Boolean).slice(0, 5000);
    state.rows = lines.map(parseUA);
    var box = $("#table"), js = $("#json");
    box.innerHTML = "";
    if (!lines.length) {
      box.appendChild(S3.h("div", { "class": "empty" }, [S3.h("b", { text: "Paste user agents above" }), "One per line, for example from an access log."]));
      js.textContent = ""; $("#summary").textContent = ""; return;
    }
    var counts = {};
    state.rows.forEach(function (r) { counts[r.type] = (counts[r.type] || 0) + 1; });
    $("#summary").textContent = lines.length + " parsed · " + Object.keys(counts).map(function (k) { return counts[k] + " " + TYPE_LABEL[k].toLowerCase(); }).join(", ");
    var t = S3.h("table", { "class": "tbl" }), head = S3.h("tr");
    ["Type", "Browser / bot", "Engine", "OS", "Device", "User agent"].forEach(function (h) { head.appendChild(S3.h("th", { text: h })); });
    t.appendChild(S3.h("thead", null, [head]));
    var tb = S3.h("tbody");
    state.rows.slice(0, 1000).forEach(function (r) {
      var d = describe(r), cls = { bot: "warn", client: "accent", mobile: "ok", tablet: "ok" }[r.type] || "";
      tb.appendChild(S3.h("tr", null, [
        S3.h("td", null, [S3.h("span", { "class": "chip " + cls, text: TYPE_LABEL[r.type] })]),
        S3.h("td", { "class": "ua-strong", text: d.browser }), S3.h("td", { text: d.engine }), S3.h("td", { text: d.os }), S3.h("td", { text: d.device }),
        S3.h("td", { "class": "mono ua-cell", text: r.ua, title: r.ua })
      ]));
    });
    t.appendChild(tb); box.appendChild(t);
    if (state.rows.length > 1000) box.appendChild(S3.h("p", { "class": "faint ua-more", text: "The table shows the first 1,000; copy or download for all " + state.rows.length + "." }));
    js.textContent = jsonText();
    S3.store("ua.last", input.value.length < 100000 ? input.value : undefined);
  }
  function jsonText() { return JSON.stringify(state.rows, null, 2); }
  function csvText() {
    var cols = ["type", "browser", "browserVersion", "engine", "engineVersion", "os", "osVersion", "vendor", "model", "bot", "client", "ua"];
    // a leading ' stops spreadsheets from running =, +, -, @ values as formulas
    function q(v) { v = String(v == null ? "" : v); if (/^[=+\-@\t\r]/.test(v)) v = "'" + v; return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }
    return cols.join(",") + "\n" + state.rows.map(function (r) { return cols.map(function (c) { return q(r[c]); }).join(","); }).join("\n") + "\n";
  }
  function setView(v) {
    state.view = v;
    $$("#view button").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.v === v)); });
    $("#table").hidden = v !== "table"; $("#json").hidden = v !== "json";
    $("#ext").textContent = v === "json" ? ".json" : ".csv";
  }

  var SAMPLES = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1",
    "Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/25.0 Chrome/121.0.0.0 Mobile Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15",
    "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:131.0) Gecko/20100101 Firefox/131.0",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 Edg/130.0.2849.68",
    "Mozilla/5.0 (iPad; CPU OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/129.0.6668.69 Mobile/15E148 Safari/604.1",
    "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Mobile Safari/537.36",
    "Mozilla/5.0 (Linux; Android 12; SM-X200) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Web0S; Linux/SmartTV) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.128 Safari/537.36 WebAppManager",
    "Mozilla/5.0 (compatible; Googlebot/2.1)",
    "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; ClaudeBot/1.0; claudebot@anthropic.com)",
    "curl/8.7.1",
    "python-requests/2.32.3",
    "Mozilla/5.0 (Windows NT 6.1; WOW64; Trident/7.0; rv:11.0) like Gecko",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 OPR/115.0.0.0",
    "Mozilla/5.0 (PlayStation; PlayStation 5/2.26) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0 Safari/605.1.15"
  ];

  input.addEventListener("input", S3.debounce(render, 200));
  $$("#view button").forEach(function (b) { b.addEventListener("click", function () { setView(b.dataset.v); }); });
  $("#sample").addEventListener("click", function () { input.value = SAMPLES.join("\n"); render(); });
  $("#clear").addEventListener("click", function () { input.value = ""; render(); input.focus(); });
  $("#open input").addEventListener("change", function (e) {
    var f = e.target.files[0]; if (!f) return;
    S3.readFile(f, "text").then(function (t) {
      // access logs: pull the last quoted field of each line (combined log format), else take the line
      input.value = t.split(/\r?\n/).map(function (l) { var m = /"([^"]*)"\s*$/.exec(l); return m ? m[1] : l; }).filter(function (l) { return l.trim() && l !== "-"; }).join("\n");
      render();
    });
    e.target.value = "";
  });
  $("#copyMine").addEventListener("click", function () { S3.copy(navigator.userAgent, "User agent copied"); });
  $("#copy").addEventListener("click", function () {
    if (!state.rows.length) return S3.toast("Nothing parsed yet", "error");
    S3.copy(state.view === "json" ? jsonText() : csvText().replace(/,/g, "\t")); S3.done();
  });
  $("#save").addEventListener("click", function () {
    if (!state.rows.length) return S3.toast("Nothing parsed yet", "error");
    if (state.view === "json") S3.download(jsonText(), "user-agents.json", "application/json"); else S3.download(csvText(), "user-agents.csv", "text/csv");
    S3.done();
  });

  window.S3_DEMO = function () { $("#sample").click(); };

  window.S3_SELFTEST = function () {
    var fails = [];
    function eq(name, a, b) { a = JSON.stringify(a); b = JSON.stringify(b); if (a !== b) fails.push(name + ": got " + a + " want " + b); }
    function pick(r) { return [r.type, r.browser, major(r.browserVersion), r.engine, r.os, r.osVersion]; }
    eq("chrome win", pick(parseUA(SAMPLES[0])), ["desktop", "Chrome", "130", "Blink", "Windows", "10 or 11"]);
    eq("iphone", pick(parseUA(SAMPLES[1])), ["mobile", "Mobile Safari", "17", "WebKit", "iOS", "17.4"]);
    var s = parseUA(SAMPLES[2]);
    eq("samsung", pick(s), ["mobile", "Samsung Internet", "25", "Blink", "Android", "14"]); eq("samsung vendor", [s.vendor, s.model], ["Samsung", "SM-S918B"]);
    eq("mac safari", pick(parseUA(SAMPLES[3])), ["desktop", "Safari", "17", "WebKit", "macOS", "10.15.7"]);
    eq("firefox linux", pick(parseUA(SAMPLES[4])), ["desktop", "Firefox", "131", "Gecko", "Ubuntu", ""]);
    eq("edge", pick(parseUA(SAMPLES[5])).slice(0, 4), ["desktop", "Edge", "130", "Blink"]);
    eq("ipad chrome", pick(parseUA(SAMPLES[6])), ["tablet", "Chrome", "129", "WebKit", "iPadOS", "16.6"]);
    eq("pixel", [parseUA(SAMPLES[7]).vendor, parseUA(SAMPLES[7]).type], ["Google", "mobile"]);
    eq("android tablet", parseUA(SAMPLES[8]).type, "tablet");
    eq("smart tv", [parseUA(SAMPLES[9]).type, parseUA(SAMPLES[9]).os], ["tv", "webOS"]);
    eq("googlebot", [parseUA(SAMPLES[10]).type, parseUA(SAMPLES[10]).bot], ["bot", "Googlebot"]);
    eq("claudebot", parseUA(SAMPLES[11]).bot, "ClaudeBot (Anthropic)");
    eq("curl", [parseUA("curl/8.7.1").type, parseUA("curl/8.7.1").browser, parseUA("curl/8.7.1").browserVersion], ["client", "curl", "8.7.1"]);
    eq("requests", parseUA("python-requests/2.32.3").client, "Python requests");
    eq("ie11", pick(parseUA(SAMPLES[14])), ["desktop", "Internet Explorer", "11", "Trident", "Windows", "7"]);
    eq("opera", parseUA(SAMPLES[15]).browser, "Opera");
    eq("ps5", parseUA(SAMPLES[16]).type, "console");
    eq("firefox ios", parseUA("Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) FxiOS/131.0 Mobile/15E148 Safari/605.1.15").engine, "WebKit");
    eq("webview", parseUA("Mozilla/5.0 (Linux; Android 10; K; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/129.0.6668.81 Mobile Safari/537.36").browser, "Android WebView");
    eq("reduced model", parseUA("Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Mobile Safari/537.36").model, "(hidden by reduced UA)");
    eq("headless", parseUA("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/120.0.0.0 Safari/537.36").type, "bot");
    eq("generic crawler", parseUA("SomeCrawler/1.0 (+contact)").type, "bot");
    eq("empty", parseUA("").type, "unknown");
    eq("csv injection guarded", (function () { state.rows = [parseUA("=cmd|' /C calc'!A0")]; return csvText().split("\n")[1].slice(-20).indexOf("'=cmd") >= 0; })(), true);
    state.rows = [];
    return fails.length ? fails : true;
  };

  renderMine();
  input.value = S3.store("ua.last") || "";
  render();
})();
