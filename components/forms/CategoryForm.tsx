"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createCategorySchema,
  CreateCategoryInput,
  updateCategorySchema,
  UpdateCategoryInput,
} from "@/lib/validations/categories";
import { createCategory, updateCategory } from "@/actions/categories";
import { EmojiPicker } from "@/components/ui/EmojiPicker";
import { ChevronDown, Smile, Hash, Palette, X } from "lucide-react";
import { toast } from "@/lib/store/useToast";

interface CategoryFormProps {
  initialData?: Partial<CreateCategoryInput>;
  categoryId?: string;
  isModal?: boolean;
  onSuccess?: () => void;
  categories?: { id: string; name: string }[]; // For parent selection
}

export function CategoryForm({
  initialData,
  categoryId,
  isModal,
  onSuccess,
  categories = [],
}: CategoryFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const isEditing = !!categoryId;

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<CreateCategoryInput>({
    resolver: zodResolver(
      isEditing ? updateCategorySchema : createCategorySchema,
    ) as Resolver<CreateCategoryInput>,
    defaultValues: initialData || {
      name: "",
      type: "expense",
      color: "#003178",
      icon: "📁",
      parentId: null,
    },
  });

  // Watch values for live sync to fix the color picker "update issue"
  const watchedColor = watch("color");
  const watchedIcon = watch("icon");

  const onSubmit = (data: CreateCategoryInput) => {
    setError(null);
    startTransition(async () => {
      try {
        const result = isEditing
          ? await updateCategory(categoryId, data)
          : await createCategory(data);

        if (result && "error" in result) {
          setError(result.error);
          toast.error(result.error);
          return;
        }

        toast.success(
          isEditing ? "Category updated" : "Category created successfully",
        );

        if (onSuccess) {
          onSuccess();
        } else {
          router.push("/categories");
          router.refresh();
        }
      } catch (err: unknown) {
        const msg =
          err instanceof Error ? err.message : "An unexpected error occurred";
        setError(msg);
        toast.error(msg);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {error && (
        <div className="p-3.5 text-sm text-accent-danger bg-accent-danger/10 rounded-xl border border-accent-danger/20 animate-in fade-in slide-in-from-top-1">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-[11px] font-bold text-text-muted uppercase tracking-widest mb-1.5 ml-1">
            Category Name
          </label>
          <input
            {...register("name")}
            className="w-full px-4 py-3 rounded-xl border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm"
            placeholder="e.g. Health & Fitness"
          />
          {errors.name && (
            <p className="mt-1.5 text-xs text-accent-danger font-medium ml-1">
              {String(errors.name.message)}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-bold text-text-muted uppercase tracking-widest mb-1.5 ml-1">
              Type
            </label>
            <div className="relative shadow-sm rounded-xl overflow-hidden">
              <select
                {...register("type")}
                className="w-full pl-4 pr-10 py-3 rounded-xl border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all appearance-none"
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
                <option value="both">Both</option>
              </select>
              <ChevronDown
                className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
                size={16}
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-text-muted uppercase tracking-widest mb-1.5 ml-1">
              Parent Category
            </label>
            <div className="relative shadow-sm rounded-xl overflow-hidden">
              <select
                {...register("parentId")}
                className="w-full pl-4 pr-10 py-3 rounded-xl border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all appearance-none"
              >
                <option value="">None (Top Level)</option>
                {categories
                  .filter((c) => c.id !== categoryId)
                  .map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
              </select>
              <ChevronDown
                className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
                size={16}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Accent Color Section */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 px-1">
              <Palette size={14} className="text-text-muted" />
              <label className="text-[11px] font-bold text-text-muted uppercase tracking-widest">
                Color
              </label>
            </div>
            <div className="flex items-center gap-3 bg-highlight/30 p-2.5 rounded-2xl border border-border/50 transition-all hover:border-primary/30 shadow-sm">
              <div className="relative group shrink-0">
                <input
                  type="color"
                  value={watchedColor || "#003178"}
                  onChange={(e) => setValue("color", e.target.value)}
                  className="w-11 h-11 rounded-xl border-none cursor-pointer bg-transparent transition-transform hover:scale-105 active:scale-95"
                />
                <div className="absolute inset-0 rounded-xl border border-border group-hover:border-primary/50 pointer-events-none" />
              </div>
              <div className="flex flex-col flex-1">
                <div className="flex items-center gap-2 text-text-muted mb-0.5">
                  <Hash size={10} />
                  <span className="text-[9px] font-bold uppercase tracking-widest leading-none">
                    HEX
                  </span>
                </div>
                <input
                  {...register("color")}
                  className="w-full bg-transparent border-none focus:ring-0 text-text-primary font-mono text-base p-0 leading-tight"
                  placeholder="#003178"
                />
              </div>
            </div>
          </div>

          {/* Icon Section */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 px-1">
              <Smile size={14} className="text-text-muted" />
              <label className="text-[11px] font-bold text-text-muted uppercase tracking-widest">
                Icon
              </label>
            </div>
            <div className="flex items-center gap-3 bg-highlight/30 p-2.5 rounded-2xl border border-border/50 transition-all hover:border-primary/30 relative shadow-sm">
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="w-11 h-11 flex items-center justify-center bg-surface rounded-xl text-2xl border border-border shadow-sm hover:scale-105 active:scale-95 transition-all shrink-0"
              >
                {watchedIcon || "📁"}
              </button>
              <div className="flex flex-col flex-1">
                <div className="flex items-center gap-2 text-text-muted mb-0.5">
                  <Smile size={10} />
                  <span className="text-[9px] font-bold uppercase tracking-widest leading-none">
                    Emoji
                  </span>
                </div>
                <input
                  {...register("icon")}
                  className="w-full bg-transparent border-none focus:ring-0 text-text-primary text-lg p-0 leading-tight"
                  placeholder="📁"
                />
              </div>

              {showEmojiPicker && (
                <div className="absolute bottom-full left-0 mb-3 w-65 h-64 bg-surface border border-border rounded-2xl shadow-2xl z-60 flex flex-col p-3 animate-in zoom-in-90 slide-in-from-bottom-2 duration-200">
                  <div className="flex items-center justify-between mb-3 px-1">
                    <h3 className="font-bold text-xs uppercase tracking-wider text-text-secondary">
                      Library
                    </h3>
                    <button
                      onClick={() => setShowEmojiPicker(false)}
                      className="p-1 hover:bg-highlight rounded-lg text-text-muted"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  <div className="flex-1 min-h-0">
                    <EmojiPicker
                      onSelect={(emoji) => setValue("icon", emoji)}
                      onClose={() => setShowEmojiPicker(false)}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="pt-4 flex gap-3">
        {!isModal && (
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 px-4 py-3.5 border border-border-subtle rounded-xl text-text-primary hover:bg-elevated transition-all font-semibold active:scale-[0.98]"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isPending}
          className="flex-1 px-4 py-3.5 bg-linear-to-r from-primary to-primary-container text-white rounded-xl font-bold hover:brightness-110 active:brightness-95 disabled:opacity-70 transition-all shadow-lg hover:shadow-primary/20 active:scale-[0.98]"
        >
          {isPending
            ? "Saving..."
            : isEditing
              ? "Update Category"
              : "Create Category"}
        </button>
      </div>
    </form>
  );
}
