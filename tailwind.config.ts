/** @type {import('tailwindcss').Config} */
import typography from '@tailwindcss/typography';

// 品牌色改版（2026-09）：主色調為米白 #FCF6F1，強調色改為藏青。
// 原本全站用 teal-* 表達「可以點」，共約 590 處。與其逐一改寫 class 名稱，
// 直接把 teal 這個色階重新定義成藏青——所有既有 class 自動跟著換，
// 也避免漏改造成兩套顏色並存。
const navy = {
  50:  '#F2F5F9',
  100: '#E1E8F1',
  200: '#C3D0E1',
  300: '#93A9C6',
  400: '#5C7BA3',
  500: '#2C5183',   // 對應原 teal-500：一般按鈕
  600: '#1F3A5F',   // 對應原 teal-600：主要按鈕與連結（使用者選定的藏青）
  700: '#162C48',   // 對應原 teal-700：hover 與深色狀態
  800: '#101F33',
  900: '#0A1420',
};

// 米白系：頁面底色、分隔線與文字。另開一組命名，
// 不覆蓋既有的 gray-*，避免影響表單與後台的中性色。
const cream = {
  50:  '#FEFCFA',
  100: '#FCF6F1',  // 主色調 · 頁面底
  200: '#F5EDE5',
  300: '#E8DFD7',  // 分隔線
  400: '#D5C8BC',
  500: '#A99C8F',
  600: '#6E6862',  // 次要文字
  700: '#4A443E',
  800: '#2E2C33',  // 頁尾（炭灰）
  900: '#1F1C19',  // 標題與內文
};

export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        fontFamily: {
          // 標題用襯線，內文維持系統字。改版稿的整體調性靠這一組。
          serif: ['"Noto Serif TC"', 'serif'],
        },
        colors: {
          teal: navy,   // 舊 class 名稱不動，色值換掉
          navy,
          cream,
          brandgold: {
            DEFAULT: '#EECD8B',
            ink: '#574512',
            panel: '#FAF1DC',   // CTA 面板底色
            edge: '#DDB863',    // CTA 面板上緣與邊框
          },
          alert: '#C0261F',
        },
      },
    },
    plugins: [
      typography,
    ],
  }
