import { useState } from "react";
import { Link } from "react-router-dom";
import { Download, FileCode2, ArrowLeft } from "lucide-react";
import { getStaticSiteHtml } from "@/lib/staticSiteHtml";

export default function DownloadSite() {
  const [copied, setCopied] = useState(false);

  const downloadHtml = () => {
    const html = getStaticSiteHtml();
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "apexmarket-website.html";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(getStaticSiteHtml());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container-bleed px-5 lg:px-10 py-10 lg:py-16 max-w-3xl">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to store
        </Link>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-lg bg-accent/10 flex items-center justify-center">
            <FileCode2 className="w-6 h-6 text-accent" />
          </div>
          <h1 className="display-text text-3xl">Download Website HTML</h1>
        </div>
        <p className="serif-text text-muted-foreground leading-relaxed mb-8 max-w-prose">
          A self-contained static HTML snapshot of the storefront — header, hero, product sections, promo banner and footer, all styled with inline CSS. Open the file in any browser or host it anywhere. This is a visual reproduction only; the live app remains the dynamic Base44 store.
        </p>

        <div className="flex flex-wrap items-center gap-3 mb-8">
          <button onClick={downloadHtml} className="btn-mono-solid">
            <Download className="w-4 h-4" /> Download .html
          </button>
          <button onClick={copyCode} className="btn-mono-outline">
            {copied ? "Copied!" : "Copy HTML code"}
          </button>
        </div>

        <div className="border hairline p-4 bg-secondary/40">
          <p className="text-[11px] uppercase tracking-[0.15em] font-semibold mb-2">Preview</p>
          <iframe
            title="Static site preview"
            srcDoc={getStaticSiteHtml()}
            className="w-full h-[420px] bg-white border hairline"
          />
        </div>
      </div>
    </div>
  );
}