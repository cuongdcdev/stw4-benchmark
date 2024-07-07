// Find all our documentation at https://docs.near.org
import { NearBindgen, near, call, view, UnorderedMap, AccountId, NearPromise, PromiseIndex, ONE_YOCTO} from 'near-sdk-js';
import { UserPoint } from './models';
import { randomSeed } from 'near-sdk-js/lib/api';

const G50_TGAS = BigInt("50000000000000"); //50 tgas
const G5_TGAS = BigInt("5000000000000"); //5 tgas // 1  lenh 
const G25_TGAS = BigInt("25000000000000"); //25 tgas
const G30_TGAS = BigInt("30000000000000"); //30 tgas
const MAX_TGAS = BigInt("300000000000000"); //300 TGAS - max allowed gas 
const G100_TGAS = BigInt("100000000000000");
const G10_TGAS = BigInt("10000000000000"); //10tgas 

const ONE_STW4_TOKEN = BigInt("100000000");
const SMALL_STW4_TOKEN = BigInt("5000000"); //0.05 token
const NO_DEPOSIT = BigInt(0);
const ONE_YOCTOR = BigInt(1);
const NO_ARGS = JSON.stringify({});

const POINT_FT = BigInt(1);
const POINT_NFT = BigInt(10);
const STW4_FT_ADDRESS = "token-stw4.kent-validator.statelessnet";
const STW4_NFT_ADDRESS = "nft-stw4.kent-validator.statelessnet";
// const STW4_FT_ADDRESS = "token.stw4.cuongdcdev.testnet";
// const STW4_NFT_ADDRESS = "nft.stw4.cuongdcdev.testnet";
@NearBindgen({})
class STW4{
  nftPoints = new UnorderedMap<bigint>('nft_points');
  tokenPoints = new UnorderedMap<bigint>("token_points");



  @call({privateFunction:true})
  // @call({})
  testMint( {action} : {action: string} ){
    action = action ? action : "token";
    let minter = near.signerAccountId(); 

    if (action == "token"){
      let totalPoints = (this.tokenPoints.get(minter) ? this.tokenPoints.get(minter)  : BigInt(0)) + POINT_FT;
      this.tokenPoints.set(minter,totalPoints);
      near.log("minted FT for " + minter + " - Total FT points: " + totalPoints  );
    }

    if (action == "nft"){
      let totalPoints = (this.nftPoints.get(minter) ? this.nftPoints.get(minter) : BigInt(0) )  + POINT_NFT;
      this.nftPoints.set(minter,totalPoints);
      near.log("minted NFT for " + minter + " - Total NFT points: " + totalPoints );
    }
  }

  @call({privateFunction:true})
  mintAllCallback( {action} : {action: string} ):boolean{

    let {success} = this.promiseResult();

    action = action ? action : "token";
    let minter = near.signerAccountId(); 

    if(success){
      if (action == "token"){
        let totalPoints = (this.tokenPoints.get(minter) ?  this.tokenPoints.get(minter)  : BigInt(0))  + POINT_FT;
        this.tokenPoints.set(minter,totalPoints);
        near.log("minted FT for " + minter + " - Total FT points: " + totalPoints  );
      }
  
      if (action == "nft"){
        let totalPoints = (this.nftPoints.get(minter) ? this.nftPoints.get(minter) : BigInt(0) ) + POINT_NFT;
        this.nftPoints.set(minter,totalPoints);
        near.log("minted NFT for " + minter + " - Total NFT points: " + totalPoints );
      }

      return true;
    }else{
      near.log("Promise error, plz check again" );
      return false;
    }

  }

@call({payableFunction: true})
/**
 * mintAll: cross contract call to token contract or NFT contract then after done, add 1 point to user accordingly  
 */
  mintAll( {action , tokenId} : {action:string, tokenId: string} ): NearPromise{
    action = action ? action : "token";

    if (action == "token"){
      const promise = NearPromise.new(STW4_FT_ADDRESS)
      // .functionCall("ft_transfer" , JSON.stringify({"receiver_id": near.signerAccountId() , "amount" : SMALL_STW4_TOKEN.toString() }), ONE_YOCTO, G10_TGAS)
      .functionCall("ft_transfer" , JSON.stringify({"receiver_id": near.signerAccountId() , "amount" : SMALL_STW4_TOKEN.toString() }), ONE_YOCTO, G100_TGAS)
      // .then( NearPromise.new(near.currentAccountId()).functionCall("mintAllCallback" , JSON.stringify({action:"token"}) , NO_DEPOSIT, G10_TGAS) );
      .then( NearPromise.new(near.currentAccountId()).functionCall("mintAllCallback" , JSON.stringify({action:"token"}) , NO_DEPOSIT, G100_TGAS) );
      return promise.asReturn();
    }
  
    const promise = NearPromise.new(STW4_NFT_ADDRESS)
    .functionCall("nft_mint" , JSON.stringify({"token_id": tokenId, "receiver_id": near.signerAccountId(), "token_metadata": { "title": "STW4 NFT", "description": "NFT for StakeWars4", "media": "https://ipfs.near.social/ipfs/bafkreigklaabay6dpg7jdjjoe375ubbpkqkovmpmsopdpblbdexrrzucsa"}}),
     near.attachedDeposit(), G100_TGAS)
    .then( NearPromise.new(near.currentAccountId()).functionCall("mintAllCallback" , JSON.stringify({action:"nft"}) , NO_DEPOSIT, G100_TGAS) );
    return promise.asReturn();
  }

  @view({})
  getUserPoints( {accountId} : {accountId: AccountId} ): UserPoint{
    let uPoint = new UserPoint();
    uPoint.accountId = accountId;
    uPoint.scoreFT = this.tokenPoints.get(accountId);
    uPoint.scoreNFT = this.nftPoints.get(accountId);
    return uPoint;
  }

  @view({})
  getAllUserPoints(){
    return {
      nfts: this.nftPoints.toArray(),
      tokens: this.tokenPoints.toArray()
    }
  }

  
   promiseResult(): {result: string, success: boolean}{
    let result, success;
    
    try{ result = near.promiseResult(0 as PromiseIndex); success = true }
    catch{ result = undefined; success = false }
    
    return {result, success}
  }

  // // make a async call function that call mintAllCallback 20 times 
  // @call({payableFunction: true})
  // /**
  //  * mintAllMultiple: cross contract call to token contract or NFT contract 20 times and add 1 point to user accordingly for each call
  //  */
  //   mintAllMultiple( {action , tokenId} : {action:string, tokenId: string} ): NearPromise{
  //     action = action ? action : "token";

  //     if (action == "token"){
  //       const promises = [];
  //       for(let i = 0; i < 20; i++){
  //         const promise = NearPromise.new(STW4_FT_ADDRESS)
  //         .functionCall("ft_transfer" , JSON.stringify({"receiver_id": near.signerAccountId() , "amount" : SMALL_STW4_TOKEN.toString() }), ONE_YOCTO, G10_TGAS)
  //         .then( NearPromise.new(near.currentAccountId()).functionCall("mintAllCallback" , JSON.stringify({action:"token"}) , NO_DEPOSIT, G10_TGAS) );
  //         promises.push(promise);
  //       }
  //       return NearPromise.all(promises).asReturn();

  //     }
      
    
  //     const promises = [];
  //     for(let i = 0; i < 20; i++){
  //       const promise = NearPromise.new(STW4_NFT_ADDRESS)
  //       .functionCall("nft_mint" , JSON.stringify({"token_id": tokenId, "receiver_id": near.signerAccountId(), "token_metadata": { "title": "STW4 NFT", "description": "NFT for StakeWars4", "media": "https://ipfs.near.social/ipfs/bafkreigklaabay6dpg7jdjjoe375ubbpkqkovmpmsopdpblbdexrrzucsa"}}),
  //        near.attachedDeposit(), G10_TGAS)
  //       .then( NearPromise.new(near.currentAccountId()).functionCall("mintAllCallback" , JSON.stringify({action:"nft"}) , NO_DEPOSIT, G10_TGAS) );
  //       promises.push(promise);
  //     }
  //     return NearPromise.all(promises).asReturn();
  //   }
 
}

