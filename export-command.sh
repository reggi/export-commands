local SCRIPT_DIR=$(dirname "$(realpath "$0")")
local JS_FILE_PATH="$1"
output=$(deno run --allow-all "$SCRIPT_DIR/get-exports.ts")
echo "$output" | while IFS= read -r FUNC_NAME
do
  eval "$FUNC_NAME() { deno eval \"await import('$JS_FILE_PATH').then(async m => await m['$FUNC_NAME'](...Deno.args)).then(v => v ? console.log(v) : null)\" -- \"\$@\"; }"
done