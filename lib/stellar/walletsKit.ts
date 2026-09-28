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

export class StellarWalletsKit {
  private readonly network: WalletNetwork;
  private selectedWalletId: WalletId;
  private modalContainer: HTMLElement | null = null;
  private modalCleanup: (() => void) | null = null;

  constructor(opts: StellarWalletsKitOptions) {
    this.network         = opts.network;
    this.selectedWalletId = opts.selectedWalletId ?? FREIGHTER_ID;
  }

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
    this.selectedWalletId = id;
  }

  getSelectedWalletId(): WalletId {
    return this.selectedWalletId;
  }

  // ── Modal ───────────────────────────────────────────────────────────────────

  async openModal(opts: WalletModalOptions): Promise<void> {
    if (typeof window === "undefined") {
      throw new Error("openModal requires a browser environment.");
    }

    return new Promise<void>((resolve) => {
      this.injectModal(opts, resolve);
    });
  }

  private injectModal(opts: WalletModalOptions, resolve: () => void): void {
    this.destroyModal();

    const title = opts.modalTitle ?? "Connect Wallet";
    const unavailText = opts.notAvailableText ?? "Not installed";
    const lastFocused = document.activeElement as HTMLElement | null;
    let settled = false;

    const overlay = document.createElement("div");
    overlay.setAttribute("data-settlex-wallet-modal", "true");
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-labelledby", "settlex-wallet-modal-title");
    overlay.setAttribute("aria-describedby", "settlex-wallet-modal-description");
    Object.assign(overlay.style, {
      position: "fixed",
      inset: "0",
      background: "rgba(0,0,0,0.55)",
      backdropFilter: "blur(4px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: "99999",
      fontFamily: "Poppins, system-ui, sans-serif",
    } as Partial<CSSStyleDeclaration>);

    const card = document.createElement("div");
    card.tabIndex = -1;
    Object.assign(card.style, {
      background: "#fff",
      borderRadius: "20px",
      padding: "28px 24px",
      width: "360px",
      maxWidth: "calc(100vw - 32px)",
      boxShadow: "0 24px 80px -12px rgba(0,0,0,0.25)",
      outline: "none",
    } as Partial<CSSStyleDeclaration>);

    const header = document.createElement("div");
    Object.assign(header.style, {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "20px",
    } as Partial<CSSStyleDeclaration>);

    const titleEl = document.createElement("h2");
    titleEl.id = "settlex-wallet-modal-title";
    titleEl.textContent = title;
    Object.assign(titleEl.style, {
      fontSize: "17px",
      fontWeight: "700",
      color: "#0F0F14",
      margin: "0",
    } as Partial<CSSStyleDeclaration>);

    const descEl = document.createElement("p");
    descEl.id = "settlex-wallet-modal-description";
    descEl.textContent = "Choose a wallet to continue signing in and connecting to Stellar.";
    descEl.style.display = "none";

    const closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.setAttribute("aria-label", "Close wallet selector");
    closeBtn.innerHTML = "&#x2715;";
    Object.assign(closeBtn.style, {
      background: "none",
      border: "none",
      fontSize: "18px",
      color: "#999",
      cursor: "pointer",
      padding: "4px",
      lineHeight: "1",
    } as Partial<CSSStyleDeclaration>);
    const finish = (notifyClosed: boolean) => {
      if (settled) return;
      settled = true;
      this.destroyModal();
      if (lastFocused && document.contains(lastFocused)) lastFocused.focus();
      if (notifyClosed) opts.onClosed?.();
      resolve();
    };

    closeBtn.addEventListener("click", () => finish(true));

    header.appendChild(titleEl);
    header.appendChild(closeBtn);

    const list = document.createElement("div");
    Object.assign(list.style, {
      display: "flex",
      flexDirection: "column",
      gap: "10px",
    } as Partial<CSSStyleDeclaration>);

    const focusableButtons: HTMLButtonElement[] = [];

    SUPPORTED_WALLETS.forEach((wallet) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.setAttribute("role", "button");
      Object.assign(btn.style, {
        display: "flex",
        alignItems: "center",
        gap: "14px",
        padding: "14px 16px",
        border: "1.5px solid #E5E5E5",
        borderRadius: "12px",
        background: "#fff",
        cursor: "pointer",
        width: "100%",
        textAlign: "left",
        transition: "border-color 0.15s, background 0.15s",
      } as Partial<CSSStyleDeclaration>);

      btn.addEventListener("mouseenter", () => {
        btn.style.borderColor = "#B9FF66";
        btn.style.background = "#F8FFF0";
      });
      btn.addEventListener("mouseleave", () => {
        btn.style.borderColor = "#E5E5E5";
        btn.style.background = "#fff";
      });

      const img = document.createElement("img");
      img.src = wallet.logoUrl;
      img.alt = wallet.name;
      Object.assign(img.style, { width: "32px", height: "32px", borderRadius: "8px" });

      const nameEl = document.createElement("span");
      nameEl.textContent = wallet.name;
      Object.assign(nameEl.style, {
        fontSize: "15px",
        fontWeight: "600",
        color: "#0F0F14",
        flex: "1",
      } as Partial<CSSStyleDeclaration>);

      const badge = document.createElement("span");
      Object.assign(badge.style, {
        fontSize: "11px",
        fontWeight: "600",
        padding: "3px 8px",
        borderRadius: "6px",
        background: "#F0F0F0",
        color: "#999",
      } as Partial<CSSStyleDeclaration>);
      badge.textContent = "Checking…";

      wallet.isInstalled().then((available) => {
        if (available) {
          badge.textContent = "Available";
          badge.style.background = "#ECFDF5";
          badge.style.color = "#059669";
          btn.style.cursor = "pointer";
        } else {
          badge.textContent = unavailText;
          badge.style.background = "#FEF2F2";
          badge.style.color = "#DC2626";
          btn.style.cursor = "not-allowed";
          btn.style.opacity = "0.6";
        }
      });

      btn.appendChild(img);
      btn.appendChild(nameEl);
      btn.appendChild(badge);

      btn.addEventListener("click", async () => {
        wallet.isInstalled().then(async (available) => {
          if (!available) {
            window.open(wallet.installUrl, "_blank", "noopener,noreferrer");
            return;
          }
          finish(false);
          try {
            await opts.onWalletSelected(wallet);
          } finally {
            resolve();
          }
        });
      });

      focusableButtons.push(btn);
      list.appendChild(btn);
    });

    card.appendChild(header);
    card.appendChild(descEl);
    card.appendChild(list);
    overlay.appendChild(card);

    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        finish(true);
      }
    });

    const trapFocus = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const focusable = [closeBtn, ...focusableButtons].filter(
        (el): el is HTMLElement => !!el && typeof el.focus === "function"
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    overlay.addEventListener("keydown", trapFocus);
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        finish(true);
      }
    };
    document.addEventListener("keydown", handleEscape);
    this.modalCleanup = () => {
      overlay.removeEventListener("keydown", trapFocus);
      document.removeEventListener("keydown", handleEscape);
    };

    document.body.appendChild(overlay);
    this.modalContainer = overlay;

    const focusTarget = focusableButtons[0] ?? closeBtn;
    window.setTimeout(() => focusTarget.focus(), 0);
  }

  private destroyModal(): void {
    this.modalCleanup?.();
    this.modalCleanup = null;
    if (this.modalContainer && document.body.contains(this.modalContainer)) {
      document.body.removeChild(this.modalContainer);
    }
    this.modalContainer = null;
    this.modalCleanup?.();
    this.modalCleanup = null;
  }

  // ── Address ─────────────────────────────────────────────────────────────────

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
