import React, { useEffect } from 'react';
import { ExchangeService } from './Services';
import { ethers } from "ethers";
declare global {
  interface Window {
    ethereum: any;
    web3: any;
  }
}

const switchEthereumChain = async (provider: ethers.providers.Web3Provider,chainId:number) : Promise<any[]> => {
  return await provider.send("wallet_switchEthereumChain", [{chainId:"0x"+chainId.toString(16)}]);
}
const requestAccounts = async (provider: ethers.providers.Web3Provider) : Promise<any[]> => {
  return await provider.send("eth_requestAccounts", []);
}
const addEthereumChain = async (provider: ethers.providers.Web3Provider) => {
  await provider.send("wallet_addEthereumChain",
    [
      {
        chainId: '0x' + (54321).toString(16),
        chainName: "Private Node 2",
        nativeCurrency: {
          name: "exchange",
          symbol: "ex",
          decimals: 18 //In number form
        },
        rpcUrls:  ["http://localhost:18545"],
        // blockExplorerUrls?: ["BLOCKCHAIN_EXPLORER"]
      }
    ]);
  await provider.send("wallet_addEthereumChain",
    [
      {
        chainId: '0x' + (12345).toString(16),
        chainName: "Private Node 1",
        nativeCurrency: {
          name: "exchange",
          symbol: "EX",
          decimals: 18 //In number form
        },
        rpcUrls: ["http://localhost:8545"],
        // blockExplorerUrls?: ["BLOCKCHAIN_EXPLORER"]
      }
    ]);  
}

function CoinManagement() {
  useEffect(() => {
    if (!window.ethereum || !window.web3) {
      window.alert("please install metamask");
      return;
    }
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    (async () => {
      await addEthereumChain(provider);
      for (const account of await requestAccounts(provider)) {
        console.log(account);
      }
      await switchEthereumChain(provider,12345);
      await switchEthereumChain(provider,54321);
      for (const account of await provider.listAccounts()) {
        console.log(account);
        const signer = provider.getSigner(account);
        console.log(await signer.getChainId());
      }
    })();
  });
  return (
    <div>
    </div>
  );
}

export default CoinManagement;
