# Remix IDE Deployment Guide for Aura Creatures NFT

## 📋 Prerequisites

1. **Remix IDE**: https://remix.ethereum.org
2. **Base Sepolia Network**: Add to MetaMask
   - Network Name: Base Sepolia
   - RPC URL: https://sepolia.base.org
   - Chain ID: 84532
   - Currency Symbol: ETH
   - Block Explorer: https://sepolia.basescan.org

3. **Test ETH**: Get from [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-goerli-faucet)

4. **Private Key**: Your deployer wallet private key

---

## 🚀 Deployment Steps

### Step 1: Prepare Files in Remix

Create the following files in Remix:

#### A. `AuraCreaturesNFT.sol` (Main Contract)
Copy the entire content from `packages/contracts/src/XAnimalNFT.sol`

#### B. Import OpenZeppelin Contracts

In Remix, you need to import OpenZeppelin contracts. Use the GitHub import feature:

1. Go to **File Explorer** in Remix
2. Click **Contract**
3. Select **"https://github.com/OpenZeppelin/openzeppelin-contracts"**
4. Version: **v5.0.2**
5. Path: `contracts`

This will automatically import all OpenZeppelin contracts including:
- `ERC721.sol`
- `ERC721URIStorage.sol`
- `Ownable.sol`
- `EIP712.sol`
- `ECDSA.sol`
- `ReentrancyGuard.sol`

---

### Step 2: Compile Contract

1. Select **Solidity Compiler** in Remix
2. Set **Compiler Version**: `0.8.20`
3. Click **"Compile AuraCreaturesNFT.sol"**
4. Check for errors and fix imports if needed

---

### Step 3: Deploy Contract

1. Go to **Deploy & Run Transactions**
2. Select **Environment**: `Injected Provider - MetaMask`
   - Make sure MetaMask is connected to Base Sepolia network

3. **Contract**: Select `AuraCreaturesNFT`

4. **Constructor Arguments**:
   ```
   initialOwner: YOUR_WALLET_ADDRESS (0x...)
   name: "Aura Creatures"
   symbol: "AURAC"
   ```

5. Click **"Deploy"**

6. Confirm transaction in MetaMask

---

### Step 4: Verify Deployment

1. Copy the deployed contract address
2. Open [BaseScan Sepolia](https://sepolia.basescan.org)
3. Search for your contract address
4. Verify contract (optional) for transparency

---

### Step 5: Update Environment Variables

After deployment, update your `.env.local` file in `apps/web/`:

```env
NEXT_PUBLIC_CHAIN_ID=84532
RPC_URL=https://sepolia.base.org
CONTRACT_ADDRESS=YOUR_DEPLOYED_CONTRACT_ADDRESS
SERVER_SIGNER_PRIVATE_KEY=YOUR_SERVER_SIGNER_KEY
```

---

## 📝 Contract Address Format

Your deployed contract will look like:
```
Contract deployed at: 0xXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
Owner: 0xYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY
```

Copy the first address (contract) to your `.env.local` file.

---

## ⚠️ Important Notes

1. **Owner Address**: The owner must be your server signer wallet for mint permits
2. **Security**: Never commit private keys to version control
3. **Gas Fees**: Base Sepolia requires test ETH for deployment (~0.001-0.01 ETH)
4. **Network**: Always deploy to testnet first before mainnet

---

## 🔗 Useful Links

- [Remix IDE](https://remix.ethereum.org)
- [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-goerli-faucet)
- [BaseScan Sepolia](https://sepolia.basescan.org)
- [OpenZeppelin Contracts GitHub](https://github.com/OpenZeppelin/openzeppelin-contracts)

---

## ✅ Verification Checklist

- [ ] Base Sepolia network added to MetaMask
- [ ] Have test ETH in deployer wallet
- [ ] OpenZeppelin contracts imported in Remix
- [ ] Contract compiled successfully
- [ ] Contract deployed to Base Sepolia
- [ ] Contract address saved to `.env.local`
- [ ] Contract verified on BaseScan (optional)

---

**Happy Deploying! 🎉**

