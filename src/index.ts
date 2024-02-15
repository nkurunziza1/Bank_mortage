import { Canister, update, text, Record, Result, nat64, Ok, Err, Variant } from "azle";

const Loan = Record({
  amount: nat64,
  interestRate: nat64,
  durationMonths: nat64,
  monthlyPayment: nat64,
  totalPayment: nat64,
});
type Loan = typeof Loan;

const Errors = Variant({
  InvalidInput: text
});

export default Canister({
  calculateMonthlyPayment: update(
    [nat64, nat64, nat64],
    Result(nat64, Errors),
    (amount, interestRate, durationMonths) => {
      if(!amount || !interestRate || !durationMonths){
        return Err({InvalidInput: "Invalid input."});
      }

      const oneHundredPercent = 10000n;
      const totalPayment =
        amount + (amount * interestRate * durationMonths) / oneHundredPercent;
      const monthlyPayment = totalPayment / durationMonths;

      return Ok(monthlyPayment);
    },
  ),

  calculateDurationMonths: update(
    [nat64, nat64, nat64],
    Result(nat64, Errors),
    (amount, interestRate, totalPayment) => {
      if(!amount || !interestRate || !totalPayment){
        return Err({InvalidInput: "Invalid input."});
      }

      const durationMonths = (totalPayment * 10000n) / (amount * interestRate);

      return Ok(durationMonths);
    },
  ),
  validateLoanAmount: update([nat64], Result(text, Errors), (amount) => {
    if (!amount || amount <= 0) {
      return Err({InvalidInput: "Loan amount must be greater than zero."});
    }
    return Ok("Loan amount is valid.");
  }),

  validateInterestRate: update([nat64], Result(text, Errors), (interestRate) => {
    if (!interestRate || interestRate < 0 || interestRate > 10000n) {
      return Err({InvalidInput: "Interest rate must be between 0 and 10000 basis points."});
    }
    return Ok("Interest rate is valid.");
  }),

  calculateLoan: update(
    [nat64, nat64, nat64],
    Result(Loan, Errors),
    (amount, interestRate, durationMonths) => {
      if(!amount || !interestRate || !durationMonths){
        return Err({InvalidInput: "Invalid input."});
      }

      const totalPayment =
        amount + (amount * interestRate * durationMonths) / 10000n;
      const monthlyPayment = totalPayment / durationMonths;

      const loan: typeof Loan = {
        amount: amount,
        interestRate: interestRate,
        durationMonths: durationMonths,
        monthlyPayment: monthlyPayment,
        totalPayment: totalPayment,
      };

      return Ok(loan);
    },
  ),
});
