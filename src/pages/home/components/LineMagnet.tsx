/**
 * LINE 領取帶。
 *
 * 舊版首頁完全沒有 LINE 入口，但那是主要的轉換管道（進去之後有懶人包可以下載）。
 * 放在第一屏之下，滑一下就看得到。
 */
export default function LineMagnet() {
  return (
    <section className="bg-brandgold-panel border-y border-brandgold-edge">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6
                      flex flex-wrap items-center gap-5 sm:gap-7">
        <div className="flex-1 min-w-[260px]">
          <span className="block text-[0.7rem] font-bold tracking-[0.16em] text-brandgold-ink mb-1">免費領取</span>
          <b className="text-[1.02rem] font-bold text-cream-900">小資族保險規劃攻略、新生兒保險規劃攻略</b>
          <p className="mt-1 text-[0.85rem] leading-relaxed text-cream-600">
            加入官方 LINE 就能下載，也可以直接私訊我。不會有任何廣告訊息。
          </p>
        </div>
        <a
          href="https://lin.ee/Z7HOfYBe"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-md bg-teal-600 px-6 py-3 text-[0.92rem] font-semibold text-white hover:bg-teal-700 transition-colors whitespace-nowrap max-sm:w-full max-sm:text-center"
        >
          加入官方 LINE
        </a>
      </div>
    </section>
  );
}
