interface Account {
    privateKey: string
}
interface CoinbaseAccount{
    privateKey: string
    address: string
}
interface Accounts {
    coinbase: CoinbaseAccount
    deployer: Account
}
interface CustomChain {
    name: string, chainId: number, networkId: number
}
export interface Node {
    name: string
    accounts: Accounts
    customChain: CustomChain
    endpoint: string
}

export const Node1: Node = {
    name: "node1",
    accounts: {
        coinbase: {
            privateKey: "26e2e186e201a30f6f03fe03f23f4ced8f8054911478343e72bf52a35c2ff121",
            address: "0xf88bee0ac4fc75c7059c83358711e86d5c652317"
        },
        deployer: {
            privateKey: "b4047842543402604305d3b06a2e2cf7345d9e73945f973cbae7dafb1b8f4f94"
        }
    },
    customChain: {
        name: "custom-network1", chainId: 12345, networkId: 12345
    },
    endpoint: "http://localhost:8545"
};
export const Node2: Node = {
    name: "node2",
    accounts: {
        coinbase: {
            privateKey: "20b80cf94c52ab670f4c9e35b20c4358c455f96979d66a0bf5992f9129c2d6ba",
            address: "0x25796afab7e32a26d0d248629abea354b0f243af"
        },
        deployer: {
            privateKey: "b0e09cde6b921754e49547ac40d9c1da4d79a496a2e0c308aaceb5143bf49a9a"
        }
    },
    customChain: {
        name: "custom-network2", chainId: 54321, networkId: 54321
    },
    endpoint: "http://localhost:18545"
};
export const NodeList = [
    Node1,
    Node2
]
export default {
    Node1,
    Node2
}