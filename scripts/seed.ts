import mongoose from "mongoose";
import { Question } from "../src/models/Question";
import { generateDefaultStarterTemplates } from "../src/lib/starterTemplates";

const MONGODB_URI = process.env.MONGODB_URI || process.env.DATABASE_URL || "mongodb://127.0.0.1:27017/clashjudge";

const SEED_QUESTIONS = [
  // ── VERY EASY (2) ──
  {
    problemId: "001",
    title: "Palindrome Number",
    slug: "palindrome-number",
    difficulty: "Very Easy" as const,
    description: `Given an integer x, return true if x is a palindrome, and false otherwise.
An integer is a palindrome when it reads the same forward and backward.

### Input Format
- A single line with integer x.

### Output Format
- Print true or false.`,
    constraints: ["-2^31 <= x <= 2^31 - 1"],
    examples: [
      { input: "121", output: "true", explanation: "121 reads as 121 from left to right and from right to left." },
      { input: "-121", output: "false", explanation: "From left to right, it reads -121. From right to left, it becomes 121-. Therefore it is not a palindrome." },
      { input: "10", output: "false", explanation: "Reads 01 from right to left. Therefore it is not a palindrome." },
    ],
    xp: 50,
    tags: ["Math", "String"],
    hiddenTestCases: [
      { input: "121", expectedOutput: "true" },
      { input: "-121", expectedOutput: "false" },
      { input: "10", expectedOutput: "false" },
      { input: "0", expectedOutput: "true" },
      { input: "1221", expectedOutput: "true" },
      { input: "1234321", expectedOutput: "true" },
      { input: "123456", expectedOutput: "false" },
    ],
  },
  {
    problemId: "002",
    title: "FizzBuzz",
    slug: "fizzbuzz",
    difficulty: "Very Easy" as const,
    description: `Given an integer n, print the numbers from 1 to n separated by spaces.
For multiples of 3, print "Fizz" instead of the number.
For multiples of 5, print "Buzz".
For multiples of both 3 and 5, print "FizzBuzz".

### Input Format
- A single integer n.

### Output Format
- Space-separated sequence.`,
    constraints: ["1 <= n <= 100"],
    examples: [
      { input: "5", output: "1 2 Fizz 4 Buzz" },
      { input: "3", output: "1 2 Fizz" },
    ],
    xp: 50,
    tags: ["Math", "Simulation"],
    hiddenTestCases: [
      { input: "5", expectedOutput: "1 2 Fizz 4 Buzz" },
      { input: "3", expectedOutput: "1 2 Fizz" },
      { input: "1", expectedOutput: "1" },
      { input: "15", expectedOutput: "1 2 Fizz 4 Buzz Fizz 7 8 Fizz Buzz 11 Fizz 13 14 FizzBuzz" },
      { input: "16", expectedOutput: "1 2 Fizz 4 Buzz Fizz 7 8 Fizz Buzz 11 Fizz 13 14 FizzBuzz 16" },
    ],
  },

  // ── EASY (5) ──
  {
    problemId: "003",
    title: "Two Sum",
    slug: "two-sum",
    difficulty: "Easy" as const,
    description: `Given an integer target and an array of integers, find the indices of the two numbers that add up to target.

### Input Format
- Line 1: An integer target.
- Line 2: Space-separated integers representing nums.

### Output Format
- Print the two 0-based indices separated by a space (e.g. 0 1).`,
    constraints: ["2 <= nums.length <= 10^5", "-10^9 <= nums[i] <= 10^9"],
    examples: [
      { input: "9\n2 7 11 15", output: "0 1", explanation: "nums[0] + nums[1] = 2 + 7 = 9" },
      { input: "6\n3 2 4", output: "1 2", explanation: "nums[1] + nums[2] = 2 + 4 = 6" },
      { input: "6\n3 3", output: "0 1" },
    ],
    xp: 100,
    tags: ["Array", "Hash Table"],
    hiddenTestCases: [
      { input: "9\n2 7 11 15", expectedOutput: "0 1" },
      { input: "6\n3 2 4", expectedOutput: "1 2" },
      { input: "6\n3 3", expectedOutput: "0 1" },
      { input: "10\n1 2 3 4 5 5", expectedOutput: "4 5" },
      { input: "-8\n-1 -2 -3 -4 -5", expectedOutput: "2 4" },
      { input: "0\n0 4 3 0", expectedOutput: "0 3" },
      { input: "100\n10 20 30 40 50 60", expectedOutput: "3 5" },
    ],
  },
  {
    problemId: "004",
    title: "Best Time to Buy and Sell Stock",
    slug: "best-time-to-buy-and-sell-stock",
    difficulty: "Easy" as const,
    description: `You are given an array of prices where prices[i] is the price of a given stock on the i-th day.
Maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell.

### Input Format
- Space-separated integers representing prices.

### Output Format
- Print maximum profit achievable (0 if none).`,
    constraints: ["1 <= prices.length <= 10^5", "0 <= prices[i] <= 10^4"],
    examples: [
      { input: "7 1 5 3 6 4", output: "5", explanation: "Buy on day 2 (1) and sell on day 5 (6), profit = 5." },
      { input: "7 6 4 3 1", output: "0" },
    ],
    xp: 100,
    tags: ["Array", "Dynamic Programming"],
    hiddenTestCases: [
      { input: "7 1 5 3 6 4", expectedOutput: "5" },
      { input: "7 6 4 3 1", expectedOutput: "0" },
      { input: "1 2 3 4 5", expectedOutput: "4" },
      { input: "2 4 1", expectedOutput: "2" },
      { input: "3 3 3 3 3", expectedOutput: "0" },
      { input: "10", expectedOutput: "0" },
      { input: "1 100", expectedOutput: "99" },
    ],
  },
  {
    problemId: "005",
    title: "Valid Parentheses",
    slug: "valid-parentheses",
    difficulty: "Easy" as const,
    description: `Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.

### Input Format
- A single line containing string s.

### Output Format
- Print true if valid, or false if invalid.`,
    constraints: ["1 <= s.length <= 10^4"],
    examples: [
      { input: "()", output: "true" },
      { input: "()[]{}", output: "true" },
      { input: "(]", output: "false" },
    ],
    xp: 100,
    tags: ["String", "Stack"],
    hiddenTestCases: [
      { input: "()", expectedOutput: "true" },
      { input: "()[]{}", expectedOutput: "true" },
      { input: "(]", expectedOutput: "false" },
      { input: "([)]", expectedOutput: "false" },
      { input: "{[]}", expectedOutput: "true" },
      { input: "((((((()))))))", expectedOutput: "true" },
    ],
  },
  {
    problemId: "006",
    title: "Valid Anagram",
    slug: "valid-anagram",
    difficulty: "Easy" as const,
    description: `Given two strings s and t on separate lines, return true if t is an anagram of s, and false otherwise.

### Input Format
- Line 1: string s
- Line 2: string t

### Output Format
- Print true or false.`,
    constraints: ["1 <= s.length, t.length <= 5 * 10^4"],
    examples: [
      { input: "anagram\nnagaram", output: "true" },
      { input: "rat\ncar", output: "false" },
    ],
    xp: 100,
    tags: ["String", "Hash Table", "Sorting"],
    hiddenTestCases: [
      { input: "anagram\nnagaram", expectedOutput: "true" },
      { input: "rat\ncar", expectedOutput: "false" },
      { input: "a\na", expectedOutput: "true" },
      { input: "ab\na", expectedOutput: "false" },
      { input: "listen\nsilent", expectedOutput: "true" },
    ],
  },
  {
    problemId: "007",
    title: "Merge Sorted Array",
    slug: "merge-sorted-array",
    difficulty: "Easy" as const,
    description: `Given two sorted integer arrays nums1 and nums2 on separate lines, merge them into a single sorted array.

### Input Format
- Line 1: Space-separated integers for nums1.
- Line 2: Space-separated integers for nums2.

### Output Format
- Print the merged sorted array separated by spaces.`,
    constraints: ["1 <= nums1.length, nums2.length <= 10^4"],
    examples: [
      { input: "1 2 3\n2 5 6", output: "1 2 2 3 5 6" },
      { input: "1\n2", output: "1 2" },
    ],
    xp: 100,
    tags: ["Array", "Two Pointers", "Sorting"],
    hiddenTestCases: [
      { input: "1 2 3\n2 5 6", expectedOutput: "1 2 2 3 5 6" },
      { input: "1\n2", expectedOutput: "1 2" },
      { input: "4 5 6\n1 2 3", expectedOutput: "1 2 3 4 5 6" },
      { input: "1 3 5 7\n2 4 6 8", expectedOutput: "1 2 3 4 5 6 7 8" },
    ],
  },

  // ── MEDIUM (3) ──
  {
    problemId: "008",
    title: "Longest Substring Without Repeating Characters",
    slug: "longest-substring-without-repeating-characters",
    difficulty: "Medium" as const,
    description: `Given a string s, find the length of the longest substring without repeating characters.

### Input Format
- A single line containing string s.

### Output Format
- Print length of longest substring without duplicates.`,
    constraints: ["0 <= s.length <= 5 * 10^4"],
    examples: [
      { input: "abcabcbb", output: "3", explanation: "The answer is 'abc', with length 3." },
      { input: "bbbbb", output: "1" },
      { input: "pwwkew", output: "3" },
    ],
    xp: 250,
    tags: ["Hash Table", "String", "Sliding Window"],
    hiddenTestCases: [
      { input: "abcabcbb", expectedOutput: "3" },
      { input: "bbbbb", expectedOutput: "1" },
      { input: "pwwkew", expectedOutput: "3" },
      { input: "a", expectedOutput: "1" },
      { input: "au", expectedOutput: "2" },
      { input: "dvdf", expectedOutput: "3" },
      { input: "anviaj", expectedOutput: "5" },
    ],
  },
  {
    problemId: "009",
    title: "Maximum Subarray",
    slug: "maximum-subarray",
    difficulty: "Medium" as const,
    description: `Given an integer array nums, find the subarray with the largest sum, and return its sum.

### Input Format
- Space-separated integers representing nums.

### Output Format
- Print maximum subarray sum.`,
    constraints: ["1 <= nums.length <= 10^5", "-10^4 <= nums[i] <= 10^4"],
    examples: [
      { input: "-2 1 -3 4 -1 2 1 -5 4", output: "6", explanation: "Subarray [4,-1,2,1] has the largest sum 6." },
      { input: "1", output: "1" },
      { input: "5 4 -1 7 8", output: "23" },
    ],
    xp: 250,
    tags: ["Array", "Dynamic Programming", "Divide and Conquer"],
    hiddenTestCases: [
      { input: "-2 1 -3 4 -1 2 1 -5 4", expectedOutput: "6" },
      { input: "1", expectedOutput: "1" },
      { input: "5 4 -1 7 8", expectedOutput: "23" },
      { input: "-1", expectedOutput: "-1" },
      { input: "-2 -1", expectedOutput: "-1" },
      { input: "1 2 3 4 5", expectedOutput: "15" },
    ],
  },
  {
    problemId: "010",
    title: "Reverse Integer",
    slug: "reverse-integer",
    difficulty: "Medium" as const,
    description: `Given a signed 32-bit integer x, return x with its digits reversed. If overflow occurs, return 0.

### Input Format
- Single integer x.

### Output Format
- Print reversed integer (or 0).`,
    constraints: ["-2^31 <= x <= 2^31 - 1"],
    examples: [
      { input: "123", output: "321" },
      { input: "-123", output: "-321" },
      { input: "120", output: "21" },
    ],
    xp: 250,
    tags: ["Math"],
    hiddenTestCases: [
      { input: "123", expectedOutput: "321" },
      { input: "-123", expectedOutput: "-321" },
      { input: "120", expectedOutput: "21" },
      { input: "0", expectedOutput: "0" },
      { input: "1534236469", expectedOutput: "0" },
      { input: "-2147483648", expectedOutput: "0" },
    ],
  },
];

async function seed() {
  console.log("Connecting to MongoDB:", MONGODB_URI);
  await mongoose.connect(MONGODB_URI);
  console.log("Connected successfully.");

  for (const item of SEED_QUESTIONS) {
    const starterTemplates = generateDefaultStarterTemplates(item.title);
    await Question.findOneAndUpdate(
      { problemId: item.problemId },
      {
        ...item,
        starterTemplates,
        isPublished: true,
      },
      { upsert: true, new: true }
    );
    console.log(`✓ Seeded Question: [${item.problemId}] ${item.title} (${item.difficulty})`);
  }

  console.log("Database seeding completed!");
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
