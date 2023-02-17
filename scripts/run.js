const main = async () => {
  const axios = require('axios');
  const domainContractFactory = await hre.ethers.getContractFactory('Domains');
  const domainContract = await domainContractFactory.deploy("funk");
  await domainContract.deployed();

  // await domainContract.updateContractData("banana");
  
  let namesarr = await domainContract.getAllNames();
  console.log("namesarr.length", namesarr.length, " aa",  domainsarr.length)
  namesarr.forEach(async function (element, index) {
    const mintRecord = await domainContract.records(element);
    console.log(index, ")", element, " mint ", mintRecord );
  });

  let randomWordBase64 = await domainContract.generateJsonData("banana");
  randomWordBase64 = Buffer.from(randomWordBase64, 'base64');
  let jsonToSend = JSON.parse(randomWordBase64);

  var config = {
    method: 'post',
    url: 'https://api.pinata.cloud/pinning/pinJSONToIPFS',
    headers: { 
        'Content-Type': 'application/json', 
        'pinata_api_key': `${process.env.REACT_APP_PINATA_API_KEY}`,
        'pinata_secret_api_key': `${process.env.REACT_APP_PINATA_API_SECRET}`,
    },
    data : 
    {
        "name": jsonToSend.name,
        "description": jsonToSend.description,
        "data": jsonToSend.image,
        "length": jsonToSend.length
    }
  };

  const res = await axios(config);
  
  const tokenURI = `ipfs://${res.data.IpfsHash}`;
  console.log(tokenURI);

  // CHANGE THIS DOMAIN TO SOMETHING ELSE! I don't want to see OpenSea full of bananas lol
  let txn = await domainContract.register(tokenURI, "banana", {value: hre.ethers.utils.parseEther('0.1')});
  await txn.wait();
  console.log("Minted domain banana.funk");
  
  txn = await domainContract.setRecord("banana", "Am I a banana or a funk??");
  await txn.wait();
  console.log("Set record for banana.funk");
  
  namesarr = await domainContract.getAllNames();
  console.log("namesarr.length", namesarr.length, " aa",  domainsarr.length)
  namesarr.forEach(async function (element, index) {
    const mintRecord = await domainContract.records(element);
    console.log("what1", index, ")", element, " mint ", mintRecord );
  });

  const address = await domainContract.getAddress("banana");
  const myBalanceB = await hre.ethers.provider.getBalance("0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266");
  console.log("Owner of domain banana:", address, " and his balance before", myBalanceB);

  let balance = await hre.ethers.provider.getBalance(domainContract.address);
  console.log("Contract balance:", hre.ethers.utils.formatEther(balance));
  const withdrawTx = await domainContract.withdraw();

  const myBalanceA = await hre.ethers.provider.getBalance("0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266");
  console.log("Owner of domain banana:", address, " and his balance before", myBalanceA);

  const gainz = (myBalanceA - myBalanceB) / 10 ** 18
  console.log(gainz);
  console.log("Fees were ", 0.1 - gainz);

  balance = await hre.ethers.provider.getBalance(domainContract.address);
  console.log("Contract balance:", hre.ethers.utils.formatEther(balance));
}

const runMain = async () => {
  try {
    await main();
    process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

runMain();