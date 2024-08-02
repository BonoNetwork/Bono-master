import type { Router } from "vue-router"

class PublicCase {
  constructor(
    public title: string,
    public image1: string,
    public image2: string,
    public description: string,
    public shareTo: {
      text: string,
      btns: Array<{
        text: string,
        actionLink: Function
        bgColor: string
      }>
    },
    public stats: {
      currency: string
      balance: number,
      withdrawn: number,
      goal: number,
      caseOwner: string,
      legalFirm: string,
      status: string,
      highTableApproval: string
    },
    public contribution: {
      title: string,
      fee: string,
      options: Array<{
        id: string,
        title: string,
        description: string,
        amount: number,
      }>,
      field1Placeholder: string,
      field2Placeholder: string,
      buttonText: string,
      contributionsText: string,
    },
    public caseDetails: {
      incidentDate: string,
      jurisdiction: string,
      caseType: string,
      evidenceSummary: string
    },
    public legalUpdate: {
      lastUpdate: string,
      status: string,
      nextSteps: string
    },
    public legalDisclaimer: {
      text: string,
      buttons: Array<{
        text: string,
        action: Function
      }>
    }
  ) { }
}

export const mock = new PublicCase(
  "Seeking Justice: Cryptocurrency Scam Recovery",
  "bono-logo.png",
  "justice-scales.png",
  "Help support legal action against a major cryptocurrency scam affecting thousands of investors.",
  {
    text: "Share this case:",
    btns: [
      {
        text: "Twitter",
        actionLink: (url: string | URL, title: string) => `https://twitter.com/share?url=${url}&text=${title}&via=BonoNetwork`,
        bgColor: "#55ACEE"
      }, {
        text: "LinkedIn",
        actionLink: (url: string | URL, title: string) => `https://www.linkedin.com/shareArticle?url=${url}&title=${title}`,
        bgColor: "#4875B4"
      }, {
        text: "Copy link",
        actionLink: () => 'copy',
        bgColor: "#F7931A"
      }
    ]
  },
  {
    currency: "SOL",
    balance: 500,
    withdrawn: 100,
    goal: 2000,
    caseOwner: 'Investor Group A',
    legalFirm: 'Crypto Law Experts LLP',
    status: 'Active',
    highTableApproval: 'Approved'
  },
  {
    title: "Contribute to Legal Fund",
    fee: "+0.001 SOL processing fee",
    options: [
      {
        id: "0",
        title: "+5 SOL",
        description: "(≈ $100)",
        amount: 5
      },
      {
        id: "1",
        title: "+25 SOL",
        description: "(≈ $500)",
        amount: 25
      },
      {
        id: "2",
        title: "+50 SOL",
        description: "(≈ $1000)",
        amount: 50
      }
    ],
    field1Placeholder: "Your name (optional)",
    field2Placeholder: "Public comment (optional)",
    buttonText: "Connect Wallet to Contribute",
    contributionsText: "Recent Contributions"
  },
  {
    incidentDate: "2023-01-15",
    jurisdiction: "United States, Southern District of New York",
    caseType: "Class Action Lawsuit",
    evidenceSummary: "Blockchain transactions, misleading promotional materials, expert testimony"
  },
  {
    lastUpdate: "2023-05-01",
    status: "Discovery Phase",
    nextSteps: "Preparing for depositions and document review"
  },
  {
    text: "Bono Network facilitates fundraising for legal proceedings. By contributing, you acknowledge that you are not guaranteed any returns and accept our <a href='https://bono.network/privacy-policy' target='blank_'>Privacy Policy</a> and <a href='https://bono.network/terms-of-use' target='blank_'>Terms of Use</a>.",
    buttons: [
      {
        text: "Submit Your Case",
        action: function (router: Router) {
          router.push({name: 'create'})
        }
      },
      {
        text: "Learn More About Bono",
        action: function (router: Router) {
          router.push({name: 'about'})
        }
      }
    ]
  }
)