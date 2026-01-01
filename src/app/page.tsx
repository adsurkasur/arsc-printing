'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { QueueWidget } from '@/components/QueueWidget'
import { CheckCircle, Clock, Shield, Zap, ArrowRight, Sparkles } from 'lucide-react'
import { motion, FadeInUp, StaggerContainer, StaggerItem, PageTransition } from '@/components/animations'
import { AnimatePresence } from 'framer-motion'

const cyclingTexts = [
  { text: 'dengan Praktis.', duration: 2000 },
  { text: 'dari Jauh.', duration: 2000 },
  { text: 'oleh ARSC.', duration: 6000 },
]

export default function Home() {
  const router = useRouter()
  const [textIndex, setTextIndex] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      setTextIndex((prev) => (prev + 1) % cyclingTexts.length)
    }, cyclingTexts[textIndex].duration)
    return () => clearTimeout(timer)
  }, [textIndex])

  const features = [
    {
      icon: Zap,
      title: 'Proses Cepat',
      description: 'Upload dan pesan dalam hitungan detik',
      color: 'primary'
    },
    {
      icon: Clock,
      title: 'Real-Time Status',
      description: 'Pantau antrian secara langsung',
      color: 'secondary'
    },
    {
      icon: Shield,
      title: 'Aman & Terpercaya',
      description: 'Layanan oleh ARSC',
      color: 'primary'
    },
    {
      icon: CheckCircle,
      title: 'Kualitas Terjamin',
      description: 'Hasil cetak berkualitas',
      color: 'secondary'
    }
  ]

  return (
    <PageTransition>
      <div className="min-h-screen overflow-hidden">
        {/* Hero Section */}
        <section className="relative min-h-[90vh] flex items-center overflow-hidden">
          {/* Animated Background */}
          <div className="absolute inset-0 animated-gradient" />
          
          {/* Decorative Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 0.1, scale: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-white/20 blur-3xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 0.1, scale: 1 }}
              transition={{ duration: 1, delay: 0.7 }}
              className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-white/20 blur-3xl"
            />
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 0.05 }}
              transition={{ duration: 1.5, delay: 0.3 }}
              className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRoLTJ2LTRoMnY0em0wLTZoLTJ2LTRoMnY0em0tNCA2aC0ydi00aDJ2NHptMC02aC0ydi00aDJ2NHoiLz48L2c+PC9nPjwvc3ZnPg==')]"
            />
          </div>

          <div className="container relative mx-auto px-4 py-20">
            <div className="mx-auto max-w-4xl text-center">
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-8"
              >
                <Sparkles className="h-4 w-4 text-yellow-300" />
                <span className="text-sm font-medium text-white">Layanan Cetak Terbaru!</span>
              </motion.div>

              {/* Main Heading */}
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="mb-6 text-4xl font-extrabold leading-tight text-white md:text-5xl lg:text-7xl tracking-tight"
              >
                Cetak Dokumen
                <br />
                <span className="relative inline-block min-h-[1.2em] pb-2">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={textIndex}
                      initial={{ y: 40, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -40, opacity: 0 }}
                      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                      className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-yellow-400"
                    >
                      {cyclingTexts[textIndex].text}
                    </motion.span>
                  </AnimatePresence>
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="mb-10 text-lg text-white/80 md:text-xl max-w-2xl mx-auto leading-relaxed"
              >
                Layanan cetak oleh ARSC. Upload dokumen dari mana saja,
                pantau status real-time, dan ambil hasil cetak kapan siap.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    size="lg"
                    onClick={() => router.push('/order')}
                    className="h-14 px-8 text-lg font-semibold bg-white text-primary hover:bg-white/90 shadow-2xl hover:shadow-white/25 transition-all duration-300 group"
                  >
                    Pesan Sekarang
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </motion.div>
                {/*
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => router.push('/track')}
                    className="h-14 px-8 text-lg font-semibold bg-transparent text-white border-white/30 hover:bg-white/10 hover:border-white/50 transition-all duration-300"
                  >
                    Lacak Pesanan
                  </Button>
                </motion.div>
                */}
              </motion.div>

              {/* Highlights */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto"
              >
                {[
                  { value: '24/7', label: 'Akses Online' },
                  { value: 'A4', label: 'Ukuran Kertas' },
                  { value: 'ALL', label: 'Format Support' }
                ].map((stat, i) => (
                  <div key={i} className="text-center">
                    <div className="text-2xl md:text-3xl font-bold text-white">{stat.value}</div>
                    <div className="text-sm text-white/60">{stat.label}</div>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>

          {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-2"
            >
              <motion.div className="w-1.5 h-1.5 rounded-full bg-white" />
            </motion.div>
          </motion.div>
        </section>

        {/* Queue Status Section */}
        <section className="pt-24 md:pt-28 pb-12 md:pb-14 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-muted/30 to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_hsl(var(--primary)/0.05)_0%,_transparent_70%)]" />
          <div className="container relative mx-auto px-4">
            <FadeInUp className="mx-auto max-w-3xl space-y-4">
              <div className="mx-auto max-w-xl">
                <QueueWidget />
              </div>
            </FadeInUp>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-12 md:py-14 relative">
          <div className="container mx-auto px-4">
            <FadeInUp className="text-center mb-16">
              <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                Keunggulan Kami
              </span>
              <h2 className="text-3xl font-bold text-foreground md:text-5xl tracking-tight">
                Kenapa Pilih <span className="gradient-text">ARSC Printing?</span>
              </h2>
              <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
                ARSC menyediakan layanan cetak digital inovatif dengan teknologi modern untuk memenuhi kebutuhan Anda
              </p>
            </FadeInUp>

            <StaggerContainer className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {features.map((feature, index) => (
                <StaggerItem key={index}>
                  <motion.div
                    whileHover={{ y: -8, scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                    className="group relative p-8 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-xl transition-all duration-300"
                  >
                    {/* Glow effect on hover */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    <div className="relative">
                      <div className={`mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-${feature.color}/10 group-hover:scale-110 transition-transform duration-300`}>
                        <feature.icon className={`h-7 w-7 text-${feature.color}`} />
                      </div>
                      <h3 className="mb-3 text-lg font-semibold text-foreground">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </motion.div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 animated-gradient opacity-90" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0aC0ydi00aDJ2NHptMC02aC0ydi00aDJ2NHptLTQgNmgtMnYtNGgydjR6bTAtNmgtMnYtNGgydjR6Ii8+PC9nPjwvZz48L3N2Zz4=')]" />
          
          <div className="container relative mx-auto px-4 text-center">
            <FadeInUp>
              <motion.div
                initial={{ scale: 0.9 }}
                whileInView={{ scale: 1 }}
                transition={{ duration: 0.5 }}
                className="max-w-3xl mx-auto"
              >
                <h2 className="mb-6 text-3xl font-bold text-white md:text-5xl tracking-tight">
                  Siap Untuk Mencetak?
                </h2>
                <p className="mb-10 text-lg text-white/80 max-w-xl mx-auto">
                  Mulai pesan dokumen Anda sekarang dan hemat waktu berharga Anda
                </p>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    size="lg"
                    onClick={() => router.push('/order')}
                    className="h-14 px-10 text-lg font-semibold bg-white text-primary hover:bg-white/90 shadow-2xl group"
                  >
                    Mulai Pesan
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </motion.div>
              </motion.div>
            </FadeInUp>
          </div>
        </section>


      </div>
    </PageTransition>
  )
}
