const {
	RpcProvider,
	Provider,
	Contract,
	uint256,
	number,
	shortString,
} = require("starknet");
const erc721Abi = require("./erc721");
const provider = new Provider({ sequencer: { network: "mainnet-alpha" } });

const nftAddress =
	"0x066f271471e5134466c9cb3f7a9a4caf210b1595d9d7e1cca3b2f5c2f39347fb";
const nftContract = new Contract(erc721Abi, nftAddress, provider);
const nftHolders = [];

async function fetchNftTotalSupply() {
	let totalSupply = await nftContract.totalSupply();
	return uint256.uint256ToBN(totalSupply[0]).toString();
}

async function fetchNftHolder(tokenId) {
	let owner = await nftContract.ownerOf(tokenId);
	return number.toHex(owner[0]);
}

async function countNftPerHolder() {
	const totalSupply = await fetchNftTotalSupply();

	for (let index = 1; index <= totalSupply; index++) {
		const percentage = (index / totalSupply) * 100;
		console.log(`Fetching NFTs... ${percentage.toFixed(2)}%`);
		let holder = await fetchNftHolder([index, 0]);

		if (nftHolders[holder]) {
			nftHolders[holder] += 1;
		} else {
			nftHolders[holder] = 1;
		}
	}

	// Sort the NFT counts in descending order
	const sortedNftHolders = Object.entries(nftHolders).sort(
		([, countA], [, countB]) => countB - countA
	);

	// Display the sorted count of NFTs per holder
	sortedNftHolders.forEach(([holder, count]) => {
		if (count != 1 || count != 2) {
			console.log(`${holder} : ${count} NFTs`);
		}
	});
}

countNftPerHolder();
