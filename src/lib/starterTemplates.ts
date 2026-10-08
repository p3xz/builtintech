import { IStarterTemplates } from "@/types";

export function generateDefaultStarterTemplates(problemTitle: string): IStarterTemplates {
  return {
    python: `# Problem: ${problemTitle}\n# Write your solution below using stdin and stdout\n\nimport sys\n\ndef solve():\n    lines = sys.stdin.read().splitlines()\n    if not lines:\n        return\n    \n    # TODO: Implement solution\n    pass\n\nif __name__ == "__main__":\n    solve()\n`,

    javascript: `// Problem: ${problemTitle}\n// Read from standard input and print output\n\nimport * as fs from "node:fs";\n\nfunction solve() {\n    const input = fs.readFileSync(0, "utf-8");\n    const lines = input.trim().split("\\n");\n    \n    // TODO: Implement solution\n}\n\nsolve();\n`,

    cpp: `// Problem: ${problemTitle}\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    \n    // TODO: Implement solution\n    \n    return 0;\n}\n`,

    c: `/* Problem: ${problemTitle} */\n#include <stdio.h>\n#include <stdlib.h>\n#include <string.h>\n\nint main() {\n    // TODO: Implement solution\n    \n    return 0;\n}\n`,

    java: `// Problem: ${problemTitle}\nimport java.util.Scanner;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner scanner = new Scanner(System.in);\n        \n        // TODO: Implement solution\n        \n        scanner.close();\n    }\n}\n`,
  };
}
