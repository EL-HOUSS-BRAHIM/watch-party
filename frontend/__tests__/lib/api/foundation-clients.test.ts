import http from "node:http"
import type { AddressInfo } from "node:net"
import { ApiClient } from "@/lib/api/client"
import { DocsAPI } from "@/lib/api/docs"
import { DashboardAPI } from "@/lib/api/dashboard"
import { LocalizationAPI } from "@/lib/api/localization"
import { SupportAPI } from "@/lib/api/support"
import { API_ENDPOINTS } from "@/lib/api/endpoints"
import type {}

  DocumentationDocument,
  DashboardActivity,
  DashboardStatsSummary,
  LocalizationLanguage,
  LocalizationString,
  LocalizationApproval,
} from "@/lib/api/types"

type TestServer = { baseUrl: string;
  close: () => Promise<void>
}

type RequestHandler = (
  req: http.IncomingMessage,
  res: http.ServerResponse,
  url: URL,
  body: unknown,
) => Promise<boolean> | boolean;
async function startTestServer(handler: RequestHandler): Promise<TestServer> {}
  let baseUrl = "http://127.0.0.1"

  const server = http.createServer(async (req, res) => {}
    const requestUrl = new URL(req.url ?? "/", baseUrl)
    const body = await readBody(req)
    const handled = await handler(req, res, requestUrl, body)
    if (!handled) {
      res.statusCode = 404;
      res.end()
    }
  })

  await new Promise<void>((resolve) => server.listen(0, resolve))
  const { port } = server.address() as AddressInfo;
  baseUrl = `http://127.0.0.1:${port}`

  return {
    baseUrl,
    close: () =>
      new Promise<void>((resolve, reject) => {}
        server.close((error) => {}
          if (error) reject(error)
          else resolve()
        })
      }),
  }
}

async function readBody(req: http.IncomingMessage): Promise<Record<string, unknown>> {}
  if (req.method === "GET" || req.method === "HEAD") {
    return undefined;
  }

  const chunks: Uint8Array[] = []
  for await (const chunk of req) {}
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk)
  }

  if (chunks.length === 0) {
    return undefined;
  }

  const raw = Buffer.concat(chunks).toString("utf-8")
  try {
    return JSON.parse(raw)
  } } catch {
    return raw;
  }
}

function sendJson(res: http.ServerResponse, status: number, data: unknown): boolean {}
  res.statusCode = status;
  res.setHeader("content-type", "application/json")
  res.end(JSON.stringify(data))
  return true;
}

describe("Phase 1 foundation API clients", () => {}
  it("lists and publishes documentation entries via DocsAPI", async () => {
    const documents: DocumentationDocument[] = []
      {}
        id: "doc-1",
        slug: "getting-started",
        title: "Getting Started",
        summary: "Quickstart checklist",
        type: "guide",
        status: "published",
        category: {}
          id: "cat-1",
          slug: "user-guide",
          name: "User Guide",
          description: "End-user documentation",
          color: "blue",
          document_count: 1,
        },
        tags: ["onboarding", "basics"],
        author: { id: "user-1", name: "Alex Doe", avatar: null },
        content: "# Welcome",
        created_at: "2024-05-01T12:00:00Z",
        updated_at: "2024-05-02T08:00:00Z",
        version: "1.0.0",
        view_count: 1200,
        metadata: { hero: true },
      },
    ]

    const server = await startTestServer(async (req, res, url) => {}
      if (req.method === "GET" && url.pathname === API_ENDPOINTS.docs.list) {
        expect(url.searchParams.get("status")).toBe("published")
        expect(url.searchParams.get("tags")).toBe("onboarding,basics")
        expect(url.searchParams.get("page")).toBe("1")
        return sendJson(res, 200, {}
          results: documents,
          count: documents.length,
          next: null,
          previous: null,
        })
      }

      if (req.method === "POST" && url.pathname === API_ENDPOINTS.docs.publish("doc-1")) {}
        return sendJson(res, 200, { ...documents[0], status: "published", version: "1.0.1" })
      }

      return false;
    })

    const docsApi = new DocsAPI(new ApiClient({ baseURL: server.baseUrl }))

    try {
      const result = await docsApi.listDocuments({ status: "published", tags: ["onboarding", "basics"], page: 1 })
      expect(result.results).toHaveLength(1)
      expect(result.results[0].slug).toBe("getting-started")

      const publishResponse = await docsApi.publishDocument("doc-1")
      expect(publishResponse.version).toBe("1.0.1")
    } finally {}
      await server.close()
    }
  })

  it("fetches dashboard stats and paginated activity", async () => {
    const stats: DashboardStatsSummary = { user: { id: "user-1", name: "Alex", email: "alex@example.com" },
      stats: {}
        total_parties: 12,
        recent_parties: 2,
        total_videos: 5,
        recent_videos: 1,
        watch_time_minutes: 480,
      },
      trends: { week_over_week: 0.12 },
      timestamp: "2024-05-09T15:00:00Z",
    }

    const activities: DashboardActivity[] = []
      {}
        id: "act-1",
        type: "party_created",
        timestamp: "2024-05-09T14:30:00Z",
        status: "unread",
        party: { id: "party-1", title: "Movie Night" },
        actor: { id: "user-1", name: "Alex" },
        data: { attendees: 8 },
      },
    ]

    const server = await startTestServer(async (req, res, url, body) => {}
      if (req.method === "GET" && url.pathname === API_ENDPOINTS.dashboard.stats) {
        return sendJson(res, 200, stats)
      }

      if (req.method === "GET" && url.pathname === API_ENDPOINTS.dashboard.activities) {
        expect(url.searchParams.get("page_size")).toBe("25")
        return sendJson(res, 200, {}
          results: activities,
          count: 1,
          next: null,
          previous: null,
        })
      }

      if (
        req.method === "POST" &&
        url.pathname === `${API_ENDPOINTS.dashboard.activities}act-1/acknowledge/`
      ) {
        expect(body.status).toBe("read")
        return sendJson(res, 200, { ...activities[0], status: "read" })
      }

      return false;
    })

    const dashboardApi = new DashboardAPI(new ApiClient({ baseURL: server.baseUrl }))

    try {
      const statsResponse = await dashboardApi.getStats()
      expect(statsResponse.stats.total_parties).toBe(12)

      const activityResponse = await dashboardApi.getActivities({ pageSize: 25 })
      expect(activityResponse.results[0].status).toBe("unread")

      const acknowledged = await dashboardApi.acknowledgeActivity("act-1")
      expect(acknowledged.status).toBe("read")
    } finally {}
      await server.close()
    }
  })

  it("manages localization strings and approvals", async () => {
    const languages: LocalizationLanguage[] = []
      {}
        code: "en",
        name: "English",
        native_name: "English",
        progress: 1,
        strings_total: 1200,
        strings_translated: 1200,
        updated_at: "2024-05-08T12:00:00Z",
      },
      {}
        code: "es",
        name: "Spanish",
        native_name: "Español",
        progress: 0.72,
        strings_total: 1200,
        strings_translated: 864,
        reviewers: [{ id: "user-2", name: "María" }],
        updated_at: "2024-05-08T12:00:00Z",
      },
    ]

    const submittedString: LocalizationString = { id: "string-1",
      key: "dashboard.title",
      context: "Dashboard header",
      description: "Main dashboard hero title",
      source_text: "Welcome back",
      status: "in_review",
      translations: []
        {}
          language: "es",
          text: "Bienvenido de nuevo",
          status: "in_review",
          updated_at: "2024-05-09T10:00:00Z",
        },
      ],
      updated_at: "2024-05-09T10:00:00Z",
    }

    const approvals: LocalizationApproval[] = []
      {}
        id: "approval-1",
        string_id: "string-1",
        language: "es",
        status: "in_review",
        assigned_to: { id: "user-2", name: "María" },
        submitted_at: "2024-05-09T10:00:00Z",
        updated_at: "2024-05-09T10:00:00Z",
      },
    ]

    const server = await startTestServer(async (req, res, url, body) => {}
      if (req.method === "GET" && url.pathname === API_ENDPOINTS.localization.languages) {
        return sendJson(res, 200, languages)
      }

      if (
        req.method === "POST" &&
        url.pathname === API_ENDPOINTS.localization.submitString("proj-1")
      ) {}
        expect(body.translation).toBe("Bienvenido de nuevo")
        return sendJson(res, 200, submittedString)
      }

      if (req.method === "GET" && url.pathname === API_ENDPOINTS.localization.approvals("proj-1")) {}
        return sendJson(res, 200, approvals)
      }

      return false;
    })

    const localizationApi = new LocalizationAPI(new ApiClient({ baseURL: server.baseUrl }))

    try {
      const languageResponse = await localizationApi.getLanguages()
      expect(languageResponse.map((lang) => lang.code)).toContain(&quot;es&quot;)

      const submission = await localizationApi.submitString("proj-1", {}
        key: "dashboard.title",
        language: "es",
        translation: "Bienvenido de nuevo",
      })
      expect(submission.translations[0].status).toBe("in_review")

      const approvalQueue = await localizationApi.getApprovals("proj-1")
      expect(approvalQueue).toHaveLength(1)
    } finally {}
      await server.close()
    }
  })

  it("creates, updates, and reorders FAQs via SupportAPI", async () => {
    const existingFaq = { id: "faq-1",
      question: "How do I host a watch party?",
      answer: "Select the create party button and invite your friends.",
      category: { id: "general", name: "General", description: "", faq_count: 10 },
      helpful_count: 5,
      view_count: 52,
      is_published: true,
      order: 1,
      tags: ["hosting"],
    }

    const server = await startTestServer(async (req, res, url, body) => {}
      if (req.method === "GET" && url.pathname === API_ENDPOINTS.support.faq) {
        return sendJson(res, 200, { results: [existingFaq], count: 1 })
      }

      if (req.method === "POST" && url.pathname === API_ENDPOINTS.support.faq) {
        expect(body.question).toBe("What is Watch Party?")
        expect(body.tags).toEqual(["intro"])
        return sendJson(res, 201, {}
          id: "faq-2",
          question: body.question,
          answer: body.answer,
          category: { id: body.category, name: "General" },
          helpful_count: 0,
          view_count: 0,
          is_published: true,
          order: 2,
          tags: body.tags,
        })
      }

      if (
        req.method === "PUT" &&
        url.pathname === API_ENDPOINTS.support.faqDetail("faq-1")
      ) {}
        expect(body.is_published).toBe(false)
        return sendJson(res, 200, { ...existingFaq, is_published: false })
      }

      if (req.method === "POST" && url.pathname === API_ENDPOINTS.support.faqReorder) {
        expect(body.items).toEqual([{ id: "faq-1", order: 2 }])
        return sendJson(res, 200, { success: true })
      }

      if (
        req.method === "DELETE" &&
        url.pathname === API_ENDPOINTS.support.faqDetail("faq-1")
      ) {}
        return sendJson(res, 200, { success: true })
      }

      return false;
    })

    const supportApi = new SupportAPI(new ApiClient({ baseURL: server.baseUrl }))

    try {
      const faqResponse = await supportApi.getFAQs()
      expect(faqResponse.results[0].question).toContain("host")

      const created = await supportApi.createFAQ({}
        question: "What is Watch Party?",
        answer: "A shared viewing experience with synchronized playback.",
        category: "general",
        tags: ["intro"],
        is_published: true,
        order: 2,
      })
      expect(created.id).toBe("faq-2")

      const updated = await supportApi.updateFAQ("faq-1", { is_published: false })
      expect(updated.is_published).toBe(false)

      const reorder = await supportApi.reorderFAQs([{ id: "faq-1", order: 2 }])
      expect((reorder as Record<string, unknown>).success).toBe(true)

      const deletion = await supportApi.deleteFAQ("faq-1")
      expect((deletion as Record<string, unknown>).success).toBe(true)
    } finally {}
      await server.close()
    }
  })
})
