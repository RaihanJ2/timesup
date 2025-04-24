"use client";
import React from "react";
import { motion } from "framer-motion";
import { Clock, AlarmClock, Timer, ArrowRight, Gauge } from "lucide-react";
import Link from "next/link";

const FeatureCard = ({ title, description, icon, color, link }) => {
  return (
    <motion.div
      whileHover={{
        scale: 1.05,
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2)",
      }}
      whileTap={{ scale: 0.98 }}
      className={`bg-gray-800 rounded-xl p-6 flex flex-col h-full cursor-pointer`}
    >
      <Link href={link} className="flex flex-col h-full">
        <motion.div
          className={`${color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}
          whileHover={{ rotate: 10 }}
        >
          {icon}
        </motion.div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-gray-400 mb-4 flex-grow">{description}</p>
        <div className="flex items-center text-blue-500 font-medium">
          Get Started <ArrowRight size={16} className="ml-2" />
        </div>
      </Link>
    </motion.div>
  );
};

export default function Home() {
  const features = [
    {
      title: "Alarm Clock",
      description:
        "Set customizable alarms with repeating schedules for daily routines.",
      icon: <AlarmClock size={24} className="text-white" />,
      color: "bg-red-500",
      link: "/Alarm",
    },
    {
      title: "Stopwatch",
      description:
        "Track elapsed time with precision and save lap records for reference.",
      icon: <Gauge size={24} className="text-white" />,
      color: "bg-green-500",
      link: "/Stopwatch",
    },
    {
      title: "Task Timer",
      description:
        "Boost productivity with Pomodoro technique and task management.",
      icon: <Timer size={24} className="text-white" />,
      color: "bg-blue-500",
      link: "/Timer",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col gap-2 text-center py-16 px-4"
      >
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20,
            delay: 0.2,
          }}
        >
          <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600 mb-4 leading-normal pb-1">
            TimeSup!
          </h1>
        </motion.div>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          Your complete time management solution with alarms, stopwatch, and
          focus timer all in one place.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="container mx-auto px-4 pb-16"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 * (index + 1) }}
            >
              <FeatureCard {...feature} />
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.8 }}
        className="container mx-auto px-4 pb-16"
      >
        <div className="bg-gray-800 rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Quick Start Guide</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-gray-700 p-4 rounded-lg"
            >
              <h3 className="font-semibold mb-2">Set Alarms</h3>
              <p className="text-sm text-gray-400">
                Create daily or custom repeating alarms with custom names.
              </p>
            </motion.div>
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-gray-700 p-4 rounded-lg"
            >
              <h3 className="font-semibold mb-2">Track Time</h3>
              <p className="text-sm text-gray-400">
                Measure elapsed time and record laps for workouts or tasks.
              </p>
            </motion.div>
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-gray-700 p-4 rounded-lg"
            >
              <h3 className="font-semibold mb-2">Boost Focus</h3>
              <p className="text-sm text-gray-400">
                Use Pomodoro technique to maintain productivity and manage
                tasks.
              </p>
            </motion.div>
          </div>
          <motion.div className="mt-8" whileHover={{ scale: 1.03 }}>
            <Clock size={32} className="mx-auto text-gray-400 mb-2" />
            <p className="text-gray-400">
              Start managing your time effectively today!
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
