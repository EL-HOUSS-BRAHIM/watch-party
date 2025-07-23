"use client"

const testimonials = [
  {
    body: "Watch Party has completely changed how we watch games together. Even when we're in different cities, it feels like we're all in the same room cheering for our team!",
    author: {
      name: "Sarah Chen",
      handle: "sarahc_football",
      imageUrl: "/placeholder.svg?height=40&width=40&text=SC",
    },
  },
  {
    body: "The sync is perfect and the chat makes every game so much more fun. We've been using it for every match this season and it's been incredible.",
    author: {
      name: "Marcus Johnson",
      handle: "marcusj_sports",
      imageUrl: "/placeholder.svg?height=40&width=40&text=MJ",
    },
  },
  {
    body: "Finally, a platform that actually works! No more trying to coordinate 'press play in 3, 2, 1...' - everything just works seamlessly.",
    author: {
      name: "Elena Rodriguez",
      handle: "elena_futbol",
      imageUrl: "/placeholder.svg?height=40&width=40&text=ER",
    },
  },
]

export function TestimonialsSection() {
  return (
    <section className="py-24 sm:py-32">
      <div className="container px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Loved by football fans everywhere
          </h2>
        </div>

        <div className="mx-auto mt-16 flow-root max-w-2xl sm:mt-20 lg:mx-0 lg:max-w-none">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((testimonial, testimonialIdx) => (
              <div key={testimonialIdx} className="card">
                <figure className="mt-6">
                  <blockquote className="text-muted-foreground">
                    <p>"{testimonial.body}"</p>
                  </blockquote>
                  <figcaption className="mt-6 flex items-center gap-x-4">
                    <img
                      className="h-10 w-10 rounded-full bg-secondary"
                      src={testimonial.author.imageUrl || "/placeholder.svg"}
                      alt=""
                    />
                    <div>
                      <div className="font-semibold text-foreground">{testimonial.author.name}</div>
                      <div className="text-muted-foreground">@{testimonial.author.handle}</div>
                    </div>
                  </figcaption>
                </figure>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
