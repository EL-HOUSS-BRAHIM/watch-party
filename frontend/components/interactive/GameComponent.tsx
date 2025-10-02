"use client"

import { useState, useEffect } from "react"
import api from "@/lib/api-client"

interface GameSession {
  id: string
  game_type: string
  game_data: any
  is_active: boolean
  created_by: {
    id: string
    username: string
    avatar?: string
  }
  participants: Array<{
    id: string
    username: string
    avatar?: string
    score?: number
  }>
  created_at: string
  started_at?: string
  ended_at?: string
}

interface GameComponentProps {
  partyId: string
  currentUser?: any
  isHost?: boolean
}

const AVAILABLE_GAMES = [
  {
    type: "trivia",
    name: "Trivia Quiz",
    description: "Answer questions about movies, shows, and more",
    icon: "🧠"
  },
  {
    type: "guess_movie",
    name: "Guess the Movie",
    description: "Identify movies from screenshots or quotes",
    icon: "🎬"
  },
  {
    type: "emoji_movie",
    name: "Emoji Movies",
    description: "Guess movies from emoji clues",
    icon: "😎"
  },
  {
    type: "word_association",
    name: "Word Association",
    description: "Connect words related to what you're watching",
    icon: "💭"
  }
]

export default function GameComponent({ partyId, currentUser, isHost = false }: GameComponentProps) {
  const [currentGame, setCurrentGame] = useState<GameSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [showGameSelection, setShowGameSelection] = useState(false)
  const [starting, setStarting] = useState(false)

  useEffect(() => {
    loadCurrentGame()
    
    // Poll for updates every 10 seconds
    const interval = setInterval(loadCurrentGame, 10000)
    return () => clearInterval(interval)
  }, [partyId])

  const loadCurrentGame = async () => {
    try {
      const response = await api.get(`/parties/${partyId}/games/current/`)
      setCurrentGame(response)
    } catch (error) {
      if (error instanceof Error && error.message.includes("404")) {
        setCurrentGame(null)
      } else {
        console.error("Failed to load current game:", error)
      }
    } finally {
      setLoading(false)
    }
  }

  const startGame = async (gameType: string) => {
    setStarting(true)
    try {
      const response = await api.post(`/parties/${partyId}/games/`, {
        game_type: gameType
      })
      setCurrentGame(response)
      setShowGameSelection(false)
    } catch (error) {
      alert("Failed to start game: " + (error instanceof Error ? error.message : "Unknown error"))
    } finally {
      setStarting(false)
    }
  }

  const endGame = async () => {
    if (!currentGame || !confirm("Are you sure you want to end the current game?")) return

    try {
      await api.patch(`/parties/${partyId}/games/${currentGame.id}/`, {
        is_active: false
      })
      setCurrentGame(null)
    } catch (error) {
      alert("Failed to end game: " + (error instanceof Error ? error.message : "Unknown error"))
    }
  }

  const joinGame = async () => {
    if (!currentGame) return

    try {
      await api.post(`/parties/${partyId}/games/${currentGame.id}/join/`)
      await loadCurrentGame()
    } catch (error) {
      alert("Failed to join game: " + (error instanceof Error ? error.message : "Unknown error"))
    }
  }

  const leaveGame = async () => {
    if (!currentGame) return

    try {
      await api.post(`/parties/${partyId}/games/${currentGame.id}/leave/`)
      await loadCurrentGame()
    } catch (error) {
      alert("Failed to leave game: " + (error instanceof Error ? error.message : "Unknown error"))
    }
  }

  const isParticipant = currentGame?.participants.some(p => p.id === currentUser?.id) || false

  if (loading) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-white/10 rounded w-1/3"></div>
          <div className="h-20 bg-white/10 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Party Games</h3>
        {isHost && !currentGame && (
          <button
            onClick={() => setShowGameSelection(!showGameSelection)}
            className="px-4 py-2 bg-brand-purple hover:bg-brand-purple-dark text-white rounded-lg text-sm font-medium transition-colors"
          >
            {showGameSelection ? "Cancel" : "Start Game"}
          </button>
        )}
      </div>

      {/* Game Selection */}
      {showGameSelection && (
        <div className="mb-6 space-y-4">
          <h4 className="font-medium text-white">Choose a Game</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {AVAILABLE_GAMES.map((game) => (
              <button
                key={game.type}
                onClick={() => startGame(game.type)}
                disabled={starting}
                className="p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{game.icon}</span>
                  <div>
                    <h5 className="font-medium text-white">{game.name}</h5>
                    <p className="text-white/60 text-sm mt-1">{game.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Current Game */}
      {currentGame ? (
        <div className="space-y-4">
          <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">
                  {AVAILABLE_GAMES.find(g => g.type === currentGame.game_type)?.icon || "🎮"}
                </span>
                <div>
                  <h4 className="font-medium text-white">
                    {AVAILABLE_GAMES.find(g => g.type === currentGame.game_type)?.name || "Game"}
                  </h4>
                  <p className="text-white/60 text-sm">
                    Started by {currentGame.created_by.username}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {currentGame.is_active ? (
                  <span className="px-2 py-1 bg-green-600/20 text-brand-cyan-light text-xs rounded">
                    Active
                  </span>
                ) : (
                  <span className="px-2 py-1 bg-red-600/20 text-brand-coral-light text-xs rounded">
                    Ended
                  </span>
                )}
              </div>
            </div>

            {/* Participants */}
            <div className="mb-4">
              <h5 className="text-white/80 text-sm mb-2">
                Participants ({currentGame.participants.length})
              </h5>
              <div className="flex flex-wrap gap-2">
                {currentGame.participants.map((participant) => (
                  <div
                    key={participant.id}
                    className="flex items-center gap-2 px-3 py-1 bg-white/10 rounded-lg"
                  >
                    {participant.avatar && (
                      <img
                        src={participant.avatar}
                        alt={participant.username}
                        className="w-4 h-4 rounded-full"
                      />
                    )}
                    <span className="text-white text-sm">{participant.username}</span>
                    {typeof participant.score === "number" && (
                      <span className="text-white/60 text-xs">
                        ({participant.score} pts)
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Game Actions */}
            {currentGame.is_active && (
              <div className="flex gap-2">
                {!isParticipant ? (
                  <button
                    onClick={joinGame}
                    className="px-4 py-2 bg-brand-cyan hover:bg-green-700 text-white rounded-lg text-sm transition-colors"
                  >
                    Join Game
                  </button>
                ) : (
                  <button
                    onClick={leaveGame}
                    className="px-4 py-2 bg-brand-coral hover:bg-red-700 text-white rounded-lg text-sm transition-colors"
                  >
                    Leave Game
                  </button>
                )}

                {isHost && (
                  <button
                    onClick={endGame}
                    className="px-4 py-2 bg-brand-coral hover:bg-red-700 text-white rounded-lg text-sm transition-colors"
                  >
                    End Game
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Game Interface */}
          {currentGame.is_active && isParticipant && (
            <GameInterface
              game={currentGame}
              partyId={partyId}
              currentUser={currentUser}
              onUpdate={loadCurrentGame}
            />
          )}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="text-4xl mb-2">🎮</div>
          <p className="text-white/60">No active game</p>
          {isHost ? (
            <p className="text-white/40 text-sm mt-1">Start a game to engage your audience!</p>
          ) : (
            <p className="text-white/40 text-sm mt-1">Waiting for host to start a game</p>
          )}
        </div>
      )}
    </div>
  )
}

// Game Interface Component
interface GameInterfaceProps {
  game: GameSession
  partyId: string
  currentUser?: any
  onUpdate: () => void
}

function GameInterface({ game, partyId, currentUser, onUpdate }: GameInterfaceProps) {
  const [answer, setAnswer] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const submitAnswer = async () => {
    if (!answer.trim()) return

    setSubmitting(true)
    try {
      await api.post(`/parties/${partyId}/games/${game.id}/answer/`, {
        answer: answer.trim()
      })
      setAnswer("")
      onUpdate()
    } catch (error) {
      alert("Failed to submit answer: " + (error instanceof Error ? error.message : "Unknown error"))
    } finally {
      setSubmitting(false)
    }
  }

  // Render different interfaces based on game type
  switch (game.game_type) {
    case "trivia":
      return (
        <div className="p-4 bg-purple-600/10 border border-purple-600/20 rounded-lg">
          <h5 className="text-white font-medium mb-3">Current Question</h5>
          {game.game_data?.current_question ? (
            <div className="space-y-4">
              <p className="text-white/90">{game.game_data.current_question.text}</p>
              {game.game_data.current_question.options && (
                <div className="grid grid-cols-2 gap-2">
                  {game.game_data.current_question.options.map((option: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => setAnswer(option)}
                      className={`p-2 rounded border transition-colors ${
                        answer === option
                          ? "bg-brand-blue border-brand-blue text-white"
                          : "bg-white/10 border-white/20 text-white/80 hover:bg-white/20"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
              <button
                onClick={submitAnswer}
                disabled={submitting || !answer}
                className="px-4 py-2 bg-brand-cyan hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm transition-colors"
              >
                {submitting ? "Submitting..." : "Submit Answer"}
              </button>
            </div>
          ) : (
            <p className="text-white/60">Waiting for next question...</p>
          )}
        </div>
      )

    default:
      return (
        <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
          <h5 className="text-white font-medium mb-3">Submit Your Answer</h5>
          <div className="flex gap-2">
            <input
              type="text"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Type your answer..."
              className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  submitAnswer()
                }
              }}
            />
            <button
              onClick={submitAnswer}
              disabled={submitting || !answer.trim()}
              className="px-4 py-2 bg-brand-cyan hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm transition-colors"
            >
              {submitting ? "Submitting..." : "Submit"}
            </button>
          </div>
        </div>
      )
  }
}