export const useShare = (func: Function, campaignId: string, title: string) => {
  const url = `https://app.bono.network/campaign/${campaignId}`;
  
  if (func === 'copy') {
    navigator.clipboard.writeText(url);
    return 'Copied to clipboard';
  } else if (typeof func === 'function') {
    try {
      window.open(func(url, title), '_blank');
      return 'Opened in new window';
    } catch (error) {
      console.error('Error opening share link:', error);
      return 'Error sharing link';
    }
  } else {
    console.error('Invalid share function');
    return 'Invalid share function';
  }
}