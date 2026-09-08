/**
 * Borrowing Power Calculator Test Suite
 */

const assert = require('assert');
const { Calculator } = require('../borrowingCalculator');

describe('Term Deposit Calculator Tests', () => {

  // Instantiate the class now
  const calculator = new Calculator({
    LOAN_TERM_MONTHS: 360, // 30 Years
    INTEREST_RATE: 7.0, // 7.0% baseline interest rate
    ASSESSMENT_RATE_BUFFER: 3.0 // 3.0% buffer added to interest rates
  }) 

  it('should calculate borrowing power for standard values', async () => {
    const result = await calculator.calculateBorrowingPower(120000, 2, 3000, 10000, 7.5);
    console.log(result.maxLoanAmount)
    assert.ok(result.maxLoanAmount > 0, 'Should yield a positive borrowing power amount');
    assert.strictEqual(result.monthlyRepayment, 4600);
  });

  describe('Standard calculations', () => {
    it('should calculate borrowing power for standard values', async () => {
      const result = await calculator.calculateBorrowingPower(120000, 2, 3000, 10000, 7.5);
      assert.ok(result.maxLoanAmount > 0, 'Should yield a positive borrowing power amount');
      assert.ok(result.monthlyRepayment > 0, 'Should yield a positive monthly repayment');
    });

    it('should return 0 for cases where expenses exceed income', async () => {
      const result = await calculator.calculateBorrowingPower(30000, 3, 4000, 5000, 7.5);
      assert.strictEqual(result.maxLoanAmount, 0);
      assert.strictEqual(result.monthlyRepayment, 0);
    });
  });

  describe('Edge cases - Zero and boundary values', () => {
    it('should handle zero income', async () => {
      const result = await calculator.calculateBorrowingPower(0, 0, 0, 0, 7.5);
      assert.strictEqual(result.maxLoanAmount, 0);
      assert.strictEqual(result.monthlyRepayment, 0);
    });

    it('should handle zero dependents', async () => {
      const result = await calculator.calculateBorrowingPower(100000, 0, 2000, 5000, 7.5);
      assert.ok(result.maxLoanAmount >= 0);
      assert.ok(result.monthlyRepayment >= 0);
    });

    it('should handle zero expenses', async () => {
      const result = await calculator.calculateBorrowingPower(100000, 2, 0, 0, 7.5);
      assert.ok(result.maxLoanAmount > 0, 'Should have positive borrowing power with zero expenses');
    });

    it('should handle zero credit limits', async () => {
      const result = await calculator.calculateBorrowingPower(100000, 2, 2000, 0, 7.5);
      assert.ok(result.maxLoanAmount > 0);
      assert.ok(result.monthlyRepayment > 0);
    });
  });

  describe('Edge cases - High values', () => {
    it('should handle extremely high income', async () => {
      const result = await calculator.calculateBorrowingPower(10000000, 0, 5000, 10000, 7.5);
      assert.ok(result.maxLoanAmount > 0);
      assert.ok(result.monthlyRepayment > 0);
      assert.ok(Number.isFinite(result.maxLoanAmount), 'Max loan amount should be finite');
    });

    it('should handle high number of dependents', async () => {
      const result = await calculator.calculateBorrowingPower(150000, 10, 3000, 5000, 7.5);
      assert.ok(result.maxLoanAmount >= 0);
      assert.ok(result.monthlyRepayment >= 0);
    });

    it('should handle extremely high expenses', async () => {
      const result = await calculator.calculateBorrowingPower(80000, 2, 50000, 5000, 7.5);
      assert.strictEqual(result.maxLoanAmount, 0, 'Should return 0 when expenses are too high');
      assert.strictEqual(result.monthlyRepayment, 0);
    });

    it('should handle extremely high credit limits', async () => {
      const result = await calculator.calculateBorrowingPower(100000, 2, 2000, 500000, 7.5);
      assert.ok(result.maxLoanAmount >= 0);
      assert.ok(result.monthlyRepayment >= 0);
    });
  });

  describe('Invalid input handling', () => {
    it('should handle negative income gracefully', async () => {
      const result = await calculator.calculateBorrowingPower(-50000, 2, 3000, 5000, 7.5);
      // API should reject negative values, but calculator should handle gracefully
      assert.ok(result.maxLoanAmount >= 0);
      assert.ok(result.monthlyRepayment >= 0);
    });

    it('should handle negative dependents', async () => {
      const result = await calculator.calculateBorrowingPower(100000, -2, 3000, 5000, 7.5);
      assert.ok(result.maxLoanAmount >= 0);
      assert.ok(result.monthlyRepayment >= 0);
    });

    it('should handle negative expenses', async () => {
      const result = await calculator.calculateBorrowingPower(100000, 2, -3000, 5000, 7.5);
      assert.ok(result.maxLoanAmount >= 0);
      assert.ok(result.monthlyRepayment >= 0);
    });

    it('should handle negative credit limits', async () => {
      const result = await calculator.calculateBorrowingPower(100000, 2, 3000, -5000, 7.5);
      assert.ok(result.maxLoanAmount >= 0);
      assert.ok(result.monthlyRepayment >= 0);
    });

    // Input validation checks
    it('should handle NaN income', async () => {
      const result = await calculator.calculateBorrowingPower(NaN, 2, 3000, 5000, 7.5);
      assert.ok(result.maxLoanAmount >= 0);
      assert.ok(result.monthlyRepayment >= 0);
    });

    it('should handle string inputs that cannot be parsed', async () => {
      const result = await calculator.calculateBorrowingPower('not-a-number', 2, 3000, 5000, 7.5);
      assert.ok(result.maxLoanAmount >= 0);
      assert.ok(result.monthlyRepayment >= 0);
    });

    it('should handle undefined inputs', async () => {
      const result = await calculator.calculateBorrowingPower(undefined, undefined, undefined, undefined, 7.5);
      assert.strictEqual(result.maxLoanAmount, 0);
      assert.strictEqual(result.monthlyRepayment, 0);
    });

    it('should handle null inputs', async () => {
      const result = await calculator.calculateBorrowingPower(null, null, null, null, 7.5);
      assert.strictEqual(result.maxLoanAmount, 0);
      assert.strictEqual(result.monthlyRepayment, 0);
    });
  });

  // Checks that returns values are outputted in the proper format
  describe('Return value validation', () => {
    it('should return numbers, not strings', async () => {
      const result = await calculator.calculateBorrowingPower(100000, 2, 3000, 5000, 7.5);
      assert.strictEqual(typeof result.maxLoanAmount, 'number');
      assert.strictEqual(typeof result.monthlyRepayment, 'number');
    });

    it('should return properly rounded values (2 decimal places)', async () => {
      const result = await calculator.calculateBorrowingPower(100000, 2, 3000, 5000, 7.5);
      assert.strictEqual(result.maxLoanAmount, Number(result.maxLoanAmount.toFixed(2)));
      assert.strictEqual(result.monthlyRepayment, Number(result.monthlyRepayment.toFixed(2)));
    });

    it('should return an object with expected properties', async () => {
      const result = await calculator.calculateBorrowingPower(100000, 2, 3000, 5000, 7.5);
      assert.ok(result.hasOwnProperty('maxLoanAmount'));
      assert.ok(result.hasOwnProperty('monthlyRepayment'));
    });
  });

  // Checks a bunch of different interest rate inputs and the normal edge cases
  describe('Different interest rates', () => {
    it('should produce higher borrowing power with lower interest rates', async () => {
      const lowRate = await calculator.calculateBorrowingPower(100000, 2, 2500, 5000, 5.0);
      const highRate = await calculator.calculateBorrowingPower(100000, 2, 2500, 5000, 10.0);
      
      assert.ok(lowRate.maxLoanAmount > highRate.maxLoanAmount, 
        'Lower interest rate should allow higher borrowing');
    });

    it('should handle zero interest rate', async () => {
      const result = await calculator.calculateBorrowingPower(100000, 2, 2000, 5000, 0);
      // With 0% interest, the calculation becomes simpler but should still work
      assert.ok(result.monthlyRepayment >= 0);
    });

    it('should handle very high interest rates', async () => {
      const result = await calculator.calculateBorrowingPower(100000, 2, 2000, 5000, 50);
      assert.ok(result.maxLoanAmount >= 0);
      assert.ok(result.monthlyRepayment >= 0);
    });
  });

  // Checks that it actually uses the custom values provided and that default values are
  // used in the situation where there are no passed values
  describe('Calculator configuration', () => {
    it('should use custom loan term months', async () => {
      const shortTermCalc = new Calculator({
        loan_term_length: 120, // 10 years
        interest_rate: 7.0,
        rate_buffer: 3.0
      });

      const longTermCalc = new Calculator({
        loan_term_length: 360, // 30 years
        interest_rate: 7.0,
        rate_buffer: 3.0
      });

      const shortResult = await shortTermCalc.calculateBorrowingPower(100000, 2, 2500, 5000, 7.5);
      const longResult = await longTermCalc.calculateBorrowingPower(100000, 2, 2500, 5000, 7.5);

      assert.ok(longResult.maxLoanAmount > shortResult.maxLoanAmount,
        'Longer loan term should allow higher borrowing amount');
    });

    it('should use default values when no config provided', () => {
      const defaultCalc = new Calculator();
      assert.strictEqual(defaultCalc.LOAN_TERM_MONTHS, 360);
      assert.strictEqual(defaultCalc.INTEREST_RATE, 7.0);
      assert.strictEqual(defaultCalc.ASSESSMENT_RATE_BUFFER, 3.0);
    });
  });

  // Basic math checks that higher credit card limits should lower borrowing power
  // If it breaks then someone broke the math for the calculator
  describe('Credit card liability calculation', () => {
    it('should reduce borrowing power with higher credit limits', async () => {
      const lowCredit = await calculator.calculateBorrowingPower(100000, 2, 2500, 5000, 7.5);
      const highCredit = await calculator.calculateBorrowingPower(100000, 2, 2500, 50000, 7.5);

      assert.ok(lowCredit.maxLoanAmount > highCredit.maxLoanAmount,
        'Higher credit card limits should reduce borrowing power');
    });
  });

  // Checks that the calculator works correctly across different income/dependant combinations
  describe('Living expenses vs HEM baseline', () => {
    it('should use HEM when it is higher than declared expenses', async () => {
      // With very low declared expenses, HEM should take precedence
      const result = await calculator.calculateBorrowingPower(100000, 2, 100, 5000, 7.5);
      assert.ok(result.maxLoanAmount > 0);
      // The actual calculation should use HEM, not the low declared expenses
    });

    it('should use declared expenses when higher than HEM', async () => {
      // With very high declared expenses, they should be used
      const highExpenses = await calculator.calculateBorrowingPower(100000, 2, 8000, 5000, 7.5);
      const lowExpenses = await calculator.calculateBorrowingPower(100000, 2, 2000, 5000, 7.5);
      
      assert.ok(lowExpenses.maxLoanAmount > highExpenses.maxLoanAmount,
        'Higher declared expenses should reduce borrowing power');
    });
  });
});
