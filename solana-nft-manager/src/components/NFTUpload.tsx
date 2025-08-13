import React, { useState, useRef } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import {
  Upload,
  Image as ImageIcon,
  Loader,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

interface UploadStatus {
  step: 'idle' | 'uploading' | 'minting' | 'success' | 'error';
  message: string;
  signature?: string;
}

export const NFTUpload: React.FC = () => {
  const { publicKey } = useWallet();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [nftMetadata, setNftMetadata] = useState({
    name: '',
    description: '',
    symbol: '',
    attributes: [{ trait_type: '', value: '' }],
  });
  const [status, setStatus] = useState<UploadStatus>({
    step: 'idle',
    message: '',
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const addAttribute = () => {
    setNftMetadata((prev) => ({
      ...prev,
      attributes: [...prev.attributes, { trait_type: '', value: '' }],
    }));
  };

  const updateAttribute = (index: number, field: 'trait_type' | 'value', value: string) => {
    setNftMetadata((prev) => ({
      ...prev,
      attributes: prev.attributes.map((attr, i) =>
        i === index ? { ...attr, [field]: value } : attr
      ),
    }));
  };

  const removeAttribute = (index: number) => {
    setNftMetadata((prev) => ({
      ...prev,
      attributes: prev.attributes.filter((_, i) => i !== index),
    }));
  };

  const createNFT = async () => {
    if (!selectedFile || !publicKey || !nftMetadata.name) {
      setStatus({
        step: 'error',
        message: '请选择文件并填写必要信息',
      });
      return;
    }

    setStatus({ step: 'uploading', message: '功能开发中...' });
    
    // 模拟处理过程
    setTimeout(() => {
      setStatus({
        step: 'success',
        message: 'NFT 上传功能正在开发中，敬请期待！',
      });
    }, 2000);
  };

  const getStatusIcon = () => {
    switch (status.step) {
      case 'uploading':
      case 'minting':
        return <Loader className="h-5 w-5 animate-spin text-blue-400" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-400" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-400" />;
      default:
        return null;
    }
  };

  if (!publicKey) {
    return (
      <div className="bg-gray-900 border border-purple-500/20 rounded-xl p-6 text-center">
        <Upload className="h-12 w-12 text-gray-500 mx-auto mb-4" />
        <p className="text-gray-400">请先连接钱包以上传 NFT</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 border border-purple-500/20 rounded-xl p-6">
      <div className="flex items-center space-x-3 mb-6">
        <Upload className="h-6 w-6 text-purple-400" />
        <h2 className="text-xl font-bold text-white">创建 NFT</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 文件上传区域 */}
        <div className="space-y-4">
          <div
            className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-purple-500 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            {previewUrl ? (
              <div className="space-y-3">
                <img
                  src={previewUrl}
                  alt="预览"
                  className="max-h-32 mx-auto rounded-lg"
                />
                <p className="text-white text-sm">{selectedFile?.name}</p>
              </div>
            ) : (
              <div className="space-y-3">
                <ImageIcon className="h-12 w-12 text-gray-500 mx-auto" />
                <p className="text-gray-400">点击选择图片</p>
                <p className="text-gray-500 text-sm">
                  支持 PNG, JPG, GIF (最大 10MB)
                </p>
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {/* 元数据表单 */}
        <div className="space-y-4">
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              NFT 名称 *
            </label>
            <input
              type="text"
              value={nftMetadata.name}
              onChange={(e) =>
                setNftMetadata((prev) => ({ ...prev, name: e.target.value }))
              }
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
              placeholder="输入 NFT 名称"
            />
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              描述
            </label>
            <textarea
              value={nftMetadata.description}
              onChange={(e) =>
                setNftMetadata((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500 h-20 resize-none"
              placeholder="描述您的 NFT"
            />
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              符号
            </label>
            <input
              type="text"
              value={nftMetadata.symbol}
              onChange={(e) =>
                setNftMetadata((prev) => ({ ...prev, symbol: e.target.value }))
              }
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
              placeholder="NFT 符号 (可选)"
            />
          </div>
        </div>
      </div>

      {/* 属性 */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <label className="block text-gray-300 text-sm font-medium">
            属性 (可选)
          </label>
          <button
            type="button"
            onClick={addAttribute}
            className="text-purple-400 hover:text-purple-300 text-sm font-medium"
          >
            + 添加属性
          </button>
        </div>
        <div className="space-y-3">
          {nftMetadata.attributes.map((attr, index) => (
            <div key={index} className="flex space-x-3">
              <input
                type="text"
                value={attr.trait_type}
                onChange={(e) =>
                  updateAttribute(index, 'trait_type', e.target.value)
                }
                placeholder="属性名称"
                className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
              />
              <input
                type="text"
                value={attr.value}
                onChange={(e) => updateAttribute(index, 'value', e.target.value)}
                placeholder="属性值"
                className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
              />
              <button
                type="button"
                onClick={() => removeAttribute(index)}
                className="text-red-400 hover:text-red-300 px-3 py-2"
              >
                删除
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 状态显示 */}
      {status.step !== 'idle' && (
        <div
          className={`mt-6 p-4 rounded-lg border ${
            status.step === 'success'
              ? 'bg-green-900/20 border-green-500/50 text-green-300'
              : status.step === 'error'
              ? 'bg-red-900/20 border-red-500/50 text-red-300'
              : 'bg-blue-900/20 border-blue-500/50 text-blue-300'
          }`}
        >
          <div className="flex items-center space-x-2">
            {getStatusIcon()}
            <span>{status.message}</span>
          </div>
          {status.signature && (
            <div className="mt-2 text-sm">
              <span className="text-gray-400">交易签名: </span>
              <span className="font-mono text-xs break-all">
                {status.signature}
              </span>
            </div>
          )}
        </div>
      )}

      {/* 创建按钮 */}
      <button
        onClick={createNFT}
        disabled={
          !selectedFile ||
          !nftMetadata.name ||
          status.step === 'uploading' ||
          status.step === 'minting'
        }
        className="w-full mt-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-all duration-200"
      >
        {status.step === 'uploading' || status.step === 'minting'
          ? '处理中...'
          : '创建 NFT'}
      </button>
    </div>
  );
};