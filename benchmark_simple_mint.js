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

const startMintSimple = async (userAddress, userPrivateKey) => {
    const gas = "300000000000000";
    const keyPair = KeyPair.fromString(userPrivateKey);
    const keyStore = new keyStores.InMemoryKeyStore();
    const nearConfig = { ...globalConfig, ...{ keyStore: keyStore } };

    await keyStore.setKey(nearConfig.networkId, userAddress, keyPair);
    const nearConnection = await connect(nearConfig);
    const account = await nearConnection.account(userAddress);
    const contractPoint = new Contract(account, nearConfig.contractPoint, {
        viewMethods: ['getPoint'],
        changeMethods: ['mint'],
    });

    while (true) {
        const waitTime = Math.floor(Math.random() * (1000 - 200 + 1) + 200);
        await new Promise(resolve => setTimeout(resolve, waitTime));

        console.log(chalk.black.bgYellow("✨ Start simple minting after ✨"));

        try {
            const rs = await contractPoint.mint({}, gas);
            console.log(rs);
        } catch (e) {
            console.log("❌ mint error, retry after sometime~~:", e);
            const waitTime = Math.floor(Math.random() * (3000 - 1000 + 1) + 1000);
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }
    }
};

const run = async () => {
    const data = await fs.promises.readFile(csvFilePath, 'utf8');
    const rows = data.trim().split('\n');

    for (let i = 1; i < rows.length; i++) {
        const [key, value] = rows[i].split(',');
        try {
            await startMintSimple(key, value);
        } catch (e) {
            console.error("Error in the try catch:", e);
        }
    }
};

run()
    .then(() => {})
    .catch((error) => {
        console.error('An error occurred:', error);
    });
