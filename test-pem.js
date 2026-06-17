require('dotenv').config({ path: '.env.local' });
const serviceAccountStr = process.env.GCP_SA_KEY || '{}';
console.log("Raw string:", serviceAccountStr.slice(0, 100));
const serviceAccount = JSON.parse(serviceAccountStr);
console.log("Parsed private key has actual newlines?", serviceAccount.private_key.includes('\n'));
console.log("Parsed private key has literal \\n?", serviceAccount.private_key.includes('\\n'));
console.log("Parsed private key exact:", JSON.stringify(serviceAccount.private_key.slice(0, 50)));
