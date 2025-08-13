import React from 'react';
import {
  WalletMultiButton,
  WalletDisconnectButton,
} from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';
import { Wallet, Zap, User } from 'lucide-react';

export const WalletConnection: React.FC = () => {
  const { wallet, publicKey, connected } = useWallet();

  return (
    <div className="bg-gray-900 border border-purple-500/20 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Wallet className="h-6 w-6 text-purple-400" />
          <h2 className="text-xl font-bold text-white">钱包连接</h2>
        </div>
        {connected && (
          <div className="flex items-center space-x-2 bg-green-500/20 px-3 py-1 rounded-full">
            <Zap className="h-4 w-4 text-green-400" />
            <span className="text-green-400 text-sm font-medium">已连接</span>
          </div>
        )}
      </div>

      {connected ? (
        <div className="space-y-4">
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-3">
              <User className="h-5 w-5 text-purple-400" />
              <span className="text-gray-300 font-medium">当前钱包</span>
            </div>
            <div className="space-y-2">
              <div className="text-white font-semibold">
                {wallet?.adapter.name || '未知钱包'}
              </div>
              <div className="text-gray-400 text-sm font-mono break-all">
                {publicKey?.toString()}
              </div>
            </div>
          </div>
          <div className="flex space-x-3">
            <WalletDisconnectButton className="!bg-red-600 hover:!bg-red-700 !text-white !border-none !rounded-lg !px-4 !py-2 !font-medium transition-colors" />
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-gray-300 mb-4">
            请连接钱包以开始使用 Solana NFT 管理功能
          </div>
          <WalletMultiButton className="!bg-gradient-to-r !from-purple-600 !to-blue-600 hover:!from-purple-700 hover:!to-blue-700 !text-white !border-none !rounded-lg !px-6 !py-3 !font-medium !transition-all !duration-200" />
        </div>
      )}
    </div>
  );
};