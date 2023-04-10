// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract P2PHealthInsurance {
    
    uint256 public policyHolderCount;
    // Define the data structures for policies and claims
    struct Policy {
        address policyholder;
        uint256 coverageAmount;
        uint256 premiumAmount;
        uint256 coverageDuration;
        uint256 lastPaymentDate;
        bool isActive;
    }
    struct ApprovalVote{
        bool vote;
    }
    struct Claim {
        address claimant;
        uint256 amount;
        uint256 approvalsReceived;
        bool isApproved;      
    }

    // Define the mapping for policies and claims
    mapping(address => Policy) public policies;
    mapping(address => Claim[]) public claims;
    mapping (address => ApprovalVote) private approvalVote;

    // Define the events for policy and claim creation and approval
    event PolicyCreated(address policyholder, uint256 coverageAmount, uint256 premiumAmount, uint256 coverageDuration,uint256 policyHolderCount);
    event ClaimCreated(address claimant, uint256 amount);
    event ClaimApproved(address claimant, uint256 amount, uint256 approvalsReceived);

    // Define the functions for policy and claim creation and approval
    function createPolicy(uint256 coverageAmount, uint256 premiumAmount, uint256 coverageDuration) public payable {
        require(!policies[msg.sender].isActive, "Policy already exists.");
        coverageDuration = 86400 * 365 * coverageDuration;
        // coverageDuration = 600 * coverageDuration;
        policies[msg.sender] = Policy(msg.sender, coverageAmount, premiumAmount, coverageDuration, block.timestamp, true);
        require(msg.value == policies[msg.sender].premiumAmount, "Premium not paid or Incorrect premium amount.");
        policyHolderCount=policyHolderCount+1;
        emit PolicyCreated(msg.sender, coverageAmount, premiumAmount, coverageDuration, policyHolderCount);
    }
    
    function createClaim(uint256 amount) public {
        require(policies[msg.sender].isActive, "Policy does not exist.");
        require(amount <= policies[msg.sender].coverageAmount, "Claim amount exceeds coverage amount.");
        claims[msg.sender].push(Claim(msg.sender, amount,0, false));
        emit ClaimCreated(msg.sender, amount); 
    }
    
    function approveClaim(address claimant, uint256 claimIndex) public {
        require(policies[msg.sender].isActive, "Only policyholders can approve claims.");
        require(claimIndex < claims[claimant].length, "Invalid claim index.");
        require(!claims[claimant][claimIndex].isApproved, "Claim already approved.");
        require(!approvalVote[msg.sender].vote, "You have already voted.");

        approvalVote[msg.sender].vote=true;
        claims[claimant][claimIndex].approvalsReceived = claims[claimant][claimIndex].approvalsReceived + 1;
        emit ClaimApproved(claimant, claims[claimant][claimIndex].amount,claims[claimant][claimIndex].approvalsReceived);
    }

    function releaseClaimAmount(uint256 claimIndex) public{
        require(policies[msg.sender].isActive, "Only claimant can release claim amount.");
        require(claimIndex < claims[msg.sender].length, "Invalid claim index.");
        require(!claims[msg.sender][claimIndex].isApproved, "Claim already approved.");
        require(address(this).balance>=claims[msg.sender][claimIndex].amount, "Insufficient balance in the pool");
        require(block.timestamp < policies[msg.sender].lastPaymentDate + policies[msg.sender].coverageDuration, "Policy expired.");
        if(policyHolderCount % 2 == 0){
            require(claims[msg.sender][claimIndex].approvalsReceived>(policyHolderCount/2),"Not approved by enough policy holders");
            claims[msg.sender][claimIndex].isApproved = true;
            payable(msg.sender).transfer(claims[msg.sender][claimIndex].amount);
        }else if (policyHolderCount % 2 == 1){
            require((claims[msg.sender][claimIndex].approvalsReceived)>=((policyHolderCount+1)/2),"Not approved by enough policy holders");
            claims[msg.sender][claimIndex].isApproved = true;
            payable(msg.sender).transfer(claims[msg.sender][claimIndex].amount);
        }

        
    }
    

    
}
