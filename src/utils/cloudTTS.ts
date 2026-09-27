// src/utils/cloudTTS.ts

export type TTSProvider = 'browser' | 'google' | 'azure' | 'elevenlabs';

// Hardcoded voices for cloud providers (can be expanded later)
export const CLOUD_VOICES = {
    google: [
        { id: 'bn-BD-Wavenet-A', name: 'Google Cloud Wavenet Bengali (Bangladesh) Male', lang: 'bn-BD' },
        { id: 'bn-BD-Wavenet-B', name: 'Google Cloud Wavenet Bengali (Bangladesh) Female', lang: 'bn-BD' },
        { id: 'bn-IN-Wavenet-A', name: 'Google Cloud Wavenet Bengali (India) Female', lang: 'bn-IN' },
        { id: 'bn-IN-Wavenet-B', name: 'Google Cloud Wavenet Bengali (India) Male', lang: 'bn-IN' },
        { id: 'en-US-Neural2-F', name: 'Google Cloud Neural2 English (US) Female', lang: 'en-US' },
        { id: 'en-US-Neural2-J', name: 'Google Cloud Neural2 English (US) Male', lang: 'en-US' },
    ],
    azure: [
        { id: 'bn-BD-NabanitaNeural', name: 'Azure Nabanita (Bengali Bangladesh Female)', lang: 'bn-BD' },
        { id: 'bn-BD-PradeepNeural', name: 'Azure Pradeep (Bengali Bangladesh Male)', lang: 'bn-BD' },
        { id: 'bn-IN-TanishaaNeural', name: 'Azure Tanishaa (Bengali India Female)', lang: 'bn-IN' },
        { id: 'bn-IN-BashkarNeural', name: 'Azure Bashkar (Bengali India Male)', lang: 'bn-IN' },
        { id: 'en-US-AriaNeural', name: 'Azure Aria (English US Female)', lang: 'en-US' },
        { id: 'en-US-GuyNeural', name: 'Azure Guy (English US Male)', lang: 'en-US' },
    ],
    elevenlabs: [
        // Users can add their custom ElevenLabs Voice IDs here. These are some generic defaults.
        { id: '4O1sYUnmtThcBoSBrri7', name: 'Custom Added Voice', lang: 'multi' },
        { id: 'TWutjvRaJqAX89preB4e', name: 'Evan - Calm, Grounded & Reflective', lang: 'multi' },
        { id: 'DGzg6RaUqxGRTHSBjfgF', name: 'Custom Voice 3', lang: 'multi' },
        { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam (Deep, Professional)', lang: 'multi' },
        { id: 'hpp4J3VqNfWAUOO0d1Us', name: 'Bella (Soft, Calm)', lang: 'multi' },
        { id: 'IKne3meq5aSn9XLyUdCD', name: 'Charlie (Casual, Conversational)', lang: 'multi' },
        { id: 'onwK4e9ZLuTAKqWW03F9', name: 'Daniel (Authoritative, News)', lang: 'multi' },
        { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Rachel (Clear, Pleasant)', lang: 'multi' },
        { id: 'ThT5KcBeYPX3keUQqHPh', name: 'Dorothy (Pleasant, British)', lang: 'multi' },
        { id: 'ErXwobaYiN019PkySvjV', name: 'Antoni (Well-rounded)', lang: 'multi' },
        { id: 'MF3mGyEYCl7XYWbV9V6O', name: 'Elli (Emotional, Clear)', lang: 'multi' },
        { id: 'VR6AewLTigWG4xSOukaG', name: 'Rachel (Warm, Expressive)', lang: 'multi' },
        { id: '2EiwWnXFnvU5JabPnv8n', name: 'Clyde (War veteran)', lang: 'multi' }
    ]
};

export const fetchCloudTTS = async (provider: string, text: string, voiceId: string, rate: number = 1, modelId: string = '') => {
    const response = await fetch('/api/tts', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            provider,
            text,
            voiceId,
            rate,
            modelId
        })
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `TTS API Error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.audioDataUrl;
};
