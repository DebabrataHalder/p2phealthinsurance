async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  // console.log("Account balance:", (await deployer.getBalance()).toString());

  const P2PHealthInsurance = await ethers.getContractFactory("P2PHealthInsurance");
  const p2pHealthInsurance = await P2PHealthInsurance.deploy();

  console.log("address:", p2pHealthInsurance.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });


  // 0x2920D68Cf008E94015E7Cc12B09F288F81ba8524