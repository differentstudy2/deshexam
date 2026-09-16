'use client';
import React, { useState, useRef, useEffect } from 'react';
import {
    MonitorPlay,
    Video,
    Mic,
    Wand2,
    CheckCircle2,
    Download,
    Play,
    Languages,
    FileQuestion,
    ChevronDown,
    Star,
    Square
} from 'lucide-react';

export default function ScreenRecorderPage() {
    const [isRecording, setIsRecording] = useState(false);
    const [recordingQuality, setRecordingQuality] = useState<'standard' | 'high' | 'ultra' | '4k'>('high');
    const [recordingTime, setRecordingTime] = useState(0);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const recordedChunksRef = useRef<BlobPart[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Timer logic
    useEffect(() => {
        if (isRecording) {
            timerRef.current = setInterval(() => setRecordingTime(t => t + 1), 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
            setRecordingTime(0);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isRecording]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const toggleRecording = async () => {
        if (isRecording) {
            // Stop recording
            if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
                mediaRecorderRef.current.stop();
            }
            return;
        }

        // Start recording
        try {
            // Configure Quality Constraints
            let frameRate = 60;
            let width = 1920;
            let height = 1080;
            let bitsPerSecond = 8000000;

            if (recordingQuality === 'standard') {
                frameRate = 30; width = 1280; height = 720; bitsPerSecond = 2500000;
            } else if (recordingQuality === 'ultra') {
                width = 2560; height = 1440; bitsPerSecond = 12000000;
            } else if (recordingQuality === '4k') {
                width = 3840; height = 2160; bitsPerSecond = 20000000;
            }

            // 1. Get Screen & Tab/System Audio
            const displayStream = await navigator.mediaDevices.getDisplayMedia({
                video: { 
                    displaySurface: 'browser',
                } as any,
                audio: true,
                selfBrowserSurface: 'include' // Still include current tab just in case
            } as any);

            // 2. Get Microphone Audio
            let micStream: MediaStream | null = null;
            try {
                micStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
            } catch (err) {
                console.warn("Microphone not available or permission denied.", err);
            }

            // 3. Mix Audio Tracks using AudioContext
            let finalStream = displayStream;
            
            const hasDisplayAudio = displayStream.getAudioTracks().length > 0;
            const hasMicAudio = micStream && micStream.getAudioTracks().length > 0;

            if (hasDisplayAudio || hasMicAudio) {
                const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
                if (AudioContextClass) {
                    const audioCtx = new AudioContextClass();
                    const dest = audioCtx.createMediaStreamDestination();

                    if (hasDisplayAudio) {
                        const displaySource = audioCtx.createMediaStreamSource(new MediaStream([displayStream.getAudioTracks()[0]]));
                        displaySource.connect(dest);
                    }

                    if (hasMicAudio && micStream) {
                        const micSource = audioCtx.createMediaStreamSource(micStream);
                        micSource.connect(dest);
                    }

                    const mixedTracks = dest.stream.getAudioTracks();
                    
                    finalStream = new MediaStream([
                        displayStream.getVideoTracks()[0],
                        ...(mixedTracks.length > 0 ? mixedTracks : [])
                    ]);
                } else {
                    console.warn("AudioContext not supported, falling back to basic stream");
                }
            }

            // Stop event for when user clicks "Stop Sharing" on Chrome's native bar
            displayStream.getVideoTracks()[0].onended = () => {
                if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
                    mediaRecorderRef.current.stop();
                }
            };

            // Setup MediaRecorder
            let mimeType = 'video/webm;codecs=vp9,opus';
            if (!MediaRecorder.isTypeSupported(mimeType)) {
                mimeType = 'video/webm;codecs=vp8,opus';
                if (!MediaRecorder.isTypeSupported(mimeType)) {
                    mimeType = 'video/webm';
                }
            }

            const mediaRecorder = new MediaRecorder(finalStream, { mimeType, videoBitsPerSecond: bitsPerSecond });
            mediaRecorderRef.current = mediaRecorder;
            recordedChunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    recordedChunksRef.current.push(e.data);
                }
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(recordedChunksRef.current, { type: mimeType });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                document.body.appendChild(a);
                a.style.display = 'none';
                a.href = url;
                const dateStr = new Date().toISOString().slice(0, 10);
                a.download = `ScreenRecord_${recordingQuality.toUpperCase()}_${dateStr}.webm`;
                a.click();
                window.URL.revokeObjectURL(url);
                setIsRecording(false);
                
                // Cleanup tracks
                finalStream.getTracks().forEach(track => track.stop());
                displayStream.getTracks().forEach(track => track.stop());
                if (micStream) micStream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start(1000); // collect 1s chunks
            setIsRecording(true);
        } catch (err) {
            console.error("Recording error: ", err);
            setIsRecording(false);
        }
    };


    return (
        <div className="min-h-screen bg-white font-sans text-gray-900 selection:bg-pink-500 selection:text-white">
            
            {/* FLOATING RECORDING CONTROL BAR */}
            {isRecording && (
                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] bg-gray-900 text-white rounded-full shadow-2xl px-6 py-3 flex items-center gap-6 animate-in slide-in-from-bottom-10 border border-gray-800">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]"></div>
                        <span className="font-mono text-lg font-bold tracking-wider">{formatTime(recordingTime)}</span>
                    </div>
                    <button 
                        onClick={toggleRecording}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full font-bold flex items-center gap-2 transition-colors"
                    >
                        <Square className="w-4 h-4 fill-white" />
                        Stop Recording
                    </button>
                </div>
            )}

            {/* HERO SECTION */}
            <section className={`pt-24 pb-16 px-4 md:px-8 max-w-7xl mx-auto transition-opacity duration-500 ${isRecording ? 'opacity-30 pointer-events-none' : ''}`}>
                <div className="flex flex-col lg:flex-row items-start justify-between gap-16">
                    {/* Left Column */}
                    <div className="flex-1 animate-in slide-in-from-left-8 fade-in duration-700">
                        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900 mb-6 leading-[1.1]">
                            Free online screen <br className="hidden md:block" /> recorder
                        </h1>
                        <p className="text-lg text-gray-600 mb-8 max-w-xl leading-relaxed">
                            The fastest, easiest way to capture high-quality videos of your screen, camera, or both. No downloads necessary. Start recording instantly right inside your browser.
                        </p>
                        
                        <div className="flex flex-col sm:flex-row items-center gap-4">
                            <button 
                                onClick={toggleRecording}
                                className="group relative px-8 py-4 bg-transparent border-2 border-pink-500 text-pink-600 font-bold rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 w-full sm:w-auto text-lg text-center inline-flex items-center justify-center gap-2"
                            >
                                <span className="absolute inset-0 bg-pink-500 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-0"></span>
                                <span className="relative z-10 group-hover:text-white transition-colors duration-300 flex items-center gap-2">
                                    <MonitorPlay className="w-5 h-5" />
                                    Start Recorder
                                </span>
                            </button>
                            
                            <select
                                value={recordingQuality}
                                onChange={(e) => setRecordingQuality(e.target.value as any)}
                                className="px-4 py-4 w-full sm:w-auto bg-gray-50 border-2 border-gray-200 text-gray-700 font-bold rounded-xl shadow-sm outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all cursor-pointer"
                            >
                                <option value="standard">Standard (720p)</option>
                                <option value="high">High (1080p)</option>
                                <option value="ultra">Ultra (1440p)</option>
                                <option value="4k">4K (2160p)</option>
                            </select>
                        </div>
                        
                        <p className="text-xs text-gray-400 mt-6 uppercase tracking-wider font-semibold">
                            Supports Windows, Mac, Chrome, Edge, Linux
                        </p>
                    </div>

                    {/* Right Column */}
                    <div className="flex-1 animate-in slide-in-from-right-8 fade-in duration-700 delay-150">
                        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6">
                            Free desktop screen recorder & editor
                        </h2>
                        <ul className="space-y-4 mb-8">
                            <li className="flex items-center gap-3 text-gray-700 font-medium">
                                <CheckCircle2 className="w-6 h-6 text-pink-500 shrink-0" />
                                <span>Record any part of your screen</span>
                            </li>
                            <li className="flex items-center gap-3 text-gray-700 font-medium">
                                <CheckCircle2 className="w-6 h-6 text-pink-500 shrink-0" />
                                <span>Add text, shapes, cut tools and more to video</span>
                            </li>
                            <li className="flex items-center gap-3 text-gray-700 font-medium">
                                <CheckCircle2 className="w-6 h-6 text-pink-500 shrink-0" />
                                <span>Share directly to YouTube, Drive, & others</span>
                            </li>
                        </ul>
                        <button className="px-8 py-4 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-xl shadow-lg hover:shadow-pink-500/25 transition-all duration-300 w-full sm:w-auto text-lg flex items-center justify-center gap-2">
                            <Download className="w-5 h-5" />
                            Download Free App
                        </button>
                        <p className="text-xs text-gray-400 mt-4 tracking-wide font-medium">
                            Available for Windows, Mac, iOS, Android
                        </p>
                    </div>
                </div>
            </section>

            <div className={`transition-opacity duration-500 ${isRecording ? 'opacity-30 pointer-events-none' : ''}`}>
                {/* STATS BANNER */}
                <section className="bg-gray-50 border-y border-gray-100 py-12 px-4">
                    <div className="max-w-6xl mx-auto text-center">
                        <h3 className="text-2xl font-bold text-gray-800 mb-8">
                            200,000,000+ videos captured and counting.
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm font-semibold text-gray-600">
                            <div className="flex items-center justify-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Easy screen capture</div>
                            <div className="flex items-center justify-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Great for tutorials</div>
                            <div className="flex items-center justify-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> 100% Free & Safe</div>
                            <div className="flex items-center justify-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> High Quality Export</div>
                        </div>
                    </div>
                </section>

                {/* FEATURES SECTION (Blue) */}
                <section className="bg-blue-600 text-white py-20 px-4">
                    <div className="max-w-7xl mx-auto text-center">
                        <h2 className="text-3xl md:text-4xl font-extrabold mb-16">Online screen recorder features</h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 text-left">
                            {/* Feature 1 */}
                            <div className="group hover:-translate-y-2 transition-transform duration-300">
                                <MonitorPlay className="w-10 h-10 mb-4 text-blue-200 group-hover:text-white transition-colors" />
                                <h3 className="text-xl font-bold mb-3">Record screen</h3>
                                <p className="text-blue-100 text-sm leading-relaxed">
                                    Capture your entire screen, a specific window, or a single Chrome tab seamlessly.
                                </p>
                            </div>
                            {/* Feature 2 */}
                            <div className="group hover:-translate-y-2 transition-transform duration-300">
                                <Video className="w-10 h-10 mb-4 text-blue-200 group-hover:text-white transition-colors" />
                                <h3 className="text-xl font-bold mb-3">Record camera</h3>
                                <p className="text-blue-100 text-sm leading-relaxed">
                                    Add a personal touch by overlaying your webcam in the corner of your video.
                                </p>
                            </div>
                            {/* Feature 3 */}
                            <div className="group hover:-translate-y-2 transition-transform duration-300">
                                <Mic className="w-10 h-10 mb-4 text-blue-200 group-hover:text-white transition-colors" />
                                <h3 className="text-xl font-bold mb-3">Record audio</h3>
                                <p className="text-blue-100 text-sm leading-relaxed">
                                    Narrate with your microphone and capture system audio simultaneously.
                                </p>
                            </div>
                            {/* Feature 4 */}
                            <div className="group hover:-translate-y-2 transition-transform duration-300">
                                <Wand2 className="w-10 h-10 mb-4 text-blue-200 group-hover:text-white transition-colors" />
                                <h3 className="text-xl font-bold mb-3">Add effects</h3>
                                <p className="text-blue-100 text-sm leading-relaxed">
                                    Highlight clicks, draw on screen, and use dynamic animations while recording.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* SHOWCASE SECTION */}
                <section className="py-24 px-4 bg-gray-50">
                    <div className="max-w-7xl mx-auto text-center">
                        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-12">
                            One app to capture, edit, and share
                        </h2>
                        
                        <div className="bg-gradient-to-br from-pink-600 to-rose-700 rounded-3xl p-8 md:p-12 text-left flex flex-col lg:flex-row items-center gap-12 shadow-2xl relative overflow-hidden">
                            {/* Background pattern */}
                            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                            
                            <div className="flex-1 text-white z-10">
                                <h3 className="text-2xl font-bold mb-6">
                                    Get feature-rich recording & editing with our desktop app for Windows & Mac
                                </h3>
                                <div className="space-y-6">
                                    <div>
                                        <h4 className="font-bold text-pink-200 mb-2">Flexible screen recording:</h4>
                                        <ul className="space-y-2">
                                            <li className="flex items-center gap-2 text-sm"><CheckCircle2 className="w-4 h-4 text-pink-300" /> Custom capture frame</li>
                                            <li className="flex items-center gap-2 text-sm"><CheckCircle2 className="w-4 h-4 text-pink-300" /> Record offline (no internet)</li>
                                            <li className="flex items-center gap-2 text-sm"><CheckCircle2 className="w-4 h-4 text-pink-300" /> Draw and zoom while recording</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-pink-200 mb-2">Easy video editing:</h4>
                                        <ul className="space-y-2">
                                            <li className="flex items-center gap-2 text-sm"><CheckCircle2 className="w-4 h-4 text-pink-300" /> Mix tracks and transition scenes</li>
                                            <li className="flex items-center gap-2 text-sm"><CheckCircle2 className="w-4 h-4 text-pink-300" /> Add music, shapes, text and more</li>
                                            <li className="flex items-center gap-2 text-sm"><CheckCircle2 className="w-4 h-4 text-pink-300" /> Green screen & blurs</li>
                                        </ul>
                                    </div>
                                </div>
                                <button className="mt-8 px-6 py-3 bg-white text-pink-600 hover:bg-pink-50 font-bold rounded-xl shadow-lg transition-colors">
                                    Download desktop free
                                </button>
                            </div>
                            
                            <div className="flex-1 z-10 w-full relative">
                                {/* Abstract Mockup UI */}
                                <div className="bg-gray-100 rounded-xl shadow-2xl overflow-hidden border border-gray-200/50 aspect-video relative flex flex-col">
                                    <div className="h-8 bg-gray-200 flex items-center px-4 gap-2">
                                        <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                        <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                                        <div className="w-3 h-3 rounded-full bg-green-400"></div>
                                    </div>
                                    <div className="flex-1 bg-white p-4 relative">
                                        {/* Fake Timeline */}
                                        <div className="absolute bottom-4 left-4 right-4 h-24 bg-gray-50 rounded-lg border border-gray-200 flex flex-col p-2 gap-2">
                                            <div className="h-4 bg-indigo-200 rounded w-full"></div>
                                            <div className="h-4 bg-pink-200 rounded w-3/4"></div>
                                            <div className="h-4 bg-blue-200 rounded w-1/2"></div>
                                        </div>
                                        {/* Fake Video Preview */}
                                        <div className="w-2/3 h-32 mx-auto mt-4 bg-gradient-to-r from-cyan-100 to-blue-100 rounded-lg border border-gray-200 flex items-center justify-center">
                                            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center shadow-lg cursor-pointer">
                                                <Play className="w-5 h-5 text-white ml-1" />
                                            </div>
                                        </div>
                                    </div>
                                    {/* Speaker Mockup overlay */}
                                    <div className="absolute bottom-6 right-6 w-32 h-32 bg-gray-300 rounded-lg shadow-xl overflow-hidden border-4 border-white object-cover">
                                        <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200&h=200" alt="Presenter" className="w-full h-full object-cover" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* AI VIDEO TOOLS SECTION */}
                <section className="bg-gradient-to-br from-indigo-900 via-purple-800 to-blue-700 py-24 px-4 text-center">
                    <div className="max-w-7xl mx-auto">
                        <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-16">
                            Save time with AI video tools
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {/* Card 1 */}
                            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-left hover:bg-white/15 transition-all duration-300 cursor-pointer group">
                                <div className="aspect-video bg-gray-900 rounded-xl mb-6 overflow-hidden relative">
                                    <img src="https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&q=80&w=600" alt="Captions" className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700" />
                                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur text-white px-4 py-1.5 rounded-full text-xs font-bold border border-white/10">Auto-generating...</div>
                                </div>
                                <h3 className="text-white font-bold text-xl mb-2 flex items-center gap-2"><MonitorPlay className="w-5 h-5 text-pink-400" /> One-click captions</h3>
                                <p className="text-blue-100 text-sm">
                                    Easily turn voice into text to automatically generate video subtitles, captions, and chapters.
                                </p>
                            </div>
                            {/* Card 2 */}
                            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-left hover:bg-white/15 transition-all duration-300 cursor-pointer group">
                                <div className="aspect-video bg-gray-900 rounded-xl mb-6 overflow-hidden relative">
                                    <img src="https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?auto=format&fit=crop&q=80&w=600" alt="Languages" className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4">
                                        <div className="bg-blue-600 text-white px-3 py-1 rounded text-xs font-bold shadow-lg">Spanish (Español)</div>
                                    </div>
                                </div>
                                <h3 className="text-white font-bold text-xl mb-2 flex items-center gap-2"><Languages className="w-5 h-5 text-pink-400" /> Global languages</h3>
                                <p className="text-blue-100 text-sm">
                                    Reach new audiences. Translate subtitles and text overlays into over 100+ languages in a single click.
                                </p>
                            </div>
                            {/* Card 3 */}
                            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-left hover:bg-white/15 transition-all duration-300 cursor-pointer group">
                                <div className="aspect-video bg-gray-900 rounded-xl mb-6 overflow-hidden relative">
                                    <img src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=600" alt="Assessments" className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700" />
                                    <div className="absolute bottom-6 right-6 bg-white rounded-lg p-3 shadow-xl max-w-[150px]">
                                        <div className="text-xs font-bold text-gray-800 mb-1">Generate quiz?</div>
                                        <div className="h-6 bg-pink-100 text-pink-600 rounded flex items-center justify-center text-[10px] font-bold cursor-pointer">Yes, generate!</div>
                                    </div>
                                </div>
                                <h3 className="text-white font-bold text-xl mb-2 flex items-center gap-2"><FileQuestion className="w-5 h-5 text-pink-400" /> Easy assessments</h3>
                                <p className="text-blue-100 text-sm">
                                    Let AI write the quiz for you. Generative AI automatically extracts key concepts to create MCQs.
                                </p>
                            </div>
                        </div>
                        
                        <button className="mt-12 px-8 py-4 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-xl shadow-lg transition-colors">
                            Get started for free
                        </button>
                    </div>
                </section>

                {/* TRUST & FAQ SECTION */}
                <section className="py-24 px-4 bg-white max-w-4xl mx-auto">
                    <div className="text-center mb-20">
                        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6">
                            DeshExam desktop recorder — used, trusted, loved.
                        </h2>
                        <div className="flex justify-center gap-1 mb-4">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <Star key={i} className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                            ))}
                        </div>
                        <p className="text-gray-500 text-sm">Loved by thousands of students & educators.</p>
                        
                        <div className="mt-10 bg-blue-50/50 rounded-2xl p-8 border border-blue-100 text-center">
                            <h4 className="font-bold text-gray-800 mb-4">Frees up my time</h4>
                            <p className="text-gray-600 text-sm italic mb-4 max-w-2xl mx-auto">
                                "With this recorder, I've been able to extend my reach online as an educator in an easy and reliable way. 
                                I love the clean UI and the audio mixing features. It saves me so much time producing high-quality content."
                            </p>
                            <p className="text-xs font-bold text-gray-800 uppercase tracking-wide">SHAHIN ALOM – EDUCATOR & CONTENT CREATOR</p>
                        </div>
                    </div>

                    {/* FAQ Accordion Placeholder */}
                    <div className="border-t border-gray-100 pt-20">
                        <h2 className="text-3xl font-extrabold text-gray-900 mb-10 text-center">
                            Frequently asked questions
                        </h2>
                        <div className="space-y-3">
                            {[
                                "What's included in the free online screen recorder?",
                                "Is the online screen recorder secure and private?",
                                "Is there a watermark on the free online screen recorder?",
                                "Which browsers are supported?",
                                "Is a screen recording downloadable?",
                                "How do I share my screen recording?",
                                "How do I record my screen?",
                                "How do I record my webcam and screen?",
                                "How can I record my screen with audio?",
                                "How do I screen record on Windows or Mac OS?"
                            ].map((q, i) => (
                                <div key={i} className="bg-blue-600 text-white rounded-lg px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-blue-700 transition-colors shadow-sm">
                                    <span className="font-bold text-sm">{q}</span>
                                    <ChevronDown className="w-5 h-5 text-blue-200" />
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
