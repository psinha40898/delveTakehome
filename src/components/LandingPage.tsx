'use client'

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import ConnectSupabase from '@/components/ConnectSupabase'
import { ArrowRight, Database, Lock, Zap } from "lucide-react"
import { motion } from "framer-motion"

export default function LandingPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  }

  return (
    <div className="w-full flex flex-col  items-center dark bg-[url('/bg.png')] bg-cover bg-center">
      <section className="mt-24 flex-grow py-8 md:py-12 lg:py-16">
        <motion.div
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="flex flex-col items-center space-y-8 text-center">
            <motion.div className="space-y-4" variants={itemVariants}>
              <h1 className="text-5xl font-bold tracking-tighter sm:text-6xl md:text-7xl lg:text-8xl bg-gradient-to-b from-white to-gray-400 text-transparent bg-clip-text">
                Delve Takehome
              </h1>
              <p className="mx-auto max-w-[700px] text-xl text-muted-foreground">
                Pyush Sinha
              </p>
            </motion.div>
            <motion.div variants={itemVariants}>
              <ConnectSupabase/>
            </motion.div>
          </div>
        </motion.div>
      </section>
      <Card className="mt-5 bg-white/10 rounded-xl border border-white/10 p-4 shadow-lg backdrop-blur-lg w-3/4">
        <section className="md:py-2 lg:py-4  mx-auto sm:px-2 lg:px-4">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            <div className="flex flex-col md:flex-row bg-background/90 border border-white/10 shadow-lg rounded-xl">
              {[
                { icon: Database, title: "RLS", description: "Connect AWS, OpenAI, Github, and other platforms you use" },
                { icon: Zap, title: "MFA", description: "Detect compliance issues automatically with Delve" },
                { icon: Lock, title: "PITR", description: "Your data stays safe with our secure OAuth integration" }
              ].map((item, index) => (
                <motion.div 
                  key={index} 
                  className="flex flex-col items-center space-y-4 text-center p-4 rounded-2xl m-4" 
                  variants={itemVariants}
                >
                  <div className="p-3 rounded-full bg-accent/10">
                    <item.icon className="h-8 w-8 text-accent" />
                  </div>
                  <h2 className="text-2xl font-bold">{item.title}</h2>
                  <p className="text-muted-foreground">
                    {item.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>
      </Card>
      <Card className="mt-5 bg-white/10 rounded-xl border border-white/10 p-4 shadow-lg backdrop-blur-lg w-3/4">
        <section className="md:py-2 lg:py-4  mx-auto sm:px-2 lg:px-4">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            <div className="flex flex-col md:flex-row bg-background/90 border border-white/10 shadow-lg rounded-xl">
              {[
                { icon: Database, title: "RLS", description: "Connect AWS, OpenAI, Github, and other platforms you use" },
                { icon: Zap, title: "MFA", description: "Detect compliance issues automatically with Delve" },
                { icon: Lock, title: "PITR", description: "Your data stays safe with our secure OAuth integration" }
              ].map((item, index) => (
                <motion.div 
                  key={index} 
                  className="flex flex-col items-center space-y-4 text-center p-4 rounded-2xl m-4" 
                  variants={itemVariants}
                >
                  <div className="p-3 rounded-full bg-accent/10">
                    <item.icon className="h-8 w-8 text-accent" />
                  </div>
                  <h2 className="text-2xl font-bold">{item.title}</h2>
                  <p className="text-muted-foreground">
                    {item.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>
      </Card>
    </div>
  )
}