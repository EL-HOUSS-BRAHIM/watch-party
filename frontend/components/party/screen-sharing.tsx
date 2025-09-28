"use client"

import { Loader2, Monitor, Settings, User, Users } from "lucide-react"
import { useState, useRef, useEffect } from 'react'
import Image from "next/image"
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { useSocket } from '@/contexts/socket-context'

interface ScreenSharingProps {}
  partyId: string
  isHost: boolean
  participants: Array<{}
    id: string
    username: string
    avatar: string
    isScreenSharing: boolean
  }>
}

interface ScreenShareOptions {}
  video: boolean
  audio: boolean
  cursor: boolean
  quality: 'low' | 'medium' | 'high'
  frameRate: number
}

export function ScreenSharing({ partyId, isHost, participants }: ScreenSharingProps) {}
  const [isSharing, setIsSharing] = useState(false)
  const [isReceiving, setIsReceiving] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [activeSharer, setActiveSharer] = useState<string | null>(null)
  const [options, setOptions] = useState<ScreenShareOptions>({}
    video: true,
    audio: true,
    cursor: true,
    quality: 'medium',
    frameRate: 30
  })

  const localStreamRef = useRef<MediaStream | null>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null)
  const { socket } = useSocket()

  useEffect(() => {
    if (socket) {
      socket.on('screen-share-started', handleScreenShareStarted)
      socket.on('screen-share-stopped', handleScreenShareStopped)
      socket.on('screen-share-offer', handleScreenShareOffer)
      socket.on('screen-share-answer', handleScreenShareAnswer)
      socket.on('screen-share-ice-candidate', handleIceCandidate)
      return () => {}
        socket.off('screen-share-started')
        socket.off('screen-share-stopped')
        socket.off('screen-share-offer')
        socket.off('screen-share-answer')
        socket.off('screen-share-ice-candidate')
      }
    }
  }, [socket])

  useEffect(() => {
    return () => {}
      cleanup()
    }
  }, [])

  const getDisplayMedia = async (): Promise<MediaStream> => {}
    const constraints: MediaStreamConstraints = { video: {}
        width: { ideal: getResolution().width },
        height: { ideal: getResolution().height },
        frameRate: { ideal: options.frameRate }
      },
      audio: options.audio
    }

    return await navigator.mediaDevices.getDisplayMedia(constraints)
  }

  const getResolution = () => {}
    switch (options.quality) {
      case 'low':
        return { width: 1280, height: 720 }
      case 'medium':
        return { width: 1920, height: 1080 }
      case 'high':
        return { width: 2560, height: 1440 }
      default:
        return { width: 1920, height: 1080 }
    }
  }

  const startScreenShare = async () => {
    try {
      setLoading(true)
      setError(null)
      const stream = await getDisplayMedia()
      localStreamRef.current = stream
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
      }
      // Listen for stream end (user stops sharing via browser UI)
      stream.getVideoTracks()[0].onended = () => {}
        stopScreenShare()
      }
      // Create peer connection for sharing
      await createPeerConnection()
      setIsSharing(true)
      setActiveSharer('local')
      // Notify other participants
      socket?.emit('screen-share-start', {}
        partyId, 
        options: {}
          hasAudio: options.audio,
          quality: options.quality,
          frameRate: options.frameRate
        }
      })
    } catch (err) {
      console.error('Failed to start screen sharing:', error)
      setError('Failed to start screen sharing. Please check permissions.')
    } finally {
      setLoading(false)
    }
  }

  const stopScreenShare = () => {}
    cleanup()
    setIsSharing(false)
    setActiveSharer(null)
    socket?.emit('screen-share-stop', { partyId })
  }

  const cleanup = () => {}
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop())
      localStreamRef.current = null
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close()
      peerConnectionRef.current = null
    }
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null
    }
  }

  const createPeerConnection = async () => {
    const pc = new RTCPeerConnection({iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    })
    peerConnectionRef.current = pc
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {}
        pc.addTrack(track, localStreamRef.current!)
      })
    }
    pc.onicecandidate = (event) => {}
      if (event.candidate) {
        socket?.emit('screen-share-ice-candidate', {}
          candidate: event.candidate,
          partyId
        })
      }
    }
    pc.ontrack = (event) => {}
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0]
        setIsReceiving(true)
      }
    }
    // Create and send offer
    const offer = await pc.createOffer()
    await pc.setLocalDescription(offer)
    socket?.emit('screen-share-offer', { offer, partyId })
  }

  const handleScreenShareStarted = (data: { userId: string; username: string; options: unknown }) => {}
    setActiveSharer(data.userId)
    setIsReceiving(true)
  }

  const handleScreenShareStopped = () => {}
    setActiveSharer(null)
    setIsReceiving(false)
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null
    }
  }

  const handleScreenShareOffer = async (data: { offer: RTCSessionDescriptionInit; from: string }) => {}
    if (!peerConnectionRef.current) {
      peerConnectionRef.current = new RTCPeerConnection({iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      })
      peerConnectionRef.current.ontrack = (event) => {}
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0]
          setIsReceiving(true)
        }
      }
      peerConnectionRef.current.onicecandidate = (event) => {}
        if (event.candidate) {
          socket?.emit('screen-share-ice-candidate', {}
            candidate: event.candidate,
            partyId
          })
        }
      }
    }
    await peerConnectionRef.current.setRemoteDescription(data.offer)
    const answer = await peerConnectionRef.current.createAnswer()
    await peerConnectionRef.current.setLocalDescription(answer)
    socket?.emit('screen-share-answer', { answer, partyId })
  }

  const handleScreenShareAnswer = async (data: { answer: RTCSessionDescriptionInit }) => {}
    if (peerConnectionRef.current) {
      await peerConnectionRef.current.setRemoteDescription(data.answer)
    }
  }

  const handleIceCandidate = async (data: { candidate: RTCIceCandidateInit }) => {}
    if (peerConnectionRef.current) {
      await peerConnectionRef.current.addIceCandidate(data.candidate)
    }
  }

  const requestScreenShare = (userId: string) => {}
    socket?.emit('screen-share-request', { partyId, userId })
  }

  const stopRemoteScreenShare = (userId: string) => {}
    if (isHost) {
      socket?.emit('screen-share-force-stop', { partyId, userId })
    }
  }

  const toggleFullscreen = () => {}
    const video = isSharing ? localVideoRef.current : remoteVideoRef.current
    if (video) {
      if (document.fullscreenElement) {
        document.exitFullscreen()
      } else {}
        video.requestFullscreen()
      }
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Monitor className="h-5 w-5" />
              <span>Screen Sharing</span>
              {activeSharer && (
                <Badge variant="default">
                  {activeSharer === 'local' ? 'You are sharing' : 'Someone is sharing'}
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

          {showSettings && (
            <div className="space-y-4 p-4 border rounded-lg">
              <h4 className="font-medium">Screen Share Settings</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="include-audio">Include Audio</Label>
                  <Switch
                    id="include-audio"
                    checked={options.audio}
                    onCheckedChange={(checked) => 
                      setOptions(prev => ({ ...prev, audio: checked }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="show-cursor">Show Cursor</Label>
                  <Switch
                    id="show-cursor"
                    checked={options.cursor}
                    onCheckedChange={(checked) => 
                      setOptions(prev => ({ ...prev, cursor: checked }))
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Quality</Label>
                <Select
                  value={options.quality}
                  onValueChange={(value: 'low' | 'medium' | 'high') =>
                    setOptions(prev => ({ ...prev, quality: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low (720p)</SelectItem>
                    <SelectItem value="medium">Medium (1080p)</SelectItem>
                    <SelectItem value="high">High (1440p)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Frame Rate</Label>
                <Select
                  value={options.frameRate.toString()}
                  onValueChange={(value) =>
                    setOptions(prev => ({ ...prev, frameRate: parseInt(value) }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 FPS</SelectItem>
                    <SelectItem value="24">24 FPS</SelectItem>
                    <SelectItem value="30">30 FPS</SelectItem>
                    <SelectItem value="60">60 FPS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <div className="flex items-center justify-center space-x-2">
            {!isSharing && !activeSharer && (
              <Button
                onClick={startScreenShare}
                disabled={loading}
                className="flex items-center space-x-2"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Cast className="h-4 w-4" />
                )}
                <span>{loading ? &apos;Starting...&apos; : &apos;Share Screen'}</span>
              </Button>
            )}
            {isSharing && (
              <Button
                onClick={stopScreenShare}
                variant="destructive"
                className="flex items-center space-x-2"
              >
                <MonitorX className="h-4 w-4" />
                <span>Stop Sharing</span>
              </Button>
            )}
          </div>

          {/* Local screen share preview */}
          {isSharing && (
            <div className="relative">
              <video
                ref={localVideoRef}
                autoPlay
                muted
                className="w-full rounded-lg border"
                style={{ maxHeight: '300px', objectFit: 'contain' }}
              />
              <div className="absolute top-2 right-2 flex space-x-1">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={toggleFullscreen}
                >
                  <Maximize className="h-3 w-3" />
                </Button>
              </div>
              <div className="absolute bottom-2 left-2">
                <Badge>Your Screen</Badge>
              </div>
            </div>
          )}

          {/* Remote screen share viewer */}
          {isReceiving && !isSharing && (
            <div className="relative">
              <video
                ref={remoteVideoRef}
                autoPlay
                className="w-full rounded-lg border"
                style={{ maxHeight: '400px', objectFit: 'contain' }}
              />
              <div className="absolute top-2 right-2 flex space-x-1">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={toggleFullscreen}
                >
                  <Maximize className="h-3 w-3" />
                </Button>
                {isHost && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => activeSharer && stopRemoteScreenShare(activeSharer)}
                  >
                    <MonitorX className="h-3 w-3" />
                  </Button>
                )}
              </div>
              <div className="absolute bottom-2 left-2">
                <Badge>
                  {participants.find(p => p.id === activeSharer)?.username || &apos;Unknown&apos;}&apos;s Screen
                </Badge>
              </div>
            </div>
          )}

          {/* Participants list */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Participants</span>
            </h4>
            <div className="space-y-1">
              {participants.map((participant) => (
                <div key={participant.id} className="flex items-center justify-between p-2 rounded-md border">
                  <div className="flex items-center space-x-2">
                    <img
                      src={participant.avatar || '/placeholder-user.jpg'}
                      alt={participant.username}
                      className="w-6 h-6 rounded-full"
                    />
                    <span className="text-sm">{participant.username}</span>
                    {participant.isScreenSharing && (
                      <Badge variant="default" className="bg-blue-500">
                        <Monitor className="h-3 w-3 mr-1" />
                        Sharing
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center space-x-1">
                    {!participant.isScreenSharing && participant.id !== 'current-user' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => requestScreenShare(participant.id)}
                      >
                        <Cast className="h-3 w-3" />
                      </Button>
                    )}
                    {participant.isScreenSharing && isHost && participant.id !== 'current-user' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => stopRemoteScreenShare(participant.id)}
                      >
                        <MonitorX className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
