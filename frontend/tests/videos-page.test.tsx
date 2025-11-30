import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import VideosPage from "@/app/dashboard/videos/page"
import { videosApi } from "@/lib/api-client"

jest.mock("@/hooks/use-design-system", () => ({
  useDesignSystem: () => ({
    formatNumber: (value: number) => {
      if (value >= 1_000_000) {
        return `${(value / 1_000_000).toFixed(1)}M`
      }
      if (value >= 1_000) {
        return `${(value / 1_000).toFixed(1)}K`
      }
      return value.toString()
    },
  }),
}))

jest.mock("@/components/ui/gradient-card", () => ({
  GradientCard: ({ children }: any) => <div>{children}</div>,
}))

jest.mock("@/components/ui/icon-button", () => ({
  IconButton: ({ children, onClick, disabled, loading, type = "button", ...rest }: any) => (
    <button onClick={onClick} disabled={disabled || loading} type={type} {...rest}>
      {loading ? "Loading..." : children}
    </button>
  ),
}))

jest.mock("next/navigation", () => ({
  __esModule: true,
  useSearchParams: () => new URLSearchParams(),
}))

jest.mock("@/lib/api-client", () => ({
  __esModule: true,
  videosApi: {
    list: jest.fn(),
    search: jest.fn(),
    create: jest.fn(),
    validateUrl: jest.fn(),
    delete: jest.fn(),
    getGDriveVideos: jest.fn(),
    uploadFromGDrive: jest.fn(),
    getGDriveStream: jest.fn(),
    deleteGDriveVideo: jest.fn(),
  },
}))

describe("VideosPage Google Drive integration", () => {
  let user: ReturnType<typeof userEvent.setup>

  beforeEach(() => {
    user = userEvent.setup()
    jest.clearAllMocks()
    ;(videosApi.list as jest.Mock).mockResolvedValue({ results: [] })
    ;(videosApi.search as jest.Mock).mockResolvedValue({ results: [] })
    ;(videosApi.getGDriveVideos as jest.Mock).mockResolvedValue({
      success: true,
      movies: [
        {
          gdrive_file_id: "drive-file-1",
          title: "Drive Sample",
          size: 1048576,
          duration: 120,
          in_database: false,
        },
      ],
    })
    ;(videosApi.uploadFromGDrive as jest.Mock).mockResolvedValue({
      id: "video-1",
      title: "Drive Sample",
    })
    ;(videosApi.getGDriveStream as jest.Mock).mockResolvedValue({ stream_url: "https://stream.example" })
    ;(videosApi.deleteGDriveVideo as jest.Mock).mockResolvedValue(undefined)

    window.alert = jest.fn()
    window.open = jest.fn()
    window.confirm = jest.fn(() => true) as any
  })

  it("loads Google Drive files when the Drive tab is selected", async () => {
    render(<VideosPage />)

    await waitFor(() => expect(videosApi.list).toHaveBeenCalled())

    await user.click(screen.getAllByRole("button", { name: /google drive/i })[0])

    expect(videosApi.getGDriveVideos).toHaveBeenCalledWith({ page_size: 50 })
    expect(await screen.findByText("Drive Sample")).toBeInTheDocument()
    expect(await screen.findByRole("button", { name: /import google drive video/i })).toBeInTheDocument()
  })

  it("imports a Google Drive video into the library", async () => {
    render(<VideosPage />)

    await waitFor(() => expect(videosApi.list).toHaveBeenCalled())

    await user.click(screen.getAllByRole("button", { name: /google drive/i })[0])

    const importButton = await screen.findByRole("button", { name: /import google drive video/i })
    await user.click(importButton)

    await waitFor(() => expect(videosApi.uploadFromGDrive).toHaveBeenCalledWith("drive-file-1"))
    expect(await screen.findByRole("button", { name: /stream/i })).toBeInTheDocument()
  })

  it("streams an imported Google Drive video", async () => {
    ;(videosApi.getGDriveVideos as jest.Mock).mockResolvedValueOnce({
      success: true,
      movies: [
        {
          gdrive_file_id: "drive-file-2",
          title: "Drive Imported",
          size: 2048,
          duration: 60,
          in_database: true,
          video_id: "video-2",
        },
      ],
    })

    render(<VideosPage />)

    await waitFor(() => expect(videosApi.list).toHaveBeenCalled())

    await user.click(screen.getAllByRole("button", { name: /google drive/i })[0])

    const streamButton = await screen.findByRole("button", { name: /stream imported video/i })
    await user.click(streamButton)

    await waitFor(() => expect(videosApi.getGDriveStream).toHaveBeenCalledWith("video-2"))
    expect(window.open).toHaveBeenCalledWith("https://stream.example", "_blank")
  })

  it("deletes an imported Google Drive video", async () => {
    ;(videosApi.getGDriveVideos as jest.Mock).mockResolvedValueOnce({
      success: true,
      movies: [
        {
          gdrive_file_id: "drive-file-3",
          title: "Drive Imported",
          size: 2048,
          duration: 60,
          in_database: true,
          video_id: "video-3",
        },
      ],
    })

    render(<VideosPage />)

    await waitFor(() => expect(videosApi.list).toHaveBeenCalled())

    await user.click(screen.getAllByRole("button", { name: /google drive/i })[0])

    const deleteButton = await screen.findByRole("button", { name: /delete imported video/i })
    await user.click(deleteButton)

    await waitFor(() => expect(videosApi.deleteGDriveVideo).toHaveBeenCalledWith("video-3"))
    expect(await screen.findByRole("button", { name: /import google drive video/i })).toBeInTheDocument()
  })
})
