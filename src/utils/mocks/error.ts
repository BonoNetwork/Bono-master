import type { Router } from "vue-router"

class Error {
  constructor(
    public title: string,
    public image: string,
    public description: string,
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

export const mock = new Error(
  "Page not found",
  "image1.png",
  "There is no such page on Bono Network.<br/>Go to Home page to find a case or submit your own.",
  "Home page",
  {
    text: "Bono Network facilitates case submissions and fundraising.<br/>By using this platform, you accept our <a href='https://bono.network/privacy-policy' target='blank_'>Privacy Policy</a> and <a href='https://bono.network/terms-of-use' target='blank_'>Terms of Use</a>.",
    buttons: [
      {
        text: "Submit a Case",
        action: function (router: Router) {
          router.push({name: 'create'})
        }
      }
    ]
  }
)