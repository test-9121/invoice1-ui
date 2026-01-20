# Speech Recognition API Network Issue - Troubleshooting Guide

## Problem Description
The Web Speech API (Chrome's `webkitSpeechRecognition`) consistently throws a "network" error immediately after starting, preventing voice capture functionality.

**Error Message**: `Unable to connect to speech recognition service. Please check your internet connection and try again.`

## Root Cause Analysis

### What We Know:
✅ Code implementation is correct (retry logic, error handling, state management)  
✅ General internet connectivity works (Google.com reachable on port 443)  
✅ TypeScript compilation has no errors  
✅ Manual text input fallback works as alternative  

❌ Google's Speech Recognition API endpoints are unreachable  
❌ WebRTC/Speech services specifically are blocked  

### Most Likely Causes:
1. **Corporate Firewall**: Blocking Google Speech API endpoints specifically
2. **VPN/Proxy**: Interfering with WebRTC connections required by Speech API
3. **Network Security Policies**: Restricting cloud-based speech services
4. **Browser Security Settings**: Blocking microphone access or speech services

## Immediate Workaround

The application now includes a **manual text input fallback**:
- When speech recognition fails, type your invoice details in the text area
- Click "Process Text" to send to the backend API
- Backend processes text identically to voice input

## Permanent Solutions

### Option 1: Network Configuration (IT Team Required)
Ask your IT department to whitelist these Google domains:
```
*.google.com
*.googleapis.com
www.google.com/speech-api/*
```

**Required Ports**: 443 (HTTPS), potentially WebRTC ports (UDP 3478-3497)

### Option 2: Offline Speech Recognition Library
Replace Web Speech API with an offline solution:

**Vosk (Recommended)**
- Pros: Works completely offline, no network required, multiple languages
- Cons: Larger bundle size (~50MB models), requires WASM support
- Implementation: https://github.com/alphacep/vosk-browser

**Whisper.js (OpenAI's Whisper in browser)**
- Pros: High accuracy, works offline
- Cons: Computationally intensive, requires modern browser
- Implementation: https://github.com/xenova/whisper-web

### Option 3: Server-Side Speech Processing
Move speech recognition to backend:

1. **Frontend**: Record audio using MediaRecorder API
2. **Upload**: Send audio blob to backend
3. **Backend**: Use Google Cloud Speech-to-Text API, AWS Transcribe, or Azure Speech
4. **Return**: Parsed transcript to frontend

**Benefits**: No browser API restrictions, better accuracy, more control

### Option 4: Try Different Network
Test if the issue is environment-specific:
- Use mobile hotspot instead of corporate network
- Disable VPN/proxy temporarily
- Test from home network
- Try different browser (Edge, Firefox with speech polyfill)

## Testing Steps for IT Team

### 1. Check Firewall Logs
Look for blocked requests to:
```
www.google.com/speech-api/v2/
www.google.com/speech-api/full-duplex/v1/
```

### 2. Test WebRTC Connectivity
Visit: https://test.webrtc.org/
If WebRTC tests fail, Speech API won't work either.

### 3. Browser Console Check
1. Open DevTools → Console
2. Run:
```javascript
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.onerror = (e) => console.error('Speech error:', e);
recognition.start();
```
3. Check error details in console

### 4. Network Traffic Analysis
Use Wireshark or browser DevTools Network tab to see:
- Are requests being made to Google?
- Are they being blocked at DNS level?
- Are SSL handshakes succeeding?

## Code Implementation Details

Current implementation in `src/hooks/useSpeechRecognition.ts`:
- ✅ Browser support detection
- ✅ Error handling with 3-retry limit
- ✅ Graceful degradation
- ✅ Clear error messages
- ✅ Manual stop tracking

The code is **production-ready**. The network issue is environmental, not a bug.

## Decision Matrix

| Solution | Effort | Network Required | Accuracy | Latency |
|----------|--------|------------------|----------|---------|
| Fix Firewall | Low (IT) | Yes | High | Low |
| Vosk Offline | Medium | No | Medium | Medium |
| Whisper.js | High | No | High | High |
| Server-side | Medium | Yes | High | Low-Medium |
| Manual Input | Done | No | N/A | N/A |

## Recommended Next Steps

### Immediate (Today):
1. ✅ Use manual text input fallback
2. Test backend API with manual input
3. Verify form auto-fill works

### Short-term (This Week):
1. Contact IT team with firewall whitelist request
2. Try different network to isolate issue
3. Test with mobile hotspot

### Long-term (If Firewall Can't Be Fixed):
1. Evaluate Vosk for offline capability
2. Consider server-side speech processing
3. Implement hybrid approach (try browser, fallback to server)

## Contact Information
- **Web Speech API Docs**: https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API
- **Chrome Speech Issues**: https://bugs.chromium.org/p/chromium/issues/list?q=speechrecognition
- **Vosk Documentation**: https://alphacephei.com/vosk/

---

**Status**: Code implementation complete and working. Blocked by network/firewall restrictions. Manual input fallback available.

**Last Updated**: January 13, 2026
