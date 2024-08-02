import Mixpanel from 'mixpanel';

export class MixpanelManager {

    static mixpanel: Mixpanel.Mixpanel;

    static async init() {
        if (process.env.MIXPANEL_TOKEN){
            this.mixpanel = Mixpanel.init(process.env.MIXPANEL_TOKEN!);
        }
    }

    static async track(event: string, userId: string, properties: any, ipAddress: string | undefined) {
        if (this.mixpanel) {
            properties['distinct_id'] = userId;
            properties['ip'] = ipAddress;

            console.log('Mixpanel track', event, properties);
            this.mixpanel.track(event, properties);
        }
    }

    static async trackGeneralEvent(event: string, properties: any) {
        if (this.mixpanel) {
            console.log('Mixpanel track', event, properties);
            this.mixpanel.track(event, properties);
        }
    }


}