export interface Example {
  input: string;
  output: string;
  explanation?: string;
}

export interface ClientProblem {
  id: string;
  title: string;
  statement: string;
  examples: Example[];
}

export interface HiddenTest {
  input: string;
  expected: string;
}

export interface ServerProblem extends ClientProblem {
  hiddenTests: HiddenTest[];
  referenceSolution: string;
}

const PROBLEMS_DATA: ServerProblem[] = [
  {
    id: "two-sum",
    title: "Two Sum",
    statement: `Given an integer target and an array of integers, find the indices of the two numbers that add up to target.

### Input Format
- Line 1: An integer \`target\`.
- Line 2: Space-separated integers representing the array \`nums\`.

### Output Format
- Print the two 0-based indices separated by a space (e.g. \`0 1\` or \`1 0\`).

### Assumptions
- Exactly one valid solution exists.
- You may not use the same element twice.`,
    examples: [
      {
        input: "9\n2 7 11 15",
        output: "0 1",
        explanation: "nums[0] + nums[1] = 2 + 7 = 9",
      },
      {
        input: "6\n3 2 4",
        output: "1 2",
        explanation: "nums[1] + nums[2] = 2 + 4 = 6",
      },
      {
        input: "6\n3 3",
        output: "0 1",
      },
    ],
    hiddenTests: [
      { input: "9\n2 7 11 15", expected: "0 1" },
      { input: "6\n3 2 4", expected: "1 2" },
      { input: "6\n3 3", expected: "0 1" },
      { input: "10\n1 2 3 4 5 5", expected: "4 5" },
      { input: "-8\n-1 -2 -3 -4 -5", expected: "2 4" },
      { input: "0\n0 4 3 0", expected: "0 3" },
      { input: "100\n10 20 30 40 50 60", expected: "3 5" },
      { input: "13\n5 8 3 1", expected: "0 1" },
    ],
    referenceSolution: `import sys

def solve():
    lines = sys.stdin.read().split()
    if not lines:
        return
    target = int(lines[0])
    nums = [int(x) for x in lines[1:]]
    seen = {}
    for i, num in enumerate(nums):
        comp = target - num
        if comp in seen:
            print(f"{seen[comp]} {i}")
            return
        seen[num] = i

if __name__ == "__main__":
    solve()
`,
  },
  {
    id: "best-time-to-buy-and-sell-stock",
    title: "Best Time to Buy and Sell Stock",
    statement: `You are given an array of prices where \`prices[i]\` is the price of a given stock on the i-th day.

You want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock.

### Input Format
- A single line of space-separated integers representing \`prices\`.

### Output Format
- Print the maximum profit achievable. If no profit is possible, print \`0\`.`,
    examples: [
      {
        input: "7 1 5 3 6 4",
        output: "5",
        explanation: "Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6-1 = 5.",
      },
      {
        input: "7 6 4 3 1",
        output: "0",
        explanation: "In this case, no transactions are done and the max profit = 0.",
      },
    ],
    hiddenTests: [
      { input: "7 1 5 3 6 4", expected: "5" },
      { input: "7 6 4 3 1", expected: "0" },
      { input: "1 2 3 4 5", expected: "4" },
      { input: "2 4 1", expected: "2" },
      { input: "3 3 3 3 3", expected: "0" },
      { input: "10", expected: "0" },
      { input: "1 100", expected: "99" },
      { input: "10 8 2 9 1 7", expected: "7" },
    ],
    referenceSolution: `import sys

def solve():
    lines = sys.stdin.read().split()
    if not lines:
        print(0)
        return
    prices = [int(x) for x in lines]
    min_price = float('inf')
    max_profit = 0
    for p in prices:
        if p < min_price:
            min_price = p
        elif p - min_price > max_profit:
            max_profit = p - min_price
    print(max_profit)

if __name__ == "__main__":
    solve()
`,
  },
  {
    id: "valid-parentheses",
    title: "Valid Parentheses",
    statement: `Given a string \`s\` containing just the characters \`'('\`, \`')'\`, \`'{'\`, \`'}'\`, \`'['\` and \`']'\`, determine if the input string is valid.

### Input Format
- A single line containing the string \`s\` (can be empty).

### Output Format
- Print \`true\` if valid, or \`false\` if invalid (case-insensitive, e.g. True or true).`,
    examples: [
      { input: "()", output: "true" },
      { input: "()[]{}", output: "true" },
      { input: "(]", output: "false" },
    ],
    hiddenTests: [
      { input: "()", expected: "true" },
      { input: "()[]{}", expected: "true" },
      { input: "(]", expected: "false" },
      { input: "([)]", expected: "false" },
      { input: "{[]}", expected: "true" },
      { input: "(", expected: "false" },
      { input: "]", expected: "false" },
      { input: "((((((()))))))", expected: "true" },
    ],
    referenceSolution: `import sys

def solve():
    s = sys.stdin.read().strip()
    stack = []
    mapping = {')': '(', '}': '{', ']': '['}
    for char in s:
        if char in mapping:
            top = stack.pop() if stack else '#'
            if mapping[char] != top:
                print("false")
                return
        else:
            stack.append(char)
    print("true" if not stack else "false")

if __name__ == "__main__":
    solve()
`,
  },
  {
    id: "longest-substring-without-repeating-characters",
    title: "Longest Substring Without Repeating Characters",
    statement: `Given a string \`s\`, find the length of the longest substring without repeating characters.

### Input Format
- A single line containing the string \`s\`.

### Output Format
- Print the length of the longest substring without repeating characters.`,
    examples: [
      {
        input: "abcabcbb",
        output: "3",
        explanation: "The answer is 'abc', with the length of 3.",
      },
      {
        input: "bbbbb",
        output: "1",
        explanation: "The answer is 'b', with the length of 1.",
      },
      {
        input: "pwwkew",
        output: "3",
        explanation: "The answer is 'wke', with the length of 3.",
      },
    ],
    hiddenTests: [
      { input: "abcabcbb", expected: "3" },
      { input: "bbbbb", expected: "1" },
      { input: "pwwkew", expected: "3" },
      { input: "a", expected: "1" },
      { input: "au", expected: "2" },
      { input: "dvdf", expected: "3" },
      { input: "anviaj", expected: "5" },
      { input: "abcdefgh", expected: "8" },
    ],
    referenceSolution: `import sys

def solve():
    s = sys.stdin.read().strip()
    char_map = {}
    left = 0
    max_len = 0
    for right, char in enumerate(s):
        if char in char_map and char_map[char] >= left:
            left = char_map[char] + 1
        char_map[char] = right
        max_len = max(max_len, right - left + 1)
    print(max_len)

if __name__ == "__main__":
    solve()
`,
  },
  {
    id: "maximum-subarray",
    title: "Maximum Subarray",
    statement: `Given an integer array \`nums\`, find the subarray with the largest sum, and return its sum.

### Input Format
- A single line of space-separated integers representing \`nums\`.

### Output Format
- Print the maximum subarray sum.`,
    examples: [
      {
        input: "-2 1 -3 4 -1 2 1 -5 4",
        output: "6",
        explanation: "The subarray [4, -1, 2, 1] has the largest sum 6.",
      },
      {
        input: "1",
        output: "1",
      },
      {
        input: "5 4 -1 7 8",
        output: "23",
      },
    ],
    hiddenTests: [
      { input: "-2 1 -3 4 -1 2 1 -5 4", expected: "6" },
      { input: "1", expected: "1" },
      { input: "5 4 -1 7 8", expected: "23" },
      { input: "-1", expected: "-1" },
      { input: "-2 -1", expected: "-1" },
      { input: "-1 -2 -3 -4", expected: "-1" },
      { input: "1 2 3 4 5", expected: "15" },
      { input: "-2 1 -3 4 -1 2 1 -5 4 10", expected: "16" },
    ],
    referenceSolution: `import sys

def solve():
    nums = [int(x) for x in sys.stdin.read().split()]
    if not nums:
        print(0)
        return
    max_sum = current = nums[0]
    for n in nums[1:]:
        current = max(n, current + n)
        max_sum = max(max_sum, current)
    print(max_sum)

if __name__ == "__main__":
    solve()
`,
  },
  {
    id: "reverse-integer",
    title: "Reverse Integer",
    statement: `Given a signed 32-bit integer \`x\`, return \`x\` with its digits reversed. If reversing \`x\` causes the value to go outside the signed 32-bit integer range \`[-2^31, 2^31 - 1]\`, return \`0\`.

### Input Format
- A single integer \`x\`.

### Output Format
- Print the reversed integer (or \`0\` if overflow).`,
    examples: [
      { input: "123", output: "321" },
      { input: "-123", output: "-321" },
      { input: "120", output: "21" },
    ],
    hiddenTests: [
      { input: "123", expected: "321" },
      { input: "-123", expected: "-321" },
      { input: "120", expected: "21" },
      { input: "0", expected: "0" },
      { input: "1534236469", expected: "0" },
      { input: "-2147483648", expected: "0" },
      { input: "2147483647", expected: "0" },
      { input: "-10", expected: "-1" },
    ],
    referenceSolution: `import sys

def solve():
    raw = sys.stdin.read().strip()
    if not raw:
        return
    x = int(raw)
    INT_MIN, INT_MAX = -2**31, 2**31 - 1
    sign = -1 if x < 0 else 1
    x = abs(x)
    rev = 0
    while x != 0:
        digit = x % 10
        x //= 10
        rev = rev * 10 + digit
    rev *= sign
    if rev < INT_MIN or rev > INT_MAX:
        print(0)
    else:
        print(rev)

if __name__ == "__main__":
    solve()
`,
  },
];

// Client-safe problems (never include hidden tests or reference solutions)
export function getClientProblems(): ClientProblem[] {
  return PROBLEMS_DATA.map(({ id, title, statement, examples }) => ({
    id,
    title,
    statement,
    examples,
  }));
}

export function getClientProblem(id: string): ClientProblem | undefined {
  const prob = PROBLEMS_DATA.find((p) => p.id === id);
  if (!prob) return undefined;
  return {
    id: prob.id,
    title: prob.title,
    statement: prob.statement,
    examples: prob.examples,
  };
}

// Server-only access
export function getServerProblem(id: string): ServerProblem | undefined {
  return PROBLEMS_DATA.find((p) => p.id === id);
}

export function getAllServerProblems(): ServerProblem[] {
  return PROBLEMS_DATA;
}
