export class Helpers {
    static sleep = async (seconds: number): Promise<void> => {
        return new Promise(resolve => setTimeout(resolve, seconds * 1000));
    }
 
    static getRandomInt = (min: number, max: number): number => {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    static getProbability = (winProbability: number): boolean => {
        return Helpers.getRandomInt(1, 10000) <= winProbability * 100;
    }   

    static padNumber = (d: number): string => {
        return (d < 10) ? '0' + d.toString() : d.toString();
    }

    static numberWithCommas = (x: number): string => {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    static truncateString = (str: string, len: number): string => {
        if (str.length <= len) { return str; }

        const n = Math.floor(len / 2);

        const subString1 = str.slice(0, n); 
        const subString2 = str.slice(str.length-n, str.length); 

        return subString1 + "..." + subString2;
    }

    static shuffleArray = (array: any[]): void => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    static differenceInSeconds = (date1: Date, date2: Date): number => {
        const difference = Math.abs(date1.getTime() - date2.getTime());
        return Math.floor(difference / 1000);
    }

    static formatNumber = (num: number): string => {
        const formatter = Intl.NumberFormat('en', { notation: 'compact' });
        return formatter.format(num);
    }

    static formatCurrency = (amount: number, currency: string = 'USD'): string => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format(amount);
    }

    static calculateFundingProgress = (currentAmount: number, goalAmount: number): number => {
        return Math.min((currentAmount / goalAmount) * 100, 100);
    }

     static formatDate = (
        date: string | Date,
        locale: string = 'en-US',
        options: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }
    ): string => {
        const dateObject = typeof date === 'string' ? new Date(date) : date;
        return new Intl.DateTimeFormat(locale, options).format(dateObject);
    }

    static formatRelativeTime = (date: string | Date, locale: string = 'en-US'): string => {
        const dateObject = typeof date === 'string' ? new Date(date) : date;
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - dateObject.getTime()) / 1000);

        const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

        if (diffInSeconds < 60) return rtf.format(-diffInSeconds, 'second');
        if (diffInSeconds < 3600) return rtf.format(-Math.floor(diffInSeconds / 60), 'minute');
        if (diffInSeconds < 86400) return rtf.format(-Math.floor(diffInSeconds / 3600), 'hour');
        if (diffInSeconds < 2592000) return rtf.format(-Math.floor(diffInSeconds / 86400), 'day');
        if (diffInSeconds < 31536000) return rtf.format(-Math.floor(diffInSeconds / 2592000), 'month');
        return rtf.format(-Math.floor(diffInSeconds / 31536000), 'year');
    }

    static timeLeft = (endDate: Date): string => {
        const now = new Date();
        const diff = endDate.getTime() - now.getTime();
        
        if (diff <= 0) return 'Ended';
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        
        if (days > 0) return `${days} day${days > 1 ? 's' : ''} left`;
        return `${hours} hour${hours > 1 ? 's' : ''} left`;
    }

    static generateCampaignSlug = (title: string): string => {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '');
    }

    static isValidSolanaAddress = (address: string): boolean => {
        return /^[A-HJ-NP-Za-km-z1-9]{32,44}$/.test(address);
    }

    
}