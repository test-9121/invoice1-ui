import { useState, useEffect, useCallback, useRef } from 'react';

interface UseSpeechRecognitionProps {
  language?: string;
}

interface SpeechRecognitionResult {
  isRecording: boolean;
  transcript: string;
  interimTranscript: string;
  error: string | null;
  isSupported: boolean;
  startRecording: () => void;
  stopRecording: () => void;
  resetTranscript: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export const useSpeechRecognition = ({
  language = 'en-IN',
}: UseSpeechRecognitionProps = {}): SpeechRecognitionResult => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);

  const recognitionRef = useRef<any>(null);
  const transcriptRef = useRef<string>('');
  const isStoppedManually = useRef<boolean>(false);
  const retryCount = useRef<number>(0);
  const maxRetries = 3;

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setIsSupported(false);
      setError('Speech recognition not supported. Use Chrome, Edge, or Safari.');
      return;
    }

    setIsSupported(true);
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language;

    recognition.onstart = () => {
      console.log('Recording started');
      setIsRecording(true);
      setError(null);
    };

    recognition.onresult = (event: any) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text = event.results[i][0].transcript;
        
        if (event.results[i].isFinal) {
          final += text + ' ';
        } else {
          interim += text;
        }
      }

      if (final) {
        transcriptRef.current += final;
        setTranscript(transcriptRef.current);
        setInterimTranscript('');
      }
      
      if (interim) {
        setInterimTranscript(interim);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Error:', event.error);
      
      // Ignore no-speech and aborted errors
      if (event.error === 'no-speech') {
        console.log('No speech detected, continuing...');
        return;
      }
      
      if (event.error === 'aborted') {
        return;
      }

      let errorMsg = 'Speech recognition error';
      
      if (event.error === 'not-allowed') {
        errorMsg = 'Microphone permission denied. Please allow microphone access in your browser.';
        setError(errorMsg);
        setIsRecording(false);
        isStoppedManually.current = true;
      } else if (event.error === 'network') {
        retryCount.current += 1;
        console.warn(`Network error (attempt ${retryCount.current}/${maxRetries})`);
        
        if (retryCount.current >= maxRetries) {
          errorMsg = 'Unable to connect to speech recognition service. Please check your internet connection and try again.';
          setError(errorMsg);
          setIsRecording(false);
          isStoppedManually.current = true;
        }
        return;
      } else {
        setError(errorMsg);
        setIsRecording(false);
        isStoppedManually.current = true;
      }
    };

    recognition.onend = () => {
      console.log('Recording ended');
      
      // If stopped manually by user or max retries reached, don't restart
      if (isStoppedManually.current || retryCount.current >= maxRetries) {
        setIsRecording(false);
        setInterimTranscript('');
        isStoppedManually.current = false;
        retryCount.current = 0;
        return;
      }
      
      // Auto-restart if still supposed to be recording
      if (recognitionRef.current) {
        try {
          console.log('Auto-restarting recognition...');
          setTimeout(() => {
            if (recognitionRef.current && !isStoppedManually.current && retryCount.current < maxRetries) {
              recognitionRef.current.start();
            }
          }, 100);
        } catch (e) {
          console.error('Failed to restart:', e);
          setIsRecording(false);
          setInterimTranscript('');
          retryCount.current = 0;
        }
      } else {
        setIsRecording(false);
        setInterimTranscript('');
        retryCount.current = 0;
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }
    };
  }, [language]);

  const startRecording = useCallback(() => {
    if (!isSupported || !recognitionRef.current) {
      setError('Speech recognition not available');
      return;
    }

    if (isRecording) {
      return;
    }

    try {
      transcriptRef.current = '';
      setTranscript('');
      setInterimTranscript('');
      setError(null);
      isStoppedManually.current = false;
      retryCount.current = 0;
      recognitionRef.current.start();
    } catch (err) {
      console.error('Start error:', err);
      setError('Failed to start recording');
    }
  }, [isSupported, isRecording]);

  const stopRecording = useCallback(() => {
    if (!recognitionRef.current || !isRecording) {
      return;
    }

    try {
      isStoppedManually.current = true;
      recognitionRef.current.stop();
    } catch (err) {
      console.error('Stop error:', err);
    }
  }, [isRecording]);

  const resetTranscript = useCallback(() => {
    transcriptRef.current = '';
    setTranscript('');
    setInterimTranscript('');
    setError(null);
  }, []);

  return {
    isRecording,
    transcript,
    interimTranscript,
    error,
    isSupported,
    startRecording,
    stopRecording,
    resetTranscript,
  };
};
