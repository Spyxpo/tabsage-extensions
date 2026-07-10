#!/usr/bin/env bash
# Scaffold a new Tab Sage extension under extensions/<id>/.
#
# Usage (flags, any omitted are prompted for):
#   ./create.sh --id my-ext --name "My Ext" --description "Does a thing." \
#               --author "You" [--homepage URL] [--permissions content_scripts,storage] \
#               [--matches "<all_urls>"] [--run-at document_end]
#
# Or just run ./create.sh with no arguments to be prompted for everything.
#
# The valid permissions are: content_scripts (required), storage, ai, tabs, notifications.
set -euo pipefail

repo_root="$(cd "$(dirname "$0")" && pwd)"
ext_root="$repo_root/extensions"

ID="" NAME="" DESCRIPTION="" AUTHOR="" HOMEPAGE=""
PERMISSIONS="content_scripts" MATCHES="<all_urls>" RUN_AT="document_end"

while [ $# -gt 0 ]; do
  case "$1" in
    --id) ID="$2"; shift 2 ;;
    --name) NAME="$2"; shift 2 ;;
    --description|--desc) DESCRIPTION="$2"; shift 2 ;;
    --author) AUTHOR="$2"; shift 2 ;;
    --homepage) HOMEPAGE="$2"; shift 2 ;;
    --permissions|--perms) PERMISSIONS="$2"; shift 2 ;;
    --matches) MATCHES="$2"; shift 2 ;;
    --run-at) RUN_AT="$2"; shift 2 ;;
    -h|--help) grep '^#' "$0" | sed 's/^# \{0,1\}//'; exit 0 ;;
    *) echo "Unknown option: $1" >&2; exit 1 ;;
  esac
done

# Prompt for anything still missing (id and name are required).
prompt() { # prompt VAR "Question" "default"
  local __var="$1" __q="$2" __def="${3:-}" __ans
  if [ -n "${!__var}" ]; then return; fi
  if [ -n "$__def" ]; then
    printf "%s [%s]: " "$__q" "$__def" >&2
  else
    printf "%s: " "$__q" >&2
  fi
  read -r __ans || true
  printf -v "$__var" "%s" "${__ans:-$__def}"
}

prompt ID          "Extension id (lowercase, digits, hyphens)"
prompt NAME        "Display name"
prompt DESCRIPTION "One-line description"
prompt AUTHOR      "Author"
prompt HOMEPAGE    "Homepage URL (optional)"
prompt PERMISSIONS "Permissions (comma-separated)" "content_scripts"
prompt MATCHES     "Match pattern" "<all_urls>"
prompt RUN_AT      "Run at (document_start|document_end)" "document_end"

# --- validate ---------------------------------------------------------------
if ! printf '%s' "$ID" | grep -qE '^[a-z0-9-]+$'; then
  echo "Error: id must be lowercase letters, digits, and hyphens only." >&2
  exit 1
fi
if [ -z "$NAME" ] || [ -z "$DESCRIPTION" ] || [ -z "$AUTHOR" ]; then
  echo "Error: name, description, and author are required." >&2
  exit 1
fi

dest="$ext_root/$ID"
if [ -e "$dest" ]; then
  echo "Error: $dest already exists." >&2
  exit 1
fi

# Normalize + validate the permissions list. content_scripts is always included.
valid_perm() {
  case "$1" in
    content_scripts|storage|ai|tabs|notifications) return 0 ;;
    *) return 1 ;;
  esac
}
perms_json="" has_cs=0
IFS=',' read -ra _perms <<< "$PERMISSIONS"
for p in "${_perms[@]}"; do
  p="$(printf '%s' "$p" | tr -d '[:space:]')"
  [ -z "$p" ] && continue
  if ! valid_perm "$p"; then
    echo "Error: unknown permission '$p'. Valid: content_scripts, storage, ai, tabs, notifications." >&2
    exit 1
  fi
  [ "$p" = "content_scripts" ] && has_cs=1
  perms_json="$perms_json\"$p\", "
done
if [ "$has_cs" -eq 0 ]; then
  perms_json="\"content_scripts\", $perms_json"
fi
perms_json="[ ${perms_json%, } ]"

case "$RUN_AT" in
  document_start|document_end) ;;
  *) echo "Error: run-at must be document_start or document_end." >&2; exit 1 ;;
esac

# --- write files ------------------------------------------------------------
mkdir -p "$dest"

# homepage is optional: emit null when empty.
if [ -n "$HOMEPAGE" ]; then home_json="\"$HOMEPAGE\""; else home_json="null"; fi

cat > "$dest/manifest.json" <<JSON
{
  "id": "$ID",
  "name": "$NAME",
  "version": "1.0.0",
  "description": "$DESCRIPTION",
  "author": "$AUTHOR",
  "homepage": $home_json,
  "permissions": $perms_json,
  "content_scripts": [
    {
      "matches": ["$MATCHES"],
      "js": ["content.js"],
      "css": ["style.css"],
      "run_at": "$RUN_AT"
    }
  ]
}
JSON

# CamelCase the id for a unique window guard flag (portable across BSD/GNU awk).
guard="__ts$(printf '%s' "$ID" | awk -F- '{s="";for(i=1;i<=NF;i++)s=s toupper(substr($i,1,1)) substr($i,2);print s}')"
cat > "$dest/content.js" <<JS
// $NAME — $DESCRIPTION
(function () {
  // Content scripts can run more than once per page (e.g. after in-page
  // navigation), so bail out if we already ran.
  if (window.$guard) return;
  window.$guard = true;

  // console output shows up in Settings > Extensions, so it confirms the
  // extension is alive on the page.
  console.log("$NAME ready on", location.href);

  // TODO: your extension code here. If you requested host permissions, the
  // \`tabsage\` API is available (e.g. tabsage.storage, tabsage.ai, tabsage.tabs,
  // tabsage.notify) — see the repository README.
})();
JS

cat > "$dest/style.css" <<CSS
/* Styles for $NAME. Keep selectors specific so you don't affect the host page. */
CSS

cat > "$dest/README.md" <<MD
# $NAME

$DESCRIPTION

## What it touches

- Runs on: \`$MATCHES\` (never in incognito).
- Describe here exactly what the extension reads or changes.

## Permissions

$(printf '%s' "$PERMISSIONS")

## Changes

- 1.0.0 — Initial release.
MD

echo "Created $dest"
echo
echo "Next steps:"
echo "  1. Edit content.js / style.css."
echo "  2. In Tab Sage: Settings > Extensions > Load unpacked → $dest"
echo "  3. Reload a page it matches to test it."
