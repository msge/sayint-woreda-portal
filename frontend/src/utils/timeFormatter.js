export const formatTimeAgo = (date, language) => {
  const now = new Date();
  const past = new Date(date);
  const diffInMinutes = Math.floor((now - past) / (1000 * 60));
  
  if (diffInMinutes < 60) {
    return language === 'am' 
      ? `${diffInMinutes} ደቂቃ በፊት`
      : `${diffInMinutes} minutes ago`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return language === 'am'
      ? `${diffInHours} ${diffInHours === 1 ? 'ሰዓት' : 'ሰዓታት'} በፊት`
      : `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  return language === 'am'
    ? `${diffInDays} ቀናት በፊት`
    : `${diffInDays} days ago`;
};