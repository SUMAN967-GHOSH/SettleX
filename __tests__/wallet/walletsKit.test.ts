/** @jest-environment jsdom */

import { StellarWalletsKit, WalletNetwork } from "@/lib/stellar/walletsKit";

jest.mock("@stellar/freighter-api", () => ({
  isConnected: jest.fn().mockResolvedValue({ isConnected: false, error: null }),
  isAllowed: jest.fn(),
  requestAccess: jest.fn(),
  getAddress: jest.fn(),
  signTransaction: jest.fn(),
  getNetwork: jest.fn(),
}));

describe("StellarWalletsKit wallet modal", () => {
  afterEach(() => {
    document.body.innerHTML = "";
    jest.useRealTimers();
  });

  it("moves focus into the dialog and restores it on Escape", async () => {
    const opener = document.createElement("button");
    document.body.appendChild(opener);
    opener.focus();

    const onClosed = jest.fn();
    const kit = new StellarWalletsKit({ network: WalletNetwork.TESTNET });
    const modalPromise = kit.openModal({ onWalletSelected: jest.fn(), onClosed });

    await new Promise((resolve) => setTimeout(resolve, 0));

    const dialog = document.querySelector('[role="dialog"]');
    expect(dialog).toBeTruthy();
    expect(document.activeElement).not.toBe(opener);

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    await modalPromise;

    expect(onClosed).toHaveBeenCalledTimes(1);
    expect(document.querySelector('[role="dialog"]')).toBeNull();
    expect(document.activeElement).toBe(opener);
  });
});