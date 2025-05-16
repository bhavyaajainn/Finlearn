"use client"

import { motion } from "framer-motion"
import { UserInfo } from "./UserInfo"
import { GlossaryCard } from "./GlossaryCard"
import MotivationCard from "./MotivationCard"
import { useState } from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useAppSelector } from "@/app/store/hooks"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label"
import { MultiSelect } from "@/components/multi-select"
import { Button } from "@/components/ui/button"
import { expertiseLevels, topicOptions } from "@/lib/data";

export function Dashboard() {
  const [open, setOpen] = useState<boolean>();
  const [expertise, setExpertise] = useState("");
  const [topics, setTopics] = useState<string[]>([]);
  const router = useRouter();
  const { user, loading, error, verificationEmailSent } = useAppSelector(
    (state) => state.auth
  );


  const handleSave = async () => {
    if (!expertise || topics.length === 0 || !user) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/selectedcategories?user_id=${user.uid}`, {
        method: "POST",
        body: JSON.stringify({
          expertise_level: expertise,
          categories: topics,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log(res);

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData?.message || "Failed to save data.");
      }

      toast.success("Data stored successfully! You can start learning now.");
      setOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Something went wrong. Please try again.");
    }
  };
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  if (open) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-zinc-900 text-white border border-blue-700/50 rounded-2xl shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-blue-400 text-xl font-semibold">Tell us about yourself!</DialogTitle>
          </DialogHeader>

          <div className="space-y-5 mt-4">
            <div>
              <Label className="text-white text-md mb-5">Expertise Level</Label>
              <Select onValueChange={setExpertise}>
                <SelectTrigger className="bg-zinc-800 w-full cursor-pointer text-white border">
                  <SelectValue placeholder="Choose level" className="bg-zinc-800 cursor-pointer text-white" />
                </SelectTrigger>

                <SelectContent className="bg-zinc-900 text-white border border-blue-700">
                  {expertiseLevels.map((item) => (
                    <SelectItem
                      key={item.value}
                      value={item.value}
                      className="hover:bg-zinc-700 hover:text-white cursor-pointer"
                    >
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-white text-md mb-5">Topics of Interest</Label>
              <MultiSelect
                options={topicOptions}
                selected={topics}
                onChange={setTopics}
                placeholder="Select topics you're interested in"
                className="bg-zinc-800 text-white border border-white/50"
              />
              <p className="text-sm  text-blue-400 mt-3">Select your interested topics.</p>
            </div>

            <Button
              onClick={handleSave}
              disabled={!expertise || topics.length === 0}
              className="w-full cursor-pointer bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition"
            >
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    )
  } else {

    return (
      <div className="h-full p-6 container mx-auto">
        <motion.div variants={container} initial="hidden" animate="show" className="grid gap-6">
          <motion.div variants={item}>
            <h1 className="text-2xl font-bold text-white">Dashboard</h1>
            <p className="text-gray-400">Welcome to your financial journey</p>
          </motion.div>


          <motion.div variants={item}>
            <UserInfo />
          </motion.div>
          <MotivationCard />

          <motion.div variants={item}>
            <GlossaryCard />
          </motion.div>

        </motion.div>
      </div>
    )
  }
}
