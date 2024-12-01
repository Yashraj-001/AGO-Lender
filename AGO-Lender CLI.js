import 'ses';  
lockdown();   


import { makeIssuerKit, AmountMath } from '@agoric/ertp';
import { makeTracer } from '@agoric/internal';


const trace = makeTracer('LendingContract');


const governance = {
  interestRate: 5, 
  collateralizationRatio: 150, 
};


const { mint: lendingMint, issuer: lendingIssuer, brand: lendingBrand } = makeIssuerKit('LendingAsset');
const { mint: borrowingMint, issuer: borrowingIssuer, brand: borrowingBrand } = makeIssuerKit('BorrowingAsset');

const lenders = new Map();
const borrowers = new Map(); 
let lendingPool = 0; 

const updateGovernance = (parameter, value) => {
  if (parameter === 'interestRate') {
    governance.interestRate = value;
  } else if (parameter === 'collateralizationRatio') {
    governance.collateralizationRatio = value;
  } else {
    throw new Error('Invalid governance parameter');
  }
  trace(`Governance updated: ${parameter} = ${value}`);
};


const lendAssets = async (lenderName, amount) => {
  if (amount <= 0) throw new Error('Amount must be greater than 0');
  lenders.set(lenderName, AmountMath.add(lenders.get(lenderName) || AmountMath.makeEmpty(lendingBrand), AmountMath.make(lendingBrand, amount)));
  lendingPool += amount;
  trace(`Lender ${lenderName} added ${amount} to the pool. Total pool: ${lendingPool}`);
};


const borrowAssets = async (borrowerName, collateral, loanAmount) => {
  const requiredCollateral = (loanAmount * governance.collateralizationRatio) / 100;
  if (collateral < requiredCollateral) {
    throw new Error('Insufficient collateral');
  }

  borrowers.set(borrowerName, { collateral, loanAmount, dueDate: Date.now() + 30 * 24 * 60 * 60 * 1000 }); // 30 days from now
  lendingPool -= loanAmount;
  trace(`Borrower ${borrowerName} borrowed ${loanAmount} with ${collateral} collateral.`);
};

const checkRepayments = async () => {
  const now = Date.now();
  borrowers.forEach((loan, borrower) => {
    if (loan.dueDate <= now) {
      trace(`Loan overdue for ${borrower}. Liquidating collateral.`);
      borrowers.delete(borrower); 
      lendingPool += loan.collateral; 
    }
  });
};


import readline from 'readline'; 

const prompt = question => new Promise(resolve => rl.question(question, resolve));


const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const menu = async () => {
  let running = true;
  while (running) {
    console.log('\nChoose an action:');
    console.log('1. Lend Assets');
    console.log('2. Borrow Assets');
    console.log('3. Update Governance Parameters');
    console.log('4. Check Overdue Loans');
    console.log('5. Exit');

    const choice = await prompt('Enter your choice: ');

    switch (choice) {
      case '1': {
        const lenderName = await prompt('Enter your name (Lender): ');
        const amount = parseFloat(await prompt('Enter the amount to lend: '));
        await lendAssets(lenderName, amount);
        break;
      }
      case '2': {
        const borrowerName = await prompt('Enter your name (Borrower): ');
        const collateral = parseFloat(await prompt('Enter collateral amount: '));
        const loanAmount = parseFloat(await prompt('Enter loan amount: '));
        await borrowAssets(borrowerName, collateral, loanAmount);
        break;
      }
      case '3': {
        const param = await prompt('Enter the governance parameter to update (interestRate or collateralizationRatio): ');
        const value = parseFloat(await prompt(`Enter the new value for ${param}: `));
        updateGovernance(param, value);
        break;
      }
      case '4': {
        await checkRepayments();
        break;
      }
      case '5': {
        console.log('\nExiting the platform. Goodbye!');
        running = false;
        break;
      }
      default:
        console.log('\nInvalid choice. Please try again.');
    }
  }

  rl.close();
};

// Start the program
console.log('\nWelcome to the Agoric Lending Platform!');
menu().catch(console.error);
