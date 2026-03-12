import { describe, it, expect, vi, beforeEach } from "vitest";
import { uploadFile, getFileInfo, accessFile } from "@/lib/api";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

beforeEach(() => {
  mockFetch.mockReset();
});

describe("uploadFile", () => {
  it("sends file as FormData and returns response", async () => {
    const mockResponse = {
      short_id: "abc12345",
      url: "/abc12345",
      original_filename: "test.txt",
      expires_at: null,
    };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const file = new File(["hello"], "test.txt", { type: "text/plain" });
    const result = await uploadFile([file]);

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toContain("/api/files/upload");
    expect(options.method).toBe("POST");
    expect(options.body).toBeInstanceOf(FormData);
    expect(result).toEqual(mockResponse);
  });

  it("includes optional parameters in FormData", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          short_id: "x",
          url: "/x",
          original_filename: "f",
          expires_at: null,
        }),
    });

    const file = new File(["data"], "doc.pdf");
    await uploadFile([file], {
      password: "secret",
      oneTime: true,
      ttlMinutes: 60,
    });

    const formData = mockFetch.mock.calls[0][1].body as FormData;
    expect(formData.get("password")).toBe("secret");
    expect(formData.get("one_time")).toBe("true");
    expect(formData.get("ttl_minutes")).toBe("60");
  });

  it("throws on error response", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ detail: "File too large." }),
    });

    const file = new File(["x"], "big.bin");
    await expect(uploadFile([file])).rejects.toThrow("File too large.");
  });
});

describe("getFileInfo", () => {
  it("fetches file info by shortId", async () => {
    const mockInfo = {
      short_id: "abc12345",
      original_filename: "test.txt",
      content_type: "text/plain",
      file_size: 1024,
      requires_password: false,
      is_expired: false,
      is_access_exhausted: false,
      created_at: "2026-01-01T00:00:00Z",
      expires_at: null,
    };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockInfo),
    });

    const result = await getFileInfo("abc12345");

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/files/abc12345"),
    );
    expect(result).toEqual(mockInfo);
  });

  it("throws on 404", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ detail: "File not found." }),
    });

    await expect(getFileInfo("nonexistent")).rejects.toThrow("File not found.");
  });
});

describe("accessFile", () => {
  it("sends password and returns blob", async () => {
    const mockBlob = new Blob(["content"], { type: "text/plain" });
    mockFetch.mockResolvedValueOnce({
      ok: true,
      blob: () => Promise.resolve(mockBlob),
    });

    const result = await accessFile("abc12345", "mypassword");

    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toContain("/api/files/abc12345/access");
    expect(options.method).toBe("POST");
    expect(JSON.parse(options.body)).toEqual({ password: "mypassword" });
    expect(result).toBe(mockBlob);
  });

  it("throws on 403 forbidden", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ detail: "Incorrect password." }),
    });

    await expect(accessFile("abc12345", "wrong")).rejects.toThrow(
      "Incorrect password.",
    );
  });
});
