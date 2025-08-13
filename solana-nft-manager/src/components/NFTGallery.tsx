import React, { useState, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, AccountLayout } from '@solana/spl-token';
import { Image as ImageIcon, ExternalLink, Loader, Grid as GridIcon } from 'lucide-react';
import { FixedSizeGrid as Grid } from 'react-window';

interface NFTData {
  mint: string;
  name?: string;
  image?: string;
  description?: string;
  collection?: {
    name?: string;
    family?: string;
  };
  attributes?: Array<{
    trait_type: string;
    value: string;
  }>;
  metadata_uri?: string;
}

interface NFTCardProps {
  nft: NFTData;
  onClick: (nft: NFTData) => void;
}

const NFTCard: React.FC<NFTCardProps> = ({ nft, onClick }) => {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  return (
    <div
      className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 hover:border-purple-500 transition-all duration-200 cursor-pointer group"
      onClick={() => onClick(nft)}
    >
      <div className="aspect-square bg-gray-900 relative">
        {imageLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader className="h-8 w-8 text-purple-400 animate-spin" />
          </div>
        )}
        {imageError ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
            <ImageIcon className="h-12 w-12 text-gray-600" />
          </div>
        ) : (
          <img
            src={nft.image || '/placeholder-nft.png'}
            alt={nft.name || 'NFT'}
            className={`w-full h-full object-cover transition-transform duration-200 group-hover:scale-105 ${
              imageLoading ? 'opacity-0' : 'opacity-100'
            }`}
            onLoad={() => setImageLoading(false)}
            onError={() => {
              setImageLoading(false);
              setImageError(true);
            }}
            loading="lazy"
          />
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-white truncate">
          {nft.name || `NFT ${nft.mint.slice(0, 8)}...`}
        </h3>
        {nft.collection?.name && (
          <p className="text-gray-400 text-sm truncate mt-1">
            {nft.collection.name}
          </p>
        )}
        <p className="text-gray-500 text-xs mt-2 font-mono truncate">
          {nft.mint}
        </p>
      </div>
    </div>
  );
};

interface NFTDetailModalProps {
  nft: NFTData;
  onClose: () => void;
}

const NFTDetailModal: React.FC<NFTDetailModalProps> = ({ nft, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">
              {nft.name || 'NFT 详情'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-2xl"
            >
              ×
            </button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* NFT 图片 */}
            <div className="space-y-4">
              <div className="aspect-square bg-gray-800 rounded-xl overflow-hidden">
                <img
                  src={nft.image || '/placeholder-nft.png'}
                  alt={nft.name || 'NFT'}
                  className="w-full h-full object-cover"
                />
              </div>
              {nft.metadata_uri && (
                <a
                  href={nft.metadata_uri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center space-x-2 bg-gray-800 hover:bg-gray-700 text-gray-300 py-2 px-4 rounded-lg transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>查看元数据</span>
                </a>
              )}
            </div>
            
            {/* NFT 信息 */}
            <div className="space-y-6">
              {/* 基本信息 */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">基本信息</h3>
                <div className="space-y-2">
                  <div>
                    <span className="text-gray-400 text-sm">名称:</span>
                    <p className="text-white">{nft.name || '未命名'}</p>
                  </div>
                  {nft.description && (
                    <div>
                      <span className="text-gray-400 text-sm">描述:</span>
                      <p className="text-gray-300">{nft.description}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-400 text-sm">铸币地址:</span>
                    <p className="text-gray-300 font-mono text-sm break-all">
                      {nft.mint}
                    </p>
                  </div>
                  {nft.collection?.name && (
                    <div>
                      <span className="text-gray-400 text-sm">所属系列:</span>
                      <p className="text-gray-300">{nft.collection.name}</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* 属性 */}
              {nft.attributes && nft.attributes.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">属性</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {nft.attributes.map((attr, index) => (
                      <div
                        key={index}
                        className="bg-gray-800 rounded-lg p-3 border border-gray-700"
                      >
                        <div className="text-gray-400 text-xs uppercase font-medium">
                          {attr.trait_type}
                        </div>
                        <div className="text-white font-medium">
                          {attr.value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const NFTGallery: React.FC = () => {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const [nfts, setNfts] = useState<NFTData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [selectedNFT, setSelectedNFT] = useState<NFTData | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // 获取 NFT 元数据
  const fetchMetadata = async (uri: string): Promise<any> => {
    try {
      const response = await fetch(uri);
      return await response.json();
    } catch (error) {
      console.error('获取元数据失败:', error);
      return null;
    }
  };

  // 获取用户的所有 NFT
  const fetchUserNFTs = async () => {
    if (!publicKey) return;
    
    setLoading(true);
    setError('');
    
    try {
      console.log('获取用户 NFT...', publicKey.toString());
      
      // 获取用户的所有代币账户
      const tokenAccounts = await connection.getTokenAccountsByOwner(publicKey, {
        programId: TOKEN_PROGRAM_ID,
      });
      
      console.log(`找到 ${tokenAccounts.value.length} 个代币账户`);
      
      const nftList: NFTData[] = [];
      
      // 逐个检查代币账户，查找 NFT
      for (const account of tokenAccounts.value) {
        try {
          const accountInfo = AccountLayout.decode(account.account.data);
          const amountBuffer = accountInfo.amount;
          
          // 将缓冲区转换为number来检查数量
          const amount = Number(amountBuffer.toString());
          
          // NFT 通常数量为 1 且不可分割
          if (amount === 1) {
            const mintAddress = new PublicKey(accountInfo.mint);
            
            try {
              // 获取铸币账户信息
              const mintInfo = await connection.getParsedAccountInfo(mintAddress);
              
              if (mintInfo.value?.data && 'parsed' in mintInfo.value.data) {
                const mintData = mintInfo.value.data.parsed.info;
                
                // 检查是否为 NFT (供应量为 1 且小数位数为 0)
                if (
                  mintData.supply === '1' && 
                  mintData.decimals === 0
                ) {
                  const nftData: NFTData = {
                    mint: mintAddress.toString(),
                    name: `NFT ${mintAddress.toString().slice(0, 8)}...`,
                  };
                  
                  nftList.push(nftData);
                }
              }
            } catch (mintError) {
              console.error('获取铸币信息失败:', mintError);
            }
          }
        } catch (accountError) {
          console.error('解析账户数据失败:', accountError);
        }
      }
      
      console.log(`找到 ${nftList.length} 个 NFT`);
      setNfts(nftList);
    } catch (error) {
      console.error('获取 NFT 失败:', error);
      setError('获取 NFT 失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (publicKey) {
      fetchUserNFTs();
    } else {
      setNfts([]);
    }
  }, [publicKey]);

  if (!publicKey) {
    return (
      <div className="bg-gray-900 border border-purple-500/20 rounded-xl p-6 text-center">
        <GridIcon className="h-12 w-12 text-gray-500 mx-auto mb-4" />
        <p className="text-gray-400">请先连接钱包以查看您的 NFT 收藏</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 border border-purple-500/20 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <GridIcon className="h-6 w-6 text-purple-400" />
          <h2 className="text-xl font-bold text-white">我的 NFT 收藏</h2>
          {nfts.length > 0 && (
            <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded-full">
              {nfts.length}
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchUserNFTs}
            disabled={loading}
            className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <svg
              className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <span>刷新</span>
          </button>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-900/20 border border-red-500/50 text-red-300 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}
      
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader className="h-8 w-8 text-purple-400 animate-spin mr-3" />
          <span className="text-gray-400">正在加载 NFT...</span>
        </div>
      ) : nfts.length === 0 ? (
        <div className="text-center py-12">
          <ImageIcon className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg mb-2">您还没有任何 NFT</p>
          <p className="text-gray-500">请尝试创建一个属于您的 NFT</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {nfts.map((nft, index) => (
            <NFTCard
              key={nft.mint}
              nft={nft}
              onClick={setSelectedNFT}
            />
          ))}
        </div>
      )}
      
      {/* NFT 详情模态框 */}
      {selectedNFT && (
        <NFTDetailModal
          nft={selectedNFT}
          onClose={() => setSelectedNFT(null)}
        />
      )}
    </div>
  );
};