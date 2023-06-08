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
const myAddress = [
	// "0x2Fc78f99D97D0C04141A9B861B1Cd619d982Cf26cDFEf337ef42D7E340D87Ac",
	// "0x0D041e8fb2421E069159d3f6Ec9EaaF422E7EAd8bFfA8F558cC3e209D978396",
	// "0x111572FaD46DFf324E3Fa59890892090189D27bf54d5415b172294CA3045967",
	// "0x4bb18bC386333B67b7286d9De0548FbC2e1AE53911479881F7DddEd7D304d45",
	// "0x5f5F9B1f0281DA8BFdF86E2ff40013b9D1bF25d8005f1D2d8f05DB6Dd169527",
	// "0x616C748620f3c283cDAba459C9928bA1f3D315e751f85583b941D941Ba3450a",
	// "0x1b40B0D56d013AF87B778BB84E94dCFe368f256125b2229298E2094D7a68482",
];
const myAddressAlias = [
	"Temp 1",
	"Temp 2",
	"Temp 3",
	"Temp 4",
	"Holder 1",
	"Holder 2",
	"Holder 3",
];
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

	for (
		let index = myAddress.length === 0 ? 1 : totalSupply - 100;
		index <= totalSupply;
		index++
	) {
		try {
			let holder = await fetchNftHolder([index, 0]);
			console.log(`Fetching NFTs... #${index}: ${holder}`);

			if (nftHolders[holder]) {
				nftHolders[holder] += 1;
			} else {
				nftHolders[holder] = 1;
			}
		} catch (error) {
			console.error(
				`Failed to fetch NFT holder for #${index}. Retrying in 60 seconds...`
			);
			await new Promise((resolve) => setTimeout(resolve, 60000)); // Wait for 60 seconds
			index--; // Retry the same index again
		}
	}

	// Sort the NFT counts in descending order
	const sortedNftHolders = Object.entries(nftHolders).sort(
		([, countA], [, countB]) => countB - countA
	);

	// Display the sorted count of NFTs per holder for the specific addresses (case-insensitive)
	sortedNftHolders.forEach(([holder, count]) => {
		const lowercaseHolder = holder.toLowerCase();
		const aliasIndex = myAddress.findIndex(
			(address) => address.toLowerCase() === lowercaseHolder
		);
		if ((count > 2 && myAddress.length === 0) || aliasIndex !== -1) {
			const alias =
				aliasIndex !== -1 ? myAddressAlias[aliasIndex] : holder;
			console.log(`${alias} : ${count} NFTs`);
		}
	});
}

countNftPerHolder();
  