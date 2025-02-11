// Comprehensive Braille conversion map based on standardized chart
const brailleMap: Record<string, string> = {
  ' ': '⠀', '!': '⠮', '"': '⠐', '#': '⠼', '$': '⠫', '%': '⠩', '&': '⠯', "'": '⠄',
  '(': '⠷', ')': '⠾', '*': '⠡', '+': '⠬', ',': '⠠', '-': '⠤', '.': '⠨', '/': '⠌',
  '0': '⠴', '1': '⠂', '2': '⠆', '3': '⠒', '4': '⠲', '5': '⠢', '6': '⠖', '7': '⠶',
  '8': '⠦', '9': '⠔', ':': '⠱', ';': '⠰', '<': '⠣', '=': '⠿', '>': '⠜', '?': '⠹',
  '@': '⠈', 'A': '⠁', 'B': '⠃', 'C': '⠉', 'D': '⠙', 'E': '⠑', 'F': '⠋', 'G': '⠛',
  'H': '⠓', 'I': '⠊', 'J': '⠚', 'K': '⠅', 'L': '⠇', 'M': '⠍', 'N': '⠝', 'O': '⠕',
  'P': '⠏', 'Q': '⠟', 'R': '⠗', 'S': '⠎', 'T': '⠞', 'U': '⠥', 'V': '⠧', 'W': '⠺',
  'X': '⠭', 'Y': '⠽', 'Z': '⠵', '[': '⠪', '\\': '⠳', ']': '⠻', '^': '⠘', '_': '⠸'
};

// Also include lowercase letters for convenience
const lowercaseMap = Object.fromEntries(
  Object.entries(brailleMap)
    .filter(([key]) => /[A-Z]/.test(key))
    .map(([key, value]) => [key.toLowerCase(), value])
);

const fullBrailleMap = { ...brailleMap, ...lowercaseMap };

export function convertToBraille(text: string): string {
  return text
    .split("")
    .map(char => fullBrailleMap[char] || char)
    .join("");
}