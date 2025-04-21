// /app/components/MemoModal.tsx

"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react"; //ローディングアニメーション追加

type MemoModalProps = {
  isOpen: boolean;
  onClose: () => void;
  date: Date | null;
  initialMemo: string;
  onSave: (memo: string) => Promise<boolean>; //変更
};

const MemoModal = ({
  isOpen,
  onClose,
  date,
  initialMemo,
  onSave,
}: MemoModalProps) => {
  const [memo, setMemo] = useState(initialMemo);
  const [isSaving, setIsSaving] = useState(false);

  //useEffectでinitialMemoをmemoにセット
  useEffect(() => {
    setMemo(initialMemo);
  }, [initialMemo, isOpen]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const success = await onSave(memo);
      if (success) {
        onClose();
      }
    } catch (error) {
      console.error("Failed to save memo:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!date) return null; //nullの可能性ありの為、それを排除

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {date.toLocaleDateString("ja-JP", {
              //dateを日本語表記の年月日に変換
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
            のメモ
          </DialogTitle>
        </DialogHeader>

        <Textarea
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          placeholder="メモを入力してください"
          className="min-h-[100px] focus-visible:ring-0"
          disabled={isSaving}
        />
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            キャンセル
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                保存中...
              </>
            ) : (
              "保存"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MemoModal;
