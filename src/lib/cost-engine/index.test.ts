import {
  calculateNominalUnitCost,
  calculateUsableCost,
  calculateRecipeYield,
  calculateRecipeCostPerKg,
  calculateGrossMargin,
  calculateMarkup,
  calculateTargetPriceForMargin,
  calculateContributionMargin,
  calculateBreakEvenPoint
} from './index';

// A simple test runner to verify the pure functions
// To run: npx tsx src/lib/cost-engine/index.test.ts (if tsx is installed)
// Or integrate with Jest/Vitest

function runTests() {
  console.log("Running Cost Engine Tests...");

  // 1. Nominal Cost
  console.assert(calculateNominalUnitCost(75000, 15) === 5000, "Nominal Unit Cost should be 5000");

  // 2. Usable Cost
  const usable = calculateUsableCost(5000, 0.91);
  console.assert(Math.abs(usable - 5494.505) < 0.01, "Usable Cost should be ~5494.51");

  // 3. Recipe Yield
  console.assert(calculateRecipeYield(10, 15.8) === 1.58, "Recipe yield should be 1.58");

  // 4. Target Price
  // Cost: 7000, Target Margin: 40% -> 11666.66
  const targetPrice = calculateTargetPriceForMargin(7000, 0.40);
  console.assert(Math.abs(targetPrice - 11666.66) < 0.01, "Target Price should be ~11666.67");

  // 5. Break Even
  // Fixed: 1,045,000, Price: 11900, Cost: 7220
  // Contribution: 4680
  const breakEven = calculateBreakEvenPoint(1045000, 11900 - 7220);
  console.assert(Math.abs(breakEven - 223.29) < 0.01, "Break Even should be ~223.3");

  console.log("All cost engine tests passed.");
}

// runTests();
