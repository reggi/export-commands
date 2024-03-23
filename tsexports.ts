import ts from "npm:typescript";
import { readFileSync } from "node:fs";

function extractExportsFromFile(filePath: string): string[] {
  // Read the file content
  const fileContent = readFileSync(filePath, { encoding: 'utf8' });
  if (!fileContent) {
    throw new Error(`File not found or empty: ${filePath}`);
  }
  
  // Create a SourceFile object
  const sourceFile = ts.createSourceFile(
    filePath,
    fileContent,
    ts.ScriptTarget.Latest,
    true
  );

  const exports: string[] = [];

  function visit(node: ts.Node) {
    // Check for ExportDeclaration specifically (e.g., `export { name1 as default };`)
    if (ts.isExportDeclaration(node)) {
      if (node.exportClause && ts.isNamedExports(node.exportClause)) {
        node.exportClause.elements.forEach((element) => {
          exports.push(element.name.text);
        });
      }
    }

    // Use type guards to check for modifiers in nodes where they are applicable
    if (ts.isFunctionDeclaration(node) || ts.isVariableStatement(node)) {
      if (node.modifiers && node.modifiers.some(modifier => modifier.kind === ts.SyntaxKind.ExportKeyword)) {
        if (ts.isFunctionDeclaration(node) && node.name) {
          // This is a FunctionDeclaration with a name and export keyword
          exports.push(node.name.text);
        } else if (ts.isVariableStatement(node)) {
          // This is a VariableStatement with an export keyword
          node.declarationList.declarations.forEach(declaration => {
            if (ts.isIdentifier(declaration.name)) {
              exports.push(declaration.name.text);
            }
          });
        }
      }
    }

    // Recursively visit all children of the current node
    ts.forEachChild(node, visit);
  }
  // Start extraction
  visit(sourceFile);
  return exports;
}

const filePath = Deno.args[0];

try {
  const exports = extractExportsFromFile(filePath);
  Deno.stdout.write(new TextEncoder().encode(exports.join("\n")));
} catch (error) {
  console.error(`Error: ${error.message}`);
  Deno.exit(1);
}