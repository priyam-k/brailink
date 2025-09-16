import express from 'express';
import { exec } from 'child_process';
import bodyParser from 'body-parser';
import cors from 'cors';

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

// Braille dictionary mapping characters to binary
const brailleDict = {
  ' ': '000000',
  '!': '011010',
  '"': '011001',
  '#': '001111',
  '$': '110101',
  '%': '100101',
  '&': '111101',
  "'": '001000',
  '(': '111011',
  ')': '011111',
  '*': '100001',
  '+': '000010',
  ',': '010000',
  '-': '001001',
  '.': '001000',
  '/': '001100',
  '0': '010110',
  '1': '100000',
  '2': '110000',
  '3': '100100',
  '4': '100110',
  '5': '100010',
  '6': '110100',
  '7': '110110',
  '8': '110010',
  '9': '010100',
  ':': '010010',
  ';': '011000',
  '=': '111111',
  '?': '011001',
  '@': '000100',
  'A': '100000',
  'B': '110000',
  'C': '100100',
  'D': '100110',
  'E': '100010',
  'F': '110100',
  'G': '110110',
  'H': '110010',
  'I': '010100',
  'J': '010110',
  'K': '101000',
  'L': '111000',
  'M': '101100',
  'N': '101110',
  'O': '101010',
  'P': '111100',
  'Q': '111110',
  'R': '111010',
  'S': '011100',
  'T': '011110',
  'U': '101001',
  'V': '111001',
  'W': '010111',
  'X': '101101',
  'Y': '101111',
  'Z': '101011',
  'a': '100000',
  'b': '110000',
  'c': '100100',
  'd': '100110',
  'e': '100010',
  'f': '110100',
  'g': '110110',
  'h': '110010',
  'i': '010100',
  'j': '010110',
  'k': '101000',
  'l': '111000',
  'm': '101100',
  'n': '101110',
  'o': '101010',
  'p': '111100',
  'q': '111110',
  'r': '111010',
  's': '011100',
  't': '011110',
  'u': '101001',
  'v': '111001',
  'w': '010111',
  'x': '101101',
  'y': '101111',
  'z': '101011'
};

function convertTextToBinary(text, charnum) {
function rearrangeBrailleCode(code) {
  if (typeof code !== 'string' || code.length !== 6) {
    return code; // Return as-is if not a valid 6-bit string
  }
  // Reverse the first three bits and the last three bits separately
  return code.slice(2, 3) + code.slice(1, 2) + code.slice(0, 1) + code.slice(5, 6) + code.slice(4, 5) + code.slice(3, 4);
}

  text = text.toLowerCase();

  const lines = text.split('\n');
  let formattedText = '';

  lines.forEach((line, lineIndex) => {
    const words = line.split(' ');
    let currentLine = [];
    let currentLineLength = 0;

    words.forEach((word, wordIndex) => {
      const binaryWord = word
        .split('')
        .map(char => rearrangeBrailleCode(brailleDict[char] || '000000'))
        .join(' ');

      const wordLength = word.length;

      if (currentLineLength + wordLength <= charnum) {
        currentLine.push(binaryWord);
        currentLineLength += wordLength;

        if (wordIndex < words.length - 1) {
          currentLine.push(rearrangeBrailleCode('000000')); // Add a space between words
          currentLineLength += 1;
        }
      } else {
        if (currentLine.length > 0) {
          formattedText += currentLine.join(' ') + '\n';
        }

        if (wordLength > charnum) {
          let remainingWord = word;
          while (remainingWord.length > charnum) {
            const splitPart = remainingWord.slice(0, charnum - 1);
            const binarySplitPart = splitPart
              .split('')
              .map(char => rearrangeBrailleCode(brailleDict[char] || '000000'))
              .join(' ');
            formattedText += binarySplitPart + ' ' + rearrangeBrailleCode('001001') + '\n';
            remainingWord = remainingWord.slice(charnum - 1);
          }
          currentLine = [
            remainingWord
              .split('')
              .map(char => rearrangeBrailleCode(brailleDict[char] || '000000'))
              .join(' ')
          ];
          currentLineLength = remainingWord.length;
        } else {
          currentLine = [binaryWord];
          currentLineLength = wordLength;

          if (wordIndex < words.length - 1) {
            currentLine.push(rearrangeBrailleCode('000000'));
            currentLineLength += 1;
          }
        }
      }
    });

    if (currentLine.length > 0) {
      formattedText += currentLine.join(' ');
    }

    if (lineIndex < lines.length - 1) {
      formattedText += '\n';
    }
  });

  return formattedText;
}

// Existing print endpoint
app.post('/print', (req, res) => {
  const { text } = req.body;
  const charnum = 14; // max num of Braille characters per line
  console.log('Received print request with text:', text);

  if (!text) {
    return res.status(400).send('No text received');
  }


  const binaryText = convertTextToBinary(text.toLowerCase(), charnum);
  console.log('Converted text to binary:', binaryText);

  const escapedBinaryText = binaryText.replace(/'/g, `'"'"'`);
  const command = `echo '${escapedBinaryText}' | ssh -i ~/.ssh/id_rsa aditya@raspberrypi.local 'bash ~/receive_text.sh'`;

  console.log(`Executing command: ${command}`);
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error sending message: ${error.message}`);
      return res.status(500).send(`Error: ${error.message}`);
    }
    if (stderr) {
      console.error(`SSH stderr: ${stderr}`);
      return res.status(500).send(`Error: ${stderr}`);
    }
    console.log(`SSH stdout: ${stdout}`);
    res.send(`Success: ${stdout}`);
  });
});

// New endpoint to terminate the printing process
app.post('/api/terminate-print', (req, res) => {
  console.log('Received request to terminate printing process.');
  const command = `ssh -i ~/.ssh/id_rsa aditya@raspberrypi.local 'pkill -SIGTERM -f completetest.py'`;

  console.log(`Executing termination command: ${command}`);
  exec(command, (error, stdout, stderr) => {
    if (error) {
      if (error.code === 1) {
        const message = `No process matching "completetest.py" found to terminate. (pkill exit code 1)`;
        console.log(`Termination attempt: ${message}`);
        return res.status(200).send(message);
      }
      const errorMessage = `Error executing pkill for "completetest.py": ${error.message}. Stderr: ${stderr || 'N/A'}`;
      console.error(errorMessage);
      return res.status(500).send(`Error terminating process. Details: ${error.message}`);
    }

    const successMessage = `Termination signal (SIGTERM) sent successfully to "completetest.py".`;
    console.log(successMessage);
    res.status(200).send(successMessage);
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});