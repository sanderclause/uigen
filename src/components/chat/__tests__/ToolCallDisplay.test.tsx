import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolCallDisplay, getToolCallLabel } from "../ToolCallDisplay";

afterEach(() => {
  cleanup();
});

// ─── getToolCallLabel ────────────────────────────────────────────────────────

describe("getToolCallLabel", () => {
  describe("str_replace_editor", () => {
    it("returns Creating for create command", () => {
      expect(getToolCallLabel("str_replace_editor", { command: "create", path: "/App.jsx" }))
        .toEqual({ action: "Creating", fileName: "App.jsx" });
    });

    it("returns Editing for str_replace command", () => {
      expect(getToolCallLabel("str_replace_editor", { command: "str_replace", path: "/components/Card.jsx" }))
        .toEqual({ action: "Editing", fileName: "Card.jsx" });
    });

    it("returns Editing for insert command", () => {
      expect(getToolCallLabel("str_replace_editor", { command: "insert", path: "/App.jsx" }))
        .toEqual({ action: "Editing", fileName: "App.jsx" });
    });

    it("returns Reading for view command", () => {
      expect(getToolCallLabel("str_replace_editor", { command: "view", path: "/App.jsx" }))
        .toEqual({ action: "Reading", fileName: "App.jsx" });
    });

    it("returns Processing for unknown command", () => {
      expect(getToolCallLabel("str_replace_editor", { command: "unknown", path: "/App.jsx" }))
        .toEqual({ action: "Processing", fileName: "App.jsx" });
    });

    it("returns Processing with empty fileName when args are empty", () => {
      expect(getToolCallLabel("str_replace_editor", {}))
        .toEqual({ action: "Processing", fileName: "" });
    });

    it("extracts just the filename from a nested path", () => {
      expect(getToolCallLabel("str_replace_editor", { command: "create", path: "/src/components/ui/Button.tsx" }))
        .toEqual({ action: "Creating", fileName: "Button.tsx" });
    });

    it("handles a root-level path with no directories", () => {
      expect(getToolCallLabel("str_replace_editor", { command: "create", path: "App.jsx" }))
        .toEqual({ action: "Creating", fileName: "App.jsx" });
    });
  });

  describe("file_manager", () => {
    it("returns Renaming with both filenames for rename command", () => {
      expect(
        getToolCallLabel("file_manager", { command: "rename", path: "/old.jsx", new_path: "/new.jsx" })
      ).toEqual({ action: "Renaming", fileName: "old.jsx → new.jsx" });
    });

    it("extracts filenames from nested paths for rename", () => {
      expect(
        getToolCallLabel("file_manager", {
          command: "rename",
          path: "/components/OldName.tsx",
          new_path: "/components/NewName.tsx",
        })
      ).toEqual({ action: "Renaming", fileName: "OldName.tsx → NewName.tsx" });
    });

    it("returns Deleting for delete command", () => {
      expect(getToolCallLabel("file_manager", { command: "delete", path: "/App.jsx" }))
        .toEqual({ action: "Deleting", fileName: "App.jsx" });
    });

    it("returns Managing for unknown command", () => {
      expect(getToolCallLabel("file_manager", { command: "unknown", path: "/App.jsx" }))
        .toEqual({ action: "Managing", fileName: "App.jsx" });
    });
  });

  describe("unknown tool", () => {
    it("returns the tool name as action with empty fileName", () => {
      expect(getToolCallLabel("some_other_tool", {}))
        .toEqual({ action: "some_other_tool", fileName: "" });
    });
  });
});

// ─── ToolCallDisplay component ───────────────────────────────────────────────

describe("ToolCallDisplay", () => {
  it("shows the action and filename when in progress", () => {
    render(
      <ToolCallDisplay
        toolName="str_replace_editor"
        args={{ command: "create", path: "/App.jsx" }}
        state="call"
      />
    );
    expect(screen.getByText("Creating")).toBeDefined();
    expect(screen.getByText("App.jsx")).toBeDefined();
  });

  it("shows the action and filename when complete", () => {
    render(
      <ToolCallDisplay
        toolName="str_replace_editor"
        args={{ command: "str_replace", path: "/components/Card.jsx" }}
        state="result"
      />
    );
    expect(screen.getByText("Editing")).toBeDefined();
    expect(screen.getByText("Card.jsx")).toBeDefined();
  });

  it("renders the green dot when state is result", () => {
    const { container } = render(
      <ToolCallDisplay
        toolName="str_replace_editor"
        args={{ command: "create", path: "/App.jsx" }}
        state="result"
      />
    );
    expect(container.querySelector(".bg-emerald-500")).toBeTruthy();
    expect(container.querySelector(".animate-spin")).toBeNull();
  });

  it("renders the spinner when state is call", () => {
    const { container } = render(
      <ToolCallDisplay
        toolName="str_replace_editor"
        args={{ command: "create", path: "/App.jsx" }}
        state="call"
      />
    );
    expect(container.querySelector(".animate-spin")).toBeTruthy();
    expect(container.querySelector(".bg-emerald-500")).toBeNull();
  });

  it("renders the spinner when state is partial-call", () => {
    const { container } = render(
      <ToolCallDisplay
        toolName="str_replace_editor"
        args={{ command: "create", path: "/App.jsx" }}
        state="partial-call"
      />
    );
    expect(container.querySelector(".animate-spin")).toBeTruthy();
  });

  it("does not render a fileName span when fileName is empty", () => {
    const { container } = render(
      <ToolCallDisplay
        toolName="str_replace_editor"
        args={{}}
        state="call"
      />
    );
    expect(container.querySelector(".font-mono")).toBeNull();
  });

  it("renders file_manager delete correctly", () => {
    render(
      <ToolCallDisplay
        toolName="file_manager"
        args={{ command: "delete", path: "/Card.jsx" }}
        state="call"
      />
    );
    expect(screen.getByText("Deleting")).toBeDefined();
    expect(screen.getByText("Card.jsx")).toBeDefined();
  });

  it("renders file_manager rename with arrow notation", () => {
    render(
      <ToolCallDisplay
        toolName="file_manager"
        args={{ command: "rename", path: "/old.jsx", new_path: "/new.jsx" }}
        state="result"
      />
    );
    expect(screen.getByText("Renaming")).toBeDefined();
    expect(screen.getByText("old.jsx → new.jsx")).toBeDefined();
  });
});
