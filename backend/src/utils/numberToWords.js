export const numberToWords = (num) => {
  const a = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const g = ['', 'Thousand', 'Lakh', 'Crore'];

  if (num === 0) return 'Zero';

  let words = '';

  const helper = (n) => {
    let str = '';
    if (n > 99) {
      str += a[Math.floor(n / 100)] + ' Hundred ';
      n %= 100;
    }
    if (n > 19) {
      str += b[Math.floor(n / 10)] + ' ';
      n %= 10;
    }
    if (n > 0) {
      str += a[n] + ' ';
    }
    return str;
  };

  let numStr = Math.floor(num).toString();
  let k = 0;

  // Process last 3 digits
  if (numStr.length > 3) {
    let lastThree = numStr.substring(numStr.length - 3);
    let rest = numStr.substring(0, numStr.length - 3);
    words = helper(parseInt(lastThree)) + words;
    
    // Process pairs of digits (thousands, lakhs, crores)
    while (rest.length > 0) {
      k++;
      let grab = rest.length > 2 ? rest.substring(rest.length - 2) : rest;
      rest = rest.length > 2 ? rest.substring(0, rest.length - 2) : '';
      let val = parseInt(grab);
      if (val > 0) {
        words = helper(val) + g[k] + ' ' + words;
      }
    }
  } else {
    words = helper(parseInt(numStr));
  }

  return words.trim() + ' Rupees Only';
};
