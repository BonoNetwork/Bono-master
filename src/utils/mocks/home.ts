import type { Router } from "vue-router"

export class Home {
  constructor(
    public title: string,
    public image: string,
    public description: string,
    public statistic: string,
    public statisticImage: string,
    public btnText: string,
    public legalDisclaimer: {
      text: string,
      buttons: Array<{
        text: string,
        action: Function
      }>
    }
  ) { }
}

export const mock = new Home(
  "Bono Network: Justice Through Blockchain",
  "bono-logo.png",
  "A decentralized platform built on Solana, empowering victims of scams to seek justice and raise funds for legal proceedings.",
  "Total Funds Raised: $X",
  "statistics.svg",
  "Submit a Case",
  {
    text: "Bono Network facilitates case submissions and fundraising.<br/>By using this platform, you accept our <a href='https://bono.network/privacy-policy' target='blank_'>Privacy Policy</a> and <a href='https://bono.network/terms-of-use' target='blank_'>Terms of Use</a>.",
    buttons: [
      {
        text: "Submit a Case",
        action: function (router: Router) {
          router.push({name: 'create'})
        }
      },
      {
        text: "View Cases",
        action: function (router: Router) {
          router.push({name: 'cases'})
        }
      }
    ]
  }
)