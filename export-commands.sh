#!/bin/sh
JS_FILE_PATH="$1"
# https://gist.github.com/reggi/0dd44aa8a96cbea4dba9438dfaa0c65a
EXPORTS=$(deno run --allow-all https://gist.githubusercontent.com/reggi/0dd44aa8a96cbea4dba9438dfaa0c65a/raw/88fac1befb152c7fa50204963ecc3b7a437e7594/tsexports.ts "$JS_FILE_PATH")

# Process each function name
echo "$output" | while IFS= read -r FUNC_NAME
do
  # Skip empty lines or any line that doesn't look like a valid function name
  if [ -z "$FUNC_NAME" ] || [[ ! "$FUNC_NAME" =~ ^[a-zA-Z_][a-zA-Z0-9_]*$ ]]; then
    continue
  fi

  # Dynamically create shell functions for each valid function name
  eval "$FUNC_NAME() { deno eval \"await import('$JS_FILE_PATH').then(async m => m['$FUNC_NAME'] && await m['$FUNC_NAME'](...Deno.args)).then(v => v ? console.log(v) : null)\" -- \"\$@\"; }"
done
