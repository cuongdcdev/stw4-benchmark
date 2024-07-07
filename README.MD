

## Benchmark 

### Simple mint 

Simple point minting:
```
node benchmark_simple_mint.js /path/to/account_list.csv
```

Simple point minting with multiple contracts: 
```
node benchmark_simple_mint_multiple_contracts.js /path/to/account_list.csv
```


### Complex mint with cross-contract calls 

- Performing complex cross-contract calls to change the state of other contracts.
- Bulk minting and transferring NFTs.
- Token transfers

```
node benchmark_complex_mint.js /path/to/account_list.csv
```

## Source code 
All source code and wasm contracts stored in `contracts` folder:
- `main-contract` folder: Main contract for cross-contract call between ft.wasm (token minting) and nft.wasm (nft minting), also this contract logged token point for each users
- `point-minting` folder: simple contract contains 2 method of mint / viewPoint

- `ft.wasm` and `nft.wasm` are just basic FT and NFT contract.