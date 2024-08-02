class Create {
  constructor(
    public image: string,
    public setup: {
      welcomingPhrase: string,
      titlePlaceholder: string,
      descriptionPlaceHolder: string,
      goalPlaceholder: string,
      tokens: {
        placeholder: string,
        options: Array<string>
      },
      emailPlaceholder: string,
      connectWalletBtnText: string,
      scamDetailsPlaceholder: string,
      evidencePlaceholder: string
    },
    public share: {
      title: string,
      description: string,
      shareTo: {
        text: string,
        btns: Array<{
          text: string,
          actionLink: Function
          bgColor: string
        }>
      }
    },
    public privateZone: {
      title: string,
      description: string
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

export const mock = new Create(
  "image1.png",
  {
    welcomingPhrase: "Submit Your Case",
    titlePlaceholder: "Case Title",
    descriptionPlaceHolder: "Case Description",
    goalPlaceholder: "Fundraising Goal",
    tokens: {
      placeholder: "Preferred Token",
      options: ["SOL", "USDC", "BONK", "FORGE"]
    },
    emailPlaceholder: "Your email",
    connectWalletBtnText: "Connect Wallet",
    scamDetailsPlaceholder: "Describe the scam incident",
    evidencePlaceholder: "Provide any evidence or documentation"
  },
  {
    title: "Case Submitted for Review",
    description: "Your case has been submitted and is pending review by the High Table. You will be notified once it's approved for fundraising.",
    shareTo: {
      text: "Share case (after approval):",
      btns: [
        {
          text: "Twitter",
          actionLink: (url: string | URL, title: string) => `https://twitter.com/share?url=${url}&text=${title}&via=BonoNetwork`,
          bgColor: "#55ACEE"
        },
        {
          text: "LinkedIn",
          actionLink: (url: string | URL, title: string) => `https://www.linkedin.com/shareArticle?url=${url}&title=${title}`,
          bgColor: "#4875B4"
        },
        {
          text: "Copy link",
          actionLink: () => 'copy',
          bgColor: "#00B0AF"
        }
      ]
    }
  },
  {
    title: "Case Management",
    description: "Here is your case management link. Keep it secure and don't share it with anyone. You'll need this to track your case progress and manage funds."
  },
  {
    text: "Bono Network is a platform for case submission and fundraising. By submitting a case, you agree to our <a href='https://bono.network/privacy-policy' target='blank_'>Privacy Policy</a> and <a href='https://bono.network/terms-of-use' target='blank_'>Terms of Use</a>.",
    buttons: []
  }
)