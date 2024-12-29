import { NextApiRequest, NextApiResponse } from "next";
import { Engine } from "@thirdweb-dev/engine";
import {
  LORD_CONTRACT_ADDRESS,
  TOKEN_CONTRACT_ADDRESS,
} from "../../constants/contracts";
import { getEnvironment } from "../../config/configs";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

  const THIRDWEB_ENGINE_URL = getEnvironment().THIRDWEB_ENGINE_URL;
  const THIRDWEB_ENGINE_ACCESSTOKEN = getEnvironment().THIRDWEB_ENGINE_ACCESSTOKEN;
  const THIRDWEB_ENGINE_WALLET = getEnvironment().THIRDWEB_ENGINE_WALLET;

  try {
    if (
      !THIRDWEB_ENGINE_URL ||
      !THIRDWEB_ENGINE_ACCESSTOKEN ||
      !THIRDWEB_ENGINE_WALLET
    ) {
      throw new Error("Environment variables not set");
    }

    const { address } = req.query;
    if (!address) {
      throw new Error("Address not provided");
    }

    const engine = new Engine({
      url: THIRDWEB_ENGINE_URL,
      accessToken: THIRDWEB_ENGINE_ACCESSTOKEN,
    });
    
    console.log(`ENGINE INITIALIZED. Checking tavern ownership of wallet ${address}`);

    const checkLordNFT = await engine.erc721.balanceOf(
      "sepolia", 
      LORD_CONTRACT_ADDRESS, 
      address as string
    );

    return res.status(200).json({ 
      message: "Tavern ownership checked", 
      hasTavern: checkLordNFT.result.balance > 0 
    });

  } catch (error) {
    console.log(" Error: ", error);
    return res.status(500).json({ message: "Error checking tavern ownership", error: JSON.stringify(error) });
  }
};

export default handler;