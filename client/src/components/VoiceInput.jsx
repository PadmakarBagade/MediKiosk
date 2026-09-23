import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, RotateCcw, AlertCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const VoiceInput = ({ value, onChange, placeholder, isTextarea = false, rows = 3 }) => {
  const { t, getSpeechLocale } = useLanguage();
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = getSpeechLocale();

      recognition.onstart = () => {
        setIsListening(true);
        setErrorMessage('');
      };

      recognition.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          }
        }

        if (finalTranscript) {
          const newText = value ? `${value.trim()} ${finalTranscript.trim()}` : finalTranscript.trim();
          onChange(newText);
        }
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setErrorMessage('Microphone access was denied. Please allow microphone permissions or type below.');
        } else if (event.error === 'no-speech') {
          // No speech detected, ignore or reset
        } else {
          setErrorMessage(`Voice recognition error (${event.error}). You can continue by typing.`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } catch (e) {
      console.warn('Speech recognition init failed:', e);
      setIsSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [getSpeechLocale, value, onChange]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setErrorMessage('');
      try {
        recognitionRef.current.lang = getSpeechLocale();
        recognitionRef.current.start();
      } catch (err) {
        // Recognition might already be running
        recognitionRef.current.stop();
        setTimeout(() => {
          recognitionRef.current.start();
        }, 150);
      }
    }
  };

  const handleClear = () => {
    onChange('');
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  return (
    <div className="w-full space-y-3">
      {/* Speech recognition toggle bar */}
      <div className="flex items-center justify-between gap-3 flex-wrap bg-slate-50 p-2 rounded-2xl border border-slate-200">
        <div className="flex items-center gap-2">
          {isSupported ? (
            <button
              type="button"
              onClick={toggleListening}
              className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-bold text-base transition-all duration-200 shadow-sm ${
                isListening
                  ? 'bg-rose-600 text-white pulse-listening'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95'
              }`}
            >
              {isListening ? (
                <>
                  <MicOff className="w-5 h-5 animate-spin" />
                  <span>{t('stopListening')}</span>
                </>
              ) : (
                <>
                  <Mic className="w-5 h-5" />
                  <span>{t('tapToSpeak')}</span>
                </>
              )}
            </button>
          ) : (
            <span className="text-xs text-amber-700 flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
              <AlertCircle className="w-4 h-4" />
              {t('voiceUnavailable')}
            </span>
          )}

          {isListening && (
            <div className="flex items-center gap-2 text-rose-600 font-semibold text-sm animate-pulse">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span>
              {t('listening')}
            </div>
          )}
        </div>

        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-200 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t('retryVoice')} / Clear</span>
          </button>
        )}
      </div>

      {errorMessage && (
        <div className="text-xs text-rose-600 bg-rose-50 border border-rose-200 px-3 py-2 rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Editable input field */}
      {isTextarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className="w-full text-lg p-4 rounded-2xl border-2 border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none transition bg-white text-slate-900 resize-y"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full text-lg px-4 py-3.5 rounded-2xl border-2 border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none transition bg-white text-slate-900"
        />
      )}
    </div>
  );
};

export default VoiceInput;
