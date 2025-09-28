'use client'

import { useState, useEffect, useRef } from 'react'
import Image from "next/image"
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Settings, 
  Users, 
  Phone, 
  PhoneOff,
  Headphones,
  Speaker,
  Waves,
  AlertCircle
} from 'lucide-react'
import { useSocket } from '@/contexts/socket-context'

interface VoiceChatProps {
  partyId: string
  isHost: boolean
  participants: Array<{
    id: string
    username: string
    avatar: string
    isMuted: boolean
    isDeafened: boolean
    isConnected: boolean
    volume: number
  }>
}

interface AudioDevice {
  deviceId: string
  kind: 'audioinput' | 'audiooutput'
  label: string
}

export function VoiceChat({ partyId, isHost, participants }: VoiceChatProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isDeafened, setIsDeafened] = useState(false)
  const [masterVolume, setMasterVolume] = useState([50])
  const [microphoneVolume, setMicrophoneVolume] = useState([50])
  const [audioDevices, setAudioDevices] = useState<AudioDevice[]>([])
  const [selectedMicrophone, setSelectedMicrophone] = useState<string>(&apos;')
  const [selectedSpeaker, setSelectedSpeaker] = useState<string>(&apos;')
  const [showSettings, setShowSettings] = useState(false)
  const [voiceActivity, setVoiceActivity] = useState<Record<string, boolean>>({})
  const [error, setError] = useState<string | null>(null)
  
  const localStreamRef = useRef<MediaStream | null>(null)
  const peerConnectionsRef = useRef<Record<string, RTCPeerConnection>>({})
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  
  const { socket } = useSocket()

  useEffect(() => {
    getAudioDevices()
    return () => {
      cleanup()
    }
  }, [])

  useEffect(() => {
    if (socket) {
      socket.on('voice-chat-user-joined', handleUserJoined)
      socket.on('voice-chat-user-left', handleUserLeft)
      socket.on('voice-chat-offer', handleOffer)
      socket.on('voice-chat-answer', handleAnswer)
      socket.on('voice-chat-ice-candidate', handleIceCandidate)
      socket.on('voice-chat-user-muted', handleUserMuted)

      return () => {
        socket.off('voice-chat-user-joined')
        socket.off('voice-chat-user-left')
        socket.off('voice-chat-offer')
        socket.off('voice-chat-answer')
        socket.off('voice-chat-ice-candidate')
        socket.off('voice-chat-user-muted')
      }
    }
  }, [socket])

  const getAudioDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      const audioDevices = devices.filter(device => 
        device.kind === 'audioinput' || device.kind === 'audiooutput'
      ) as AudioDevice[]
      setAudioDevices(audioDevices)
      
      // Set default devices
      const defaultMic = audioDevices.find(d => d.kind === &apos;audioinput')
      const defaultSpeaker = audioDevices.find(d => d.kind === 'audiooutput')
      if (defaultMic) setSelectedMicrophone(defaultMic.deviceId)
      if (defaultSpeaker) setSelectedSpeaker(defaultSpeaker.deviceId)
    } catch (error) {
      console.error('Failed to get audio devices:', error)
      setError('Failed to access audio devices')
    }
  }

  const connectToVoiceChat = async () => {
    try {
      setError(null)
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          deviceId: selectedMicrophone ? { exact: selectedMicrophone } : undefined,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      })
      
      localStreamRef.current = stream
      setupAudioAnalyzer(stream)
      setIsConnected(true)
      
      // Join voice chat room
      socket?.emit('join-voice-chat', { partyId })
      
    } catch (error) {
      console.error('Failed to connect to voice chat:', error)
      setError('Failed to access microphone. Please check permissions.')
    }
  }

  const disconnectFromVoiceChat = () => {
    cleanup()
    setIsConnected(false)
    socket?.emit('leave-voice-chat', { partyId })
  }

  const cleanup = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop())
      localStreamRef.current = null
    }
    
    Object.values(peerConnectionsRef.current).forEach(pc => pc.close())
    peerConnectionsRef.current = {}
    
    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }
  }

  const setupAudioAnalyzer = (stream: MediaStream) => {
    try {
      audioContextRef.current = new AudioContext()
      analyserRef.current = audioContextRef.current.createAnalyser()
      const source = audioContextRef.current.createMediaStreamSource(stream)
      source.connect(analyserRef.current)
      
      analyserRef.current.fftSize = 256
      startVoiceActivityDetection()
    } catch (error) {
      console.error('Failed to setup audio analyzer:', error)
    }
  }

  const startVoiceActivityDetection = () => {
    if (!analyserRef.current) return
    
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
    
    const detectActivity = () => {
      if (!analyserRef.current) return
      
      analyserRef.current.getByteFrequencyData(dataArray)
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length
      const isActive = average > 30 && !isMuted // Threshold for voice activity
      
      setVoiceActivity(prev => ({ ...prev, local: isActive }))
      
      if (isConnected) {
        requestAnimationFrame(detectActivity)
      }
    }
    
    detectActivity()
  }

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = isMuted
        setIsMuted(!isMuted)
        socket?.emit('voice-chat-toggle-mute', { partyId, isMuted: !isMuted })
      }
    }
  }

  const toggleDeafen = () => {
    setIsDeafened(!isDeafened)
    // Mute all remote audio when deafened
    Object.values(peerConnectionsRef.current).forEach((pc: RTCPeerConnection) => {
      pc.getReceivers().forEach((receiver: RTCRtpReceiver) => {
        if (receiver.track && receiver.track.kind === 'audio') {
          receiver.track.enabled = isDeafened
        }
      })
    })
  }

  const handleUserJoined = (data: { userId: string }) => {
    if (isConnected && localStreamRef.current) {
      createPeerConnection(data.userId)
    }
  }

  const handleUserLeft = (data: { userId: string }) => {
    if (peerConnectionsRef.current[data.userId]) {
      peerConnectionsRef.current[data.userId].close()
      delete peerConnectionsRef.current[data.userId]
    }
  }

  const handleOffer = async (data: { offer: RTCSessionDescriptionInit; from: string }) => {
    const pc = createPeerConnection(data.from)
    await pc.setRemoteDescription(data.offer)
    const answer = await pc.createAnswer()
    await pc.setLocalDescription(answer)
    socket?.emit('voice-chat-answer', { answer, to: data.from, partyId })
  }

  const handleAnswer = async (data: { answer: RTCSessionDescriptionInit; from: string }) => {
    const pc = peerConnectionsRef.current[data.from]
    if (pc) {
      await pc.setRemoteDescription(data.answer)
    }
  }

  const handleIceCandidate = async (data: { candidate: RTCIceCandidateInit; from: string }) => {
    const pc = peerConnectionsRef.current[data.from]
    if (pc) {
      await pc.addIceCandidate(data.candidate)
    }
  }

  const handleUserMuted = (data: { userId: string; isMuted: boolean }) => {
    setVoiceActivity(prev => ({ ...prev, [data.userId]: !data.isMuted }))
  }

  const createPeerConnection = (userId: string): RTCPeerConnection => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    })
    
    peerConnectionsRef.current[userId] = pc
    
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        pc.addTrack(track, localStreamRef.current!)
      })
    }
    
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket?.emit('voice-chat-ice-candidate', {
          candidate: event.candidate,
          to: userId,
          partyId
        })
      }
    }
    
    pc.ontrack = (event) => {
      const remoteAudio = new Audio()
      remoteAudio.srcObject = event.streams[0]
      remoteAudio.volume = masterVolume[0] / 100
      remoteAudio.play()
    }
    
    return pc
  }

  const muteUser = (userId: string) => {
    if (isHost) {
      socket?.emit('voice-chat-mute-user', { userId, partyId })
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Headphones className="h-5 w-5" />
            <span>Voice Chat</span>
            {isConnected && (
              <Badge variant="default" className="bg-green-500">
                Connected
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {error && (
          <div className="flex items-center space-x-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <span className="text-sm text-destructive">{error}</span>
          </div>
        )}

        <div className="flex items-center justify-center space-x-2">
          {!isConnected ? (
            <Button onClick={connectToVoiceChat} className="flex items-center space-x-2">
              <Phone className="h-4 w-4" />
              <span>Join Voice Chat</span>
            </Button>
          ) : (
            <Button 
              variant="destructive" 
              onClick={disconnectFromVoiceChat}
              className="flex items-center space-x-2"
            >
              <PhoneOff className="h-4 w-4" />
              <span>Leave Voice Chat</span>
            </Button>
          )}
        </div>

        {isConnected && (
          <>
            <div className="flex items-center justify-center space-x-2">
              <Button
                variant={isMuted ? "destructive" : "outline"}
                size="sm"
                onClick={toggleMute}
              >
                {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className=&quot;h-4 w-4" />}
              </Button>
              <Button
                variant={isDeafened ? "destructive" : "outline"}
                size="sm"
                onClick={toggleDeafen}
              >
                {isDeafened ? <VolumeX className="h-4 w-4" /> : <Volume2 className=&quot;h-4 w-4" />}
              </Button>
            </div>

            {showSettings && (
              <Tabs defaultValue="audio" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="audio">Audio</TabsTrigger>
                  <TabsTrigger value="devices">Devices</TabsTrigger>
                </TabsList>
                
                <TabsContent value="audio" className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Master Volume</label>
                    <Slider
                      value={masterVolume}
                      onValueChange={setMasterVolume}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Microphone Volume</label>
                    <Slider
                      value={microphoneVolume}
                      onValueChange={setMicrophoneVolume}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="devices" className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Microphone</label>
                    <select
                      value={selectedMicrophone}
                      onChange={(e) => setSelectedMicrophone(e.target.value)}
                      className="w-full p-2 border rounded-md"
                    >
                      {audioDevices
                        .filter(device => device.kind === &apos;audioinput')
                        .map(device => (
                          <option key={device.deviceId} value={device.deviceId}>
                            {device.label || `Microphone ${device.deviceId.slice(0, 8)}`}
                          </option>
                        ))}
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Speakers</label>
                    <select
                      value={selectedSpeaker}
                      onChange={(e) => setSelectedSpeaker(e.target.value)}
                      className="w-full p-2 border rounded-md"
                    >
                      {audioDevices
                        .filter(device => device.kind === &apos;audiooutput')
                        .map(device => (
                          <option key={device.deviceId} value={device.deviceId}>
                            {device.label || `Speaker ${device.deviceId.slice(0, 8)}`}
                          </option>
                        ))}
                    </select>
                  </div>
                </TabsContent>
              </Tabs>
            )}

            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>Voice Participants</span>
              </h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {participants
                  .filter(p => p.isConnected)
                  .map((participant) => (
                    <div key={participant.id} className="flex items-center justify-between p-2 rounded-md border">
                      <div className="flex items-center space-x-2">
                        <div className="relative">
                          <img
                            src={participant.avatar || '/placeholder-user.jpg'}
                            alt={participant.username}
                            className="w-6 h-6 rounded-full"
                          />
                          {voiceActivity[participant.id] && (
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse">
                              <Waves className="h-2 w-2 text-white" />
                            </div>
                          )}
                        </div>
                        <span className="text-sm">{participant.username}</span>
                        {participant.isMuted && <MicOff className="h-3 w-3 text-muted-foreground" />}
                        {participant.isDeafened && <VolumeX className="h-3 w-3 text-muted-foreground" />}
                      </div>
                      {isHost && participant.id !== 'current-user' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => muteUser(participant.id)}
                        >
                          <MicOff className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
