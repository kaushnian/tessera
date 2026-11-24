# Example: an agent builds "Cancel subscription" with Tessera

> **Status: target design, not working code.** This walkthrough shows how the finished system (end of Phase 3) is meant to work. The tool names, patterns and rules come from `docs/SPEC.md` §5–9. The responses, rule IDs and props are examples and may change as Phases 1–3 land.

## The feature

A Ledgerly product engineer works in the Ledgerly app repo, not in Tessera. In this project that's `apps/playground` or an eval workspace, which consume Tessera like an outside team (SPEC §11). The repo:

- installs `@tessera/react` and `@tessera/mcp` as `pnpm pack` tarballs, since public npm is deferred until 1.0 (SPEC §11). `@tessera/react` ships `tessera.manifest.json`.
- lists `npx @tessera/mcp` in `.mcp.json`. npx finds the locally installed binary, so nothing is fetched from the registry.
- has the Tessera Claude Code plugin installed (skill, hooks, reviewer subagent)

They ask Claude Code:

> "Add a 'Cancel subscription' action to the customer detail page. Ask for confirmation, and show feedback once it's done."

## Step by step

### 1. The skill sets the workflow

The plugin's "build a screen with our DS" skill matches the request and loads its steps: find the pattern first, look up every component's API before using it, never guess props, and run `validate_usage` before saying you're done.

*Why a skill:* it's a checklist that loads only when the task needs it. It tells the agent how to work but can't force anything.

### 2. Find the pattern (MCP `get_pattern`)

```jsonc
// → get_pattern({ name: "destructive-confirm" })
{
  "whenToUse": "Irreversible or costly actions: delete, cancel, revoke",
  "structure": [
    "Dialog",
    "Dialog.Title (a question naming the object)",
    "Dialog.Description (the consequence)",
    "secondary 'keep' action",
    "destructive confirm action"
  ],
  "rules": [
    { "id": "destructive-confirm/label-names-action",
      "rule": "Confirm button repeats the verb, never 'OK' or 'Yes'" },
    { "id": "destructive-confirm/safe-default-focus",
      "rule": "Initial focus goes to the non-destructive action" }
  ],
  "example": "patterns/destructive-confirm/example.tsx"
}
```

The agent also reads the pattern for the "show feedback" part of the request (Toast).

### 3. Look up the real APIs (`get_component_api`, `get_tokens`)

```jsonc
// → get_component_api({ name: "Button" })
{
  "props": {
    "variant": {
      "type": "'primary' | 'secondary' | 'ghost' | 'destructive'",
      "doc": "Use 'destructive' only for the confirm step of destructive-confirm"
    },
    "loading": {
      "type": "boolean",
      "doc": "Disables the button and announces busy state"
    }
  },
  "since": "1.0.0"
}
```

The answer comes from `tessera.manifest.json` in the installed `node_modules`, so it matches the version Ledgerly actually has (SPEC §8). `get_tokens` works the same way for semantic colour and spacing names.

### 4. First draft, and a hook catches a mistake

The agent writes the component. In one spot it reaches for a familiar Tailwind habit:

```tsx
<Text className="text-red-600">This can't be undone.</Text>
```

After the edit, the plugin's post-edit hook runs `@tessera/eslint-plugin` and sends the error back to the agent:

```text
✖ tessera/semantic-tokens-only  'text-red-600' isn't a semantic token
  (Tailwind's default palette is removed). Use: text-danger, text-danger-subtle
```

The agent switches to `<Text tone="danger">`.

*Why a hook:* the skill can only ask. The hook runs every time and can't be skipped. The same rule engine also backs CI, `validate_usage` and the eval scorer (ADR-0002), so a violation is reported the same way everywhere.

### 5. Check pattern compliance (`validate_usage`)

```text
→ validate_usage({ file: "CancelSubscriptionDialog.tsx" })
✖ destructive-confirm/label-names-action  Confirm button says "Yes".
  Expected the action verb, e.g. "Cancel subscription".
```

A generic linter can't catch this. It's Tessera's own design knowledge, written in `pattern.yaml`.

### 6. The result

```tsx
import { useState } from 'react';
import { Button, Dialog, Stack, Text, useToast } from '@tessera/react';

export function CancelSubscriptionDialog({ subscription, onCancelled }: Props) {
  const toast = useToast();
  const [pending, setPending] = useState(false);

  async function confirm() {
    setPending(true);
    try {
      await cancelSubscription(subscription.id);
      toast.success({
        title: 'Subscription cancelled',
        description: `Access ends on ${formatDate(subscription.periodEnd)}.`,
      });
      onCancelled();
    } catch {
      toast.error({
        title: "Couldn't cancel subscription",
        description: 'Nothing was changed. Try again.',
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <Button variant="secondary">Cancel subscription</Button>
      </Dialog.Trigger>
      <Dialog.Content initialFocus="keep">
        <Dialog.Title>Cancel {subscription.customerName}'s subscription?</Dialog.Title>
        <Dialog.Description>
          <Text tone="danger">
            They lose access on {formatDate(subscription.periodEnd)}. This can't be undone.
          </Text>
        </Dialog.Description>
        <Stack direction="row" gap="sm" justify="end">
          <Dialog.Close asChild>
            <Button variant="ghost" data-focus-id="keep">Keep subscription</Button>
          </Dialog.Close>
          <Button variant="destructive" loading={pending} onClick={confirm}>
            Cancel subscription
          </Button>
        </Stack>
      </Dialog.Content>
    </Dialog.Root>
  );
}
```

It has no raw colours, spacing or HTML buttons, uses semantic tokens only, and follows the pattern's rules. Dialog (built on Radix) handles keyboard support and focus trapping.

### 7. A reviewer subagent checks what rules can't

The plugin's DS reviewer runs in its own context and checks things that need judgment. Does the copy name the customer? Does focus go back to the trigger when the dialog closes? Is there a test? It points out that no vitest-axe test exists yet, and the agent adds one.

## Without Tessera's tooling

Give the same prompt to an agent that has only the npm package (eval arm 1). It will likely guess `variant="danger"` (tsc fails), write `text-red-600`, label the confirm button "Yes", and leave the error path out. Phase 4 is built to measure exactly this difference: the same 20 Ledgerly prompts, scored on tsc, lint, axe and rule violations, across the three arms (package, + MCP, + MCP + plugin).

## The idea behind it

| Layer | Role | Can it be skipped? |
|---|---|---|
| MCP server | **Knowledge.** The agent asks for it. | Yes, the agent may not call it |
| Skill | **Workflow.** When to ask and in what order. | Yes, it's guidance |
| Hook + eslint plugin | **Enforcement.** Runs the same checks every time. | No |
| Reviewer subagent | **Judgment.** Copy, UX, missing tests. | Yes, but it runs in a separate context |
| Evals | **Proof** that the layers above help. | n/a |

Each layer covers what the one above it can miss. That's why the spec has all of them instead of just "an MCP server".
