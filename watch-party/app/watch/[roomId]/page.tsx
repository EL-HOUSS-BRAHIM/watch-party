"use client"

import { useParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { WatchPartyRoom } from "@/components/watch-party/watch-party-room"
import { PartyNotFound } from "@/components/watch-party/party-not-found"
import { PartyLoading } from "@/components/watch-party/party-loading"
import { api } from "@/lib/api"

export default function WatchPartyPage() {
  const params = useParams()
  const roomId = params.roomId as string

  const {
    data: party,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["party", roomId],
    queryFn: () => api.get(`/parties/${roomId}`),
    retry: 1,
  })

  if (isLoading) {
    return <PartyLoading />
  }

  if (error || !party) {
    return <PartyNotFound />
  }

  return <WatchPartyRoom party={party} />
}
