import { existsSync } from 'node:fs';
import { neon } from '@neondatabase/serverless';

if (existsSync('.env') && typeof process.loadEnvFile === 'function') {
  process.loadEnvFile('.env');
}

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error('Missing DATABASE_URL');

const sql = neon(databaseUrl);

const PLACEHOLDER_IMAGE = '/hero.png';

const homepageContent = [
  ['hero_title', '我們的願景是\n打破傳統保險業務的框架'],
  ['hero_subtitle', ''],
  ['hero_description', '提供對等、客觀、正確的資訊，\n讓大家在資訊爆炸的環境中有辨別好壞的能力。\n用專業的知識為你在市場中找出最適合的規劃方案！'],
  ['hero_button1_text', '需求分析 DIY'],
  ['hero_button1_link', '/analysis'],
  ['hero_button2_text', '保險知識分享'],
  ['hero_button2_link', '/blog'],
  ['hero_image_url', ''],
  ['cta_title', '開始您的保險規劃之旅'],
  ['cta_description', '先透過「需求分析 DIY」了解自己的保障缺口，或直接預約諮詢，讓保家佳為您量身規劃'],
  ['cta_button1_text', '立即開始需求分析'],
  ['cta_button1_link', '/analysis'],
  ['cta_button2_text', '預約專人諮詢'],
  ['cta_button2_link', '/contact'],
  ['instagram_text', '追蹤我們的 Instagram'],
  ['instagram_handle', '@baojia_jia'],
  ['instagram_url', 'https://www.instagram.com/baojia_jia/'],
].map(([content_key, content_value], index) => ({
  content_key,
  content_value,
  display_order: index + 1,
  is_active: true,
}));

const services = [
  {
    slug: 'medical',
    title: '醫療險規劃',
    icon: 'ri-hospital-line',
    description: '住院、手術、實支實付怎麼配才夠？用最白話的方式，把病房費、雜費、手術費的缺口一次算清楚。',
    content: '<h2>為什麼需要醫療險</h2><p>健保只負擔基本的醫療支出，病房差額、自費藥物與自費醫材才是真正的負擔。醫療險的目的，是讓您在需要治療時，可以選擇最適合的方式，而不是最便宜的方式。</p><h2>規劃重點</h2><ul><li><strong>實支實付：</strong>支付健保不給付的雜費與醫材，建議優先配置。</li><li><strong>住院日額：</strong>補足住院期間的收入損失與看護費用。</li><li><strong>手術費用：</strong>依手術等級給付，注意條款採用的是健保手術表還是保單自訂表。</li></ul><h2>常見迷思</h2><p>「日額買很高就夠了」——現在住院天數越來越短，雜費卻越來越高，只買日額往往補不到真正的缺口。</p>',
  },
  {
    slug: 'critical-illness',
    title: '重大傷病與癌症險',
    icon: 'ri-heart-pulse-line',
    description: '一次性給付撐住治療期的現金流，涵蓋標靶藥、免疫療法等高額自費項目。',
    content: '<h2>重大傷病險的價值</h2><p>癌症與重大疾病最大的風險不只是醫療費，而是治療期間無法工作的收入中斷。一次性給付能讓您安心休養，不必為了現金流被迫回到工作崗位。</p><h2>規劃重點</h2><ul><li><strong>重大傷病卡：</strong>以健保重大傷病證明為理賠依據，認定相對明確。</li><li><strong>癌症療程：</strong>標靶與免疫療法多屬自費，單月費用可達數十萬。</li><li><strong>保額估算：</strong>建議至少涵蓋二至三年的家庭生活支出。</li></ul>',
  },
  {
    slug: 'accident',
    title: '意外險規劃',
    icon: 'ri-shield-cross-line',
    description: '保費低、槓桿高，但職業等級與失能比例表才是理賠關鍵，帶您看懂條款細節。',
    content: '<h2>意外險怎麼看</h2><p>意外險保費便宜、槓桿高，是每個人都該有的基礎保障。但理賠與否取決於「外來、突發、非疾病」三要件，以及您的職業等級申報是否正確。</p><h2>規劃重點</h2><ul><li><strong>失能扶助：</strong>比身故給付更重要，失能後的長期照顧才是最大負擔。</li><li><strong>意外實支：</strong>補足門診手術、骨折固定等健保不給付的項目。</li><li><strong>職業等級：</strong>換工作後務必通知保險公司，否則可能影響理賠。</li></ul>',
  },
  {
    slug: 'life',
    title: '壽險與家庭保障',
    icon: 'ri-home-heart-line',
    description: '房貸、子女教育、父母奉養——用責任額度反推保額，不多買也不少買。',
    content: '<h2>保額怎麼算才合理</h2><p>壽險保額不是憑感覺，而是把您肩上的責任加總：未償房貸、子女到成年的教育與生活費、父母的奉養責任，再扣除既有的資產與保障。</p><h2>規劃重點</h2><ul><li><strong>定期壽險：</strong>在責任最重的階段用最低成本買到足額保障。</li><li><strong>終身壽險：</strong>適合有稅務規劃或喪葬費用預留需求者。</li><li><strong>定期檢視：</strong>結婚、生子、購屋後都應重新計算責任額度。</li></ul>',
  },
  {
    slug: 'long-term-care',
    title: '長期照顧規劃',
    icon: 'ri-parent-line',
    description: '失能、失智不是老年人的專利。長照、失能、特傷三種商品差在哪，一次講清楚。',
    content: '<h2>三種長照商品的差別</h2><p>市面上的「長照」商品其實分成三類，理賠條件差異很大，買錯了很可能領不到。</p><ul><li><strong>長期照顧險：</strong>依巴氏量表等生理／認知功能判定，需定期複檢。</li><li><strong>失能扶助險：</strong>依失能等級表理賠，認定標準明確。</li><li><strong>特定傷病險：</strong>罹患條款列舉的疾病即給付。</li></ul><h2>規劃重點</h2><p>照顧一位失能長者，聘請看護的月支出動輒三萬元以上，且平均照顧期間長達七至九年。保額請以「月給付 × 預估年數」估算。</p>',
  },
  {
    slug: 'savings',
    title: '儲蓄與退休規劃',
    icon: 'ri-line-chart-line',
    description: '先看懂 IRR 再談儲蓄險。把保障、儲蓄、投資分開想，錢才會放在對的地方。',
    content: '<h2>先分清楚目的</h2><p>保障歸保障、儲蓄歸儲蓄。把保障需求塞進儲蓄型商品，往往是保費很貴、保障卻不足。</p><h2>規劃重點</h2><ul><li><strong>看 IRR 不看總領回：</strong>總領回金額會受年期影響，內部報酬率才能真正比較。</li><li><strong>資金流動性：</strong>提前解約多半會虧損，請確認這筆錢中途不會動用。</li><li><strong>退休缺口：</strong>先估算勞保加勞退能領多少，差額才是需要自行準備的部分。</li></ul>',
  },
];

const coreValues = [
  { icon: 'ri-eye-line', title: '資訊對等', description: '把商品的優點和缺點一起說清楚，讓您在了解全貌之後才做決定。' },
  { icon: 'ri-scales-3-line', title: '客觀中立', description: '不以佣金高低推薦商品，只以您的需求與預算為出發點。' },
  { icon: 'ri-book-open-line', title: '知識先行', description: '先教會您怎麼判斷，再談規劃。懂了，才不會買錯。' },
];

const blogCategories = [
  { name: '保險觀念', slug: 'concepts' },
  { name: '醫療險', slug: 'medical' },
  { name: '意外險', slug: 'accident' },
  { name: '壽險', slug: 'life' },
  { name: '長照與失能', slug: 'long-term-care' },
  { name: '理財規劃', slug: 'finance' },
];

const systemSettings = [
  { setting_key: 'reviews_submission_enabled', setting_value: 'true', description: 'Enable/disable customer review submissions (login required)' },
  { setting_key: 'analysis_adult_icon', setting_value: '', description: '成人保險規劃圖示 URL' },
  { setting_key: 'analysis_child_icon', setting_value: '', description: '幼兒保險規劃圖示 URL' },
];

const seeds = [
  {
    collection: 'hero_carousel',
    rows: [{
      title: '我們的願景是打破傳統保險業務的框架',
      subtitle: '',
      description: '提供對等、客觀、正確的資訊，讓大家在資訊爆炸的環境中有辨別好壞的能力。用專業的知識為你在市場中找出最適合的規劃方案！',
      button1_text: '需求分析 DIY',
      button1_link: '/analysis',
      button1_bg_color: '#0d9488',
      button1_text_color: '#ffffff',
      button2_text: '保險知識分享',
      button2_link: '/blog',
      button2_bg_color: '#ffffff',
      button2_text_color: '#ffffff',
      image_url: '',
      cloudinary_public_id: '',
      overlay_opacity: 90,
      button_position: 'left',
      display_order: 1,
      is_active: true,
    }],
  },
  {
    collection: 'carousel_settings',
    rows: [{ setting_key: 'carousel_interval', setting_value: '5000' }],
  },
  { collection: 'homepage_content', rows: homepageContent },
  {
    collection: 'service_items',
    rows: services.map((service, index) => ({
      title: service.title,
      description: service.description,
      icon: service.icon,
      image_url: PLACEHOLDER_IMAGE,
      slug: service.slug,
      display_order: index + 1,
      is_active: true,
    })),
  },
  {
    collection: 'about_content',
    rows: [{
      mission_title: '用知識守護每個家庭',
      mission_content: '保家佳相信，好的保險規劃始於看得懂的資訊。我們用生活化的語言拆解艱澀的條款，把商品的優點和限制一併攤開來說，讓每一位客戶都能在真正理解之後，為自己和家人做出最合適的選擇。',
      hero_image: '',
      intro_visible: true,
      team_visible: true,
    }],
  },
  {
    collection: 'core_values',
    rows: coreValues.map((value, index) => ({ ...value, display_order: index + 1, is_active: true })),
  },
  {
    collection: 'team_members',
    rows: [{
      name: '保家佳團隊',
      role: '保險規劃顧問',
      description: '專注於保險知識分享與需求導向的保障規劃，協助客戶看懂條款、找出缺口、建立完整的保護網。',
      image_url: PLACEHOLDER_IMAGE,
      display_order: 1,
      is_active: true,
    }],
  },
  {
    collection: 'blog_categories',
    rows: blogCategories.map((category, index) => ({ ...category, display_order: index + 1, is_active: true })),
  },
  { collection: 'system_settings', rows: systemSettings },
];

async function countRows(collection) {
  const rows = await sql.query('select count(*)::int as count from app_records where collection = $1', [collection]);
  return rows[0].count;
}

async function insertRows(collection, rows) {
  await sql.query(
    `insert into app_records (collection, data)
     select $1, item from jsonb_array_elements($2::jsonb) as item`,
    [collection, JSON.stringify(rows)],
  );
}

// Only fills collections that are still empty, so re-running never overwrites
// content edited through the admin pages.
for (const { collection, rows } of seeds) {
  const existing = await countRows(collection);
  if (existing > 0) {
    console.log(`Skipped ${collection} — already has ${existing} record(s).`);
    continue;
  }
  await insertRows(collection, rows);
  console.log(`Seeded ${collection} with ${rows.length} record(s).`);
}

// service_details rows reference the service_items row they belong to, so they
// are inserted after the services exist and are matched back up by slug.
const detailCount = await countRows('service_details');
if (detailCount > 0) {
  console.log(`Skipped service_details — already has ${detailCount} record(s).`);
} else {
  const items = await sql.query(
    `select id, data ->> 'slug' as slug from app_records where collection = 'service_items'`,
  );
  const idBySlug = new Map(items.map((item) => [item.slug, item.id]));
  const details = services
    .filter((service) => idBySlug.has(service.slug))
    .map((service) => ({
      service_id: idBySlug.get(service.slug),
      content: service.content,
      hero_image_url: '',
    }));
  if (details.length) {
    await insertRows('service_details', details);
    console.log(`Seeded service_details with ${details.length} record(s).`);
  } else {
    console.log('Skipped service_details — no matching service_items found.');
  }
}

const total = await sql.query('select count(*)::int as count from app_records');
console.log(`\napp_records now holds ${total[0].count} record(s).`);
