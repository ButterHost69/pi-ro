# pi Read-Only Extension

Toggle read-only mode in [pi](https://github.com/badlogic/pi-mono) to prevent accidental file modifications.

## Features

- **`/ro`** — Toggle read-only mode on/off
- Blocks `write` and `edit` tool calls
- Blocks file-mutating `bash` commands (`rm`, `mv`, `cp`, `sed -i`, `>`, `git add`, `npm install`, etc.)
- Injects a system prompt so the LLM knows it is in read-only mode and structures output as analysis only
- Visual indicators: orange status bar, banner widget, and orange working spinner

## Installation

### Option 1: Symlink (recommended — stays in sync with git repo)

```bash
ln -s /mnt/shared_ssd/Timepass/my-pi-agents/ro ~/.pi/agent/extensions/ro
```

### Option 2: Copy

```bash
cp -r /mnt/shared_ssd/Timepass/my-pi-agents/ro ~/.pi/agent/extensions/
```

### Option 3: Quick test (one-off)

```bash
pi -e /mnt/shared_ssd/Timepass/my-pi-agents/ro/index.ts
```

After installing, run `/reload` in pi or restart the agent.

## Usage

```
/ro
```

Run it again to disable. State persists across sessions.

## Customizing Blocked Commands

Edit the `explicitMutators` array in `index.ts` to add or remove bash patterns.
