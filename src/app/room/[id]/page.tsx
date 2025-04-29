"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Eye, EyeOff, RefreshCw, Plus, Users } from "lucide-react"
import { MainNav } from "@/components/main-nav"
import { useAuth } from "@/contexts/auth-context"
import { useRooms } from "@/contexts/room-context"

// Define types
type Participant = {
  id: string
  name: string
  vote: string | null
  isReady: boolean
  profilePicture?: string
}

type Story = {
  id: string
  title: string
  description: string
}

export default function RoomPage() {
  const params = useParams()
  const router = useRouter()
  const roomId = params.id as string
  const { user } = useAuth()
  const { addRoom } = useRooms()

  // State
  const [participants, setParticipants] = useState<Participant[]>([])
  const [stories, setStories] = useState<Story[]>([
    { id: "1", title: "User Authentication", description: "Implement user login and registration" },
    { id: "2", title: "Dashboard UI", description: "Create responsive dashboard interface" },
  ])
  const [currentStory, setCurrentStory] = useState<Story>(stories[0])
  const [selectedCard, setSelectedCard] = useState<string | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [newStoryTitle, setNewStoryTitle] = useState("")
  const [newStoryDescription, setNewStoryDescription] = useState("")
  const [roomName, setRoomName] = useState(`Planning Session ${roomId}`)

  // Card values
  const cardValues = ["1", "2", "3", "5", "8", "13", "21", "?"]

  // Initialize participants when user is available
  useEffect(() => {
    if (user) {
      // Add current user as first participant
      setParticipants([
        {
          id: user.id,
          name: user.name,
          vote: null,
          isReady: true,
          profilePicture: user.profilePicture,
        },
        // Add some mock participants
        { id: "2", name: "John", vote: null, isReady: true },
        { id: "3", name: "Sarah", vote: null, isReady: true },
        { id: "4", name: "Mike", vote: null, isReady: true },
      ])

      // Record this room visit
      addRoom({
        id: roomId,
        name: roomName,
        createdAt: new Date().toISOString(),
        stories: stories.length,
        participants: 4,
      })
    }
  }, [user, roomId, addRoom, roomName, stories.length])

  // Handle card selection
  const handleCardSelect = (value: string) => {
    setSelectedCard(value)
    // Update your vote
    setParticipants((prev) => prev.map((p) => (p.id === user?.id ? { ...p, vote: value } : p)))
  }

  // Simulate other participants voting
  useEffect(() => {
    if (selectedCard) {
      const timeout = setTimeout(() => {
        setParticipants((prev) =>
          prev.map((p) => {
            if (p.id !== user?.id) {
              const randomVote = cardValues[Math.floor(Math.random() * cardValues.length)]
              return { ...p, vote: randomVote }
            }
            return p
          }),
        )
      }, 2000)

      return () => clearTimeout(timeout)
    }
  }, [selectedCard, user?.id])

  // Reset votes and start new round
  const resetVotes = () => {
    setRevealed(false)
    setSelectedCard(null)
    setParticipants((prev) => prev.map((p) => ({ ...p, vote: null })))
  }

  // Add new story
  const addNewStory = () => {
    if (newStoryTitle.trim()) {
      const newStory = {
        id: Date.now().toString(),
        title: newStoryTitle,
        description: newStoryDescription,
      }
      setStories((prev) => [...prev, newStory])
      setNewStoryTitle("")
      setNewStoryDescription("")
    }
  }

  // Calculate average vote
  const calculateAverage = () => {
    const numericVotes = participants
      .map((p) => p.vote)
      .filter((v) => v !== null && v !== "?")
      .map((v) => Number.parseInt(v as string))
      .filter((v) => !isNaN(v))

    if (numericVotes.length === 0) return "N/A"

    const sum = numericVotes.reduce((acc, curr) => acc + curr, 0)
    return (sum / numericVotes.length).toFixed(1)
  }

  return (
    <>
      <MainNav />
      <div className="min-h-[calc(100vh-4rem)] bg-background p-4">
        <div className="max-w-6xl mx-auto">
          <header className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-foreground">{roomName}</h1>
                <div className="flex items-center mt-2">
                  <Badge variant="outline" className="mr-2">
                    Room: {roomId}
                  </Badge>
                  <Badge className="flex items-center">
                    <Users className="h-3 w-3 mr-1" />
                    {participants.length} Members
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={resetVotes}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  New Round
                </Button>
              </div>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardContent className="p-6">
                  <div className="mb-4">
                    <h2 className="text-xl font-semibold">{currentStory.title}</h2>
                    <p className="text-muted-foreground mt-1">{currentStory.description}</p>
                  </div>

                  <div className="mt-6">
                    <h3 className="text-sm font-medium text-muted-foreground mb-3">Select your estimate:</h3>
                    <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                      {cardValues.map((value) => (
                        <button
                          key={value}
                          onClick={() => handleCardSelect(value)}
                          className={`aspect-[2/3] rounded-lg border-2 flex items-center justify-center text-lg font-bold transition-all ${
                            selectedCard === value
                              ? "border-primary bg-primary/10 text-primary shadow-md transform -translate-y-1"
                              : "border-border hover:border-primary/50 hover:bg-muted"
                          }`}
                        >
                          {value}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mt-8 flex justify-center">
                    <Button
                      onClick={() => setRevealed(true)}
                      disabled={!selectedCard || revealed}
                      size="lg"
                      className="px-8"
                    >
                      {revealed ? (
                        <>
                          <EyeOff className="mr-2 h-5 w-5" />
                          Revealed
                        </>
                      ) : (
                        <>
                          <Eye className="mr-2 h-5 w-5" />
                          Reveal Cards
                        </>
                      )}
                    </Button>
                  </div>

                  {revealed && (
                    <div className="mt-8 p-4 bg-muted rounded-lg border border-border">
                      <h3 className="text-center font-medium mb-4">Results</h3>
                      <div className="flex justify-center items-center space-x-4">
                        <div className="text-center">
                          <div className="text-sm text-muted-foreground">Average</div>
                          <div className="text-2xl font-bold">{calculateAverage()}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-muted-foreground">Consensus</div>
                          <div className="text-2xl font-bold">
                            {new Set(participants.map((p) => p.vote).filter(Boolean)).size === 1 ? "Yes" : "No"}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-medium mb-4">Team Members</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {participants.map((participant) => (
                      <div key={participant.id} className="flex flex-col items-center">
                        <div className="relative">
                          <Avatar className="h-16 w-16">
                            {participant.profilePicture ? (
                              <AvatarImage
                                src={participant.profilePicture || "/placeholder.svg"}
                                alt={participant.name}
                              />
                            ) : null}
                            <AvatarFallback className="bg-muted text-muted-foreground">
                              {participant.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          {participant.vote && (
                            <div
                              className={`absolute -bottom-2 -right-2 h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm ${
                                revealed
                                  ? "bg-primary/20 text-primary border-2 border-primary/30"
                                  : "bg-muted text-muted-foreground border-2 border-border"
                              }`}
                            >
                              {revealed ? participant.vote : "✓"}
                            </div>
                          )}
                        </div>
                        <span className="mt-2 font-medium text-sm">
                          {participant.name}
                          {participant.id === user?.id && " (You)"}
                        </span>
                        {revealed && participant.vote && (
                          <span className="mt-1 text-sm text-primary font-medium">Voted: {participant.vote}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <Tabs defaultValue="stories">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="stories">Stories</TabsTrigger>
                  <TabsTrigger value="add">Add Story</TabsTrigger>
                </TabsList>
                <TabsContent value="stories" className="mt-4">
                  <Card>
                    <CardContent className="p-4 space-y-2">
                      {stories.map((story) => (
                        <div
                          key={story.id}
                          className={`p-3 rounded-md cursor-pointer hover:bg-muted ${
                            currentStory.id === story.id ? "bg-muted border border-border" : ""
                          }`}
                          onClick={() => {
                            setCurrentStory(story)
                            resetVotes()
                          }}
                        >
                          <h4 className="font-medium">{story.title}</h4>
                          <p className="text-sm text-muted-foreground truncate">{story.description}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="add" className="mt-4">
                  <Card>
                    <CardContent className="p-4 space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="storyTitle">Story Title</Label>
                        <Input
                          id="storyTitle"
                          value={newStoryTitle}
                          onChange={(e) => setNewStoryTitle(e.target.value)}
                          placeholder="Enter story title"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="storyDescription">Description</Label>
                        <Input
                          id="storyDescription"
                          value={newStoryDescription}
                          onChange={(e) => setNewStoryDescription(e.target.value)}
                          placeholder="Enter description"
                        />
                      </div>
                      <Button onClick={addNewStory} className="w-full">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Story
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
