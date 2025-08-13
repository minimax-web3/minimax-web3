import React, { useState, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { History, ExternalLink, Clock, ArrowUpRight, ArrowDownRight, Loader } from 'lucide-react';

interface TransactionSignature {
  signature: string;
  slot: number;
  err: any;
  memo?: string;
  blockTime?: number;
}

interface TransactionDetail {
  signature: string;
  blockTime: number;
  slot: number;
  fee: number;
  status: 'success' | 'failed';
  type: 'unknown' | 'transfer' | 'token' | 'nft' | 'program';
  amount?: number;
  token?: string;
  from?: string;
  to?: string;
  instructions: any[];
}

interface TransactionItemProps {
  transaction: TransactionDetail;
}

const TransactionItem: React.FC<TransactionItemProps> = ({ transaction }) => {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const getTransactionIcon = () => {
    switch (transaction.type) {
      case 'transfer':
        return <ArrowUpRight className="h-5 w-5 text-green-400" />;
      case 'token':
      case 'nft':
        return <ArrowDownRight className="h-5 w-5 text-blue-400" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getTypeLabel = () => {
    switch (transaction.type) {
      case 'transfer':
        return 'SOL 转账';
      case 'token':
        return '代币交易';
      case 'nft':
        return 'NFT 交易';
      case 'program':
        return '程序调用';
      default:
        return '未知交易';
    }
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-purple-500/50 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <div className={`p-2 rounded-full ${
            transaction.status === 'success' 
              ? 'bg-green-900/30' 
              : 'bg-red-900/30'
          }`}>
            {getTransactionIcon()}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h3 className="text-white font-medium">{getTypeLabel()}</h3>
              <span className={`px-2 py-1 text-xs rounded-full ${
                transaction.status === 'success'
                  ? 'bg-green-900/30 text-green-300 border border-green-500/30'
                  : 'bg-red-900/30 text-red-300 border border-red-500/30'
              }`}>
                {transaction.status === 'success' ? '成功' : '失败'}
              </span>
            </div>
            
            <div className="mt-1 text-sm text-gray-400 space-y-1">
              <div className="flex items-center space-x-2">
                <Clock className="h-3 w-3" />
                <span>{formatDate(transaction.blockTime)}</span>
              </div>
              
              {transaction.amount && (
                <div className="text-purple-400">
                  金额: {transaction.amount} {transaction.token || 'SOL'}
                </div>
              )}
              
              <div className="font-mono text-xs text-gray-500">
                手续费: {transaction.fee / 1e9} SOL
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <a
            href={`https://explorer.solana.com/tx/${transaction.signature}?cluster=devnet`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white transition-colors"
            title="在 Solana Explorer 中查看"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>
      
      <div className="mt-3 pt-3 border-t border-gray-700">
        <div className="text-xs text-gray-500 font-mono break-all">
          {transaction.signature}
        </div>
      </div>
    </div>
  );
};

export const TransactionHistory: React.FC = () => {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const [transactions, setTransactions] = useState<TransactionDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [hasMore, setHasMore] = useState(true);
  const [before, setBefore] = useState<string | undefined>();

  // 解析交易类型和细节
  const parseTransaction = async (signature: string): Promise<TransactionDetail | null> => {
    try {
      const txInfo = await connection.getTransaction(signature);
      
      if (!txInfo) return null;
      
      const detail: TransactionDetail = {
        signature,
        blockTime: txInfo.blockTime || 0,
        slot: txInfo.slot,
        fee: txInfo.meta?.fee || 0,
        status: txInfo.meta?.err ? 'failed' : 'success',
        type: 'unknown',
        instructions: txInfo.transaction.message.instructions || []
      };
      
      // 简单的交易类型推断
      if (txInfo.meta?.preBalances && txInfo.meta?.postBalances) {
        const balanceChange = txInfo.meta.postBalances[0] - txInfo.meta.preBalances[0];
        if (balanceChange !== 0) {
          detail.type = 'transfer';
          detail.amount = Math.abs(balanceChange) / 1e9; // 转换为 SOL
        }
      }
      
      // 检查是否涉及代币程序
      const hasTokenProgram = txInfo.transaction.message.instructions.some(
        (ix: any) => {
          const programId = txInfo.transaction.message.accountKeys[ix.programIdIndex]?.toString();
          return programId === 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';
        }
      );
      
      if (hasTokenProgram) {
        detail.type = 'token';
      }
      
      return detail;
    } catch (error) {
      console.error('解析交易失败:', error);
      return null;
    }
  };

  // 获取交易历史
  const fetchTransactionHistory = async (loadMore = false) => {
    if (!publicKey) return;
    
    setLoading(true);
    if (!loadMore) {
      setError('');
      setTransactions([]);
    }
    
    try {
      console.log('获取交易历史...', publicKey.toString());
      
      // 获取交易签名列表
      const signatures = await connection.getSignaturesForAddress(
        publicKey,
        {
          limit: 20, // 每次获取20条记录
          before: loadMore ? before : undefined,
        }
      );
      
      console.log(`获取到 ${signatures.length} 个交易签名`);
      
      if (signatures.length === 0) {
        setHasMore(false);
        return;
      }
      
      // 解析交易细节
      const transactionDetails: TransactionDetail[] = [];
      
      for (const sig of signatures) {
        const detail = await parseTransaction(sig.signature);
        if (detail) {
          transactionDetails.push(detail);
        }
        // 添加小延迟以避免速率限制
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      if (loadMore) {
        setTransactions(prev => [...prev, ...transactionDetails]);
      } else {
        setTransactions(transactionDetails);
      }
      
      // 设置下一次查询的起点
      if (signatures.length > 0) {
        setBefore(signatures[signatures.length - 1].signature);
      }
      
      // 如果返回的数量少于请求数量，说明没有更多了
      setHasMore(signatures.length === 20);
      
    } catch (error) {
      console.error('获取交易历史失败:', error);
      setError('获取交易历史失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (publicKey) {
      setBefore(undefined);
      setHasMore(true);
      fetchTransactionHistory();
    } else {
      setTransactions([]);
    }
  }, [publicKey]);

  if (!publicKey) {
    return (
      <div className="bg-gray-900 border border-purple-500/20 rounded-xl p-6 text-center">
        <History className="h-12 w-12 text-gray-500 mx-auto mb-4" />
        <p className="text-gray-400">请先连接钱包以查看交易历史</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 border border-purple-500/20 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <History className="h-6 w-6 text-purple-400" />
          <h2 className="text-xl font-bold text-white">交易历史</h2>
          {transactions.length > 0 && (
            <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded-full">
              {transactions.length}
            </span>
          )}
        </div>
        
        <button
          onClick={() => fetchTransactionHistory()}
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
      
      {error && (
        <div className="bg-red-900/20 border border-red-500/50 text-red-300 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}
      
      {loading && transactions.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <Loader className="h-8 w-8 text-purple-400 animate-spin mr-3" />
          <span className="text-gray-400">正在加载交易历史...</span>
        </div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-12">
          <Clock className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg mb-2">暂无交易记录</p>
          <p className="text-gray-500">您的交易历史将显示在这里</p>
        </div>
      ) : (
        <div className="space-y-4">
          {transactions.map((transaction) => (
            <TransactionItem
              key={transaction.signature}
              transaction={transaction}
            />
          ))}
          
          {/* 加载更多按钮 */}
          {hasMore && (
            <div className="flex justify-center pt-4">
              <button
                onClick={() => fetchTransactionHistory(true)}
                disabled={loading}
                className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                {loading ? (
                  <Loader className="h-4 w-4 animate-spin" />
                ) : (
                  <ArrowDownRight className="h-4 w-4" />
                )}
                <span>{loading ? '加载中...' : '加载更多'}</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};