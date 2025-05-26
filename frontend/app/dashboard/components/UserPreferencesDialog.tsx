"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { MultiSelect } from "@/components/multi-select";
import { Button } from "@/components/ui/button";
import { expertiseLevels, topicOptions } from "@/lib/data";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import { saveUserPreferences, fetchUserPreferences, updateUserPreferences } from "@/app/store/slices/preferencesSlice";
import { toast } from "sonner";

interface UserPreferencesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function UserPreferencesDialog({ open, onOpenChange }: UserPreferencesDialogProps) {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { preferences, loading } = useAppSelector((state) => state.preferences);
  
  const [expertise, setExpertise] = useState("");
  const [topics, setTopics] = useState<string[]>([]);

  // Load preferences when dialog opens
  useEffect(() => {
    if (open && user && !preferences) {
      dispatch(fetchUserPreferences(user.uid));
    }
  }, [open, user, preferences, dispatch]);

  // Set form values when preferences are loaded
  useEffect(() => {
    if (preferences) {
      setExpertise(preferences.expertise_level || "");
      setTopics(preferences.categories || []);
    }
  }, [preferences]);

  const handleSave = async () => {
    if (!expertise || topics.length === 0 || !user) {
      toast.error("Please select both expertise level and at least one topic");
      return;
    }

    const data = {
      expertise_level: expertise,
      categories: topics,
    };

    try {
      // If preferences exist, update them, otherwise create new ones
      if (preferences) {
        await dispatch(updateUserPreferences({ 
          userId: user.uid, 
          data 
        })).unwrap();
      } else {
        await dispatch(saveUserPreferences({ 
          userId: user.uid, 
          data 
        })).unwrap();
      }

      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.toString());
    }
  };

  // Prevent the dialog from being closed when clicking outside or pressing Escape
  const handleOpenChange = (newOpen: boolean) => {
    // Only allow closing if preferences are set and saved
    if (newOpen === false && (!preferences || !preferences.expertise_level || !preferences.categories?.length)) {
      // Prevent closing the dialog
      return;
    }
    
    // Otherwise, allow the change
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange} modal={true}>
      <DialogContent className="bg-zinc-900 text-white border border-blue-700/50 rounded-2xl shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-blue-400 text-xl font-semibold">Tell us about yourself!</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 mt-4">
          <div>
            <Label className="text-white text-md mb-5">Expertise Level</Label>
            <Select onValueChange={setExpertise} value={expertise}>
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
            <p className="text-sm text-blue-400 mt-3">Select your interested topics.</p>
          </div>

          <Button
            onClick={handleSave}
            disabled={!expertise || topics.length === 0 || loading}
            className="w-full cursor-pointer bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition"
          >
            {loading ? "Saving..." : "Save"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}