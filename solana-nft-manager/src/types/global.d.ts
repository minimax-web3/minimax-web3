/// <reference types="vite/client" />

declare global {
  interface Window {
    solana?: {
      isPhantom?: boolean;
      connect(): Promise<{ publicKey: { toString(): string } }>;
      disconnect(): Promise<void>;
      on(event: string, callback: Function): void;
      off(event: string, callback: Function): void;
      request(args: { method: string; params?: any }): Promise<any>;
    };
    phantom?: {
      solana?: {
        isPhantom: boolean;
        connect(): Promise<{ publicKey: { toString(): string } }>;
        disconnect(): Promise<void>;
        on(event: string, callback: Function): void;
        off(event: string, callback: Function): void;
        request(args: { method: string; params?: any }): Promise<any>;
      };
    };
  }
}

export {};