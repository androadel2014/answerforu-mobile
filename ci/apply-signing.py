#!/usr/bin/env python3
"""CI-only signing injection for the Expo-prebuild-generated android tree.

The delivered app source contains no native android/ project (it is generated
by `expo prebuild` in CI). The generated android/app/build.gradle signs the
release build type with the DEBUG keystore. This script patches ONLY the
generated file inside CI so that:

  * a new signing config `afuRelease` reads the upload keystore from the same
    env vars the other apps in this lane use
    (KEYSTORE_FILE / KEYSTORE_PASSWORD / KEY_ALIAS / KEY_PASSWORD), and
  * the release build type uses `afuRelease` instead of the debug config.

No delivered app source file is modified. The script exits non-zero if the
expected template patterns are not found, so a build can never silently fall
back to a debug-signed release.
"""
import pathlib
import sys

path = pathlib.Path("android/app/build.gradle")
if not path.exists():
    sys.exit("ERROR: android/app/build.gradle not found — run expo prebuild first")

text = path.read_text()

SIGNING_BLOCK = """
        afuRelease {
            storeFile file(System.getenv("KEYSTORE_FILE"))
            storePassword System.getenv("KEYSTORE_PASSWORD")
            keyAlias System.getenv("KEY_ALIAS")
            keyPassword System.getenv("KEY_PASSWORD")
        }
"""

# 1) Add the afuRelease signing config inside the signingConfigs block.
anchor = "signingConfigs {"
idx = text.find(anchor)
if idx < 0:
    sys.exit("ERROR: 'signingConfigs {' not found in generated build.gradle")
insert_at = idx + len(anchor)
text = text[:insert_at] + SIGNING_BLOCK + text[insert_at:]

# 2) Point the release build type at afuRelease (only the release occurrence).
build_types_idx = text.find("buildTypes {")
if build_types_idx < 0:
    sys.exit("ERROR: 'buildTypes {' not found in generated build.gradle")
rel_idx = text.find("release {", build_types_idx)
if rel_idx < 0:
    sys.exit("ERROR: release buildType not found in generated build.gradle")
target = "signingConfig signingConfigs.debug"
occ = text.find(target, rel_idx)
if occ < 0:
    sys.exit("ERROR: release signingConfig line not found in generated build.gradle")
text = text[:occ] + "signingConfig signingConfigs.afuRelease" + text[occ + len(target):]

path.write_text(text)

# 3) Verify the patch is in place before letting the build proceed.
final = path.read_text()
assert "afuRelease {" in final, "afuRelease block missing after patch"
assert 'System.getenv("KEYSTORE_FILE")' in final, "env-var storeFile missing after patch"
assert "signingConfig signingConfigs.afuRelease" in final, "release signingConfig not switched"
print("OK: generated android/app/build.gradle patched — release build type uses afuRelease (env-var keystore).")
