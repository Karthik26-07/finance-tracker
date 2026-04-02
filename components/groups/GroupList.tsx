"use client";

import React from "react";
import { GroupCard } from "./GroupCard";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search } from "lucide-react";

interface GroupListProps {
  groups: any[];
}

export function GroupList({ groups }: GroupListProps) {
  const [search, setSearch] = React.useState("");

  const filtered = groups.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <aside className="col-span-12 lg:col-span-4 space-y-6">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted opacity-60 font-mono">
          Collective Nodes
        </h3>
        <button className="p-1.5 bg-primary/10 text-primary rounded-lg hover:bg-primary hover:text-white transition-all active:scale-90">
          <Plus size={14} strokeWidth={3} />
        </button>
      </div>

      {/* Search Input for Groups */}
      <div className="relative group px-1">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted opacity-50 group-focus-within:text-primary group-focus-within:opacity-100 transition-all" />
        <input
          type="text"
          placeholder="Search groups..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-highlight/30 border border-border/30 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-surface transition-all font-medium"
        />
      </div>

      <div className="space-y-3">
        <AnimatePresence mode="popLayout" initial={false}>
          {filtered.map((group, idx) => (
            <motion.div
              layout
              key={group.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: idx * 0.05 }}
            >
              <GroupCard group={group} />
            </motion.div>
          ))}
        </AnimatePresence>

        {filtered.length === 0 && (
          <div className="py-12 px-2 text-center border border-dashed border-border/50 rounded-3xl opacity-50">
            <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">
              No groups matching search
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}
