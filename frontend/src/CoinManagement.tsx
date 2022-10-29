import React, {useEffect, useState} from 'react';
import {ExchangeNetwork, ExchangeService} from './Services';
import {BigNumber, ethers} from "ethers";
import detectEthereumProvider from "@metamask/detect-provider";
import {
    AppBar,
    Box,
    Button,
    Card,
    CardActions, CardContent,
    CircularProgress,
    MenuItem,
    Select,
    SelectChangeEvent, TextField,
    Toolbar, Typography
} from "@mui/material";

declare global {
    interface Window {
        ethereum: any;
        web3: any;
        localStorage: any;
    }
}


const requestAccounts = async (): Promise<any[]> => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    return await provider.send("eth_requestAccounts", []);
}
const addEthereumChain = async (network: ExchangeNetwork[]) => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("wallet_addEthereumChain",
        network);
}
const switchEthereumChain = async (network: ExchangeNetwork): Promise<void> => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    try {
        await provider.send("wallet_switchEthereumChain", [{chainId: network.chainId}]);
    } catch (switchError: any) {
        if (switchError.code === 4902) {
            await addEthereumChain([network]);
        }
    }
}
const gasLimit = 8000000;
function ExchangeNetworkView(props: { network: ExchangeNetwork }) {
    const [address, setAddress] = useState<string | null>(null);
    const [balance, setBalance] = useState<string | null>(null);
    const [amount, setAmount] = useState<string>("100000000");

    const exchange = async () => {
        const service = new ExchangeService();
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const contract = await service.getContract(props.network.chainId, provider.getSigner());
        const value = BigNumber.from(amount);
        await contract.exchange(address!, value, {value: value.add(gasLimit)});
    }
    const withdraw = async () => {
        if (!address) return;
        const service = new ExchangeService();
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await service.withdraw(amount,props.network.chainId,provider.getSigner());
    }
    const refresh = async () => {
        if (!address) return;
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const balance = await provider.getBalance(address);
        setBalance(balance.toString());
    }
    useEffect(() => {
        (async () => {
            await refresh();
        })();
    }, [address]);
    useEffect(() => {
        let ignore = false;
        if (ignore) return;
        (async () => {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const network = await provider.getNetwork();
            if ("0x" + network.chainId.toString(16) !== props.network.chainId) {
                await switchEthereumChain(props.network);
            }
            const accounts = await requestAccounts();
            if (accounts.length > 0) {
                setAddress(accounts[0]);
                await refresh();
            }
        })();
        return () => {
            ignore = true;
        };
    }, [props.network]);
    if (address) {
        return (<div style={{display: "flex", justifyContent: "center", alignItems: "center", height: "100%"}}>
            <Card variant="outlined">
                <CardContent>
                    <Typography sx={{fontSize: 14}} color="text.secondary" gutterBottom>
                        {props.network.chainName}
                    </Typography>
                    <Typography sx={{fontSize: 14}} color="text.secondary" gutterBottom>
                        <a>Address:{address}</a>
                    </Typography>
                    <Typography variant="h5" component="div">
                        <a>Balance:{balance} {props.network.nativeCurrency.symbol} </a>
                    </Typography>
                    <TextField type={"number"}  id="amount" label="Amount" variant="standard" value={amount} onChange={(event) => {
                        setAmount(event.target.value);
                    }}/>

                </CardContent>
                <CardActions>
                    <Button onClick={async () => {
                        await refresh();
                    }}>Refresh</Button>
                    <Button onClick={async () => {
                        const service = new ExchangeService();
                        await service.faucet(address, props.network.chainId);
                    }}>Faucet</Button>
                    <Button onClick={async () => {
                        await exchange();
                    }}>Exchange</Button>
                    <Button onClick={async () => {
                        await withdraw();
                    }}>Withdraw</Button>
                </CardActions>
            </Card>
        </div>);
    } else {
        return (
            <div style={{display: "flex", justifyContent: "center", alignItems: "center", height: "100%"}}>
                <CircularProgress/>
            </div>
        );
    }
}

interface ProviderMessage {
    type: string;
    data: unknown;
}

function CoinManagement() {
    const [networks, setNetworks] = useState<ExchangeNetwork[]>([]);
    const [selectedNetwork, setSelectedNetwork] = useState<ExchangeNetwork | undefined>(undefined);
    const onChangeChain = (event: SelectChangeEvent<string>) => {
        const network = networks.find(network => network.chainId == event.target.value);
        setSelectedNetwork(network);
        if (network) {
            window.localStorage.setItem("chainId", network.chainId);
        } else {
            window.localStorage.removeItem("chainId");
        }
    };
    const service = new ExchangeService();
    const initializeNetwork = async () => {
        const networks = await service.getNetworks();
        setNetworks(networks);
        const chainId = window.localStorage.getItem("chainId");
        if (chainId) {
            const network = networks.find(network => network.chainId == chainId);
            setSelectedNetwork(network);
        }
    }
    useEffect(() => {
        let ignore = false;
        if (ignore) return;
        if (!window.ethereum || !window.web3) {
            window.alert("please install metamask");
            return;
        }
        window.ethereum.on('accountsChanged', (accounts: Array<string>) => {
            console.log(`accountsChanged`);
            window.location.reload();
        });
        window.ethereum.on('chainChanged', async (chainId: string) => {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const network = await provider.getNetwork();
            console.log(`chainChanged: chainId:${chainId}`);
            if (chainId != '0x' + network.chainId.toString(16).toLowerCase()) {
                console.log(`start reload`);
                window.location.reload();
            }
        });
        window.ethereum.on('message', (message: ProviderMessage) => {
            console.log(message);
        });
        (async () => {
            const provider = await detectEthereumProvider();
            if (!provider) {
                window.alert("please install metamask");
                return;
            }
            if (!window.ethereum.isConnected()) {
                await requestAccounts();
            }
            await initializeNetwork();
        })();
        return () => {
            ignore = true;
        };
    }, []);
    return (
        <Box style={{height: "100vh"}}>
            <Box sx={{display: "flex"}} style={{height: 64}}>
                <AppBar position={"fixed"}>
                    <Toolbar>
                        <Select
                            labelId="chain-select-label"
                            id="chain-select"
                            value={selectedNetwork?.chainId ?? "none"}
                            label="Chain"
                            onChange={onChangeChain}
                            style={{color: "white"}}
                        >
                            <MenuItem value={"none"}>not selected</MenuItem>
                            {networks.map((network: ExchangeNetwork) => {
                                return <MenuItem key={network.chainId} value={network.chainId}>
                                    {network.chainName}
                                </MenuItem>
                            })}
                        </Select>
                    </Toolbar>
                </AppBar>
            </Box>
            <Box component="main" style={{height: "100%"}}> {selectedNetwork ?
                <ExchangeNetworkView network={selectedNetwork!}/> :
                <></>}</Box>
        </Box>
    );
}

export default CoinManagement;
