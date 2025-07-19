import { Metadata } from 'next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Smartphone, Download, QrCode } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Mobile App | Watch Party',
  description: 'Download the Watch Party mobile app for the best on-the-go streaming experience.',
}

export default function MobilePage() {
  return (
    <div className="min-h-screen bg-neo-background">
      <div className="container mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <div className="inline-block p-4 rounded-full bg-primary/10 mb-6">
            <Smartphone className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-neo-text-primary mb-4">
            Watch Party Mobile App
          </h1>
          <p className="text-xl text-neo-text-secondary max-w-2xl mx-auto">
            Take your watch parties anywhere with our mobile app. 
            Stream, chat, and connect with friends on the go.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card className="card">
            <CardHeader>
              <CardTitle className="text-neo-text-primary flex items-center gap-2">
                <Download className="h-5 w-5" />
                Coming Soon
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-neo-text-secondary mb-4">
                We're working hard to bring Watch Party to mobile devices. 
                Sign up to be notified when it's ready!
              </p>
              <Button className="btn-primary w-full" disabled>
                Notify Me When Available
              </Button>
            </CardContent>
          </Card>

          <Card className="card">
            <CardHeader>
              <CardTitle className="text-neo-text-primary flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                Web Version
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-neo-text-secondary mb-4">
                In the meantime, enjoy the full Watch Party experience 
                on your mobile browser.
              </p>
              <Button variant="outline" className="w-full">
                Open Web App
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
