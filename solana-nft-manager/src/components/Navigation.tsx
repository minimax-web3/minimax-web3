import React, { useState } from 'react';
import { 
  Wallet, 
  Upload, 
  Grid, 
  History, 
  Menu, 
  X,
  Sparkles
} from 'lucide-react';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'wallet', label: '钱包连接', icon: Wallet },
    { id: 'upload', label: '创建 NFT', icon: Upload },
    { id: 'gallery', label: 'NFT 收藏', icon: Grid },
    { id: 'history', label: '交易历史', icon: History },
  ];

  const handleTabClick = (tabId: string) => {
    onTabChange(tabId);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* 桌面端导航 */}
      <nav className="hidden md:flex bg-gray-900 border-b border-purple-500/20 px-6 py-4">
        <div className="flex items-center justify-between w-full max-w-7xl mx-auto">
          {/* Logo 和标题 */}
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-2 rounded-lg">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Solana NFT Manager</h1>
              <p className="text-sm text-gray-400">全功能 NFT 管理平台</p>
            </div>
          </div>

          {/* 导航菜单 */}
          <div className="flex items-center space-x-1">
            {navItems.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => handleTabClick(id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                  activeTab === id
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="font-medium">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* 移动端导航 */}
      <nav className="md:hidden bg-gray-900 border-b border-purple-500/20">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Logo 和标题 */}
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-2 rounded-lg">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Solana NFT</h1>
            </div>
          </div>

          {/* 移动端菜单按钮 */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* 移动端菜单 */}
        {isMobileMenuOpen && (
          <div className="border-t border-purple-500/20 px-4 py-3 space-y-1">
            {navItems.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => handleTabClick(id)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                  activeTab === id
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{label}</span>
              </button>
            ))}
          </div>
        )}
      </nav>
    </>
  );
};