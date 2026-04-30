export class JournalEntry {
  static validateBalance(lines: { amount: number; type: 'debit' | 'credit' }[]) {
    const totalDebit = lines
      .filter((line) => line.type === 'debit')
      .reduce((sum, line) => sum + Number(line.amount), 0);

    const totalCredit = lines
      .filter((line) => line.type === 'credit')
      .reduce((sum, line) => sum + Number(line.amount), 0);

    // Using a small epsilon for floating point comparison if needed, 
    // but for accounting usually fixed to 2 decimals or bigint.
    // Here we assume simple number comparison.
    if (Math.abs(totalDebit - totalCredit) > 0.001) {
      throw new Error(`Debit and Credit must be balanced. Total Debit: ${totalDebit}, Total Credit: ${totalCredit}`);
    }

    return true;
  }
}
