export interface AIProvider {
  extractReceipt(imageBuffer: Buffer, mimeType: string): Promise<any>;
}
