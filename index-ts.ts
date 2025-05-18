import {
  createWalletClient,
  custom,
  createPublicClient,
  defineChain,
  parseEther,
  formatEther,
  WalletClient,
  PublicClient,
  Chain,
} from "viem";
import "viem/window";
import { contractAddress, coffeeAbi } from "./constants-ts";

console.log("Hello from TS!");

const connectButton = document.getElementById(
  "connectButton"
) as HTMLButtonElement;
const fundButton = document.getElementById("fundButton") as HTMLButtonElement;
const ethAmountInput = document.getElementById("ethAmount") as HTMLInputElement;
const balanceButton = document.getElementById(
  "balanceButton"
) as HTMLButtonElement;
const withdrawButton = document.getElementById(
  "withdrawButton"
) as HTMLButtonElement;

let walletClient: WalletClient;
let publicClient: PublicClient;

async function connect(): Promise<string | void> {
  if (typeof window.ethereum !== "undefined") {
    walletClient = createWalletClient({
      transport: custom(window.ethereum),
    });
    const [connectedAccount] = await walletClient.requestAddresses();
    connectButton.innerHTML = "Connected!";
    return connectedAccount;
  } else {
    connectButton.innerHTML = "Please install MetaMask!";
  }
}

async function fund(): Promise<void> {
  const ethAmount = ethAmountInput.value;
  console.log(`Funding with ${ethAmount} eth...`);
  const connectedAccount = await connect();
  const currentChain = await getCurrentChain(walletClient);

  if (!window.ethereum || !connectedAccount) return;
  publicClient = createPublicClient({
    transport: custom(window.ethereum),
  });

  const { request } = await publicClient.simulateContract({
    address: contractAddress,
    abi: coffeeAbi,
    functionName: "fund",
    account: connectedAccount as `0x${string}`,
    chain: currentChain,
    value: parseEther(ethAmount),
  });

  const hash = await walletClient.writeContract(request);
  console.log("hash", hash);
}

async function getBalance(): Promise<void> {
  if (typeof window.ethereum === "undefined")
    return alert("Please install MetaMask");

  if (typeof window.ethereum !== "undefined" && !publicClient) {
    publicClient = createPublicClient({
      transport: custom(window.ethereum),
    });
  }

  const balance = await publicClient.getBalance({
    address: contractAddress,
  });
  console.log(formatEther(balance));
}

async function withdraw(): Promise<void> {
  console.log("Withdrawing funds...");

  const connectedAccount = await connect();
  const currentChain = await getCurrentChain(walletClient);

  if (!window.ethereum || !connectedAccount) return;
  publicClient = createPublicClient({
    transport: custom(window.ethereum),
  });

  const { request } = await publicClient.simulateContract({
    address: contractAddress,
    abi: coffeeAbi,
    functionName: "withdraw",
    account: connectedAccount as `0x${string}`,
    chain: currentChain,
  });

  const hash = await walletClient.writeContract(request);
  console.log("hash", hash);
}

async function getCurrentChain(client: WalletClient): Promise<Chain> {
  const chainId = await client.getChainId();
  const currentChain = defineChain({
    id: chainId,
    name: "Custom Chain",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: {
      default: {
        http: ["http://localhost:8545"],
      },
    },
  });
  return currentChain;
}

connectButton.onclick = connect;
fundButton.onclick = fund;
balanceButton.onclick = getBalance;
withdrawButton.onclick = withdraw;
