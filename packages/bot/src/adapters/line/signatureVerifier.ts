import { validateSignature } from "@line/bot-sdk";

/**
 * Verifies the `x-line-signature` header (HMAC-SHA256 over the RAW request body) using the
 * channel secret. Must run on the unparsed body — any prior deserialize/escape breaks it.
 */
export class SignatureVerifier {
  constructor(private readonly channelSecret: string) {}

  verify(rawBody: string | Buffer, signature: string | undefined): boolean {
    if (signature === undefined || signature === "") {
      return false;
    }
    return validateSignature(rawBody, this.channelSecret, signature);
  }
}
