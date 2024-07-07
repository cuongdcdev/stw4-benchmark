import { KeyPair, keyStores, connect, Contract, utils } from 'near-api-js';
import { globalConfig } from './config.js';
import { v4 as uuidv4 } from 'uuid';
import chalk from 'chalk';
import fs from "fs";

if (process.argv.length < 3) {
    console.error('Usage: node benchmark_simple_random_mint.js <path/to/account_list.csv>');
    process.exit(1);
}

const csvFilePath = process.argv[2];

const startMintSimple = async(userAddress,userPrivateKey)=>{

        const gas = "300000000000000";

        const keyPair = KeyPair.fromString(userPrivateKey);
        const keyStore = new keyStores.InMemoryKeyStore();
        const nearConfig = {
                ...globalConfig, ...{
                        keyStore: keyStore
                }
        }
        await keyStore.setKey(nearConfig.networkId, userAddress, keyPair);
        const listPointContracts = [
                "cdc1.kent-validator.statelessnet",
                "cdc2.kent-validator.statelessnet",
                "cdc3.kent-validator.statelessnet",
                "cdc4.kent-validator.statelessnet",
                "10.kent-validator.statelessnet",
                "11.kent-validator.statelessnet",
                "12.kent-validator.statelessnet",
                "13.kent-validator.statelessnet",
                "14.kent-validator.statelessnet",
                "15.kent-validator.statelessnet",
                "16.kent-validator.statelessnet",
                "17.kent-validator.statelessnet",
                "18.kent-validator.statelessnet",
                "19.kent-validator.statelessnet",
                "20.kent-validator.statelessnet",
                "21.kent-validator.statelessnet",
                "22.kent-validator.statelessnet",
                "23.kent-validator.statelessnet",
                "24.kent-validator.statelessnet",
                "25.kent-validator.statelessnet",
                "26.kent-validator.statelessnet",
                "27.kent-validator.statelessnet",
                "28.kent-validator.statelessnet",
                "29.kent-validator.statelessnet",
                "30.kent-validator.statelessnet",
                "31.kent-validator.statelessnet",
                "32.kent-validator.statelessnet",
                "33.kent-validator.statelessnet",
                "34.kent-validator.statelessnet",
                "35.kent-validator.statelessnet",
                "36.kent-validator.statelessnet",
                "37.kent-validator.statelessnet",
                "38.kent-validator.statelessnet",
                "39.kent-validator.statelessnet",
                "40.kent-validator.statelessnet",
                "41.kent-validator.statelessnet",
                "42.kent-validator.statelessnet",
                "43.kent-validator.statelessnet",
                "45.kent-validator.statelessnet",
                "46.kent-validator.statelessnet",
                "47.kent-validator.statelessnet",
                "48.kent-validator.statelessnet",
                "49.kent-validator.statelessnet",
                "50.kent-validator.statelessnet"
        ];
        nearConfig.contractPoint = listPointContracts[Math.floor(Math.random() * listPointContracts.length)];

        const nearConnection = await connect(nearConfig);
        const account = await nearConnection.account(userAddress);

        const contractPoint = new Contract(
                account,
                nearConfig.contractPoint,
                {
                        viewMethods: ['getPoint'],
                        changeMethods: ['mint'],
                }
        );

        while(true){
                let waitTime = Math.floor(Math.random() * (3000 - 100 + 1) + 100);
                await new Promise(resolve => setTimeout(resolve, waitTime));

                console.log( chalk.black.bgYellow("✨ [🔥"+  nearConfig.contractPoint +"] | Start simple minting" +  "✨"));

                try{
                        const rs = await contractPoint.mint({}, gas);
                        console.log(rs);
                }catch(e){
                        console.log("❌ mint error, retry after sometime~~:" ,e );
                        let waitTime = Math.floor(Math.random() * (20000 - 10000 + 1) + 10000);
                        await new Promise(resolve => setTimeout(resolve, waitTime));
                }
        }
}

const run = async () => {
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
                    try{
                     startMintSimple(key,value);
                    }catch(e){
                        console.error("Error in the try catch: ", e);
                    }
                }
                console.log("✅ INIT DONE");
            });
};

run()
        .then(() => {
        })
        .catch((error) => {
                console.error('An error occurred:', error);
        });
