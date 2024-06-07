import { CHAIN_ID } from "@tradetrust-tt/tradetrust-utils/constants/supportedChains";
import { v4 as uuid } from "uuid";
import { generateEncryptionKey } from "@govtechsg/oa-encryption";
import {
  validateNetwork,
  validateDocument,
  getEncryptedDocument,
} from "../../utils";
import { azureBlobPut, azureBlobGet } from "../../services/s3";
import { SUPPORTED_NETWORKS } from "../../constants";

export const getDocument = async (id: string) => {
  const document = await azureBlobGet(id);

  return document;
};

export const uploadDocument = async (document) => {
  const { chainId } = await validateNetwork(document);
  console.log('first1');
  await validateDocument({
    document,
    network: SUPPORTED_NETWORKS[chainId as CHAIN_ID].name,
  });
  console.log('first2');
  const { encryptedDocument, encryptedDocumentKey } =
    await getEncryptedDocument({
      str: JSON.stringify(document),
    });
  console.log('first3');

  const id = uuid();
  await azureBlobPut(id, JSON.stringify({ document: encryptedDocument }));

  return {
    id,
    key: encryptedDocumentKey,
    type: encryptedDocument.type,
  };
};

export const uploadDocumentAtId = async (document, documentId: string) => {
  const { chainId } = await validateNetwork(document);

  await validateDocument({
    document,
    network: SUPPORTED_NETWORKS[chainId as CHAIN_ID].name,
  });

  const { key: existingKey } = await getDocument(documentId);
  const { encryptedDocument, encryptedDocumentKey } =
    await getEncryptedDocument({
      str: JSON.stringify(document),
      existingKey,
    });

  await azureBlobPut(documentId, JSON.stringify({ document: encryptedDocument }));

  return {
    id: documentId,
    key: encryptedDocumentKey,
    type: encryptedDocument.type,
  };
};

export const getQueueNumber = async () => {
  const id = uuid();
  const encryptionKey = generateEncryptionKey();

  await azureBlobPut(id, JSON.stringify({
    key: encryptionKey,
  }));

  return { key: encryptionKey, id };
};
