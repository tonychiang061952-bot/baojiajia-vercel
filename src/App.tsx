import { BrowserRouter } from "react-router-dom";
import { AppRoutes } from "./router";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n";
import { SEO } from "./components/SEO";
import { RouteBoundary } from "./components/RouteBoundary";


function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <SEO
        title="保家佳 | 保險理財知識分享"
        description="致力於保險知識分享及提供專業的保險諮詢服務。透過淺顯易懂的方式，讓您真正了解保險、善用保險，為家人建立完整的保護網。"
        keywords={["保家佳", "保險規劃", "保險知識", "醫療保險", "壽險", "意外險", "儲蓄險", "退休規劃"]}
        /* 全站共用的 Organization。@id 要跟首頁那份一樣，
           否則 Google 會看成兩個不同的公司實體。 */
        schema={{
          "@context": "https://schema.org",
          "@type": "Organization",
          "@id": "https://baojiajia.tw/#organization",
          "name": "保家佳",
          "url": "https://baojiajia.tw/",
          "logo": {
            "@type": "ImageObject",
            "url": "https://baojiajia.tw/logo.png",
            "width": 256,
            "height": 253
          },
          "sameAs": [
            "https://www.instagram.com/baojia_jia/",
            "https://www.facebook.com/Baojiajia.tw"
          ]
        }}
      />
      <BrowserRouter basename={__BASE_PATH__}>
        {/* 頁面都是 lazy 載入，這層負責顯示載入中與載入失敗，
            避免畫面停在給爬蟲看的靜態底稿上 */}
        <RouteBoundary>
          <AppRoutes />
        </RouteBoundary>
      </BrowserRouter>
    </I18nextProvider>
  );
}

export default App;
