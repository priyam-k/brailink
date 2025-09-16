// Comprehensive Braille conversion map based on the provided chart
const brailleMap: Record<string, string> = {
  ' ': '⠀', '!': '⠖', '"': '⠦', '#': '⠼', '$': '⠫', '%': '⠩', '&': '⠯', "'": '⠄',
  '(': '⠷', ')': '⠾', '*': '⠡', '+': '⠐', ',': '⠂', '-': '⠤', '.': '⠄', '/': '⠌',
  '0': '⠚', '1': '⠁', '2': '⠃', '3': '⠉', '4': '⠙', '5': '⠑', '6': '⠋', '7': '⠛',
  '8': '⠓', '9': '⠊', ':': '⠒', ';': '⠆', '=': '⠿', '?': '⠦', '@': '⠈',
  
  // Alphabet letters
  'A': '⠁', 'B': '⠃', 'C': '⠉', 'D': '⠙', 'E': '⠑', 'F': '⠋', 'G': '⠛',
  'H': '⠓', 'I': '⠊', 'J': '⠚', 'K': '⠅', 'L': '⠇', 'M': '⠍', 'N': '⠝', 'O': '⠕',
  'P': '⠏', 'Q': '⠟', 'R': '⠗', 'S': '⠎', 'T': '⠞', 'U': '⠥', 'V': '⠧', 'W': '⠺',
  'X': '⠭', 'Y': '⠽', 'Z': '⠵',

  // Lowercase letters
  'a': '⠁', 'b': '⠃', 'c': '⠉', 'd': '⠙', 'e': '⠑', 'f': '⠋', 'g': '⠛',
  'h': '⠓', 'i': '⠊', 'j': '⠚', 'k': '⠅', 'l': '⠇', 'm': '⠍', 'n': '⠝', 'o': '⠕',
  'p': '⠏', 'q': '⠟', 'r': '⠗', 's': '⠎', 't': '⠞', 'u': '⠥', 'v': '⠧', 'w': '⠺',
  'x': '⠭', 'y': '⠽', 'z': '⠵'};

// Include lowercase letters
const lowercaseMap = Object.fromEntries(
  Object.entries(brailleMap)
    .filter(([key]) => /[A-Z]/.test(key))
    .map(([key, value]) => [key.toLowerCase(), value.replace('⠠', '')])
);

const fullBrailleMap = { ...brailleMap, ...lowercaseMap };

export function convertToBraille(text: string, charnum: number = 14, maxLines: number = 10): { formattedText: string; totalLines: number } {
  const lines = text.split('\n'); // Split text into lines
  let formattedText = '';
  let totalLines = 0; // Track the number of lines after formatting

  lines.forEach((line, lineIndex) => {
    const words = line.split(' ');
    let currentLine: string[] = [];
    let currentLineLength = 0;

    words.forEach((word, wordIndex) => {
      const brailleWord = word
        .split('')
        .map(char => fullBrailleMap[char] || '⠀') // Convert each character to Braille
        .join(' '); // Add spaces between Braille characters

      const wordLength = word.length;

      if (currentLineLength + wordLength <= charnum) {
        currentLine.push(brailleWord);
        currentLineLength += wordLength;

        if (wordIndex < words.length - 1) {
          currentLine.push(fullBrailleMap[' '] || '⠀'); // Add a space between words
          currentLineLength += 1;
        }
      } else {
        if (currentLine.length > 0) {
          formattedText += currentLine.join(' ') + '\n';
          totalLines++; // Increment the line count
        }

        if (wordLength > charnum) {
          let remainingWord = word;
          while (remainingWord.length > charnum) {
            const splitPart = remainingWord.slice(0, charnum - 1);
            const brailleSplitPart = splitPart
              .split('')
              .map(char => fullBrailleMap[char] || '⠀')
              .join(' ');
            formattedText += brailleSplitPart + ' ' + (fullBrailleMap['-'] || '⠤') + '\n';
            totalLines++; // Increment the line count
            remainingWord = remainingWord.slice(charnum - 1);
          }
          currentLine = [
            remainingWord
              .split('')
              .map(char => fullBrailleMap[char] || '⠀')
              .join(' ')
          ];
          currentLineLength = remainingWord.length;
        } else {
          currentLine = [brailleWord];
          currentLineLength = wordLength;

          if (wordIndex < words.length - 1) {
            currentLine.push(fullBrailleMap[' '] || '⠀');
            currentLineLength += 1;
          }
        }
      }
    });

    if (currentLine.length > 0) {
      formattedText += currentLine.join(' ') + '\n'; // Add a newline after each line
      totalLines++; // Increment the line count
    }
  });

  return { formattedText, totalLines };
}