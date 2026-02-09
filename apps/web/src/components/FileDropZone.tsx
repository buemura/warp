import { useDropzone } from "react-dropzone";

interface FileDropZoneProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
  selectedFile?: File | null;
}

export function FileDropZone({
  onFileSelect,
  disabled,
  selectedFile,
}: FileDropZoneProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (accepted) => {
      if (accepted.length > 0) {
        onFileSelect(accepted[0]);
      }
    },
    multiple: false,
    disabled,
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${
        isDragActive
          ? "border-indigo-500 bg-indigo-500/10"
          : selectedFile
            ? "border-green-500 bg-green-500/10"
            : "border-gray-600 hover:border-gray-500 bg-gray-800/50"
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      <input {...getInputProps()} />
      {selectedFile ? (
        <div>
          <p className="text-green-400 font-medium">{selectedFile.name}</p>
          <p className="text-sm text-gray-400 mt-1">
            {(selectedFile.size / 1024).toFixed(1)} KB — Click or drop to
            replace
          </p>
        </div>
      ) : isDragActive ? (
        <p className="text-indigo-400 font-medium">Drop your file here...</p>
      ) : (
        <div>
          <p className="text-gray-300">
            Drag and drop a file here, or click to select
          </p>
          <p className="text-sm text-gray-500 mt-1">Max 50 MB</p>
        </div>
      )}
    </div>
  );
}
