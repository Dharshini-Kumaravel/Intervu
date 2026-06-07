export const APTITUDE_TOPICS = [
  {
    name: "Quantitative Aptitude",
    icon: "🧮",
    subtopics: ["Time & Work", "Percentages", "Profit & Loss", "Ratios", "Averages", "Probability", "Permutations", "Speed Distance Time"]
  },
  {
    name: "Logical Reasoning",
    icon: "🧠",
    subtopics: ["Series", "Coding-Decoding", "Blood Relations", "Direction Sense", "Syllogisms", "Puzzles", "Seating Arrangement"]
  },
  {
    name: "Verbal Ability",
    icon: "📝",
    subtopics: ["Reading Comprehension", "Synonyms", "Antonyms", "Sentence Correction", "Para Jumbles", "Cloze Test"]
  },
  {
    name: "Data Interpretation",
    icon: "📊",
    subtopics: ["Bar Charts", "Pie Charts", "Line Graphs", "Tables", "Caselets"]
  }
];

export const CODING_TOPICS = [
  { name: "Arrays", problems: ["Two Sum", "Maximum Subarray", "Move Zeros", "Best Time to Buy Stock"] },
  { name: "Strings", problems: ["Valid Anagram", "Reverse String", "Longest Substring Without Repeat"] },
  { name: "Linked List", problems: ["Reverse Linked List", "Detect Cycle", "Merge Two Sorted Lists"] },
  { name: "Trees", problems: ["Invert Binary Tree", "Max Depth", "Validate BST"] },
  { name: "Dynamic Programming", problems: ["Climbing Stairs", "House Robber", "Coin Change"] },
  { name: "Graphs", problems: ["Number of Islands", "Course Schedule"] }
];

export const PROBLEM_DETAILS: Record<string, { difficulty: string; statement: string; example: string }> = {
  "Two Sum": { difficulty: "Easy", statement: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.", example: "Input: nums=[2,7,11,15], target=9 → Output: [0,1]" },
  "Maximum Subarray": { difficulty: "Medium", statement: "Given an integer array nums, find the contiguous subarray with the largest sum and return its sum.", example: "Input: [-2,1,-3,4,-1,2,1,-5,4] → Output: 6" },
  "Move Zeros": { difficulty: "Easy", statement: "Given an integer array nums, move all 0's to the end of it while maintaining the relative order of the non-zero elements.", example: "Input: [0,1,0,3,12] → Output: [1,3,12,0,0]" },
  "Best Time to Buy Stock": { difficulty: "Easy", statement: "You are given an array prices where prices[i] is the price of a given stock on the ith day. You want to maximize your profit by choosing a single day to buy and a different day in the future to sell.", example: "Input: [7,1,5,3,6,4] → Output: 5" },
  "Valid Anagram": { difficulty: "Easy", statement: "Given two strings s and t, return true if t is an anagram of s.", example: "Input: s='anagram', t='nagaram' → Output: true" },
  "Reverse String": { difficulty: "Easy", statement: "Write a function that reverses a string in-place.", example: "Input: ['h','e','l','l','o'] → Output: ['o','l','l','e','h']" },
  "Longest Substring Without Repeat": { difficulty: "Medium", statement: "Given a string s, find the length of the longest substring without repeating characters.", example: "Input: 'abcabcbb' → Output: 3" },
  "Reverse Linked List": { difficulty: "Easy", statement: "Given the head of a singly linked list, reverse the list, and return the reversed list.", example: "Input: 1→2→3 → Output: 3→2→1" },
  "Detect Cycle": { difficulty: "Easy", statement: "Given head, the head of a linked list, determine if the linked list has a cycle in it.", example: "Return true if a cycle exists" },
  "Merge Two Sorted Lists": { difficulty: "Easy", statement: "Merge two sorted linked lists and return it as a new sorted list.", example: "Input: 1→2→4 and 1→3→4 → Output: 1→1→2→3→4→4" },
  "Invert Binary Tree": { difficulty: "Easy", statement: "Given the root of a binary tree, invert the tree and return its root.", example: "Mirror the tree left↔right" },
  "Max Depth": { difficulty: "Easy", statement: "Given the root of a binary tree, return its maximum depth.", example: "Number of nodes along the longest path" },
  "Validate BST": { difficulty: "Medium", statement: "Given the root of a binary tree, determine if it is a valid binary search tree.", example: "Each node value must satisfy BST property" },
  "Climbing Stairs": { difficulty: "Easy", statement: "You are climbing a staircase. It takes n steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?", example: "Input: n=3 → Output: 3" },
  "House Robber": { difficulty: "Medium", statement: "You cannot rob two adjacent houses. Given an integer array of house values, return the maximum amount of money you can rob.", example: "Input: [2,7,9,3,1] → Output: 12" },
  "Coin Change": { difficulty: "Medium", statement: "Given an integer array coins and an integer amount, return the fewest number of coins needed to make up that amount. Return -1 if not possible.", example: "Input: coins=[1,2,5], amount=11 → Output: 3" },
  "Number of Islands": { difficulty: "Medium", statement: "Given an m×n 2D binary grid which represents a map of '1's (land) and '0's (water), return the number of islands.", example: "4-directional connectivity" },
  "Course Schedule": { difficulty: "Medium", statement: "There are numCourses courses you have to take. Given prerequisites pairs, return true if you can finish all courses.", example: "Detect cycle in directed graph" }
};

export const COMPANIES = {
  service: ["TCS", "Infosys", "Wipro", "Cognizant", "Accenture", "Capgemini"],
  product: ["Google", "Microsoft", "Amazon", "Meta", "Apple", "Netflix"]
};

export const COMPANY_FLOW = {
  service: [
    { round: "Aptitude", description: "Quantitative + Logical + Verbal", duration: 20 },
    { round: "Basic Coding", description: "1 easy coding problem", duration: 30 },
    { round: "Technical Basics", description: "OOP, DB, OS fundamentals (HR-style Q&A)", duration: 15 },
    { round: "HR Round", description: "Behavioral & motivational", duration: 15 }
  ],
  product: [
    { round: "Coding (DSA)", description: "1-2 medium DSA problems", duration: 45 },
    { round: "Technical Deep Dive", description: "System design + advanced concepts", duration: 20 },
    { round: "Behavioral", description: "Leadership & culture-fit", duration: 20 }
  ]
};
