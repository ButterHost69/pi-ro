# pi-ro

Read-only mode for [pi](https://github.com/badlogic/pi-mono). Prevent accidental file modifications with a single command.

## Features

- **`/ro`** — Toggle read-only mode on/off
- Blocks `write` and `edit` tool calls
- Blocks file-mutating `bash` commands (`rm`, `mv`, `cp`, `sed -i`, `>`, `git add`, `npm install`, etc.)
- Injects a system prompt so the LLM knows it is in read-only mode and structures output as analysis only
- **Orange theme** when active — switches the entire TUI to an orange/copper palette
- **Restores previous theme** when disabled

## Install

### From GitHub (recommended)

```bash
pi install git:github.com/yourusername/pi-ro
```

### From npm

```bash
pi install npm:pi-ro
```

### One-off test (no install, current session only)

```bash
pi -e git:github.com/yourusername/pi-ro
```

### Local path (for development)

```bash
pi install /mnt/shared_ssd/Timepass/my-pi-agents/ro
```

After installing, run `/reload` in pi or restart the agent.

## Usage

```
/ro
```

Run it again to disable. State and previous theme persist across sessions.

## Files

```
pi-ro/
├── package.json
├── extensions/
│   └── index.ts          # Extension entry point
├── themes/
│   └── ro-orange.json    # Orange read-only theme
└── README.md
```

## Customizing Blocked Commands

Edit the `explicitMutators` array in `extensions/index.ts` to add or remove bash patterns, then run `/reload`.
