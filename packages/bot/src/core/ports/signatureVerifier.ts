/** Verifies the LINE `x-line-signature` HMAC over the RAW request body. The app's ingest
 * handler depends on this port; the LINE-SDK-backed implementation lives in the adapter. */
export interface SignatureVerifier {
  verify(rawBody: string | Buffer, signature: string | undefined): boolean;
}
