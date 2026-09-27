import { StellarWalletsKit } from "@creit.tech/stellar-wallets-kit/sdk";
import { FREIGHTER_ID as KIT_FREIGHTER_ID } from "@creit.tech/stellar-wallets-kit/modules/freighter";
import { defaultModules } from "@creit.tech/stellar-wallets-kit/modules/utils";
import { Networks } from "@creit.tech/stellar-wallets-kit/types";
import { STELLAR_NETWORK } from "@/lib/utils/constants";

export const FREIGHTER_ID = KIT_FREIGHTER_ID;
export type WalletId = string;

interface WalletModalOptions {
  onWalletSelected: (wallet: { id: WalletId }) => Promise<void> | void;
  onClosed?: () => void;
  modalTitle?: string;
  notAvailableText?: string;
}

let initialized = false;

function initializeKit(): void {
  if (initialized) return;

  StellarWalletsKit.init({
    modules: defaultModules(),
    selectedWalletId: FREIGHTER_ID,
    network:
      STELLAR_NETWORK === "PUBLIC" ? Networks.PUBLIC : Networks.TESTNET,
    authModal: {
      showInstallLabel: true,
      hideUnsupportedWallets: false,
    },
  });

  initialized = true;
}

/**
 * Thin compatibility layer around the maintained Stellar Wallets Kit.
 * Keeping this small surface avoids coupling the rest of the app to the kit's
 * static API while leaving wallet detection, modal behavior, and signing to
 * the upstream library.
 */
const walletsKit = {
  setWallet(id: WalletId): void {
    StellarWalletsKit.setWallet(id);
  },

  async openModal(options: WalletModalOptions): Promise<void> {
    try {
      await StellarWalletsKit.authModal();
      await options.onWalletSelected({
        id: StellarWalletsKit.selectedModule.productId,
      });
    } catch (error) {
      options.onClosed?.();
      throw error;
    }
  },

  getAddress(): Promise<{ address: string }> {
    return StellarWalletsKit.getAddress();
  },

  async getAddressSilently(): Promise<string | null> {
    try {
      const { address } = await StellarWalletsKit.selectedModule.getAddress({
        skipRequestAccess: true,
      });
      return address || null;
    } catch {
      return null;
    }
  },

  signTransaction(
    xdr: string,
    options: { address: string; networkPassphrase?: string }
  ): Promise<{ signedTxXdr: string; signerAddress?: string }> {
    return StellarWalletsKit.signTransaction(xdr, options);
  },

  async getNetworkFromWallet(): Promise<string> {
    const { network } = await StellarWalletsKit.getNetwork();
    return network;
  },
};

export function getWalletsKit(): typeof walletsKit {
  if (typeof window === "undefined") {
    throw new Error("StellarWalletsKit requires a browser environment.");
  }

  initializeKit();
  return walletsKit;
}
