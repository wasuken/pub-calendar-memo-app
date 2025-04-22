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
  onDelete: (dateKey: string) => Promise<boolean>; //削除
};

const MemoModal = ({
  isOpen,
  onClose,
  date,
  initialMemo,
  onSave,
  onDelete,
}: MemoModalProps) => {
  const [memo, setMemo] = useState(initialMemo);
  const [isLoading, setIsLoading] = useState(false);

  //useEffectでinitialMemoをmemoにセット
  useEffect(() => {
    setMemo(initialMemo);
  }, [initialMemo, isOpen]);

  const handleDelete = async () => {
    if(date === null) return;
    setIsLoading(true);
    try {
      const success = await onDelete(date.toISOString().split("T")[0] || "");
      if (success) {
        onClose();
      }
    } catch (error) {
      console.error("Failed to save memo:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const success = await onSave(memo);
      if (success) {
        onClose();
      }
    } catch (error) {
      console.error("Failed to save memo:", error);
    } finally {
      setIsLoading(false);
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
          disabled={isLoading}
        />
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            キャンセル
          </Button>
	  {initialMemo !== undefined && (
	    <Button variant="outline" onClick={handleDelete} disabled={isLoading}>
	      削除
            </Button>
	  )}
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? (
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
