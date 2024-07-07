import { KeyPair, keyStores, connect, Contract, utils } from 'near-api-js';
import { globalConfig } from './config.js';
import { v4 as uuidv4 } from 'uuid';
import chalk from 'chalk';
import fs from "fs";

if (process.argv.length < 3) {
    console.error('Usage: node benchmark_simple_mint.js <path/to/account_list.csv>');
    process.exit(1);
}

const csvFilePath = process.argv[2];

const actionList = ["token", "nft"];

const startMintComplex = async (userAddress, userPrivateKey, action) => {
    // console.log("MINT ALL global config ", globalConfig);
    console.log(chalk.blue("MINT ALL global config "), globalConfig);

    console.log(chalk.white.bold.bgRed("Action: [" + action + "] for user: " + userAddress));

    const gas = "300000000000000";
    const attachedDeposit = utils.format.parseNearAmount("0.1");

    const keyPair = KeyPair.fromString(userPrivateKey);
    const keyStore = new keyStores.InMemoryKeyStore();
    const nearConfig = {
        ...globalConfig, ...{
            keyStore: keyStore
        }
    }
    await keyStore.setKey(nearConfig.networkId, userAddress, keyPair);

    const nearConnection = await connect(nearConfig);
    const account = await nearConnection.account(userAddress);

    const contractToken = new Contract(
        account,
        nearConfig.contractToken,
        {
            viewMethods: ['ft_balance_of'],
            changeMethods: ['storage_deposit'],
        }
    );

    const contractNFT = new Contract(
        account,
        nearConfig.contractNFT,
        {
            viewMethods: ['nft_tokens_for_owner'],
            changeMethods: [],
        }
    );

    const contractAccount = new Contract(
        account,
        nearConfig.contractMain,
        {
            viewMethods: ['getUserPoints', 'getAllUserPoints'],
            changeMethods: ['mintAll'],
        }
    );


    while (true) {
        try {
            let waitTime = Math.floor(Math.random() * (3000 - 1000 + 1) + 1000);
            await new Promise(resolve => setTimeout(resolve, waitTime));

            var startTime = new Date();
            /**
             * cross contracat call token mint, 6 receiept each time (https://testnet.nearblocks.io/txns/85rdHwCLNn2Th9gjw6ZEqNxfjzMbs5t1Amcg8rTyYDTK?tab=summary)
             */
            var result = "";

            if (action == "token") {
                await contractToken.storage_deposit({ "account_id": userAddress }, gas, attachedDeposit); //it's stress test so just spam the network anyway
                result = await contractAccount.mintAll({ action: "token" }, gas, attachedDeposit);
            }

            /**
             * cross contract call mint NFT, 8 receipts each time (https://testnet.nearblocks.io/txns/7ZRMyBnXHQpdHYxEMGEwQmNtmbs74smkRj4cWRCmmKWB?tab=summary)
             */
            if (action == "nft") {
                result = await contractAccount.mintAll({ action: "nft", tokenId: uuidv4() }, gas, attachedDeposit);
            }
            console.log("Result: ", result);
            console.log(chalk.white.bgGreen(
                "Done in " + (new Date() - startTime) / 1000 + " seconds, with " + (action == "nft" ? 8 : 6) + " receipts (shard's transactions) , NEAR balance: ")
            );
        } catch (e) {
            console.log("❌ Error, retry after few secs~~:", e);
            let waitTime = Math.floor(Math.random() * (5000 - 1000 + 1) + 1000);
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }

    }
};

// startMintComplex(userAddress, userPrivateKey, "token");
const run = async () => {
    const randomAction = actionList[Math.floor(Math.random() * actionList.length)];

    fs.readFile(csvFilePath, 'utf8', async (err, data) => {
        if (err) {
            console.error('Error reading CSV file:', err);
            return;
        }

        const rows = data.trim().split('\n');
        const result = [];

        for (let i = 1; i < rows.length; i++) {
            const [key, value] = rows[i].split(',');
            result.push({ key, value });
            startMintComplex(key, value, randomAction);
        }
        console.log(result);
    });

};

run()
    .then(() => {

    })
    .catch((error) => {
        console.error('An error occurred:', error);
    });
