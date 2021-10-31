import { HardhatUserConfig } from "hardhat/config";
import dotenv from "dotenv";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";

dotenv.config();

// This is a shim since TypeScript is unhappy with additional objects in the config object
type HardhatUserConfigExtended = HardhatUserConfig & { [key: string]: any };

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
const config: HardhatUserConfigExtended = {
  solidity: "0.8.4",
  networks: {
    rinkeby: {
      url: process.env.RINKEBY_APP_SECRET_KEY || "",
      accounts: process.env.RINKEBY_WALLET_PRIVATE_KEY
        ? [process.env.RINKEBY_WALLET_PRIVATE_KEY]
        : [],
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  watcher: {
    compilation: {
      tasks: ["compile"],
      files: ["./contracts"],
      verbose: true,
    },
    ci: {
      tasks: [
        "clean",
        { command: "compile", params: { quiet: true } },
        {
          command: "test",
          params: {
            noCompile: true,
            testFiles: ["./test/EthDistributor.test.js"],
          },
        },
      ],
    },
  },
};

export default config;
