import type { ExtensionAPI, ExtensionContext } from "@mariozechner/pi-coding-agent";
import { Text } from "@mariozechner/pi-tui";

export default function (pi: ExtensionAPI) {
  let isReadOnly = false;

  // --- Helpers ---

  function findLatestState(ctx: ExtensionContext): boolean {
    const entries = ctx.sessionManager.getEntries();
    let active = false;
    for (const entry of entries) {
      if (entry.type === "custom" && entry.customType === "ro-state") {
        active = (entry as any).data?.active ?? false;
      }
    }
    return active;
  }

  function stripQuotes(cmd: string): string {
    return cmd.replace(/(["'])(?:\\.|(?!\1)[^\\])*?\1/g, "");
  }

  function isMutatingBash(command: string): boolean {
    const lower = command.toLowerCase();
    const stripped = stripQuotes(command);

    // Explicit file-mutating commands
    const explicitMutators = [
      /\brm\b/,
      /\bmv\b/,
      /\bcp\b/,
      /\btouch\b/,
      /\bmkdir\b/,
      /\brmdir\b/,
      /\bchmod\b/,
      /\bchown\b/,
      /\bln\b/,
      /\btruncate\b/,
      /\bsed\s+.*-i/,
      /\bperl\s+.*-i/,
      /\btee\b/,
      /\bdd\s+if=/,
      /\bshred\b/,
      /\bmkfifo\b/,
      /\bgit\s+(add|rm|mv|commit|merge|rebase|cherry-pick|checkout|reset|clean|stash|pull|push|branch|tag)\b/,
      /\bnpm\s+(install|ci|publish|uninstall|update|i)\b/,
      /\byarn\s+(install|add|remove|upgrade)\b/,
      /\bpnpm\s+(install|add|remove|update)\b/,
      /\bpip\s+install\b/,
      /\bcargo\s+(build|install|run)\b/,
      /\bmake\b/,
      /\bcmake\b/,
    ];

    if (explicitMutators.some((p) => p.test(lower))) return true;

    // Shell redirections (write to file)
    if (/\s>\s/.test(stripped) || /\s>>\s/.test(stripped)) return true;
    if (/\d?>\s/.test(stripped) || /\d?>>\s/.test(stripped)) return true;

    return false;
  }

  function applyUI(ctx: ExtensionContext) {
    if (!ctx.hasUI) return;

    if (isReadOnly) {
      ctx.ui.setStatus("ro", "🟠 READ-ONLY MODE");
      ctx.ui.setWidget(
        "ro",
        (_tui, theme) => {
          const line =
            "🟠 READ-ONLY MODE — File writes and edits are blocked. Run /ro to disable.";
          return new Text(theme.fg("warning", line), 0, 0);
        },
        { placement: "aboveEditor" }
      );
      ctx.ui.setWorkingIndicator({
        frames: ["🟠", "🔶", "🟧", "🔶"],
        intervalMs: 300,
      });
    } else {
      ctx.ui.setStatus("ro", undefined);
      ctx.ui.setWidget("ro", undefined);
      ctx.ui.setWorkingIndicator(); // restore default spinner
    }
  }

  // --- Events ---

  pi.on("session_start", async (_event, ctx) => {
    isReadOnly = findLatestState(ctx);
    applyUI(ctx);
  });

  pi.on("before_agent_start", async (event, _ctx) => {
    if (!isReadOnly) return;
    return {
      systemPrompt:
        event.systemPrompt +
        "\n\n[READ-ONLY MODE ACTIVE] You are currently in read-only mode. You cannot create, modify, or delete any files. Do not use write, edit, or bash commands that mutate files. Structure your output as analysis, observations, and suggestions only. If the user wants changes, describe what should be done instead of executing them.",
    };
  });

  pi.on("tool_call", async (event, _ctx) => {
    if (!isReadOnly) return;

    if (event.toolName === "write") {
      return {
        block: true,
        reason:
          "Read-only mode is active. The write tool is disabled. Run /ro to disable read-only mode.",
      };
    }

    if (event.toolName === "edit") {
      return {
        block: true,
        reason:
          "Read-only mode is active. The edit tool is disabled. Run /ro to disable read-only mode.",
      };
    }

    if (event.toolName === "bash") {
      const cmd = event.input.command ?? "";
      if (isMutatingBash(cmd)) {
        return {
          block: true,
          reason: `Read-only mode is active. This bash command appears to modify files or the environment: "${cmd}". Run /ro to disable read-only mode.`,
        };
      }
    }
  });

  // --- Command ---

  pi.registerCommand("ro", {
    description:
      "Toggle read-only mode (blocks write, edit, and file-mutating bash commands)",
    handler: async (_args, ctx) => {
      isReadOnly = !isReadOnly;
      pi.appendEntry("ro-state", { active: isReadOnly });
      applyUI(ctx);
      ctx.ui.notify(
        isReadOnly ? "🟠 Read-only mode ON" : "Read-only mode OFF",
        isReadOnly ? "warning" : "success"
      );
    },
  });
}
