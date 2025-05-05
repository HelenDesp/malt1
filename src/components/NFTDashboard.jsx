import React, { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';

const ALCHEMY_API_KEY = '-h4g9_mFsBgnf1Wqb3aC7Qj06rOkzW-m';
const CONTRACT_ADDRESS = '0x28D744dAb5804eF913dF1BF361E06Ef87eE7FA47';

function normalizeImageUrl(url) {
  if (!url) return '';
  if (url.startsWith('ipfs://')) {
    return url.replace('ipfs://', 'https://ipfs.io/ipfs/');
  }
  return url;
}

export default function NFTDashboard() {
  const { address, isConnected } = useAccount();
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchNFTs = async () => {
      if (!isConnected || !address) return;

      setLoading(true);
      try {
        const url = \`https://base-mainnet.g.alchemy.com/v2/\${ALCHEMY_API_KEY}/getNFTsForOwner?owner=\${address}&contractAddresses[]=\${CONTRACT_ADDRESS}&withMetadata=true\`;
        const response = await fetch(url);
        const data = await response.json();

        const owned = data?.ownedNfts || [];
        const validNfts = owned
          .map(nft => {
            const img = normalizeImageUrl(nft?.media?.[0]?.gateway || nft?.metadata?.image);
            return img ? { ...nft, image: img } : null;
          })
          .filter(Boolean);

        setNfts(validNfts);
      } catch (err) {
        console.error('Failed to fetch NFTs', err);
        setNfts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNFTs();
  }, [isConnected, address]);

  return (
    <div className="p-6">
      {!isConnected && <p>Please connect your wallet.</p>}
      {loading && <p className="text-gray-500">Loading NFTs...</p>}
      {!loading && nfts.length === 0 && isConnected && (
        <p>No NFTs found in this wallet.</p>
      )}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
        {nfts.map((nft, index) => (
          <div key={index} className="border p-2 rounded">
            <img src={nft.image} alt={nft.title || 'NFT'} className="w-full rounded" />
            <p className="text-sm mt-2">#{nft.tokenId} — {nft.title || 'ReVerse Genesis'}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
