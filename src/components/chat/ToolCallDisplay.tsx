"use client";

import { Loader2 } from "lucide-react";

interface ToolCallDisplayProps {
  toolName: string;
  args: Record<string, unknown>;
  state: "partial-call" | "call" | "result";
}

interface ToolCallLabel {
  action: string;
  fileName: string;
}

function extractFileName(path: unknown): string {
  if (typeof path !== "string" || !path) return "";
  const parts = path.split("/").filter(Boolean);
  return parts[parts.length - 1] ?? "";
}

export function getToolCallLabel(
  toolName: string,
  args: Record<string, unknown>
): ToolCallLabel {
  if (toolName === "str_replace_editor") {
    const fileName = extractFileName(args.path);
    switch (args.command) {
      case "create":
        return { action: "Creating", fileName };
      case "str_replace":
        return { action: "Editing", fileName };
      case "insert":
        return { action: "Editing", fileName };
      case "view":
        return { action: "Reading", fileName };
      default:
        return { action: "Processing", fileName };
    }
  }

  if (toolName === "file_manager") {
    const fileName = extractFileName(args.path);
    switch (args.command) {
      case "rename": {
        const newFileName = extractFileName(args.new_path);
        return { action: "Renaming", fileName: `${fileName} → ${newFileName}` };
      }
      case "delete":
        return { action: "Deleting", fileName };
      default:
        return { action: "Managing", fileName };
    }
  }

  return { action: toolName, fileName: "" };
}

export function ToolCallDisplay({ toolName, args, state }: ToolCallDisplayProps) {
  const isComplete = state === "result";
  const { action, fileName } = getToolCallLabel(toolName, args);

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs border border-neutral-200">
      {isComplete ? (
        <div className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
      ) : (
        <Loader2 className="w-3 h-3 animate-spin text-blue-600 flex-shrink-0" />
      )}
      <span className="text-neutral-600">{action}</span>
      {fileName && (
        <span className="text-neutral-900 font-medium font-mono">{fileName}</span>
      )}
    </div>
  );
}
