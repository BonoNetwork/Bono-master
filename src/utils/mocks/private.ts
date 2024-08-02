import type { Router } from "vue-router"

class Private {
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
      contributors: string,
      transactions: number,
      legalFirm: string,
      status: string
    },
    public funds: {
      balanceTitle: string,
      balance: number,
      contributionsText: string,
      claimButtonText: string,
      distributionRules: string,
      bottomWarningText: string
    },
    public highTable: {
      approvalStatus: string,
      assignedMember: string,
      notes: string
    },
    public legalFirm: {
      name: string,
      contact: string,
      caseProgress: string
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

export const mock = new Private(
  "Case Management Dashboard",
  "bono-logo.png",
  "justice-scales.png",
  "Manage your case, track funds, and communicate with legal representation.",
  {
    text: "Share case details:",
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
    balance: 0,
    withdrawn: 0,
    goal: 1000,
    caseOwner: 'John Doe',
    contributors: "0",
    transactions: 0,
    legalFirm: 'Legal Eagles LLP',
    status: 'Active'
  },
  {
    balanceTitle: "Current Funds",
    balance: 0,
    contributionsText: "Contribution History",
    claimButtonText: "Request Fund Distribution",
    distributionRules: "80% to Legal Fees, 20% to Case Owner",
    bottomWarningText: "This is your private case management page. Do not share this link with anyone. Sharing this link may compromise your case and funds."
  },
  {
    approvalStatus: 'Approved',
    assignedMember: 'Jane Smith',
    notes: 'Case approved for fundraising. Regular updates required.'
  },
  {
    name: 'Legal Eagles LLP',
    contact: 'contact@legaleagles.com',
    caseProgress: 'Preparing initial documentation'
  },
  {
    text: "Bono Network facilitates case management and fundraising for legal proceedings. By using this platform, you accept our <a href='https://bono.network/privacy-policy' target='blank_'>Privacy Policy</a> and <a href='https://bono.network/terms-of-use' target='blank_'>Terms of Use</a>.",
    buttons: [{
      text: "Submit New Case",
      action: function (router: Router) {
        router.push({name: 'create'})
      }
    }]
  }
)