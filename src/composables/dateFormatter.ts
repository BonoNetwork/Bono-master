/**
 * Formats a date string or Date object into a localized string.
 * @param date - The date to format (string or Date object)
 * @param locale - The locale to use for formatting (default: 'en-US')
 * @param options - Intl.DateTimeFormatOptions to customize the output
 * @returns A formatted date string
 */
export function formatDate(
    date: string | Date,
    locale: string = 'en-US',
    options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }
  ): string {
    const dateObject = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat(locale, options).format(dateObject);
  }
  
  /**
   * Formats a date to a relative time string (e.g., "2 days ago", "in 3 hours")
   * @param date - The date to format (string or Date object)
   * @param locale - The locale to use for formatting (default: 'en-US')
   * @returns A relative time string
   */
  export function formatRelativeTime(date: string | Date, locale: string = 'en-US'): string {
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