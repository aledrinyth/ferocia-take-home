/**
 * Borrowing Power Calculator
 * 
 * Gen's incomplete prototype. 
 * This currently calculates what a user can borrow over 30 years.
 * Currently this code uses placeholder methods for Tax and HEM values. 
 * 
 * TODO: Refactor the code to pull Tax and HEM values from an API call.
 * A server.js has been provided to supply these values.
 */

require("dotenv").config()

class Calculator {
    /*
    This calculator class handles all calculator stuff
    */


    // Calculator constructor
    constructor({loan_term_length = 360, interest_rate = 7.0, rate_buffer = 3.0} = {}){
        this.LOAN_TERM_MONTHS = loan_term_length; // 30 Years
        this.INTEREST_RATE = interest_rate; // 7.0% baseline interest rate
        this.ASSESSMENT_RATE_BUFFER = rate_buffer; // 3.0% buffer added to interest rates

    }

    async getTax(income){
        try{
            const response = await fetch(`${process.env.SERVER_API}/tax?income=${income}`, {
                headers: {
                    'Authorization': `Bearer ${process.env.VALID_PAT}`, 
                }
            });

            // Convert it to a json object
            const results = await response.json();

            console.log(results);

            // Check if API returned an error
            if (!response.ok || results.error) {
                console.error("Tax API error:", results.error || results.message);
                return 0;
            }

            // Get the tax from the json
            const final = results.tax;

            return final

        }
        catch (err) {
            console.error("Tax calculation failed. Reason: ", err);
            // Wont cause it to crash but will return 0
            return 0
        }
    }

    async getHEM(income, dependents) {

        try{
            const response = await fetch(`${process.env.SERVER_API}/hem?income=${income}&dependents=${dependents}`, {
                headers: {
                    'Authorization': `Bearer ${process.env.VALID_PAT}`, 
                }
            });

            // Convert it to a json object
            const results = await response.json();

            console.log(results);

            // Checks if API returned an error
            if (!response.ok || results.error) {
                console.error("HEM API error:", results.error || results.message);
                return 0;
            }

            // Get the hem from the json
            const final = results.hem;

            return final

        }
        catch (err) {
            console.error("HEM calculation failed. Reason: ", err);
            // Wont cause it to crash but will return 0
            return 0
        }

    }

    /**
     * Calculates the total borrowing power amount and the monthly repayment configuration
     */
    async calculateBorrowingPower(income, dependents, expenses, creditLimits, annualAssessmentRate) {
        // Validate all the input coming in
        income = Number(income);
        dependents = Number(dependents);
        expenses = Number(expenses);
        creditLimits = Number(creditLimits);
        annualAssessmentRate = Number(annualAssessmentRate);

        // Handle the scenario if there are any invalid inputs
        if (!Number.isFinite(income) || !Number.isFinite(dependents) || 
            !Number.isFinite(expenses) || !Number.isFinite(creditLimits) ||
            !Number.isFinite(annualAssessmentRate)) {
            return { maxLoanAmount: 0, monthlyRepayment: 0 };
        }

        // If there are negative values then return an error
        if (income < 0 || dependents < 0 || expenses < 0 || creditLimits < 0){
            console.log("\n===================================");
            console.error("Please make sure your inputs are positive.")
            console.log("===================================");

            return { maxLoanAmount: 0, monthlyRepayment: 0 };

        }

        // Treat negative values as 0 for non-rate inputs to prevent it from crashing
        income = Math.max(0, income);
        dependents = Math.max(0, dependents);
        expenses = Math.max(0, expenses);
        creditLimits = Math.max(0, creditLimits);

        // 1. Calculate Net Monthly Income after tax deductions
        const annualTax = await this.getTax(income);
        const netMonthlyIncome = (income - annualTax) / 12;

        // 2. Determine living expenses (User declared expenses vs HEM baseline, whichever is higher)
        const baselineHEM = await this.getHEM(income, dependents);

        const totalLivingExpenses = Math.max(expenses, baselineHEM);

        // 3. Calculate credit card liability (~3% of total limits)
        const creditCardLiability = creditLimits * 0.03;

        // 4. Calculate monthly repayment capacity
        const maxMonthlyRepayment = netMonthlyIncome - totalLivingExpenses - creditCardLiability;

        // Return early if user cannot afford a loan at all
        if (maxMonthlyRepayment <= 0) {
            return { maxLoanAmount: 0, monthlyRepayment: 0 };
        }

        // 5. Calculate the monthly interest rate
        const monthlyRate = (annualAssessmentRate / 100) / 12;

        // 6. Calculate maximum borrowing power using the following formula:
        // P = M * (1 - (1 + R)^-N) / R
        const maxLoanAmount = maxMonthlyRepayment * ((1 - Math.pow(1 + monthlyRate, - this.LOAN_TERM_MONTHS)) / monthlyRate);

        return {
            maxLoanAmount: Number(maxLoanAmount.toFixed(2)),
            monthlyRepayment: Number(maxMonthlyRepayment.toFixed(2))
        };
    }

}

function runConsoleMode() {

    // Instantiate a calculator class to get the previously global values
    const calculator = new Calculator();

    const readline = require('readline');
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

    console.log("Mortgage Borrowing Power Calculator");
    console.log("===================================");

    rl.question("Gross Annual Income: $", (income) => {
        rl.question("Number of Dependents: ", (dependents) => {
            rl.question("Declared Monthly Expenses: $", (expenses) => {
                rl.question("Total Credit Card Limits: $", async (creditLimits) => {
                    
                    // Banks assess loans using base rate + buffer for safety
                    const assessmentRate = calculator.INTEREST_RATE + calculator.ASSESSMENT_RATE_BUFFER;

                    const result = await calculator.calculateBorrowingPower(
                        parseFloat(income),
                        parseInt(dependents),
                        parseFloat(expenses),
                        parseFloat(creditLimits),
                        assessmentRate
                    );

                    console.log("\n--- Calculation Summary ---");
                    console.log(`Maximum Borrowing Power at ${calculator.INTEREST_RATE}%: $${result.maxLoanAmount.toLocaleString()}`);
                    console.log(`Assumed Monthly Mortgage Repayment: $${result.monthlyRepayment.toLocaleString()} over 30 years`);
                    
                    rl.close();
                });
            });
        });
    });
}

if (require.main === module) {
    runConsoleMode();
}

module.exports = { Calculator }