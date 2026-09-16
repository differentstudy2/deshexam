import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { provider, text, voiceId, rate = 1 } = body;

        if (!provider || !text || !voiceId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        let audioDataUrl = '';

        if (provider === 'google') {
            const apiKey = process.env.NEXT_PUBLIC_GOOGLE_TTS_API_KEY || process.env.GOOGLE_TTS_API_KEY;
            if (!apiKey) return NextResponse.json({ error: 'Google TTS API Key missing' }, { status: 500 });
            
            const lang = voiceId.substring(0, 5); // Extract 'bn-BD' or 'en-US'
            const response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    input: { text },
                    voice: { languageCode: lang, name: voiceId },
                    audioConfig: { audioEncoding: 'MP3', speakingRate: rate }
                })
            });

            if (!response.ok) {
                const err = await response.text();
                throw new Error(`Google TTS Error: ${response.statusText} - ${err}`);
            }
            const data = await response.json();
            audioDataUrl = `data:audio/mp3;base64,${data.audioContent}`;

        } else if (provider === 'azure') {
            const apiKey = process.env.NEXT_PUBLIC_AZURE_TTS_API_KEY || process.env.AZURE_TTS_API_KEY;
            const region = process.env.NEXT_PUBLIC_AZURE_REGION || process.env.AZURE_REGION || 'eastus';
            if (!apiKey) return NextResponse.json({ error: 'Azure TTS API Key missing' }, { status: 500 });

            const lang = voiceId.substring(0, 5);
            const ssml = `<speak version='1.0' xml:lang='${lang}'>
                <voice xml:lang='${lang}' name='${voiceId}'>
                    <prosody rate='${rate > 1 ? '+' + ((rate - 1) * 100) : ((rate - 1) * 100)}%'>
                        ${text}
                    </prosody>
                </voice>
            </speak>`;

            const response = await fetch(`https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`, {
                method: 'POST',
                headers: {
                    'Ocp-Apim-Subscription-Key': apiKey,
                    'Content-Type': 'application/ssml+xml',
                    'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3',
                },
                body: ssml
            });

            if (!response.ok) {
                const err = await response.text();
                throw new Error(`Azure TTS Error: ${response.statusText} - ${err}`);
            }
            
            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            audioDataUrl = `data:audio/mp3;base64,${buffer.toString('base64')}`;

        } else if (provider === 'elevenlabs') {
            const apiKey = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY || process.env.ELEVENLABS_API_KEY;
            if (!apiKey) return NextResponse.json({ error: 'ElevenLabs API Key missing' }, { status: 500 });

            const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
                method: 'POST',
                headers: {
                    'Accept': 'audio/mpeg',
                    'Content-Type': 'application/json',
                    'xi-api-key': apiKey
                },
                body: JSON.stringify({
                    text,
                    model_id: "eleven_multilingual_v2",
                    voice_settings: {
                        stability: 0.5,
                        similarity_boost: 0.5
                    }
                })
            });

            if (!response.ok) {
                const errBody = await response.text();
                throw new Error(`ElevenLabs TTS Error: ${response.status} ${response.statusText} - ${errBody}`);
            }
            
            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            audioDataUrl = `data:audio/mp3;base64,${buffer.toString('base64')}`;

        } else {
            return NextResponse.json({ error: 'Invalid provider' }, { status: 400 });
        }

        return NextResponse.json({ audioDataUrl });

    } catch (error: any) {
        console.error('TTS API Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
