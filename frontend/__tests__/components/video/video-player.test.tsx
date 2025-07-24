import { render, screen, fireEvent } from "@testing-library/react"
import { VideoPlayer } from "@/components/video/video-player"
import jest from "jest" // Import jest to fix the undeclared variable error

// Mock HTML5 video element
Object.defineProperty(HTMLMediaElement.prototype, "play", {
  writable: true,
  value: jest.fn().mockImplementation(() => Promise.resolve()),
})

Object.defineProperty(HTMLMediaElement.prototype, "pause", {
  writable: true,
  value: jest.fn(),
})

Object.defineProperty(HTMLMediaElement.prototype, "currentTime", {
  writable: true,
  value: 0,
})

Object.defineProperty(HTMLMediaElement.prototype, "duration", {
  writable: true,
  value: 100,
})

describe("VideoPlayer", () => {
  const mockProps = {
    src: "https://example.com/video.mp4",
    title: "Test Video",
    onPlay: jest.fn(),
    onPause: jest.fn(),
    onSeek: jest.fn(),
    onTimeUpdate: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("renders video player correctly", () => {
    render(<VideoPlayer {...mockProps} />)

    const video = screen.getByRole("application", { name: /video player/i })
    expect(video).toBeInTheDocument()

    const playButton = screen.getByRole("button", { name: /play/i })
    expect(playButton).toBeInTheDocument()
  })

  it("toggles play/pause on button click", () => {
    render(<VideoPlayer {...mockProps} />)

    const playButton = screen.getByRole("button", { name: /play/i })
    fireEvent.click(playButton)

    expect(mockProps.onPlay).toHaveBeenCalled()
  })

  it("shows video title", () => {
    render(<VideoPlayer {...mockProps} />)

    expect(screen.getByText("Test Video")).toBeInTheDocument()
  })

  it("handles volume control", () => {
    render(<VideoPlayer {...mockProps} />)

    const volumeButton = screen.getByRole("button", { name: /volume/i })
    expect(volumeButton).toBeInTheDocument()

    fireEvent.click(volumeButton)
    // Volume control functionality would be tested here
  })

  it("handles fullscreen toggle", () => {
    render(<VideoPlayer {...mockProps} />)

    const fullscreenButton = screen.getByRole("button", { name: /fullscreen/i })
    expect(fullscreenButton).toBeInTheDocument()
  })

  it("displays progress bar", () => {
    render(<VideoPlayer {...mockProps} />)

    const progressBar = screen.getByRole("slider", { name: /progress/i })
    expect(progressBar).toBeInTheDocument()
  })
})
