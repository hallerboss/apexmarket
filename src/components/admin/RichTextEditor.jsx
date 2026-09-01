import { useState, useMemo } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { base44 } from "@/api/base44Client";
import { Image as ImageIcon, Maximize2, Minimize2 } from "lucide-react";

const modules = {
  toolbar: [
    [{ header: ["", 1, 2, 3] }],
    ["bold", "italic"],
    [{ list: "bullet" }, { list: "ordered" }, "blockquote"],
    [{ align: "" }, { align: "center" }, { align: "right" }],
    ["link"],
  ],
};

export default function RichTextEditor({ value = "", onChange, placeholder = "", minHeight = 200, title = "Product description" }) {
  const [mode, setMode] = useState("visual");
  const [fullscreen, setFullscreen] = useState(false);

  const wordCount = useMemo(() => {
    const text = (value || "").replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").trim();
    return text ? text.split(/\s+/).length : 0;
  }, [value]);

  const addMedia = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      try {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        onChange((value || "") + `<p><img src="${file_url}" alt="" style="max-width:100%;" /></p>`);
      } catch (e) {
        alert(e?.message || "Upload failed");
      }
    };
    input.click();
  };

  return (
    <div className={`rte-light bg-white border border-[#e2e8f0] text-[#2d3748] ${fullscreen ? "fixed inset-0 z-[70] m-0 p-4 flex flex-col" : ""}`}>
      {/* Title bar + Visual/Code */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#e2e8f0] bg-white">
        <span className="text-[13px] font-semibold text-[#2d3748]">{title}</span>
        <div className="flex items-center text-xs">
          <button type="button" onClick={() => setMode("visual")} className={`px-3 py-1 border border-[#e2e8f0] ${mode === "visual" ? "bg-white text-[#2d3748]" : "bg-[#f1f1f1] text-[#888]"}`}>Visual</button>
          <button type="button" onClick={() => setMode("code")} className={`px-3 py-1 border border-[#e2e8f0] -ml-px ${mode === "code" ? "bg-white text-[#2d3748]" : "bg-[#f1f1f1] text-[#888]"}`}>Code</button>
        </div>
      </div>

      {/* Action row */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-[#e2e8f0] bg-white">
        <button type="button" onClick={addMedia} className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 border border-[#2271b1] text-[#2271b1] bg-white hover:bg-[#2271b1] hover:!text-white transition-colors">
          <ImageIcon className="w-3.5 h-3.5" /> Add Media
        </button>
        <button type="button" onClick={() => setFullscreen((f) => !f)} className="inline-flex items-center text-xs px-2 py-1.5 border border-[#e2e8f0] text-[#2d3748] bg-white hover:bg-[#f1f1f1]" title="Fullscreen">
          {fullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
        </button>
      </div>

      {mode === "visual" ? (
        <div className="flex-1 flex flex-col" style={{ minHeight: fullscreen ? "60vh" : minHeight }}>
          <ReactQuill theme="snow" value={value} onChange={onChange} modules={modules} placeholder={placeholder} style={{ flex: 1, minHeight: "100%" }} />
        </div>
      ) : (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ minHeight: fullscreen ? "60vh" : minHeight }}
          className="flex-1 w-full p-3 font-mono text-[13px] text-[#2d3748] bg-white outline-none resize-y border-0"
          placeholder="<p>HTML…</p>"
        />
      )}

      <div className="px-3 py-1.5 border-t border-[#e2e8f0] text-[11px] text-[#888] bg-[#fafafa]">Word count: {wordCount}</div>
    </div>
  );
}