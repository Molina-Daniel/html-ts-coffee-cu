import {
  createWalletClient,
  custom,
  createPublicClient,
  defineChain,
  parseEther,
  formatEther,
} from "https://esm.sh/viem";
import { contractAddress, coffeeAbi } from "./constants-js.js";

const connectButton = document.getElementById("connectButton");
const fundButton = document.getElementById("fundButton");
const ethAmountInput = document.getElementById("ethAmount");
const balanceButton = document.getElementById("balanceButton");
const withdrawButton = document.getElementById("withdrawButton");

let walletClient;
let publicClient;

async function connect() {
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

async function fund() {
  const ethAmount = ethAmountInput.value;
  console.log(`Funding with ${ethAmount} eth...`);
  const connectedAccount = await connect();
  const currentChain = await getCurrentChain(walletClient);

  publicClient = createPublicClient({
    transport: custom(window.ethereum),
  });

  const { request } = await publicClient.simulateContract({
    address: contractAddress,
    abi: coffeeAbi,
    functionName: "fund",
    account: connectedAccount,
    chain: currentChain,
    value: parseEther(ethAmount),
  });

  const hash = await walletClient.writeContract(request);
  console.log("hash", hash);
}

async function getBalance() {
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

async function withdraw() {
  console.log("Withdrawing funds...");

  const connectedAccount = await connect();
  const currentChain = await getCurrentChain(walletClient);

  publicClient = createPublicClient({
    transport: custom(window.ethereum),
  });

  const { request } = await publicClient.simulateContract({
    address: contractAddress,
    abi: coffeeAbi,
    functionName: "withdraw",
    account: connectedAccount,
    chain: currentChain,
  });

  const hash = await walletClient.writeContract(request);
  console.log("hash", hash);
}

async function getCurrentChain(client) {
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
