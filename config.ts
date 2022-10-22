interface Account{
    privateKey:string
}
interface Accounts{
    conbase:Account
    deployer:Account
}
interface CustomChain{
   name:string,chainId:number,networkId:number
}
const accounts:Accounts = {
    conbase: {
        privateKey: "26e2e186e201a30f6f03fe03f23f4ced8f8054911478343e72bf52a35c2ff121"
    },
    deployer: {
        privateKey: "b4047842543402604305d3b06a2e2cf7345d9e73945f973cbae7dafb1b8f4f94"
    }
}
const customChain:CustomChain = {
    name: 'custom-network', chainId: 12345, networkId: 12345
}
export default {accounts,customChain};