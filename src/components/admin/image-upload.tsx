"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Cropper from "react-easy-crop";
import type { Area } from "react-easy-crop";
import { Upload, X, Crop, ZoomIn, ZoomOut, Check } from "lucide-react";

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "";
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "";

interface ImageUploadProps {
  /** Current image URL (for edit mode) */
  value?: string;
  /** Cloudinary folder path, e.g. "team" or "events" */
  folder: string;
  /** Called when upload completes with the download URL */
  onChange: (url: string) => void;
  /** Aspect ratio for cropping (default: 1 for square/circle) */
  aspect?: number;
  /** Show circular crop guide (default: true — ideal for team photos) */
  cropShape?: "round" | "rect";
}

// Convert a file to a data URL for the cropper
function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Crop the image on a canvas and return a Blob
async function getCroppedBlob(
  imageSrc: string,
  cropArea: Area,
  outputSize = 512
): Promise<Blob> {
  const image = new Image();
  image.crossOrigin = "anonymous";
  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = reject;
    image.src = imageSrc;
  });

  const canvas = document.createElement("canvas");
  canvas.width = outputSize;
  canvas.height = outputSize;
  const ctx = canvas.getContext("2d")!;

  ctx.drawImage(
    image,
    cropArea.x,
    cropArea.y,
    cropArea.width,
    cropArea.height,
    0,
    0,
    outputSize,
    outputSize
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Canvas crop failed"))),
      "image/jpeg",
      0.9
    );
  });
}

export function ImageUpload({
  value,
  folder,
  onChange,
  aspect = 1,
  cropShape = "round",
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState(value || "");
  const [error, setError] = useState("");

  // Crop state
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  // Sync preview when value prop changes
  useEffect(() => {
    setPreview(value || "");
  }, [value]);

  const onCropComplete = useCallback((_: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  // Step 1: User picks a file → open crop modal
  const handleFileSelect = async (file: File) => {
    setError("");

    if (!CLOUD_NAME || !UPLOAD_PRESET) {
      setError(
        "Cloudinary is not configured. Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET in your .env.local file."
      );
      return;
    }
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file (PNG, JPG, WEBP).");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("Image must be under 10 MB.");
      return;
    }

    const dataUrl = await readFileAsDataURL(file);
    setCropSrc(dataUrl);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  };

  // Step 2: User confirms crop → crop on canvas → upload to Cloudinary
  const handleCropConfirm = async () => {
    if (!cropSrc || !croppedAreaPixels) return;

    setUploading(true);
    setProgress(0);
    setCropSrc(null);

    try {
      const croppedBlob = await getCroppedBlob(cropSrc, croppedAreaPixels, 512);
      const file = new File([croppedBlob], "photo.jpg", { type: "image/jpeg" });

      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", UPLOAD_PRESET);
      formData.append("folder", `finfoundry/${folder}`);

      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          setProgress(Math.round((e.loaded / e.total) * 100));
        }
      });

      const url: string = await new Promise((resolve, reject) => {
        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            const data = JSON.parse(xhr.responseText);
            resolve(data.secure_url);
          } else {
            try {
              const err = JSON.parse(xhr.responseText);
              reject(new Error(err.error?.message || "Upload failed"));
            } catch {
              reject(new Error(`Upload failed (status ${xhr.status})`));
            }
          }
        });
        xhr.addEventListener("error", () => reject(new Error("Network error during upload")));
        xhr.addEventListener("abort", () => reject(new Error("Upload cancelled")));

        xhr.open("POST", `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`);
        xhr.send(formData);
      });

      setPreview(url);
      onChange(url);
    } catch (err) {
      console.error("Upload error:", err);
      setError(err instanceof Error ? err.message : "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
    if (inputRef.current) inputRef.current.value = "";
  };

  const clear = () => {
    setPreview("");
    setError("");
    setCropSrc(null);
    onChange("");
  };

  return (
    <div>
      {error && (
        <div className="mb-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* ── Crop Modal ── */}
      {cropSrc && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-surface-raised rounded-2xl border border-white/[0.08] overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-2 text-foreground">
                <Crop className="w-4 h-4 text-teal-light" />
                <span className="font-heading font-semibold text-sm">Crop Photo</span>
              </div>
              <button
                onClick={() => setCropSrc(null)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cropper */}
            <div className="relative w-full" style={{ height: 320 }}>
              <Cropper
                image={cropSrc}
                crop={crop}
                zoom={zoom}
                aspect={aspect}
                cropShape={cropShape}
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>

            {/* Zoom controls */}
            <div className="flex items-center justify-center gap-4 px-5 py-3 border-t border-white/[0.06]">
              <button
                onClick={() => setZoom((z) => Math.max(1, z - 0.2))}
                className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/[0.08] transition-colors"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <input
                type="range"
                min={1}
                max={3}
                step={0.05}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-40 accent-teal"
              />
              <button
                onClick={() => setZoom((z) => Math.min(3, z + 0.2))}
                className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/[0.08] transition-colors"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-white/[0.06]">
              <button
                onClick={() => setCropSrc(null)}
                className="px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground border border-white/[0.06] hover:bg-white/[0.04] transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleCropConfirm}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-teal text-white text-sm font-semibold hover:bg-teal-light transition-colors"
              >
                <Check className="w-4 h-4" />
                Crop & Upload
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Preview / Drop zone ── */}
      {preview ? (
        <div className="relative group rounded-xl overflow-hidden border border-white/[0.06] bg-white/[0.02]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="Preview"
            className="w-full h-48 object-cover"
          />
          <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="w-8 h-8 rounded-lg bg-black/60 flex items-center justify-center text-white hover:bg-teal/80 transition-colors"
              title="Replace photo"
            >
              <Crop className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={clear}
              className="w-8 h-8 rounded-lg bg-black/60 flex items-center justify-center text-white hover:bg-red-500/80 transition-colors"
              title="Remove photo"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          className="flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 border-dashed border-white/[0.08] hover:border-teal/[0.2] bg-white/[0.02] hover:bg-white/[0.03] cursor-pointer transition-all duration-200"
        >
          {uploading ? (
            <>
              <div className="w-10 h-10 rounded-full border-2 border-teal/30 border-t-teal animate-spin" />
              <p className="text-sm text-muted-foreground">
                Uploading... {progress}%
              </p>
            </>
          ) : (
            <>
              <div className="w-12 h-12 rounded-xl bg-teal/[0.06] flex items-center justify-center">
                <Upload className="w-5 h-5 text-teal-light/60" />
              </div>
              <div className="text-center">
                <p className="text-sm text-foreground/80">
                  Drop an image here or click to browse
                </p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  PNG, JPG up to 10 MB · Will be cropped before upload
                </p>
              </div>
            </>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        className="hidden"
      />
    </div>
  );
}
