document.addEventListener("DOMContentLoaded", async () => {
    const TARGET = "https://vertexiii.github.io/";
    const iframe = document.createElement("iframe");
    iframe.style.cssText = "position:fixed;inset:0;width:100%;height:100%;border:0";
    document.body.appendChild(iframe);
  
    function injectBase(html, baseHref) {
      const baseTag = `<base href="${baseHref}">`;
      const metaUtf8 = '<meta charset="utf-8">';
      const metaViewport = '<meta name="viewport" content="width=device-width, initial-scale=1">';
      let injected = false;
  
      html = html.replace(/<head(\b[^>]*)>/i, match => {
        injected = true;
        return match + metaUtf8 + metaViewport + baseTag;
      });
  
      if (!injected) {
        html = `<head>${metaUtf8}${metaViewport}${baseTag}</head>` + html;
      }
  
      if (!/^\s*<!doctype/i.test(html)) {
        html = "<!doctype html>\n" + html;
      }
      return html;
    }
  
    try {
      const res = await fetch(TARGET, { mode: "cors", redirect: "follow" });
      if (!res.ok) throw new Error("HTTP " + res.status);
      const html = await res.text();
      iframe.srcdoc = injectBase(html, TARGET);
    } catch (err) {
      console.warn("CORS blocked, falling back to iframe src", err);
      iframe.removeAttribute("srcdoc");
      iframe.src = TARGET;
    }
  });
  