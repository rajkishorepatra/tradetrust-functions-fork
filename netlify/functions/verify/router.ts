import express, { Request, Response } from "express";
import { networkName } from "@tradetrust-tt/tradetrust-utils/constants/network";
import { isValid } from "@tradetrust-tt/tt-verify";
import { validateDocument } from "../../utils";

const router = express.Router();

router.post("/", async (req: Request, res: Response) => {
  const {
    body: { document },
    query: { network = "mainnet" },
  } = req;

  try {
    console.log('first')
    const fragments = await validateDocument({
      document,
      network: network as networkName,
    });
    console.log('hell12134',fragments)
    res.status(200).json({
      summary: {
        all: isValid(fragments),
        documentStatus: isValid(fragments, ["DOCUMENT_STATUS"]),
        documentIntegrity: isValid(fragments, ["DOCUMENT_INTEGRITY"]),
        issuerIdentity: isValid(fragments, ["ISSUER_IDENTITY"]),
      },
      fragments,
    });
  } catch (err) {
    res.status(400).json(err);
  }
});

export { router };
