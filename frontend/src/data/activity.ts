export interface ActivityItem {
  id: string;
  type: "created" | "updated" | "published" | "shared" | "exported" | "scored";
  message: string;
  timestamp: string;
}

export const recentActivity: ActivityItem[] = [
  {
    id: "act_1",
    type: "scored",
    message: "“Senior Product Designer — Lumina” scored 98 on the ATS check",
    timestamp: "2 hours ago",
  },
  {
    id: "act_2",
    type: "exported",
    message: "Exported “Portfolio Resume v3” as PDF",
    timestamp: "Yesterday",
  },
  {
    id: "act_3",
    type: "published",
    message: "Published “ATS Professional Draft” and made it public",
    timestamp: "2 days ago",
  },
  {
    id: "act_4",
    type: "updated",
    message: "AI Copilot rewrote 4 bullet points on “Startup Roles”",
    timestamp: "4 days ago",
  },
  {
    id: "act_5",
    type: "created",
    message: "Created a new resume “Creative Director Applications”",
    timestamp: "1 week ago",
  },
];
