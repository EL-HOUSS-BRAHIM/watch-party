import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"

const team = [
  {
    name: "Alex Johnson",
    role: "CEO & Co-founder",
    imageUrl: "/placeholder.svg?height=256&width=256&text=AJ",
    bio: "Former Netflix engineer passionate about bringing people together through shared experiences.",
  },
  {
    name: "Sarah Kim",
    role: "CTO & Co-founder",
    imageUrl: "/placeholder.svg?height=256&width=256&text=SK",
    bio: "Video streaming expert with 10+ years building scalable media platforms.",
  },
  {
    name: "Marcus Rodriguez",
    role: "Head of Product",
    imageUrl: "/placeholder.svg?height=256&width=256&text=MR",
    bio: "Product leader focused on creating delightful user experiences for sports fans.",
  },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        {/* Hero Section */}
        <div className="py-24 sm:py-32">
          <div className="container px-4">
            <div className="mx-auto max-w-2xl text-center">
              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">About Watch Party</h1>
              <p className="mt-6 text-lg leading-8 text-muted-foreground">
                We're on a mission to bring football fans together, no matter where they are in the world.
              </p>
            </div>
          </div>
        </div>

        {/* Mission Section */}
        <div className="py-24 sm:py-32 bg-secondary">
          <div className="container px-4">
            <div className="mx-auto max-w-4xl">
              <div className="text-center mb-16">
                <h2 className="text-3xl font-bold text-foreground mb-6">Our Mission</h2>
                <p className="text-lg text-muted-foreground">
                  Football is more than just a game—it's about community, shared emotions, and unforgettable moments.
                  Watch Party was born from the simple idea that distance shouldn't prevent fans from experiencing these
                  moments together.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="rounded-full bg-primary/10 p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <span className="text-2xl">🌍</span>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">Global Community</h3>
                  <p className="text-muted-foreground">Connect fans from every corner of the world</p>
                </div>
                <div className="text-center">
                  <div className="rounded-full bg-success/10 p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <span className="text-2xl">⚡</span>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">Real-Time Experience</h3>
                  <p className="text-muted-foreground">Share every goal, save, and celebration instantly</p>
                </div>
                <div className="text-center">
                  <div className="rounded-full bg-premium/10 p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <span className="text-2xl">🏆</span>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">Premium Quality</h3>
                  <p className="text-muted-foreground">Crystal clear streaming with perfect synchronization</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="py-24 sm:py-32">
          <div className="container px-4">
            <div className="mx-auto max-w-2xl text-center mb-16">
              <h2 className="text-3xl font-bold text-foreground">Meet the Team</h2>
              <p className="mt-6 text-lg text-muted-foreground">
                We're a passionate team of engineers, designers, and football fans building the future of social
                viewing.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {team.map((person) => (
                <div key={person.name} className="card text-center">
                  <img
                    className="mx-auto h-32 w-32 rounded-full mb-4"
                    src={person.imageUrl || "/placeholder.svg"}
                    alt={person.name}
                  />
                  <h3 className="text-xl font-semibold text-foreground">{person.name}</h3>
                  <p className="text-primary mb-4">{person.role}</p>
                  <p className="text-muted-foreground">{person.bio}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
