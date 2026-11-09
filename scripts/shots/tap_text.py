import re
import sys
import xml.etree.ElementTree as ET

# Usage: tap_text.py <dump.xml> <text> [exact|contains|exact_last|contains_last]
# Prints "x y" (center of the matching node's bounds) and exits 0,
# or exits 1 when no VISIBLE node matches.
# Gate fix (v3.7.0 walk): only nodes intersecting the visible window
# (1080x1920) are eligible — the v3.7.0 All-sections grid mounts every
# tile, and off-screen tile bounds previously produced taps that landed
# on the bottom navigation. *_last picks the last visible match in tree
# order (in-app tile over a same-named header control).
path, target = sys.argv[1], sys.argv[2]
mode = sys.argv[3] if len(sys.argv) > 3 else "contains"
want_last = mode.endswith("_last")
base_mode = mode[:-5] if want_last else mode

try:
    root = ET.parse(path).getroot()
except Exception:
    sys.exit(1)

matches = []
for node in root.iter("node"):
    label = node.get("text") or node.get("content-desc") or ""
    ok = (label == target) if base_mode == "exact" else (target in label)
    if not ok:
        continue
    m = re.match(r"\[(\d+),(\d+)\]\[(\d+),(\d+)\]", node.get("bounds") or "")
    if not m:
        continue
    x1, y1, x2, y2 = (int(m.group(i)) for i in (1, 2, 3, 4))
    if x2 <= 0 or x1 >= 1080 or y2 <= 0 or y1 >= 1900:
        continue  # fully off-screen
    x = min(max((x1 + x2) // 2, 0), 1079)
    y = min(max((y1 + y2) // 2, 0), 1899)
    matches.append((x, y))

if not matches:
    sys.exit(1)
x, y = matches[-1] if want_last else matches[0]
print(x, y)
sys.exit(0)
