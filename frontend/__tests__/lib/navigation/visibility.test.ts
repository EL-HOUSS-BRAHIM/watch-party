import { isAuthRoute, isMarketingRoute, shouldShowDashboardChrome } from "@/lib/navigation/visibility"

describe("navigation visibility helpers", () => {
  it("detects authentication routes", () => {
    expect(isAuthRoute("/login")).toBe(true)
    expect(isAuthRoute("/(auth)/register")).toBe(true)
    expect(isAuthRoute("/dashboard")).toBe(false)
  })

  it("identifies marketing routes", () => {
    expect(isMarketingRoute("/")).toBe(true)
    expect(isMarketingRoute("/about")).toBe(true)
    expect(isMarketingRoute("/discover/features")).toBe(true)
    expect(isMarketingRoute("/dashboard")).toBe(false)
  })

  it("decides when to show dashboard chrome", () => {
    expect(shouldShowDashboardChrome("/dashboard")).toBe(true)
    expect(shouldShowDashboardChrome("/dashboard/parties")).toBe(true)
    expect(shouldShowDashboardChrome("/watch/party")).toBe(false)
    expect(shouldShowDashboardChrome("/login")).toBe(false)
    expect(shouldShowDashboardChrome("/about")).toBe(false)
  })
})
