import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
  within,
} from "@testing-library/react";
import { UploadForm } from "@/components/UploadForm";

vi.mock("@/lib/api", () => ({
  uploadFile: vi.fn(),
}));

import { uploadFile } from "@/lib/api";

const mockUploadFile = vi.mocked(uploadFile);

beforeEach(() => {
  mockUploadFile.mockReset();
});

afterEach(() => {
  cleanup();
});

function dropFile(container: HTMLElement, file: File) {
  const dropzone = container.querySelector('[role="presentation"]')!;
  const dataTransfer = {
    files: [file],
    items: [
      {
        kind: "file",
        type: file.type,
        getAsFile: () => file,
      },
    ],
    types: ["Files"],
  };
  fireEvent.drop(dropzone, { dataTransfer });
}

describe("UploadForm", () => {
  it("renders the form with all fields", () => {
    const { container } = render(<UploadForm onUploadComplete={vi.fn()} />);
    const form = within(container);

    expect(
      form.getByText(/drag and drop a file here/i),
    ).toBeInTheDocument();
    expect(form.getByLabelText(/password protection/i)).toBeInTheDocument();
    expect(form.getByLabelText(/one-time access/i)).toBeInTheDocument();
    expect(form.getByLabelText(/expiration/i)).toBeInTheDocument();
    expect(form.getByRole("button", { name: /upload/i })).toBeDisabled();
  });

  it("enables upload button when file is dropped", async () => {
    const { container } = render(<UploadForm onUploadComplete={vi.fn()} />);
    const file = new File(["test"], "test.txt", { type: "text/plain" });

    dropFile(container, file);

    const form = within(container);
    await waitFor(() => {
      expect(
        form.getByRole("button", { name: /upload/i }),
      ).not.toBeDisabled();
    });
  });

  it("calls onUploadComplete after successful upload", async () => {
    const onComplete = vi.fn();
    const mockResult = {
      short_id: "abc123",
      url: "/abc123",
      original_filename: "test.txt",
      expires_at: null,
    };
    mockUploadFile.mockResolvedValueOnce(mockResult);

    const { container } = render(
      <UploadForm onUploadComplete={onComplete} />,
    );
    const file = new File(["test"], "test.txt", { type: "text/plain" });

    dropFile(container, file);

    const form = within(container);
    await waitFor(() => {
      expect(
        form.getByRole("button", { name: /upload/i }),
      ).not.toBeDisabled();
    });

    fireEvent.click(form.getByRole("button", { name: /upload/i }));

    await waitFor(() => {
      expect(onComplete).toHaveBeenCalledWith(mockResult);
    });
  });

  it("shows error message on upload failure", async () => {
    mockUploadFile.mockRejectedValueOnce(new Error("Upload failed"));

    const { container } = render(
      <UploadForm onUploadComplete={vi.fn()} />,
    );
    const file = new File(["test"], "test.txt", { type: "text/plain" });

    dropFile(container, file);

    const form = within(container);
    await waitFor(() => {
      expect(
        form.getByRole("button", { name: /upload/i }),
      ).not.toBeDisabled();
    });

    fireEvent.click(form.getByRole("button", { name: /upload/i }));

    await waitFor(() => {
      expect(form.getByText("Upload failed")).toBeInTheDocument();
    });
  });
});
