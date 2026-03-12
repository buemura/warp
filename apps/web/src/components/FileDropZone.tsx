import { useDropzone } from "react-dropzone";

interface FileDropZoneProps {
  onFilesSelect: (files: File[]) => void;
  disabled?: boolean;
  selectedFiles?: File[];
}

export function FileDropZone({ onFilesSelect, disabled, selectedFiles }: FileDropZoneProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (accepted) => {
      if (accepted.length > 0) onFilesSelect(accepted);
    },
    multiple: true,
    disabled,
  });

  const hasFiles = selectedFiles && selectedFiles.length > 0;
  const totalSize = selectedFiles ? selectedFiles.reduce((sum, f) => sum + f.size, 0) : 0;

  const cls = [
    "dropzone",
    isDragActive ? "dragging" : hasFiles ? "has-file" : "",
    disabled ? "disabled" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div {...getRootProps()} className={cls}>
      <input {...getInputProps()} />

      {hasFiles ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", width: "100%" }}>
          <div className="file-icon-wrap">
            <FileIcon color="var(--success)" />
          </div>
          {selectedFiles!.length === 1 ? (
            <div style={{ textAlign: "center" }}>
              <p style={{ fontWeight: 600, fontSize: "15px", color: "var(--success)" }}>
                {selectedFiles![0].name}
              </p>
              <p style={{ fontSize: "13px", color: "var(--text-2)", marginTop: "4px" }}>
                {formatFileSize(selectedFiles![0].size)} — tap to replace
              </p>
            </div>
          ) : (
            <div style={{ textAlign: "center", width: "100%" }}>
              <p style={{ fontWeight: 600, fontSize: "15px", color: "var(--success)" }}>
                {selectedFiles!.length} files selected
              </p>
              <p style={{ fontSize: "13px", color: "var(--text-2)", marginTop: "4px" }}>
                {formatFileSize(totalSize)} total — tap to replace
              </p>
              <div
                style={{
                  marginTop: "10px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                  maxHeight: "80px",
                  overflowY: "auto",
                  width: "100%",
                }}
              >
                {selectedFiles!.map((f, i) => (
                  <p
                    key={i}
                    style={{
                      fontSize: "12px",
                      color: "var(--text-2)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {f.name}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : isDragActive ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
          <UploadIconBox active />
          <p style={{ fontWeight: 600, color: "var(--accent)", fontSize: "15px" }}>
            Drop them here
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
          <UploadIconBox />
          <div style={{ textAlign: "center" }}>
            <p style={{ fontWeight: 500, fontSize: "15px", color: "var(--text)" }}>
              Drop files here
            </p>
            <p style={{ fontSize: "13px", color: "var(--text-2)", marginTop: "4px" }}>
              or tap to browse · max 50 MB
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function UploadIconBox({ active }: { active?: boolean }) {
  return (
    <div
      style={{
        width: 56,
        height: 56,
        borderRadius: 14,
        background: active ? "var(--accent-dim)" : "rgba(255,255,255,0.03)",
        border: `1px solid ${active ? "rgba(202,255,69,0.3)" : "var(--border-hi)"}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg
        width="26"
        height="26"
        viewBox="0 0 24 24"
        fill="none"
        stroke={active ? "var(--accent)" : "var(--text-2)"}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="16 16 12 12 8 16" />
        <line x1="12" y1="12" x2="12" y2="21" />
        <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
      </svg>
    </div>
  );
}

function FileIcon({ color }: { color: string }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
      <polyline points="13 2 13 9 20 9" />
    </svg>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
