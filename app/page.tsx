// /app/page.tsx
"use client";

import { useState, useEffect } from "react";
import Calendar from "./components/Calendar";
import MemoModal from "./components/MemoModal";
import { getMemos, saveMemo, deleteMemo } from "./actions";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function Home() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [memos, setMemos] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(true);

  // 初期ロード時にメモを取得
  useEffect(() => {
    async function fetchMemos() {
      try {
        const response = await getMemos();

        // エラーレスポンスかどうかをチェック
        if ("success" in response && !response.success) {
          toast.error("エラー", {
            description: response.error || "メモの取得に失敗しました",
          });
          setMemos({});
        } else {
          setMemos(response as { [key: string]: string });
        }
      } catch (error) {
        console.error("Failed to fetch memos:", error);
        toast.error("エラー", {
          description: "メモの取得中にエラーが発生しました",
        });
        setMemos({});
      } finally {
        setIsLoading(false);
      }
    }

    fetchMemos();
  }, []);

  //日付をクリックした際の処理
  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setIsModalOpen(true);
  };

  const handleDeleteMemo = async (dateKey: string): Promise<boolean> => {
    try {
      // Server Actionを使用してメモを保存
      const response = await deleteMemo(dateKey);
      if (!response.success) {
        // エラーメッセージをトーストで表示
        toast.error("エラー", {
          description: response.error || "メモの削除に失敗しました",
        });
        return false;
      }

      // UIを更新
      const newMemos = { ...memos };
      delete newMemos[dateKey];
      setMemos(newMemos);
      console.log("memos", memos);

      // 成功メッセージをトーストで表示
      toast.success("成功", {
        description: "メモを削除しました",
      });

      return true;
    } catch (error) {
      console.error("Failed to delete memo:", error);

      // エラーメッセージをトーストで表示
      toast.error("エラー", {
        description: "予期せぬエラーが発生しました",
      });

      return false;
    }
    return false;
  }

  //メモを保存
  const handleSaveMemo = async (memo: string): Promise<boolean> => {
    if (selectedDate) {
      const dateKey = selectedDate.toISOString().split("T")[0];
      try {
	// Server Actionを使用してメモを保存
	const response = await saveMemo(dateKey, memo);
	if (!response.success) {
          // エラーメッセージをトーストで表示
          toast.error("エラー", {
            description: response.error || "メモの保存に失敗しました",
          });
          return false;
	}

	// UIを更新
	const newMemos = { ...memos };
	if (memo.trim() === "") {
          delete newMemos[dateKey];
	} else {
          newMemos[dateKey] = memo;
	}
	setMemos(newMemos);
	console.log("memos", memos);

	// 成功メッセージをトーストで表示
	toast.success("成功", {
          description: "メモを保存しました",
	});

	return true;
      } catch (error) {
	console.error("Failed to save memo:", error);

	// エラーメッセージをトーストで表示
	toast.error("エラー", {
          description: "予期せぬエラーが発生しました",
	});

	return false;
      }
    }
    return false;
  };

  //ローディング中表示
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
	<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							   読み込み中...
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">カレンダーメモアプリ</h1>

      <Calendar onDateClick={handleDateClick} memos={memos} />
      <MemoModal
	isOpen={isModalOpen}
	onClose={() => setIsModalOpen(false)}
	date={selectedDate}
	initialMemo={
          selectedDate ? memos[selectedDate.toISOString().split("T")[0]] : ""
	}
	onSave={handleSaveMemo}
	onDelete={handleDeleteMemo}
      />
    </div>
  );
}
