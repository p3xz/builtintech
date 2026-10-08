import { ICourse, SupportedLanguage, CourseLevel } from "@/types/learning";

export const COURSES: ICourse[] = [
  // ── 1. PYTHON FUNDAMENTALS ──
  {
    id: "python-fundamentals",
    courseId: "python-fundamentals",
    title: "Python Fundamentals",
    slug: "python-fundamentals",
    language: "python",
    level: "Beginner",
    tagline: "Master Python from core syntax to algorithmic thinking and data structures.",
    description: "An intuitive, hands-on path to writing clean, idiomatic Python. Learn variables, data types, logic flow, loops, collections, and problem-solving through interactive code sandboxes.",
    icon: "🐍",
    bannerGradient: "from-emerald-500/20 via-cyan-500/10 to-transparent",
    estimatedHours: 6,
    totalXp: 850,
    whatYouWillLearn: [
      "Python 3 syntax, dynamic typing, and variables",
      "Conditional branching with if, elif, and else",
      "Iteration with for loops, while loops, and list comprehensions",
      "Reusable functions, scope, and clean code principles",
      "Essential data structures: Lists, Dictionaries, Sets, and Tuples",
    ],
    modules: [
      {
        id: "py-mod-1",
        moduleId: "python-basics",
        courseId: "python-fundamentals",
        title: "Python Basics & Core Types",
        description: "Understand variables, strings, integers, floats, user input, and clean formatting.",
        order: 1,
        estimatedMinutes: 45,
        lessons: [
          {
            id: "py-les-1",
            lessonId: "what-is-python",
            moduleId: "python-basics",
            courseId: "python-fundamentals",
            title: "What is Python?",
            summary: "Understand Python's philosophy, indentation-based syntax, and how the interpreter executes statements.",
            order: 1,
            estimatedMinutes: 10,
            concept: `### The Python Mindset

Python is a readable, high-level programming language designed for developer productivity and clean code. Unlike languages that rely on curly braces \`{}\` or semicolons \`;\`, Python uses **indentation** to define blocks of code.

Key attributes:
* **Interpreted**: Code executes line by line from top to bottom.
* **Dynamically Typed**: You do not declare variable types beforehand.
* **Readable**: Code reads close to natural English.`,
            conceptPoints: [
              "Indentation (usually 4 spaces) defines code blocks.",
              "Comments begin with the '#' symbol.",
              "print() outputs information to the terminal.",
            ],
            example: {
              title: "Hello World and Printing",
              language: "python",
              code: `# Print a greeting to the console
print("Welcome to Built In Tech!")

# Comments are ignored by Python
print(42 + 8)`,
              output: "Welcome to Built In Tech!\n50",
              explanation: "The print() function takes values and outputs their text representation.",
            },
            tryIt: {
              instructions: "Write a print statement that outputs the text 'I am learning Python!' to the console.",
              type: "code",
              starterCode: `# Write your print statement below:
`,
              solutionCode: `print("I am learning Python!")`,
              expectedOutput: "I am learning Python!",
              hint: "Use print('...') with double or single quotes.",
            },
          },
          {
            id: "py-les-2",
            lessonId: "variables-and-data-types",
            moduleId: "python-basics",
            courseId: "python-fundamentals",
            title: "Variables & Data Types",
            summary: "Learn how to store text, numbers, and booleans in descriptive variables.",
            order: 2,
            estimatedMinutes: 12,
            concept: `### Storing Data in Variables

In Python, a variable is created the moment you assign a value to it using the assignment operator \`=\`.

Primary Primitive Types:
* **Integer (\`int\`)**: Whole numbers like \`10\`, \`-5\`, \`0\`.
* **Float (\`float\`)**: Decimal numbers like \`3.14\`, \`-0.5\`.
* **String (\`str\`)**: Text enclosed in quotes like \`"Built In Tech"\`.
* **Boolean (\`bool\`)**: \`True\` or \`False\`.`,
            conceptPoints: [
              "Variable names cannot start with numbers and use snake_case by convention.",
              "Use type() to inspect a variable's data type.",
              "Python handles type assignment dynamically.",
            ],
            example: {
              title: "Creating Variables",
              language: "python",
              code: `user_name = "Alex"
user_level = 5
xp_points = 2450.5
is_active = True

print(f"{user_name} is level {user_level} with {xp_points} XP!")`,
              output: "Alex is level 5 with 2450.5 XP!",
              explanation: "An f-string (f'...') allows you to embed variable values directly inside curly braces {}.",
            },
            tryIt: {
              instructions: "Create a variable named `language` with value `'Python'` and a variable `score` with value `100`. Print both using an f-string: `Learning Python with 100 points`.",
              type: "code",
              starterCode: `# Create your variables here:
language = ""
score = 0

# Print your message:
`,
              solutionCode: `language = "Python"
score = 100
print(f"Learning {language} with {score} points")`,
              expectedOutput: "Learning Python with 100 points",
              hint: "Assign language = 'Python' and score = 100, then print(f'Learning {language} with {score} points').",
            },
          },
          {
            id: "py-les-3",
            lessonId: "string-operations",
            moduleId: "python-basics",
            courseId: "python-fundamentals",
            title: "String Operations & Formatting",
            summary: "Transform, slice, join, and format strings with built-in methods.",
            order: 3,
            estimatedMinutes: 12,
            concept: `### Working with Strings

Strings are ordered sequences of characters. Python offers powerful built-in methods to manipulate text without mutating the original string.

Common String Operations:
* \`.upper()\` / \`.lower()\` - Change case
* \`.strip()\` - Remove leading/trailing whitespace
* \`.replace(old, new)\` - Substitute text
* \`len(text)\` - Get number of characters`,
            conceptPoints: [
              "Strings are immutable in Python.",
              "Indexing starts at 0 (e.g., text[0] is the first character).",
              "f-strings are the standard for modern Python string interpolation.",
            ],
            example: {
              title: "String Transformations",
              language: "python",
              code: `raw_input = "  python developer  "
clean_text = raw_input.strip().title()

print("Original:", raw_input)
print("Cleaned:", clean_text)
print("Length:", len(clean_text))`,
              output: "Original:   python developer  \nCleaned: Python Developer\nLength: 16",
              explanation: "strip() removes surrounding spaces, and title() capitalizes the first letter of each word.",
            },
            tryIt: {
              instructions: "Given the string `msg = 'hello world'`, print it in uppercase and replace `'WORLD'` with `'BUILTIN'`.",
              type: "code",
              starterCode: `msg = "hello world"
# Transform and print here:
`,
              solutionCode: `msg = "hello world"
print(msg.upper().replace("WORLD", "BUILTIN"))`,
              expectedOutput: "HELLO BUILTIN",
              hint: "Chain msg.upper().replace('WORLD', 'BUILTIN') inside print().",
            },
          },
        ],
        practiceActivities: [
          {
            id: "py-p-1",
            moduleId: "python-basics",
            courseId: "python-fundamentals",
            title: "Fix the Syntax Bug",
            type: "debugging",
            prompt: "Spot and fix the syntax error in the greeting script.",
            instructions: "The code below fails with a SyntaxError because of incorrect string formatting or missing quotes. Fix it so it prints 'Built In Tech'!",
            starterCode: `brand = Built In Tech
print("Welcome to " + brand)`,
            solutionCode: `brand = "Built In Tech"
print("Welcome to " + brand)`,
            explanation: "Strings must be enclosed in quotes like \"Built In Tech\". Without quotes, Python treats words as variable names.",
            xp: 30,
          },
          {
            id: "py-p-2",
            moduleId: "python-basics",
            courseId: "python-fundamentals",
            title: "Predict the Output",
            type: "output-prediction",
            prompt: "What will this Python code output when executed?",
            instructions: "Analyze the variable assignments and arithmetic operations.",
            starterCode: `x = 15
y = 4
result = (x // y) * 2
print(result)`,
            options: ["6", "7.5", "8", "7"],
            correctAnswer: "6",
            explanation: "// is integer division (floor division), so 15 // 4 equals 3. Then 3 * 2 equals 6.",
            xp: 25,
          },
          {
            id: "py-p-3",
            moduleId: "python-basics",
            courseId: "python-fundamentals",
            title: "Variable Type Matcher",
            type: "multiple-choice",
            prompt: "Which Python data type represents decimal numbers like 3.14159?",
            instructions: "Choose the correct built-in type.",
            options: ["int", "float", "decimal", "double"],
            correctAnswer: 1, // index of float
            explanation: "In standard Python, decimal/floating-point values belong to the 'float' type.",
            xp: 20,
          },
        ],
        quiz: {
          id: "py-quiz-1",
          quizId: "python-basics-quiz",
          moduleId: "python-basics",
          courseId: "python-fundamentals",
          title: "Python Basics Checkpoint Quiz",
          description: "Demonstrate your understanding of Python syntax, variables, types, and formatting to unlock Module 2.",
          passingScorePercent: 70,
          xpReward: 100,
          questions: [
            {
              id: "q1",
              question: "How does Python define a block of code (such as inside a loop or function)?",
              options: [
                "Using curly braces { }",
                "Using indentation (whitespace)",
                "Using begin ... end keywords",
                "Using semicolons ;",
              ],
              correctIndex: 1,
              explanation: "Python strictly enforces whitespace indentation to delineate code blocks.",
              conceptHint: "Look at how lines are aligned under headers in Python.",
            },
            {
              id: "q2",
              question: "What is the result of evaluating: type(True)?",
              options: ["<class 'string'>", "<class 'bool'>", "<class 'int'>", "<class 'boolean'>"],
              correctIndex: 1,
              explanation: "Booleans in Python are instances of the 'bool' class.",
              conceptHint: "True and False are boolean literals.",
            },
            {
              id: "q3",
              question: "Which of the following is a valid variable name according to Python conventions?",
              options: ["2nd_player", "player-name", "player_score", "class"],
              correctIndex: 2,
              explanation: "Python variable names use snake_case (letters, numbers, underscores) and cannot start with a digit or use reserved keywords like 'class'.",
              conceptHint: "Identifiers use letters and underscores.",
            },
            {
              id: "q4",
              question: "What does the expression '10' + '20' evaluate to in Python?",
              options: ["30", "'1020'", "TypeError", "200"],
              correctIndex: 1,
              explanation: "When + is used between two strings, Python concatenates them together into '1020'.",
              conceptHint: "Quotes denote strings, not numbers.",
            },
            {
              id: "q5",
              question: "Which string formatting syntax is recommended for Python 3.6+?",
              options: [
                "f'Hello {name}' (f-strings)",
                "'Hello %s' % name",
                "'Hello {}'.format(name)",
                "concat('Hello ', name)",
              ],
              correctIndex: 0,
              explanation: "f-strings (Formatted String Literals) are the fastest, cleanest, and standard way to format strings in modern Python.",
              conceptHint: "Look for the syntax starting with an 'f'.",
            },
          ],
        },
      },
      {
        id: "py-mod-2",
        moduleId: "control-flow",
        courseId: "python-fundamentals",
        title: "Control Flow & Loops",
        description: "Direct program execution with boolean logic, if/elif/else conditions, while loops, and for loops.",
        order: 2,
        estimatedMinutes: 50,
        lessons: [
          {
            id: "py-les-4",
            lessonId: "conditional-logic",
            moduleId: "control-flow",
            courseId: "python-fundamentals",
            title: "Conditionals: if, elif, else",
            summary: "Make decisions in code using relational operators and logical chaining.",
            order: 1,
            estimatedMinutes: 15,
            concept: `### Branching Logic

Conditionals allow programs to branch and execute different blocks based on whether a condition evaluates to \`True\` or \`False\`.

Relational Operators:
* \`==\` (equal to)
* \`!=\` (not equal)
* \`>\`, \`<\`, \`>=\`, \`<=\`

Logical Operators:
* \`and\` - True if both conditions are True
* \`or\` - True if at least one condition is True
* \`not\` - Inverts the boolean value`,
            conceptPoints: [
              "Colons ':' must follow if, elif, and else headers.",
              "elif handles multiple mutually exclusive conditions.",
              "else is the fallback executed when no prior conditions are met.",
            ],
            example: {
              title: "Checking Duel Qualification",
              language: "python",
              code: `score = 85

if score >= 90:
    grade = "A+"
elif score >= 80:
    grade = "A"
elif score >= 70:
    grade = "B"
else:
    grade = "Review"

print(f"Final Grade: {grade}")`,
              output: "Final Grade: A",
              explanation: "Because 85 >= 80 is the first condition to evaluate to True, 'grade = A' executes and the remaining branches are skipped.",
            },
            tryIt: {
              instructions: "Write an if/else block that checks if `number = 14` is even. If it is even, print 'Even', otherwise print 'Odd'.",
              type: "code",
              starterCode: `number = 14
# Write your if/else check:
`,
              solutionCode: `number = 14
if number % 2 == 0:
    print("Even")
else:
    print("Odd")`,
              expectedOutput: "Even",
              hint: "Use the modulo operator: number % 2 == 0 checks for even numbers.",
            },
          },
          {
            id: "py-les-5",
            lessonId: "for-loops-and-ranges",
            moduleId: "control-flow",
            courseId: "python-fundamentals",
            title: "For Loops & Range",
            summary: "Iterate over numbers, sequences, and lists predictably.",
            order: 2,
            estimatedMinutes: 15,
            concept: `### Definite Iteration with \`for\`

A \`for\` loop in Python iterates over members of any sequence (such as a string, list, or range).

The \`range()\` Function:
* \`range(5)\` yields \`0, 1, 2, 3, 4\` (stop at 5, non-inclusive)
* \`range(2, 6)\` yields \`2, 3, 4, 5\` (start at 2, stop at 6)
* \`range(0, 10, 2)\` yields \`0, 2, 4, 6, 8\` (step of 2)`,
            conceptPoints: [
              "range() generates numbers on demand without allocating extra memory.",
              "Use 'break' to exit a loop early.",
              "Use 'continue' to skip to the next iteration.",
            ],
            example: {
              title: "Summing Numbers with a Loop",
              language: "python",
              code: `total = 0
for i in range(1, 6):
    total += i
    print(f"Added {i}, total is now {total}")

print("Final Total:", total)`,
              output: "Added 1, total is now 1\nAdded 2, total is now 3\nAdded 3, total is now 6\nAdded 4, total is now 10\nAdded 5, total is now 15\nFinal Total: 15",
              explanation: "The loop runs 5 times for numbers 1 through 5, accumulating the running sum.",
            },
            tryIt: {
              instructions: "Write a for loop using `range()` that calculates the sum of all even numbers between 2 and 10 (inclusive) and prints the result.",
              type: "code",
              starterCode: `# Calculate sum of evens from 2 to 10
even_sum = 0
# Your loop here:

print(even_sum)`,
              solutionCode: `even_sum = 0
for n in range(2, 11, 2):
    even_sum += n
print(even_sum)`,
              expectedOutput: "30",
              hint: "Use range(2, 11, 2) to get 2, 4, 6, 8, 10.",
            },
          },
        ],
        practiceActivities: [
          {
            id: "py-p-4",
            moduleId: "control-flow",
            courseId: "python-fundamentals",
            title: "Build a FizzBuzz Generator",
            type: "write-code",
            prompt: "Implement standard FizzBuzz logic for numbers 1 to 5.",
            instructions: "Write a loop from 1 to 5. For 3 print 'Fizz', for 5 print 'Buzz', otherwise print the number.",
            starterCode: `for i in range(1, 6):
    # Complete the logic:
    pass`,
            solutionCode: `for i in range(1, 6):
    if i % 3 == 0:
        print("Fizz")
    elif i % 5 == 0:
        print("Buzz")
    else:
        print(i)`,
            explanation: "Checking modulo allows you to identify divisibility before falling back to the number.",
            xp: 40,
          },
        ],
        quiz: {
          id: "py-quiz-2",
          quizId: "control-flow-quiz",
          moduleId: "control-flow",
          courseId: "python-fundamentals",
          title: "Control Flow Checkpoint Quiz",
          description: "Verify your mastery of conditional branches, loops, and iteration.",
          passingScorePercent: 70,
          xpReward: 120,
          questions: [
            {
              id: "q2_1",
              question: "What numbers are generated by range(3, 7)?",
              options: ["3, 4, 5, 6, 7", "3, 4, 5, 6", "4, 5, 6, 7", "3, 7"],
              correctIndex: 1,
              explanation: "range(start, stop) starts at 'start' (inclusive) and ends at 'stop - 1' (exclusive).",
              conceptHint: "The stop value is not included.",
            },
            {
              id: "q2_2",
              question: "Which keyword immediately exits the enclosing loop?",
              options: ["continue", "pass", "break", "return"],
              correctIndex: 2,
              explanation: "'break' terminates the loop execution immediately.",
              conceptHint: "Stops the loop completely.",
            },
            {
              id: "q2_3",
              question: "What is the boolean result of: not (5 > 2 and 3 == 4)?",
              options: ["True", "False", "None", "TypeError"],
              correctIndex: 0,
              explanation: "(5 > 2) is True, (3 == 4) is False. True and False is False. not(False) becomes True.",
              conceptHint: "Evaluate inside parentheses first.",
            },
          ],
        },
      },
      {
        id: "py-mod-3",
        moduleId: "functions-data-structures",
        courseId: "python-fundamentals",
        title: "Functions & Data Structures",
        description: "Write clean reusable functions with arguments and return values. Master Lists and Dictionaries.",
        order: 3,
        estimatedMinutes: 55,
        lessons: [
          {
            id: "py-les-6",
            lessonId: "defining-functions",
            moduleId: "functions-data-structures",
            courseId: "python-fundamentals",
            title: "Defining Reusable Functions",
            summary: "Encapsulate logic with def, parameters, default arguments, and return statements.",
            order: 1,
            estimatedMinutes: 18,
            concept: `### Clean Functions with \`def\`

Functions allow you to reuse code, reduce repetition, and break down complex problems into modular components.

Structure:
\`\`\`python
def function_name(param1, param2=default_val):
    # computations
    return result
\`\`\`
`,
            conceptPoints: [
              "Functions are defined with the 'def' keyword.",
              "A function without an explicit return statement returns 'None'.",
              "Parameters can have default fallback values.",
            ],
            example: {
              title: "Calculating Circle Area",
              language: "python",
              code: `def calculate_area(radius, pi=3.14159):
    return pi * (radius ** 2)

print("Radius 5 area:", calculate_area(5))
print("Custom pi:", calculate_area(5, 3.14))`,
              output: "Radius 5 area: 78.53975\nCustom pi: 78.5",
              explanation: "The function calculates area using the formula and returns the computed float.",
            },
            tryIt: {
              instructions: "Write a function `is_even(n)` that returns `True` if `n` is even and `False` otherwise. Test it with `print(is_even(8))`.",
              type: "code",
              starterCode: `# Define is_even function:
def is_even(n):
    pass

print(is_even(8))`,
              solutionCode: `def is_even(n):
    return n % 2 == 0

print(is_even(8))`,
              expectedOutput: "True",
              hint: "return n % 2 == 0",
            },
          },
          {
            id: "py-les-7",
            lessonId: "lists-and-dictionaries",
            moduleId: "functions-data-structures",
            courseId: "python-fundamentals",
            title: "Lists & Dictionaries",
            summary: "Organize collections with ordered lists and key-value dictionary mappings.",
            order: 2,
            estimatedMinutes: 20,
            concept: `### Collections in Python

* **Lists (\`[]\`)**: Ordered, mutable sequences of items.
  * \`.append(x)\`, \`.pop()\`, \`len(items)\`, indexing \`items[0]\`.
* **Dictionaries (\`{}\`)**: Key-value hash maps for fast lookup.
  * \`user["email"]\`, \`user.get("age", 0)\`, \`.keys()\`, \`.values()\`.`,
            conceptPoints: [
              "Lists can hold mixed data types.",
              "Dictionary keys must be immutable (like strings or integers).",
              "Use 'in' keyword to check membership in lists and dictionaries.",
            ],
            example: {
              title: "Student Roster with Dictionaries",
              language: "python",
              code: `students = [
    {"name": "Maya", "xp": 1400},
    {"name": "Leo", "xp": 1850}
]

for s in students:
    print(f"{s['name']} has {s['xp']} XP")`,
              output: "Maya has 1400 XP\nLeo has 1850 XP",
              explanation: "A list of dictionaries is the foundational pattern for managing tabular and JSON records.",
            },
            tryIt: {
              instructions: "Create a list `scores = [85, 92, 78]`, append `95` to it, and print the maximum value using `max()`.",
              type: "code",
              starterCode: `scores = [85, 92, 78]
# Append 95 and print max:
`,
              solutionCode: `scores = [85, 92, 78]
scores.append(95)
print(max(scores))`,
              expectedOutput: "95",
              hint: "scores.append(95) then print(max(scores))",
            },
          },
        ],
        practiceActivities: [
          {
            id: "py-p-5",
            moduleId: "functions-data-structures",
            courseId: "python-fundamentals",
            title: "Filter High Scorers",
            type: "write-code",
            prompt: "Write a function that filters students with score >= 80.",
            instructions: "Implement `get_top_students(scores_dict)` to return a list of student names whose score is 80 or higher.",
            starterCode: `def get_top_students(scores):
    # Return list of names with score >= 80
    return [name for name, score in scores.items() if score >= 80]

print(get_top_students({"Alice": 90, "Bob": 65, "Charlie": 85}))`,
            solutionCode: `def get_top_students(scores):
    return [name for name, score in scores.items() if score >= 80]

print(get_top_students({"Alice": 90, "Bob": 65, "Charlie": 85}))`,
            explanation: "List comprehension or a standard for loop iterates through dictionary .items() and filters keys.",
            xp: 50,
          },
        ],
        quiz: {
          id: "py-quiz-3",
          quizId: "functions-data-structures-quiz",
          moduleId: "functions-data-structures",
          courseId: "python-fundamentals",
          title: "Functions & Structures Checkpoint Quiz",
          description: "Test your knowledge of functions, lists, dictionaries, and memory references.",
          passingScorePercent: 70,
          xpReward: 150,
          questions: [
            {
              id: "q3_1",
              question: "How do you add an item to the end of a Python list?",
              options: ["list.push(item)", "list.add(item)", "list.append(item)", "list.insert(item)"],
              correctIndex: 2,
              explanation: "Python lists use the .append() method to insert elements at the end.",
              conceptHint: "Method name starts with 'app'.",
            },
            {
              id: "q3_2",
              question: "What is the safe way to retrieve a dictionary value without throwing a KeyError if the key does not exist?",
              options: ["dict.fetch('key')", "dict.get('key', default)", "dict['key']", "dict.find('key')"],
              correctIndex: 1,
              explanation: "dict.get('key', default) returns the default fallback if the key is not present.",
              conceptHint: "Three-letter method name.",
            },
            {
              id: "q3_3",
              question: "What will a function return if it executes without reaching a return statement?",
              options: ["0", "False", "None", "undefined"],
              correctIndex: 2,
              explanation: "In Python, functions without an explicit return statement automatically return None.",
              conceptHint: "Python's null representation.",
            },
          ],
        },
      },
    ],
  },

  // ── 2. JAVASCRIPT MODERN CORE ──
  {
    id: "javascript-modern-core",
    courseId: "javascript-modern-core",
    title: "JavaScript Modern Core",
    slug: "javascript-modern-core",
    language: "javascript",
    level: "Beginner",
    tagline: "Build modern web and backend applications with ES6+, async/await, and functional primitives.",
    description: "Learn JavaScript the modern way. Master variables, closures, arrow functions, promises, async/await, array transformations, and event-driven patterns.",
    icon: "⚡",
    bannerGradient: "from-amber-500/20 via-yellow-500/10 to-transparent",
    estimatedHours: 6,
    totalXp: 800,
    whatYouWillLearn: [
      "ES6+ syntax: let/const, destructuring, template literals, spread operator",
      "Higher-order array methods: map, filter, reduce, find",
      "Asynchronous programming with Promises and async/await",
      "Objects, prototypes, and modern ES classes",
    ],
    modules: [
      {
        id: "js-mod-1",
        moduleId: "js-essentials",
        courseId: "javascript-modern-core",
        title: "JavaScript Essentials & ES6+",
        description: "Variables (let, const), data types, template literals, and arrow functions.",
        order: 1,
        estimatedMinutes: 40,
        lessons: [
          {
            id: "js-les-1",
            lessonId: "let-const-and-types",
            moduleId: "js-essentials",
            courseId: "javascript-modern-core",
            title: "let, const & Primitive Types",
            summary: "Learn modern variable declaration and understand value vs reference types.",
            order: 1,
            estimatedMinutes: 12,
            concept: `### Modern Variable Declarations

In modern JavaScript (ES6+), we avoid \`var\` in favor of block-scoped declarations:
* **\`const\`**: Default choice. Creates an immutable binding (the variable cannot be reassigned).
* **\`let\`**: Use when you need to reassign the variable (e.g. inside counters and loops).`,
            conceptPoints: [
              "const and let prevent accidental variable hoisting bugs.",
              "Template literals use backticks (\\`) for multi-line and interpolation (${expr}).",
            ],
            example: {
              title: "Template Literals and const",
              language: "javascript",
              code: `const platform = "Built In Tech";
let activeUsers = 1250;
activeUsers += 50;

console.log(\`\${platform} has \${activeUsers} active learners.\`);`,
              output: "Built In Tech has 1300 active learners.",
              explanation: "Template literals allow variable interpolation using ${variable}.",
            },
            tryIt: {
              instructions: "Declare a `const language = 'JavaScript'` and `let score = 95`. Print `Mastering JavaScript with 95%` using a template literal.",
              type: "code",
              starterCode: `// Write your code:
`,
              solutionCode: `const language = "JavaScript";
let score = 95;
console.log(\`Mastering \${language} with \${score}%\`);`,
              expectedOutput: "Mastering JavaScript with 95%",
              hint: "console.log(`Mastering ${language} with ${score}%`)",
            },
          },
        ],
        practiceActivities: [
          {
            id: "js-p-1",
            moduleId: "js-essentials",
            courseId: "javascript-modern-core",
            title: "Arrow Function Transform",
            type: "write-code",
            prompt: "Convert a traditional function to an arrow function.",
            instructions: "Create a const `double = (n) => n * 2` and test with `console.log(double(14))`.",
            starterCode: `// Convert to arrow function:
const double = (n) => n * 2;
console.log(double(14));`,
            solutionCode: `const double = (n) => n * 2;
console.log(double(14));`,
            explanation: "Arrow functions provide concise syntax for returning expression values.",
            xp: 30,
          },
        ],
        quiz: {
          id: "js-quiz-1",
          quizId: "js-essentials-quiz",
          moduleId: "js-essentials",
          courseId: "javascript-modern-core",
          title: "JavaScript Essentials Checkpoint Quiz",
          description: "Pass this quiz to prove your grasp of ES6 variable scoping and modern syntax.",
          passingScorePercent: 70,
          xpReward: 100,
          questions: [
            {
              id: "jsq1",
              question: "What happens if you try to reassign a variable declared with 'const'?",
              options: [
                "It silently fails",
                "It throws a TypeError at runtime",
                "It converts the variable to let",
                "It creates a global variable",
              ],
              correctIndex: 1,
              explanation: "Reassigning a const identifier triggers a TypeError: Assignment to constant variable.",
              conceptHint: "const protects variable reassignment.",
            },
            {
              id: "jsq2",
              question: "Which token is used to enclose template literals?",
              options: ["Single quotes ' '", "Double quotes \" \"", "Backticks ` `", "Parentheses ( )"],
              correctIndex: 2,
              explanation: "Backticks allow interpolation with ${expression}.",
              conceptHint: "The key under Escape on most keyboards.",
            },
          ],
        },
      },
      {
        id: "js-mod-2",
        moduleId: "async-and-arrays",
        courseId: "javascript-modern-core",
        title: "Array Methods & Async Programming",
        description: "Transform data with map, filter, reduce and handle async tasks with async/await.",
        order: 2,
        estimatedMinutes: 50,
        lessons: [
          {
            id: "js-les-2",
            lessonId: "array-transformations",
            moduleId: "async-and-arrays",
            courseId: "javascript-modern-core",
            title: "Functional Array Transformations",
            summary: "Master map(), filter(), and reduce() without mutating original arrays.",
            order: 1,
            estimatedMinutes: 20,
            concept: `### Modern Array Processing

* \`.map(fn)\`: Transforms every item into a new array.
* \`.filter(fn)\`: Selects items that pass a predicate test.
* \`.reduce(fn, init)\`: Accumulates items into a single final value.`,
            conceptPoints: [
              "These methods return new arrays rather than mutating the original array.",
              "They can be cleanly chained together.",
            ],
            example: {
              title: "Chaining Array Methods",
              language: "javascript",
              code: `const numbers = [1, 2, 3, 4, 5, 6];
const sumOfEvenSquares = numbers
  .filter(n => n % 2 === 0)
  .map(n => n * n)
  .reduce((acc, curr) => acc + curr, 0);

console.log("Result:", sumOfEvenSquares);`,
              output: "Result: 56",
              explanation: "Even numbers (2, 4, 6) are squared (4, 16, 36) and summed (4 + 16 + 36 = 56).",
            },
            tryIt: {
              instructions: "Given `const nums = [10, 25, 30, 45, 50]`, filter numbers greater than or equal to 30 and print the resulting array with `console.log()`.",
              type: "code",
              starterCode: `const nums = [10, 25, 30, 45, 50];
// Filter and print:
`,
              solutionCode: `const nums = [10, 25, 30, 45, 50];
const filtered = nums.filter(n => n >= 30);
console.log(filtered);`,
              expectedOutput: "[ 30, 45, 50 ]",
              hint: "Use nums.filter(n => n >= 30)",
            },
          },
        ],
        practiceActivities: [],
        quiz: {
          id: "js-quiz-2",
          quizId: "async-and-arrays-quiz",
          moduleId: "async-and-arrays",
          courseId: "javascript-modern-core",
          title: "Async & Arrays Checkpoint Quiz",
          description: "Prove your mastery of array functional pipelines and asynchronous execution.",
          passingScorePercent: 70,
          xpReward: 120,
          questions: [
            {
              id: "jq3",
              question: "What does the array map() method return?",
              options: [
                "The original mutated array",
                "A new array of the same length containing transformed elements",
                "A single accumulated value",
                "A boolean indicator",
              ],
              correctIndex: 1,
              explanation: "map() constructs and returns a new array with the return value of the callback applied to every element.",
              conceptHint: "Transformation creates a fresh array.",
            },
          ],
        },
      },
    ],
  },

  // ── 3. SQL & RELATIONAL DATABASES ──
  {
    id: "sql-mastery",
    courseId: "sql-mastery",
    title: "SQL & Relational Databases",
    slug: "sql-mastery",
    language: "sql",
    level: "Beginner",
    tagline: "Query, aggregate, join, and structure relational datasets with confidence.",
    description: "From basic SELECT statements to complex multi-table JOINs, subqueries, group aggregations, and data modeling best practices.",
    icon: "🗄️",
    bannerGradient: "from-sky-500/20 via-indigo-500/10 to-transparent",
    estimatedHours: 5,
    totalXp: 750,
    whatYouWillLearn: [
      "SELECT, WHERE, ORDER BY, LIMIT query fundamentals",
      "Aggregation with COUNT, SUM, AVG, and GROUP BY / HAVING",
      "Relational multi-table JOINs (INNER, LEFT, RIGHT, FULL)",
      "Subqueries, CTEs (Common Table Expressions), and indexing",
    ],
    modules: [
      {
        id: "sql-mod-1",
        moduleId: "sql-basics",
        courseId: "sql-mastery",
        title: "SQL Query Basics & Filtering",
        description: "Master SELECT, WHERE, ORDER BY, DISTINCT, and pattern matching.",
        order: 1,
        estimatedMinutes: 35,
        lessons: [
          {
            id: "sql-les-1",
            lessonId: "select-and-where",
            moduleId: "sql-basics",
            courseId: "sql-mastery",
            title: "SELECT, FROM & WHERE",
            summary: "Extract specific columns and filter rows matching exact conditions.",
            order: 1,
            estimatedMinutes: 12,
            concept: `### The Core SQL SELECT Query

SQL (Structured Query Language) is the declarative language for relational databases.

Query Structure:
\`\`\`sql
SELECT column1, column2
FROM table_name
WHERE condition
ORDER BY column1 DESC
LIMIT 10;
\`\`\``,
            conceptPoints: [
              "SELECT specifies what columns to retrieve (* retrieves all).",
              "WHERE filters records before grouping or sorting.",
              "SQL keywords are case-insensitive by convention, but uppercase is standard.",
            ],
            example: {
              title: "Filtering Active Developers",
              language: "sql",
              code: `-- Retrieve high-XP developers
SELECT username, xp_points, country
FROM users
WHERE xp_points > 1000 AND status = 'active'
ORDER BY xp_points DESC
LIMIT 5;`,
              output: "username | xp_points | country\nalex_dev | 2450      | USA\nchen_k   | 2100      | SGP\nsara_m   | 1890      | DEU",
              explanation: "Retrieves top 5 active users with over 1000 XP ordered from highest to lowest.",
            },
            tryIt: {
              instructions: "Write a query to select `title` and `xp` from the `problems` table where `difficulty = 'Easy'`.",
              type: "code",
              starterCode: `-- Write your query:
`,
              solutionCode: `SELECT title, xp FROM problems WHERE difficulty = 'Easy';`,
              expectedOutput: "SELECT title, xp FROM problems WHERE difficulty = 'Easy';",
              hint: "SELECT title, xp FROM problems WHERE difficulty = 'Easy';",
            },
          },
        ],
        practiceActivities: [],
        quiz: {
          id: "sql-quiz-1",
          quizId: "sql-basics-quiz",
          moduleId: "sql-basics",
          courseId: "sql-mastery",
          title: "SQL Basics Checkpoint Quiz",
          description: "Validate your knowledge of column selection, filtering clauses, and sorting.",
          passingScorePercent: 70,
          xpReward: 100,
          questions: [
            {
              id: "sq1",
              question: "Which clause is used to filter records in a standard SQL query?",
              options: ["FILTER", "WHERE", "HAVING", "ORDER BY"],
              correctIndex: 1,
              explanation: "The WHERE clause specifies search conditions for rows returned by FROM.",
              conceptHint: "Starts with W.",
            },
          ],
        },
      },
    ],
  },

  // ── 4. HTML & CSS FOUNDATIONS ──
  {
    id: "html-css-foundations",
    courseId: "html-css-foundations",
    title: "HTML & CSS Foundations",
    slug: "html-css-foundations",
    language: "html",
    level: "Beginner",
    tagline: "Build accessible, responsive web interfaces with semantic markup and modern CSS.",
    description: "Learn how the modern web is structured and styled. Covers semantic HTML5 elements, CSS Box Model, Flexbox, Grid, and responsive media queries.",
    icon: "🎨",
    bannerGradient: "from-rose-500/20 via-pink-500/10 to-transparent",
    estimatedHours: 5,
    totalXp: 700,
    whatYouWillLearn: [
      "Semantic HTML5: header, nav, main, section, article, footer",
      "The CSS Box Model: margin, border, padding, and content",
      "Modern layouts with CSS Flexbox and Grid",
      "Responsive typography and mobile-first media queries",
    ],
    modules: [
      {
        id: "html-mod-1",
        moduleId: "html-semantics",
        courseId: "html-css-foundations",
        title: "Semantic HTML5 & Structure",
        description: "Build accessible document outlines using modern semantic tags.",
        order: 1,
        estimatedMinutes: 30,
        lessons: [
          {
            id: "html-les-1",
            lessonId: "semantic-tags",
            moduleId: "html-semantics",
            courseId: "html-css-foundations",
            title: "Semantic Document Structure",
            summary: "Use header, nav, main, and section to create clean accessible layouts.",
            order: 1,
            estimatedMinutes: 10,
            concept: `### Why Semantics Matter

Semantic HTML tags give meaning to webpage structure for browsers, screen readers, and search engines.

Common Semantic Elements:
* \`<header>\`: Introductory content or navigation banner.
* \`<nav>\`: Set of navigation links.
* \`<main>\`: Dominant content unique to the page.
* \`<article>\`: Self-contained composition (like a blog post or product card).`,
            conceptPoints: [
              "Semantic tags improve accessibility (a11y) and SEO.",
              "Only use one <main> tag per page.",
            ],
            example: {
              title: "A Clean Semantic Page",
              language: "html",
              code: `<header>
  <h1>Built In Tech</h1>
  <nav>
    <a href="/learn">Learn</a>
    <a href="/duel">Duels</a>
  </nav>
</header>
<main>
  <h2>Welcome Learner</h2>
  <p>Start your coding journey today.</p>
</main>`,
              output: "Rendered page outline with header, nav, and main landmarks.",
              explanation: "Creates an accessible document hierarchy recognized by accessibility tools.",
            },
            tryIt: {
              instructions: "Write a `<main>` container with an `<h1>` containing 'Python Course' and a `<p>` tag containing 'Learn the basics'.",
              type: "code",
              starterCode: `<!-- Write semantic HTML: -->
`,
              solutionCode: `<main>
  <h1>Python Course</h1>
  <p>Learn the basics</p>
</main>`,
              expectedOutput: "<main>\n  <h1>Python Course</h1>\n  <p>Learn the basics</p>\n</main>",
              hint: "Wrap h1 and p inside <main>...</main>",
            },
          },
        ],
        practiceActivities: [],
        quiz: {
          id: "html-quiz-1",
          quizId: "html-semantics-quiz",
          moduleId: "html-semantics",
          courseId: "html-css-foundations",
          title: "HTML Semantics Checkpoint Quiz",
          description: "Verify your understanding of document structure and semantic tags.",
          passingScorePercent: 70,
          xpReward: 90,
          questions: [
            {
              id: "hq1",
              question: "Which tag should wrap the primary unique content of a webpage?",
              options: ["<section>", "<div>", "<main>", "<content>"],
              correctIndex: 2,
              explanation: "The <main> tag designates the central content unique to that page.",
              conceptHint: "Main content landmark.",
            },
          ],
        },
      },
    ],
  },

  // ── 5. TYPESCRIPT TYPED MASTERY ──
  {
    id: "typescript-mastery",
    courseId: "typescript-mastery",
    title: "TypeScript Typed Mastery",
    slug: "typescript-mastery",
    language: "typescript",
    level: "Intermediate",
    tagline: "Write rock-solid, type-safe applications with TypeScript generics and interfaces.",
    description: "Scale your JavaScript applications with static types, interfaces, type narrowing, generics, union types, and modern utility types.",
    icon: "🔷",
    bannerGradient: "from-blue-500/20 via-sky-500/10 to-transparent",
    estimatedHours: 6,
    totalXp: 850,
    whatYouWillLearn: [
      "Basic types, type inference, and explicit type annotations",
      "Interfaces vs Type Aliases",
      "Generics and generic constraints",
      "Utility types (Partial, Omit, Pick, Record)",
    ],
    modules: [
      {
        id: "ts-mod-1",
        moduleId: "ts-type-system",
        courseId: "typescript-mastery",
        title: "Type System & Interfaces",
        description: "Master interfaces, union types, and strict type checking.",
        order: 1,
        estimatedMinutes: 45,
        lessons: [
          {
            id: "ts-les-1",
            lessonId: "interfaces-and-types",
            moduleId: "ts-type-system",
            courseId: "typescript-mastery",
            title: "Interfaces & Object Shapes",
            summary: "Define contracts for data models and component props.",
            order: 1,
            estimatedMinutes: 15,
            concept: `### Defining Contracts with Interfaces

TypeScript adds static typing on top of JavaScript. An \`interface\` defines the required shape of an object.

\`\`\`typescript
interface UserProfile {
  id: string;
  username: string;
  xp: number;
  isActive?: boolean; // Optional property
}
\`\`\``,
            conceptPoints: [
              "Interfaces describe the contract for object structures.",
              "Optional properties are marked with '?'",
              "TypeScript type checks at compile time with zero runtime overhead.",
            ],
            example: {
              title: "Strict User Model",
              language: "typescript",
              code: `interface DuelScore {
  player: string;
  testsPassed: number;
  totalTests: number;
  won: boolean;
}

function printScore(score: DuelScore): void {
  console.log(\`\${score.player}: \${score.testsPassed}/\${score.totalTests} (Won: \${score.won})\`);
}

printScore({ player: "Nova", testsPassed: 5, totalTests: 5, won: true });`,
              output: "Nova: 5/5 (Won: true)",
              explanation: "The compiler guarantees that the object passed to printScore contains all required fields.",
            },
            tryIt: {
              instructions: "Define an interface `Course` with `title: string` and `xp: number`. Create a variable `const myCourse: Course = { title: 'TypeScript', xp: 500 };` and print its title.",
              type: "code",
              starterCode: `// Define interface and variable:
`,
              solutionCode: `interface Course {
  title: string;
  xp: number;
}
const myCourse: Course = { title: "TypeScript", xp: 500 };
console.log(myCourse.title);`,
              expectedOutput: "TypeScript",
              hint: "Define interface Course, assign object, then console.log(myCourse.title)",
            },
          },
        ],
        practiceActivities: [],
        quiz: {
          id: "ts-quiz-1",
          quizId: "ts-type-system-quiz",
          moduleId: "ts-type-system",
          courseId: "typescript-mastery",
          title: "TypeScript Checkpoint Quiz",
          description: "Verify your understanding of type annotations and compile-time verification.",
          passingScorePercent: 70,
          xpReward: 100,
          questions: [
            {
              id: "tq1",
              question: "How do you mark a property as optional in a TypeScript interface?",
              options: ["property: optional string", "property?: string", "optional property: string", "property!: string"],
              correctIndex: 1,
              explanation: "Adding ? after the property identifier marks it as optional (T | undefined).",
              conceptHint: "Uses the question mark.",
            },
          ],
        },
      },
    ],
  },

  // ── 6. JAVA OBJECT-ORIENTED CORE ──
  {
    id: "java-core",
    courseId: "java-core",
    title: "Java Object-Oriented Core",
    slug: "java-core",
    language: "java",
    level: "Beginner",
    tagline: "Build robust enterprise applications with OOP principles and strong typing.",
    description: "Learn Java syntax, classes, inheritance, encapsulation, polymorphism, exceptions, and the Java Collections framework.",
    icon: "☕",
    bannerGradient: "from-orange-500/20 via-red-500/10 to-transparent",
    estimatedHours: 6,
    totalXp: 800,
    whatYouWillLearn: [
      "Java syntax, strongly typed variables, and methods",
      "Object-Oriented Programming: Encapsulation, Inheritance, Polymorphism",
      "ArrayList, HashMap, and the Java Collections Framework",
    ],
    modules: [
      {
        id: "java-mod-1",
        moduleId: "java-basics",
        courseId: "java-core",
        title: "Java Syntax & Classes",
        description: "Understand the JVM, public static void main, and creating classes.",
        order: 1,
        estimatedMinutes: 40,
        lessons: [
          {
            id: "java-les-1",
            lessonId: "java-classes",
            moduleId: "java-basics",
            courseId: "java-core",
            title: "Java Program Entry & Classes",
            summary: "Learn how Java programs execute through the main method.",
            order: 1,
            estimatedMinutes: 15,
            concept: `### The Structure of a Java Program

Every Java application is organized into classes and begins execution inside the \`main\` method:

\`\`\`java
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello Built In Tech!");
    }
}
\`\`\``,
            conceptPoints: [
              "Every statement must end with a semicolon ';'.",
              "File names must match the public class name exactly.",
            ],
            example: {
              title: "Basic Java Main",
              language: "java",
              code: `public class Main {
    public static void main(String[] args) {
        int level = 5;
        System.out.println("Current Level: " + level);
    }
}`,
              output: "Current Level: 5",
              explanation: "Compiles and executes the entrypoint main method.",
            },
            tryIt: {
              instructions: "Complete the Java main method to print 'Hello Java' to the console.",
              type: "code",
              starterCode: `public class Main {
    public static void main(String[] args) {
        // Print message here:
    }
}`,
              solutionCode: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello Java");
    }
}`,
              expectedOutput: "Hello Java",
              hint: "System.out.println(\"Hello Java\");",
            },
          },
        ],
        practiceActivities: [],
        quiz: {
          id: "java-quiz-1",
          quizId: "java-basics-quiz",
          moduleId: "java-basics",
          courseId: "java-core",
          title: "Java Basics Checkpoint Quiz",
          description: "Demonstrate your understanding of Java types and execution entry points.",
          passingScorePercent: 70,
          xpReward: 100,
          questions: [
            {
              id: "jaq1",
              question: "What is the correct entry point signature for a standard Java console application?",
              options: [
                "public void main()",
                "public static void main(String[] args)",
                "static void Main(string[] args)",
                "function main()",
              ],
              correctIndex: 1,
              explanation: "Java requires 'public static void main(String[] args)' as the entry point.",
              conceptHint: "Standard JVM signature.",
            },
          ],
        },
      },
    ],
  },

  // ── 7. C & C++ SYSTEMS FOUNDATIONS ──
  {
    id: "cpp-systems",
    courseId: "cpp-systems",
    title: "C & C++ Systems Foundations",
    slug: "cpp-systems",
    language: "cpp",
    level: "Intermediate",
    tagline: "Master low-level memory, pointers, manual resource management, and the STL.",
    description: "Understand computer architecture, pointers, dynamic memory allocation, references, operator overloading, templates, and the C++ Standard Template Library.",
    icon: "⚙️",
    bannerGradient: "from-blue-600/20 via-indigo-600/10 to-transparent",
    estimatedHours: 7,
    totalXp: 900,
    whatYouWillLearn: [
      "Memory layout: Stack vs Heap allocation",
      "Pointers, dereferencing, and memory addresses",
      "C++ STL: vector, unordered_map, set, and algorithms",
    ],
    modules: [
      {
        id: "cpp-mod-1",
        moduleId: "pointers-memory",
        courseId: "cpp-systems",
        title: "Pointers & Memory Architecture",
        description: "Understand memory addresses (&), pointer variables (*), and the stack vs heap.",
        order: 1,
        estimatedMinutes: 45,
        lessons: [
          {
            id: "cpp-les-1",
            lessonId: "pointers-basics",
            moduleId: "pointers-memory",
            courseId: "cpp-systems",
            title: "Pointers and Addresses",
            summary: "Learn how variables are stored in memory and how pointers reference them.",
            order: 1,
            estimatedMinutes: 15,
            concept: `### What is a Pointer?

A pointer is a variable that stores the **memory address** of another variable.
* \`&\` Address-of operator: retrieves the memory address of a variable.
* \`*\` Dereference operator: accesses the value stored at a pointer's address.`,
            conceptPoints: [
              "Pointers allow direct memory access and efficient parameter passing.",
              "Always initialize pointers to avoid undefined behavior.",
            ],
            example: {
              title: "Pointer Dereferencing",
              language: "cpp",
              code: `#include <iostream>
using namespace std;

int main() {
    int val = 42;
    int* ptr = &val;
    cout << "Value: " << *ptr << endl;
    return 0;
}`,
              output: "Value: 42",
              explanation: "*ptr dereferences the memory address to read the integer value 42.",
            },
            tryIt: {
              instructions: "Write a C++ program that prints `Memory Master` to stdout.",
              type: "code",
              starterCode: `#include <iostream>
using namespace std;

int main() {
    // Print your message:
    return 0;
}`,
              solutionCode: `#include <iostream>
using namespace std;

int main() {
    cout << "Memory Master" << endl;
    return 0;
}`,
              expectedOutput: "Memory Master",
              hint: "cout << \"Memory Master\" << endl;",
            },
          },
        ],
        practiceActivities: [],
        quiz: {
          id: "cpp-quiz-1",
          quizId: "pointers-memory-quiz",
          moduleId: "pointers-memory",
          courseId: "cpp-systems",
          title: "C++ Memory Checkpoint Quiz",
          description: "Test your understanding of pointers, references, and memory.",
          passingScorePercent: 70,
          xpReward: 100,
          questions: [
            {
              id: "cq1",
              question: "Which operator is used to get the memory address of a variable in C/C++?",
              options: ["*", "&", "->", "%"],
              correctIndex: 1,
              explanation: "The '&' ampersand operator extracts the memory address of a variable.",
              conceptHint: "Address-of operator.",
            },
          ],
        },
      },
    ],
  },
];

// Additional language course stubs for C, C#, PHP, Swift, Ruby, CSS
const ADDITIONAL_LANGUAGES: Array<{ language: SupportedLanguage; title: string; tagline: string; icon: string }> = [
  { language: "c", title: "C Low-Level Programming", tagline: "Write high-performance low-level system code in pure C.", icon: "🔧" },
  { language: "csharp", title: "C# & .NET Modern Dev", tagline: "Build enterprise, cloud, and cross-platform apps with modern C#.", icon: "🎯" },
  { language: "php", title: "Modern PHP 8+ & Web", tagline: "Build scalable web backends with modern typed PHP.", icon: "🐘" },
  { language: "swift", title: "Swift & iOS Development", tagline: "Create modern iOS and macOS apps with Swift and SwiftUI.", icon: "🦅" },
  { language: "ruby", title: "Ruby & Elegant Scripting", tagline: "Developer happiness, expressive syntax, and web mastery with Ruby.", icon: "💎" },
  { language: "css", title: "CSS3 Mastery & Animations", tagline: "Modern layouts, Flexbox, Grid, container queries, and micro-interactions.", icon: "🎨" },
];

for (const extra of ADDITIONAL_LANGUAGES) {
  COURSES.push({
    id: `${extra.language}-essentials`,
    courseId: `${extra.language}-essentials`,
    title: extra.title,
    slug: `${extra.language}-essentials`,
    language: extra.language,
    level: "Beginner",
    tagline: extra.tagline,
    description: `A structured learning journey to master ${extra.title}. Learn syntax, best practices, idiomatic patterns, and hands-on coding.`,
    icon: extra.icon,
    bannerGradient: "from-cyan-500/20 via-slate-700/10 to-transparent",
    estimatedHours: 5,
    totalXp: 700,
    whatYouWillLearn: [
      `Core ${extra.title} syntax and conventions`,
      "Practical problem-solving patterns",
      "Interactive code exercises and module checkpoint quizzes",
    ],
    modules: [
      {
        id: `${extra.language}-mod-1`,
        moduleId: `${extra.language}-basics`,
        courseId: `${extra.language}-essentials`,
        title: `${extra.title} Foundations`,
        description: `Essential syntax, variables, and control structures for ${extra.title}.`,
        order: 1,
        estimatedMinutes: 40,
        lessons: [
          {
            id: `${extra.language}-les-1`,
            lessonId: `${extra.language}-intro`,
            moduleId: `${extra.language}-basics`,
            courseId: `${extra.language}-essentials`,
            title: `Introduction to ${extra.title}`,
            summary: `Understand language philosophy and write your first program.`,
            order: 1,
            estimatedMinutes: 15,
            concept: `### Getting Started with ${extra.title}

Learn the core primitives, syntax rules, and tooling of ${extra.title}.`,
            conceptPoints: ["Clean syntax and idiomatic style.", "Execution lifecycle and standard library."],
            example: {
              title: `First ${extra.title} program`,
              language: extra.language,
              code: `// Welcome to ${extra.title}`,
              output: `Ready to learn ${extra.title}`,
              explanation: "Basic template setup.",
            },
            tryIt: {
              instructions: `Run your first ${extra.title} exercise.`,
              type: "code",
              starterCode: `// Start coding here\n`,
              solutionCode: `// Solved\n`,
              expectedOutput: "",
              hint: "Check the syntax instructions.",
            },
          },
        ],
        practiceActivities: [],
        quiz: {
          id: `${extra.language}-quiz-1`,
          quizId: `${extra.language}-basics-quiz`,
          moduleId: `${extra.language}-basics`,
          courseId: `${extra.language}-essentials`,
          title: `${extra.title} Checkpoint Quiz`,
          description: "Pass to complete the module and earn XP.",
          passingScorePercent: 70,
          xpReward: 100,
          questions: [
            {
              id: "eq1",
              question: `What is the primary strength of ${extra.title}?`,
              options: ["Modern developer ergonomics", "Interpreted legacy only", "No type checking", "Deprecated"],
              correctIndex: 0,
              explanation: "Built for modern engineering productivity.",
              conceptHint: "Ergonomics and versatility.",
            },
          ],
        },
      },
    ],
  });
}

export function getAllCourses(): ICourse[] {
  return COURSES;
}

export function getCourseById(courseId: string): ICourse | undefined {
  return COURSES.find((c) => c.id === courseId || c.courseId === courseId || c.slug === courseId);
}

export function getCourseByLanguageAndLevel(language: SupportedLanguage, level?: CourseLevel): ICourse | undefined {
  const match = COURSES.find(
    (c) => c.language === language && (!level || c.level.toLowerCase() === level.toLowerCase())
  );
  return match || COURSES.find((c) => c.language === language) || COURSES[0];
}
