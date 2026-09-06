-- 人氣計數器。一天一列，只存彙總數字，不存任何訪客資料。
create table if not exists page_views (
  day date not null,
  hits bigint not null default 0 check (hits >= 0),
  primary key (day)
);

-- 累計數字要能在不掃全表的情況下取得；資料量小，索引僅為排序用。
create index if not exists page_views_day_idx on page_views (day desc);
