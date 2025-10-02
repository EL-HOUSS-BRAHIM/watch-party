import { render, screen } from "@testing-library/react"
import { PublicPartyLayout, type PublicPartyViewModel } from "@/components/party/public-party-layout"

describe("PublicPartyLayout", () => {
  const baseParty: PublicPartyViewModel = {
    id: "1",
    title: "Demo Party",
    roomCode: "DEMO123",
    host: {
      id: "host-1",
      name: "Demo Host",
    },
    participantCount: 42,
    allowChat: false,
    allowReactions: true,
    status: "live",
    statusLabel: "Live",
    isPlaying: true,
    playbackPosition: "00:42",
    lastSyncAt: "2024-05-01T12:00:00Z",
    video: {
      id: "video-1",
      title: "Feature Film",
      durationLabel: "01:45:00",
    },
  }

  it("surfaces playback information and disables chat when chat is off", () => {
    render(
      <PublicPartyLayout
        party={baseParty}
        guestName="Sky"
        onLeave={jest.fn()}
      />
    )

    expect(screen.getByText(/Status: Live/i)).toBeInTheDocument()
    expect(screen.getByTestId("playback-status")).toHaveTextContent("Playback: Playing")
    expect(screen.getByTestId("playback-position")).toHaveTextContent("Position: 00:42")
    expect(screen.getByTestId("playback-duration")).toHaveTextContent("Duration: 01:45:00")
    expect(screen.getByText(/Chat is disabled by the host/i)).toBeInTheDocument()

    const chatInput = screen.getByLabelText(/Chat message/i)
    expect(chatInput).toBeDisabled()

    const sendButton = screen.getByRole("button", { name: /send/i })
    expect(sendButton).toBeDisabled()
  })
})
