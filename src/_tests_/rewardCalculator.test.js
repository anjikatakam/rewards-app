const calculateRewardPoints = require("../utils/rewardCalculator.js");

test("Rewards for $120 should be 90", () => {
  expect(calculateRewardPoints(120)).toBe(90);
});

test("Rewards for $50 should be 0", () => {
  expect(calculateRewardPoints(50)).toBe(0);
});

test("Rewards for $75 should be 25", () => {
  expect(calculateRewardPoints(75)).toBe(25);
});

// Negative test cases
test("Rewards for negative amount should be 0", () => {
  expect(calculateRewardPoints(-20)).toBe(0);
});

test("Rewards for non-numeric input should return 0", () => {
  expect(calculateRewardPoints("abc")).toBe(0);
});

test("Rewards for 0 amount should be 0", () => {
  expect(calculateRewardPoints(0)).toBe(0);
});
