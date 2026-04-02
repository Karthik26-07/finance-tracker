'use client'

import React, { useState, useMemo } from 'react'
import { Search } from 'lucide-react'

const EMOJI_DATA = [
  { category: 'Finance', emojis: ['💰', '💵', '💳', '🏦', '💹', '📊', '📈', '📉', '💸', '💎', '💼', '🏢', '🏗️'] },
  { category: 'Food', emojis: ['🍏', '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍒', '🍑', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥕', '🌽', '🌶️', '🍕', '🍔', '🍟', '🍳', '🍲', '🍿', '🍱', '🍣', '🍤'] },
  { category: 'Transport', emojis: ['🚗', '🚕', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐', '🚚', '🚛', '🚜', '🚲', '🛵', '🏍️', '🚆', '🚄', '✈️', '🛫', '🛬', '🚢', '🛥️', '🚀', '⛽'] },
  { category: 'Life', emojis: ['🏠', '🏡', '🏘️', '🛌', '🛋️', '🚿', '🚽', '🧻', '🛁', '🧹', '🧼', '🧽', '🍼', '🏥', '🏩', '💊', '💉', '🩺', '🩹', '🌡️', '🎬', '🎮', '🎧', '🎸', '🎹', '🎨', '💻', '🖥️', '📱', '📸'] },
  { category: 'Misc', emojis: ['🎁', '🎈', '🎆', '🧨', '🧿', '🔮', '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐒', '🦋', '🐝', '🐞', '🦗', '🕷️', '🐢', '🐍', '🦎', '🦕', '🦖', '🍀', '🌿', '🌱', '🌾', '🍂', '🍃', '🌵', '🌴', '🌳', '🌲', '🌻', '🌼', '🌹', '🌷'] }
]

interface EmojiPickerProps {
  onSelect: (emoji: string) => void
  onClose: () => void
}

export function EmojiPicker({ onSelect, onClose }: EmojiPickerProps) {
  const [search, setSearch] = useState('')

  const filteredData = useMemo(() => {
    if (!search) return EMOJI_DATA
    
    const lowerSearch = search.toLowerCase()
    return EMOJI_DATA.map(group => ({
      ...group,
      emojis: group.emojis.filter(() => {
        // Without a keyword map, we just allow searching for the emoji itself or category name
        return group.category.toLowerCase().includes(lowerSearch)
      })
    })).filter(group => group.emojis.length > 0)
  }, [search])

  return (
    <div className="flex flex-col h-full bg-surface">
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={14} />
        <input 
          type="text" 
          placeholder="Search by category..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          autoFocus
          className="w-full pl-9 pr-4 py-2 bg-highlight/50 border border-border/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:bg-surface transition-all text-xs"
        />
      </div>

      <div className="flex-1 overflow-y-auto pr-1 space-y-4 custom-scrollbar">
        {filteredData.map((group, idx) => (
          <div key={idx}>
            <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2 px-1">{group.category}</h4>
            <div className="grid grid-cols-6 gap-1">
              {group.emojis.map((emoji, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    onSelect(emoji)
                    onClose()
                  }}
                  className="w-full aspect-square flex items-center justify-center text-xl hover:bg-highlight rounded-xl transition-all hover:scale-110 active:scale-95"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        ))}

        {filteredData.length === 0 && (
          <div className="py-10 text-center">
            <p className="text-xs text-text-muted">No emojis found</p>
          </div>
        )}
      </div>
    </div>
  )
}
