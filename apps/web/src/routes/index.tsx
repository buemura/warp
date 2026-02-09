import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { UploadForm } from "@/components/UploadForm";
import { UploadResult } from "@/components/UploadResult";
import type { UploadResponse } from "@/lib/api";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const [result, setResult] = useState<UploadResponse | null>(null);

  if (result) {
    return (
      <div className="bg-gray-800/50 rounded-xl shadow-lg p-8 border border-gray-700">
        <UploadResult result={result} onReset={() => setResult(null)} />
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 rounded-xl shadow-lg p-8 border border-gray-700">
      <h1 className="text-2xl font-bold text-gray-100 mb-6">Upload a file</h1>
      <UploadForm onUploadComplete={setResult} />
    </div>
  );
}
