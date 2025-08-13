import React, { useState } from 'react';
import { WalletContextProvider } from './components/WalletContextProvider';
import { Navigation } from './components/Navigation';
import { WalletConnection } from './components/WalletConnection';
import { NFTUpload } from './components/NFTUpload';
import { NFTGallery } from './components/NFTGallery';
import { TransactionHistory } from './components/TransactionHistory';
import { useWallet } from '@solana/wallet-adapter-react';
import { AlertTriangle } from 'lucide-react';

function AppContent() {
  const [activeTab, setActiveTab] = useState('wallet');
  const { connected } = useWallet();

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'wallet':
        return <WalletConnection />;
      case 'upload':
        return <NFTUpload />;
      case 'gallery':
        return <NFTGallery />;
      case 'history':
        return <TransactionHistory />;
      default:
        return <WalletConnection />;
    }
  };

  const getTabTitle = () => {
    switch (activeTab) {
      case 'wallet':
        return '钱包连接';
      case 'upload':
        return '创建 NFT';
      case 'gallery':
        return 'NFT 收藏';
      case 'history':
        return '交易历史';
      default:
        return '钱包连接';
    }
  };

  return (
    <div className="min-h-screen bg-gray-950">
      {/* 导航栏 */}
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />

      {/* 网络提示 */}
      <div className="bg-amber-900/20 border-b border-amber-500/30 px-6 py-2">
        <div className="max-w-7xl mx-auto flex items-center space-x-2">
          <AlertTriangle className="h-4 w-4 text-amber-400" />
          <span className="text-amber-300 text-sm">
            当前连接到 Solana 测试网络 (Devnet) - 仅供测试使用
          </span>
        </div>
      </div>

      {/* 主内容区域 */}
      <main className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {/* 页面标题 */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">{getTabTitle()}</h1>
            <p className="text-gray-400">
              {activeTab === 'wallet' && '连接您的 Solana 钱包开始使用 NFT 管理功能'}
              {activeTab === 'upload' && '上传图片并创建您的专属 NFT，发布到 Solana 区块链'}
              {activeTab === 'gallery' && '查看您拥有的所有 NFT 收藏和详细信息'}
              {activeTab === 'history' && '查看您的所有 Solana 交易记录和历史'}
            </p>
          </div>

          {/* 功能内容 */}
          <div className="space-y-8">
            {renderActiveTab()}
          </div>

          {/* 功能状态提示 */}
          {activeTab !== 'wallet' && !connected && (
            <div className="mt-8 bg-blue-900/20 border border-blue-500/30 rounded-xl p-6">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-6 w-6 text-blue-400" />
                <div>
                  <h3 className="text-blue-300 font-semibold mb-1">需要连接钱包</h3>
                  <p className="text-blue-200 text-sm">
                    请先在“钱包连接”页面连接您的钱包，然后再使用此功能。
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* 页脚 */}
      <footer className="bg-gray-900 border-t border-purple-500/20 px-6 py-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-1 rounded">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
            <span className="text-gray-400 text-sm">
              由 MiniMax Agent 开发 | 基于 Solana 区块链
            </span>
          </div>
          <p className="text-gray-500 text-xs">
            请注意保护您的私钥安全，不要在不可信的网站上输入助记词或私钥。
          </p>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <WalletContextProvider>
      <AppContent />
    </WalletContextProvider>
  );
}

export default App;