const { expect } = require('chai');
const { ethers } = require('hardhat');


describe("P2PHealthInsurance", function () {
  let p2pHealthInsurance;
  let owner;
  let policyHolder1;
  let policyHolder2;

  beforeEach(async function () {
    const P2PHealthInsurance = await ethers.getContractFactory("P2PHealthInsurance");
    [owner, policyHolder1, policyHolder2] = await ethers.getSigners();
    p2pHealthInsurance = await P2PHealthInsurance.connect(owner).deploy();
    await p2pHealthInsurance.deployed();
  });

  it("should create a policy", async function () {
    const coverageAmount = ethers.utils.parseEther("1");
    const premiumAmount = ethers.utils.parseEther("0.1");
    const coverageDuration = 365;
    await p2pHealthInsurance.connect(policyHolder1).createPolicy(coverageAmount, premiumAmount, coverageDuration, { value: premiumAmount });
    const policy = await p2pHealthInsurance.policies(policyHolder1.address);
    expect(policy.coverageAmount).to.equal(coverageAmount);
    expect(policy.premiumAmount).to.equal(premiumAmount);
    expect(policy.coverageDuration).to.equal(600 * coverageDuration);
    expect(policy.lastPaymentDate).to.be.closeTo(Date.now() / 1000, 10);
    expect(policy.isActive).to.be.true;
  });

  it("should create a claim and approve it", async function () {
    const coverageAmount = ethers.utils.parseEther("1");
    const premiumAmount = ethers.utils.parseEther("0.1");
    const coverageDuration = 365;
    await p2pHealthInsurance.connect(policyHolder1).createPolicy(coverageAmount, premiumAmount, coverageDuration, { value: premiumAmount });
    await p2pHealthInsurance.connect(policyHolder1).createClaim(ethers.utils.parseEther("0.5"));
    await p2pHealthInsurance.connect(policyHolder2).approveClaim(policyHolder1.address, 0);
    const claim = await p2pHealthInsurance.claims(policyHolder1.address, 0);
    expect(claim.amount).to.equal(ethers.utils.parseEther("0.5"));
    expect(claim.approvalsReceived).to.equal(1);
    expect(claim.isApproved).to.be.false;
  });

  it("should release the claim amount", async function () {
    const coverageAmount = ethers.utils.parseEther("1");
    const premiumAmount = ethers.utils.parseEther("0.1");
    const coverageDuration = 365;
    await p2pHealthInsurance.connect(policyHolder1).createPolicy(coverageAmount, premiumAmount, coverageDuration, { value: premiumAmount });
    await p2pHealthInsurance.connect(policyHolder1).createClaim(ethers.utils.parseEther("0.5"));
    await p2pHealthInsurance.connect(policyHolder2).approveClaim(policyHolder1.address, 0);
    const claim = await p2pHealthInsurance.claims(policyHolder1.address, 0);
    expect(claim.isApproved).to.be.false;
    await p2pHealthInsurance.connect(policyHolder1).releaseClaimAmount(0);
    expect(claim.isApproved).to.be.true;
    expect(await ethers.provider.getBalance(p2pHealthInsurance.address)).to.equal(ethers.utils.parseEther("0.5"));
    expect(await ethers.provider.getBalance(policyHolder1.address)).to.be.closeTo(ethers.utils.parseEther("0.5"), ethers.utils.parseEther("0.001"));
  });
});