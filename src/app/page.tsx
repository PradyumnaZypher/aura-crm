'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  CheckCircle, 
  Users, 
  BarChart3, 
  Shield, 
  Phone, 
  MessageSquare,
  ArrowRight,
  Sparkles,
  Zap,
  Globe,
  Lock,
  TrendingUp,
  Star,
  ChevronDown,
  Play,
  Menu,
  X
} from 'lucide-react'
import { useState, useEffect } from 'react'

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrollY, setScrollY] = useState(0)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    
    window.addEventListener('scroll', handleScroll)
    window.addEventListener('mousemove', handleMouseMove)
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  const features = [
    {
      icon: Shield,
      title: 'Admin Dashboard',
      description: 'Complete system control with user management, analytics, and configuration',
      highlights: ['User role management', 'System analytics', 'Security monitoring'],
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Users,
      title: 'Manager Dashboard',
      description: 'Team leadership tools with lead management and campaign tracking',
      highlights: ['Team performance', 'Lead pipeline', 'Campaign management'],
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      icon: BarChart3,
      title: 'Client Dashboard',
      description: 'Personalized experience with interaction history and support access',
      highlights: ['Communication center', 'Activity tracking', 'Quick support'],
      gradient: 'from-purple-500 to-pink-500'
    }
  ]

  const capabilities = [
    {
      icon: Phone,
      title: 'AI-Powered Calls',
      description: 'Intelligent voice interactions with sentiment analysis',
      color: 'text-blue-600'
    },
    {
      icon: MessageSquare,
      title: 'Smart Messaging',
      description: 'Automated responses and conversation tracking',
      color: 'text-green-600'
    },
    {
      icon: BarChart3,
      title: 'Real-time Analytics',
      description: 'Live insights and performance metrics',
      color: 'text-purple-600'
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Seamless coordination and communication tools',
      color: 'text-orange-600'
    }
  ]

  const stats = [
    { value: '10K+', label: 'Active Users', trend: '+12%' },
    { value: '99.9%', label: 'Uptime', trend: '+0.1%' },
    { value: '24/7', label: 'Support', trend: 'Always' },
    { value: '4.9★', label: 'Rating', trend: '+0.2' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 gradient-mesh opacity-30"></div>
      
      {/* Mouse follower */}
      <div 
        className="fixed w-96 h-96 rounded-full bg-primary/5 blur-3xl pointer-events-none transition-all duration-300 ease-out"
        style={{
          left: mousePosition.x - 192,
          top: mousePosition.y - 192,
        }}
      />

      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrollY > 50 ? 'glass shadow-lg' : 'bg-transparent'
      }`}>
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/60 rounded-xl flex items-center justify-center shadow-lg animate-pulse-slow">
                  <span className="text-white font-bold text-lg">AI</span>
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              <span className="text-xl font-bold text-gradient">AI CRM System</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <Link href="#features" className="text-foreground/80 hover:text-foreground transition-colors">Features</Link>
              <Link href="#capabilities" className="text-foreground/80 hover:text-foreground transition-colors">Capabilities</Link>
              <Link href="#pricing" className="text-foreground/80 hover:text-foreground transition-colors">Pricing</Link>
              <Link href="#about" className="text-foreground/80 hover:text-foreground transition-colors">About</Link>
            </div>

            <div className="hidden md:flex items-center gap-4">
              <Link href="/login">
                <Button variant="ghost" className="hover-lift">Sign In</Button>
              </Link>
              <Link href="/signup">
                <Button className="hover-shadow-glow bg-gradient-to-r from-primary to-primary/60 hover:from-primary/80 hover:to-primary/40">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden mt-4 p-4 glass rounded-xl animate-slide-up">
              <div className="flex flex-col gap-4">
                <Link href="#features" className="text-foreground/80 hover:text-foreground transition-colors">Features</Link>
                <Link href="#capabilities" className="text-foreground/80 hover:text-foreground transition-colors">Capabilities</Link>
                <Link href="#pricing" className="text-foreground/80 hover:text-foreground transition-colors">Pricing</Link>
                <Link href="#about" className="text-foreground/80 hover:text-foreground transition-colors">About</Link>
                <div className="flex gap-2 pt-2">
                  <Link href="/login" className="flex-1">
                    <Button variant="ghost" className="w-full">Sign In</Button>
                  </Link>
                  <Link href="/signup" className="flex-1">
                    <Button className="w-full">Get Started</Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-20">
        <div className="container mx-auto text-center">
          <div className="animate-fade-in">
            <Badge className="mb-6 bg-gradient-to-r from-primary/10 to-primary/20 text-primary border-primary/20 hover-lift">
              <Sparkles className="mr-2 h-4 w-4" />
              🚀 AI-Powered Business Intelligence
            </Badge>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-balance mb-6">
              Transform Your Business with
              <span className="block text-gradient mt-2">Intelligent Insights</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-foreground/70 text-pretty max-w-3xl mx-auto mb-8">
              Role-based dashboards that empower your team with AI-driven analytics, 
              real-time communication, and intelligent lead management.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href="/signup">
                <Button size="lg" className="text-lg px-8 py-4 hover-shadow-glow bg-gradient-to-r from-primary to-primary/60 hover:from-primary/80 hover:to-primary/40 group">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="text-lg px-8 py-4 hover-lift group">
                  <Play className="mr-2 h-5 w-5" />
                  View Demo
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                  <div className="text-3xl md:text-4xl font-bold text-gradient">{stat.value}</div>
                  <div className="text-sm text-foreground/60">{stat.label}</div>
                  <div className="text-xs text-green-600">{stat.trend}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <ChevronDown className="h-6 w-6 text-foreground/40" />
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 relative">
        <div className="container mx-auto">
          <div className="text-center mb-16 animate-slide-up">
            <Badge className="mb-4">Features</Badge>
            <h2 className="text-3xl md:text-5xl font-bold text-balance mb-4">
              Powerful Features for Every Role
            </h2>
            <p className="text-xl text-foreground/70 text-pretty max-w-2xl mx-auto">
              Tailored experiences that help your team work smarter, not harder
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className={`group hover-lift border-0 shadow-lg hover:shadow-2xl transition-all duration-500 animate-slide-up`} style={{ animationDelay: `${index * 150}ms` }}>
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 rounded-xl transition-opacity duration-500`}></div>
                <CardHeader className="relative">
                  <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl group-hover:text-gradient transition-colors duration-300">
                    {feature.title}
                  </CardTitle>
                  <CardDescription className="text-foreground/70">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative">
                  <ul className="space-y-3">
                    {feature.highlights.map((highlight, idx) => (
                      <li key={idx} className="flex items-center gap-3 group/item">
                        <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 group-hover/item:scale-110 transition-transform">
                          <CheckCircle className="w-3 h-3 text-green-600" />
                        </div>
                        <span className="text-sm text-foreground/80">{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Capabilities Section */}
      <section id="capabilities" className="py-24 px-6 relative bg-gradient-to-br from-primary/5 to-primary/10">
        <div className="container mx-auto">
          <div className="text-center mb-16 animate-slide-up">
            <Badge className="mb-4">Capabilities</Badge>
            <h2 className="text-3xl md:text-5xl font-bold text-balance mb-4">
              Advanced Capabilities
            </h2>
            <p className="text-xl text-foreground/70 text-pretty max-w-2xl mx-auto">
              Cutting-edge technology that drives business results
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {capabilities.map((capability, index) => (
              <div key={index} className="text-center group animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300">
                  <capability.icon className={`w-10 h-10 ${capability.color}`} />
                </div>
                <h3 className="text-xl font-semibold mb-3 group-hover:text-gradient transition-colors duration-300">
                  {capability.title}
                </h3>
                <p className="text-foreground/70 text-pretty">
                  {capability.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 relative">
        <div className="container mx-auto">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/60 rounded-3xl"></div>
            <div className="relative glass rounded-3xl p-12 text-center animate-slide-up">
              <div className="max-w-3xl mx-auto">
                <Badge className="mb-6 bg-white/20 text-white border-white/30">
                  <Zap className="mr-2 h-4 w-4" />
                  Ready to get started?
                </Badge>
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 text-balance">
                  Transform Your Business Today
                </h2>
                <p className="text-xl text-white/90 mb-8 text-pretty">
                  Join thousands of teams already using Z.ai to accelerate their growth
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/signup">
                    <Button size="lg" variant="secondary" className="text-lg px-8 py-4 hover-lift bg-white text-primary hover:bg-white/90">
                      Get Started Now
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button size="lg" variant="outline" className="text-lg px-8 py-4 border-white/20 text-white hover:bg-white/10 hover-lift">
                      View Demo
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground/5 backdrop-blur-sm border-t border-foreground/10 py-16 px-6">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="animate-slide-up">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/60 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">AI</span>
                </div>
                <span className="text-lg font-bold">AI CRM System</span>
              </div>
              <p className="text-foreground/70 text-pretty">
                AI-powered business intelligence for modern teams.
              </p>
            </div>
            
            <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-foreground/70">
                <li><Link href="#" className="hover:text-foreground transition-colors">Features</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Pricing</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">API</Link></li>
              </ul>
            </div>
            
            <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-foreground/70">
                <li><Link href="#" className="hover:text-foreground transition-colors">About</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Blog</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Careers</Link></li>
              </ul>
            </div>
            
            <div className="animate-slide-up" style={{ animationDelay: '300ms' }}>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-foreground/70">
                <li><Link href="#" className="hover:text-foreground transition-colors">Help Center</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Contact</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Status</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-foreground/10 pt-8 text-center text-foreground/60 animate-slide-up">
            <p>© 2024 AI CRM System. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}