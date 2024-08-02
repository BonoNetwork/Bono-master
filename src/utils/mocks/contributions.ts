class Contributions {
  constructor(
    public heading: string,
    public contributions: Array<{
      wallet: string,
      amount: string,
      name?: string,
      comment?: string,
      timestamp: Date,
      caseId: string
    }>
  ) { }
}

export const mock = new Contributions(
  'Contributions',
  [
    {
      wallet: '1234567890abcd',
      amount: '10 SOL',
      name: 'Ilya',
      comment: 'Good luck with your case!',
      timestamp: new Date('2023-05-01T10:00:00Z'),
      caseId: 'CASE-001'
    }, {
      wallet: '0987654321wxyz',
      amount: '20 SOL',
      timestamp: new Date('2023-05-02T14:30:00Z'),
      caseId: 'CASE-001'
    }
  ]
)