// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract LendingContract {
    uint256 public interestRate = 5;  // Initial interest rate (in percentage)
    uint256 public collateralizationRatio = 150;  // Collateralization ratio (150%)

    struct Loan {
        uint256 collateral;
        uint256 loanAmount;
        uint256 dueDate;
    }
    
    struct Lender {
        uint256 balance;
    }
    
    mapping(address => Lender) public lenders;
    mapping(address => Loan) public borrowers;

    event LenderAdded(address indexed lender, uint256 amount);
    event LoanTaken(address indexed borrower, uint256 loanAmount, uint256 collateral);
    event LoanOverdue(address indexed borrower);
    event GovernanceUpdated(string parameter, uint256 value);

    modifier onlyBorrower() {
        require(borrowers[msg.sender].loanAmount > 0, "Not a borrower");
        _;
    }

    // Lender can lend funds to the contract
    function lend(uint256 amount) external {
        require(amount > 0, "Amount must be greater than 0");

        lenders[msg.sender].balance += amount;

        emit LenderAdded(msg.sender, amount);
    }

    // Borrower can take a loan by providing collateral
    function borrow(uint256 collateral, uint256 loanAmount) external {
        uint256 requiredCollateral = (loanAmount * collateralizationRatio) / 100;

        require(collateral >= requiredCollateral, "Insufficient collateral");

        borrowers[msg.sender] = Loan({
            collateral: collateral,
            loanAmount: loanAmount,
            dueDate: block.timestamp + 30 days
        });

        emit LoanTaken(msg.sender, loanAmount, collateral);
    }

    // Check and mark loans as overdue
    function checkRepayments() external {
        for (uint256 i = 0; i < 2**160; i++) {
            address borrowerAddress = address(uint160(i));
            Loan memory loan = borrowers[borrowerAddress];

            if (loan.loanAmount > 0 && block.timestamp > loan.dueDate) {
                emit LoanOverdue(borrowerAddress);
                delete borrowers[borrowerAddress];  // Delete overdue loan
            }
        }
    }

    // Update governance parameters such as interest rate and collateral ratio
    function updateGovernance(string memory parameter, uint256 value) external {
        if (keccak256(abi.encodePacked(parameter)) == keccak256(abi.encodePacked("interestRate"))) {
            interestRate = value;
        } else if (keccak256(abi.encodePacked(parameter)) == keccak256(abi.encodePacked("collateralizationRatio"))) {
            collateralizationRatio = value;
        } else {
            revert("Invalid governance parameter");
        }

        emit GovernanceUpdated(parameter, value);
    }

    // Get the balance of a lender
    function getLenderBalance(address lender) external view returns (uint256) {
        return lenders[lender].balance;
    }

    // Get details of a borrower's loan
    function getBorrowerLoan(address borrower) external view returns (uint256 loanAmount, uint256 collateral, uint256 dueDate) {
        Loan memory loan = borrowers[borrower];
        return (loan.loanAmount, loan.collateral, loan.dueDate);
    }
}
