"use client";

import React, { useState } from "react";
import {
  FileUp,
  Info,
  Download,
  X,
  Landmark,
} from "lucide-react";
import { Account } from "@/lib/db/schema";
import { importTransactions } from "@/modules/transactions/transactions.action";
import { toast } from "@/lib/store/useToast";
import { importTransactionRowSchema } from "@/lib/validations/transactions";
import { Modal } from "../ui/Modal";

interface CSVImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: Account[];
}

export function CSVImportDialog({
  isOpen,
  onClose,
  accounts,
}: CSVImportDialogProps) {
  const [selectedAccountId, setSelectedAccountId] = useState(
    accounts[0]?.id || "",
  );
  const [isImporting, setIsImporting] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  if (!isOpen) return null;

  const downloadSample = () => {
    const csvContent =
      "date,amount,type,category,note\n2026-04-01,1500.00,expense,Food,Grocery shopping\n2026-04-02,50000.00,income,Salary,Monthly pay\n2026-04-03,200.00,expense,Transport,Metro refill";
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "fintrack_sample_transactions.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleFile = async (file: File) => {
    if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
      toast.error("Please upload a valid CSV file");
      return;
    }

    setIsImporting(true);
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split(/\r?\n/).filter((line) => line.trim());
        if (lines.length < 2) {
          toast.error("CSV file is empty or missing data");
          return;
        }

        const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
        const dataRows = lines.slice(1).map((line) => {
          const values = line.split(",").map((v) => v.trim());
          const row: Record<string, string> = {};
          headers.forEach((header, i) => {
            // Map friendly names to schema names
            if (header === "category") row.categoryName = values[i];
            else row[header] = values[i];
          });
          return row;
        });

        // Simple validation check before sending
        const validatedRows = [];
        for (const [index, row] of dataRows.entries()) {
          const result = importTransactionRowSchema.safeParse(row);
          if (!result.success) {
            toast.error(`Line ${index + 2}: ${result.error.issues[0].message}`);
            setIsImporting(false);
            return;
          }
          validatedRows.push(result.data);
        }

        const result = await importTransactions({
          accountId: selectedAccountId,
          transactions: validatedRows,
        });

        if (result && "error" in result) {
          toast.error(result.error);
        } else if (result.success) {
          toast.success(`Successfully imported ${result.count} transactions`);
          onClose();
        }
      } catch (err) {
        toast.error("Failed to parse CSV file");
      } finally {
        setIsImporting(false);
      }
    };

    reader.readAsText(file);
  };

  const onDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Import Transactions"
      subtitle="Upload a CSV file to bulk add records"
      size="lg"
    >
      <div className="space-y-6">
        {/* Account Selection */}
        <div>
          <label className="block text-[11px] font-bold text-text-muted uppercase tracking-widest mb-2.5 ml-1">
            Import Into Account
          </label>
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary group-focus-within:text-primary transition-colors">
              <Landmark size={18} />
            </div>
            <select
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
              className="w-full pl-11 pr-10 py-3.5 rounded-2xl border border-border/60 bg-surface/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none text-sm font-semibold text-text-primary"
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} (₹
                  {parseFloat(acc.balance || "0").toLocaleString()})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Dropzone */}
        <div
          onDragEnter={onDrag}
          onDragLeave={onDrag}
          onDragOver={onDrag}
          onDrop={onDrop}
          className={`relative border-2 border-dashed rounded-4xl p-12 transition-all group ${
            dragActive
              ? "border-primary bg-primary/5 scale-[0.99] shadow-inner"
              : "border-border/40 hover:border-primary/50 hover:bg-highlight/50"
          }`}
        >
          <input
            type="file"
            accept=".csv"
            onChange={(e) =>
              e.target.files?.[0] && handleFile(e.target.files[0])
            }
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={isImporting}
          />

          <div className="flex flex-col items-center text-center">
            <div
              className={`p-5 rounded-2xl mb-4 transition-all ${dragActive ? "bg-primary text-white scale-110 shadow-lg" : "bg-highlight text-text-muted group-hover:scale-110 group-hover:bg-primary/10 group-hover:text-primary"}`}
            >
              {isImporting ? (
                <div className="w-8 h-8 border-3 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <FileUp size={32} />
              )}
            </div>
            <h3 className="font-bold text-lg text-text-primary mb-1 tracking-tight">
              {isImporting ? "Processing File..." : "Drop your CSV here"}
            </h3>
            <p className="text-sm text-text-secondary max-w-60 font-medium opacity-80">
              or click to browse your computer. Max 5MB.
            </p>
          </div>
        </div>

        {/* Helper Section */}
        <div className="bg-highlight/20 rounded-2xl p-6 border border-border/30">
          <div className="flex items-start gap-4 mb-5">
            <div className="mt-0.5 p-2 bg-primary/10 text-primary rounded-xl shrink-0">
              <Info size={18} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-text-primary mb-1">
                CSV Format Requirements
              </h4>
              <p className="text-xs text-text-secondary leading-relaxed font-medium">
                Headers should include: <code className="text-primary font-bold">date</code>, <code className="text-primary font-bold">amount</code>, <code className="text-primary font-bold">type</code>, <code className="text-primary font-bold">category</code>, and <code className="text-primary font-bold">note</code>.
              </p>
            </div>
          </div>

          <button
            onClick={downloadSample}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-surface border border-border-subtle rounded-xl text-[10px] font-black uppercase tracking-widest text-text-primary hover:bg-highlight transition-all active:scale-95 shadow-sm"
          >
            <Download size={14} />
            Download Sample Template
          </button>
        </div>

        <div className="pt-2 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-4 text-[11px] font-black uppercase tracking-widest text-text-secondary hover:text-text-primary hover:bg-highlight rounded-2xl transition-all"
          >
            Close Import
          </button>
        </div>
      </div>
    </Modal>
  );
}
