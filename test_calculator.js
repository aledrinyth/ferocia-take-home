/**
 * Borrowing Power Calculator Test Suite
 */


const assert = require('assert'); 
const { Calculator } = require('./borrowingCalculator');

describe('Term Deposit Calculator Tests', () => {

  // Instantiate the class now
  const calculator = new Calculator({
    LOAN_TERM_MONTHS: 360, // 30 Years
    INTEREST_RATE: 7.0, // 7.0% baseline interest rate
    ASSESSMENT_RATE_BUFFER: 3.0 // 3.0% buffer added to interest rates
  }) 

  it('should calculate borrowing power for standard values', () => {
    const result = calculator.calculateBorrowingPower(120000, 2, 3000, 10000, 7.5);
    assert.ok(result.maxLoanAmount > 0, 'Should yield a positive borrowing power amount');
    assert.strictEqual(result.monthlyRepayment, 4200);
  });

  it('should return 0 for invalid negative inputs', () => {
    const result = calculator.calculateBorrowingPower(30000, 3, 4000, 5000, 7.5);
    assert.strictEqual(result.maxLoanAmount, 0);
    assert.strictEqual(result.monthlyRepayment, 0);
  });

});

