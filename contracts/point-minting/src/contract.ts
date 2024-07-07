// Find all our documentation at https://docs.near.org
import { NearBindgen, near, call, view, UnorderedMap, AccountId, NearPromise, PromiseIndex, ONE_YOCTO } from 'near-sdk-js';

const POINT_PER_MINT = BigInt(1);

@NearBindgen({})

class STW4Point {
  userPoints = new UnorderedMap<bigint>('upoint');

  /**
   * mint
   */
  @call({})
  mint() {
    let minter = near.signerAccountId();
    let currentPoints = this.userPoints.get(minter) ? this.userPoints.get(minter) : BigInt(0);
    let aftermintPoints = currentPoints + POINT_PER_MINT;
    this.userPoints.set(minter, aftermintPoints);
    near.log(` ${minter} minted, ${minter} total points: ${aftermintPoints}`);
  }

  @call({})
  donothing() {
    let minter = near.signerAccountId();
    near.log(` ${minter} triggered do nothing!`);
  }

  /**
   * get user points by accountId
   * @param param0 accountId
   */

  @view({})
  getPoint({ accountId }: { accountId: AccountId }): bigint {
    return this.userPoints.get(accountId);
  }


}

