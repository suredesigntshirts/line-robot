import { LINE_SIGNATURE_HTTP_HEADER_NAME, validateSignature } from "@line/bot-sdk";
import type { SignatureVerifier as SignatureVerifierPort } from "../../core/ports/signatureVerifier.js";

/** The lower-cased LINE signature header name. Re-exported from the SDK so the lambda wiring
 * reads it here (adapter layer) instead of the app layer importing @line/bot-sdk. */
export const LINE_SIGNATURE_HEADER = LINE_SIGNATURE_HTTP_HEADER_NAME;

/**
 * Verifies the `x-line-signature` header (HMAC-SHA256 over the RAW request body) using the
 * channel secret. Must run on the unparsed body — any prior deserialize/escape breaks it.
 */
export class SignatureVerifier implements SignatureVerifierPort {
  constructor(private readonly channelSecret: string) {}

  verify(rawBody: string | Buffer, signature: string | undefined): boolean {
    if (signature === undefined || signature === "") {
      return false;
    }
    return validateSignature(rawBody, this.channelSecret, signature);
  }
}
