// /app/actions.ts
"use server";

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

// エラーレスポンスの型定義
export type ActionResponse = {
  success: boolean;
  error?: string;
};

// 全てのメモを取得する処理
export async function getMemos(): Promise<
  { [key: string]: string } | ActionResponse
> {
  const { data, error } = await supabase
    .from("calendar_memos")
    .select("date, memo");

  if (error) {
    console.error("Error fetching memos:", error);
    return {
      success: false,
      error: `メモの取得に失敗しました: ${error.message}`,
    };
  }

  // データを { date: memo } の形式に変換
  const memos: { [key: string]: string } = {};
  data.forEach((item) => {
    memos[item.date] = item.memo;
  });

  return memos;
}

// メモを保存または更新する処理
export async function saveMemo(
  date: string,
  memo: string
): Promise<ActionResponse> {
  try {
    if (memo.trim() === "") {
      // メモが空の場合は削除
      return await deleteMemo(date);
    }

    // 既存のメモを確認
    const { data, error: fetchError } = await supabase
      .from("calendar_memos")
      .select("id")
      .eq("date", date)
      .maybeSingle();

    if (fetchError) {
      return {
        success: false,
        error: `メモの確認に失敗しました: ${fetchError.message}`,
      };
    }

    if (data) {
      // 既存のメモを更新
      const { error } = await supabase
        .from("calendar_memos")
        .update({ memo, updated_at: new Date().toISOString() })
        .eq("date", date);

      if (error) {
        return {
          success: false,
          error: `メモの更新に失敗しました: ${error.message}`,
        };
      }
    } else {
      // 新しいメモを作成
      const { error } = await supabase.from("calendar_memos").insert([
        {
          date,
          memo,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);

      if (error) {
        return {
          success: false,
          error: `メモの作成に失敗しました: ${error.message}`,
        };
      }
    }

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error saving memo:", error);
    return {
      success: false,
      error: `予期せぬエラーが発生しました: ${
        error instanceof Error ? error.message : String(error)
      }`,
    };
  }
}

// メモを削除する処理
export async function deleteMemo(date: string): Promise<ActionResponse> {
  const { error } = await supabase
    .from("calendar_memos")
    .delete()
    .eq("date", date);

  if (error) {
    return {
      success: false,
      error: `メモの削除に失敗しました: ${error.message}`,
    };
  }

  revalidatePath("/");
  return { success: true };
}
