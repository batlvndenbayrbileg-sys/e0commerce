export type Lang = "mn" | "en";
export const LANGS: Lang[] = ["mn", "en"];
export const DEFAULT_LANG: Lang = "mn";

type Dict = Record<string, string>;

const en: Dict = {
  // nav
  "nav.shop": "Shop", "nav.men": "Men", "nav.women": "Women", "nav.trending": "Trending",
  "nav.seasonal": "Seasonal", "nav.accessories": "Accessories",
  "nav.search": "Search the collection…", "nav.searchShort": "Search…", "nav.signin": "Sign in",
  // common
  "common.seeAll": "See all", "common.shopAll": "Shop all", "common.viewAll": "View all",
  "common.soldOut": "Sold out", "common.from": "From", "common.reviews": "reviews",
  "common.addToBag": "Add to bag", "common.buyNow": "Buy now", "common.free": "Free",
  "common.colour": "Colour", "common.size": "Size", "common.sizeGuide": "Size guide",
  "common.quantity": "Quantity", "common.apply": "Apply", "common.shopNow": "Shop now",
  "common.exploreAll": "Explore all", "common.browseShop": "Browse shop",
  // categories
  "cat.all": "All", "cat.Outerwear": "Outerwear", "cat.Tops": "Tops", "cat.Bottoms": "Bottoms",
  "cat.Base Layers": "Base Layers", "cat.Accessories": "Accessories",
  // home
  "home.newSeason": "New season", "home.category": "Category", "home.recommended": "Recommended",
  "home.freshFits": "Fresh fits for your next workout!", "home.newArrival": "New arrival",
  "home.allBrands": "All brands", "home.seeAllBrands": "See all brands",
  "home.justDropped": "Just dropped", "home.newArrivals": "New arrivals", "home.browseAll": "Browse all products",
  "home.promoKicker": "Limited time", "home.promoTitle": "Mid-season sale · up to 30% off",
  "home.promoDesc": "Refresh your training kit. Selected outerwear, tops and bottoms — while stock lasts.",
  "home.promoCta": "Shop the sale",
  "home.newsKicker": "Drop list", "home.newsTitle": "Get early access.",
  "home.newsDesc": "Be first to every drop, restock, and members-only deal. No spam — just the good stuff.",
  "home.s1Kicker": "New season", "home.s1Top": "Exclusive", "home.s1Accent": "Sneakers", "home.s1Desc": "Performance kicks, dropped fresh. Up to 30% off this week.",
  "home.s2Kicker": "Cold weather", "home.s2Top": "Winter", "home.s2Accent": "Outerwear", "home.s2Desc": "Insulated layers engineered to move with you.",
  "home.s3Kicker": "Just dropped", "home.s3Top": "Fresh", "home.s3Accent": "Arrivals", "home.s3Desc": "The latest training kit, in store now.",
  // newsletter form
  "news.placeholder": "you@email.com", "news.subscribe": "Subscribe", "news.subscribed": "You're on the list — welcome to VEXO.",
  "news.policy": "By subscribing you agree to our privacy policy. Unsubscribe anytime.",
  // cart
  "cart.title": "Your bag", "cart.emptyTitle": "Your bag is empty", "cart.emptyDesc": "Looks quiet in here — let's find you something.",
  "cart.summary": "Order summary", "cart.subtotal": "Subtotal", "cart.shipping": "Shipping", "cart.tax": "Tax (est.)",
  "cart.total": "Total", "cart.promo": "Promo code", "cart.checkout": "Checkout", "cart.freeNote": "Free standard shipping nationwide",
  // checkout
  "co.title": "Checkout", "co.cart": "Cart", "co.information": "Information", "co.payment": "Payment", "co.confirm": "Confirm",
  "co.contact": "Contact", "co.email": "Email", "co.emailOffers": "Email me with news and offers",
  "co.shippingAddress": "Shipping address", "co.firstName": "First name", "co.lastName": "Last name",
  "co.address": "Address", "co.city": "City", "co.postal": "Postal code", "co.country": "Country", "co.phone": "Phone",
  "co.shippingMethod": "Shipping method", "co.standard": "Standard — 3 to 5 business days", "co.standardSub": "Tracked, insured",
  "co.express": "Express — 1 to 2 business days", "co.expressSub": "Priority handling",
  "co.wireTitle": "Wire — QPay & bank apps", "co.wireSub": "Scan with QPay or pay from any Mongolian bank app",
  "co.wireNote": "You'll confirm payment securely on Wire, then return here.",
  "co.payWire": "Pay with Wire", "co.starting": "Starting payment…",
  "co.terms": "By placing this order you agree to our Terms & Privacy.",
  "co.order": "Order", "co.secure": "256-bit SSL · PCI compliant",
  // processing / success
  "proc.title": "Confirming payment", "proc.desc": "Approve the request in QPay or your bank app. This page updates automatically.",
  "proc.waiting": "Waiting for Wire confirmation…",
  "ok.title": "Order placed", "ok.desc": "A confirmation has been sent to your email. Your gear is being packed — tracking arrives within 24 hours.",
  "ok.orderNo": "Order number", "ok.eta": "Estimated delivery", "ok.total": "Total",
  "ok.viewOrders": "View orders", "ok.continue": "Continue shopping",
  // auth
  "auth.signIn": "Sign in", "auth.createAccount": "Create account", "auth.welcomeBack": "Welcome back.",
  "auth.createTitle": "Create account.", "auth.signInDesc": "Sign in to track orders and access your kit.",
  "auth.createDesc": "Join VEXO — early drops, restocks, and free standard shipping.",
  "auth.password": "Password", "auth.remember": "Remember me", "auth.forgot": "Forgot password?",
  "auth.or": "or continue with", "auth.haveAccount": "Already have an account?", "auth.noAccount": "New to VEXO?",
  // account
  "acc.welcome": "Welcome back", "acc.signOut": "Sign out", "acc.overview": "Overview", "acc.orders": "Orders",
  "acc.wishlist": "Wishlist", "acc.addresses": "Addresses", "acc.settings": "Settings",
  "acc.statOrders": "Orders", "acc.statSpent": "Spent", "acc.statWishlist": "Wishlist", "acc.statPoints": "Points",
  "acc.recentOrder": "Recent order", "acc.noOrders": "No orders yet", "acc.startShopping": "Start shopping",
  "acc.defaultAddress": "Default address", "acc.paymentMethod": "Payment method", "acc.profileSettings": "Profile settings",
  "acc.saveChanges": "Save changes",
  // footer
  "foot.tagline": "Gear up every season. Performance workout wear engineered for every condition.",
  "foot.shop": "Shop", "foot.support": "Support", "foot.brand": "Brand", "foot.flagship": "Flagship",
  "foot.rights": "© 2026 VEXO Athletic Inc.", "foot.slogan": "Gear up · Every season",
};

const mn: Dict = {
  "nav.shop": "Дэлгүүр", "nav.men": "Эрэгтэй", "nav.women": "Эмэгтэй", "nav.trending": "Тренд",
  "nav.seasonal": "Улирлын", "nav.accessories": "Хэрэгсэл",
  "nav.search": "Бараа хайх…", "nav.searchShort": "Хайх…", "nav.signin": "Нэвтрэх",
  "common.seeAll": "Бүгдийг", "common.shopAll": "Бүгдийг үзэх", "common.viewAll": "Бүгдийг үзэх",
  "common.soldOut": "Дууссан", "common.from": "Эхлэх үнэ", "common.reviews": "сэтгэгдэл",
  "common.addToBag": "Сагсанд хийх", "common.buyNow": "Шууд авах", "common.free": "Үнэгүй",
  "common.colour": "Өнгө", "common.size": "Хэмжээ", "common.sizeGuide": "Хэмжээний заавар",
  "common.quantity": "Тоо ширхэг", "common.apply": "Хэрэглэх", "common.shopNow": "Худалдан авах",
  "common.exploreAll": "Бүгдийг үзэх", "common.browseShop": "Дэлгүүр үзэх",
  "cat.all": "Бүгд", "cat.Outerwear": "Гадуур хувцас", "cat.Tops": "Дээд хувцас", "cat.Bottoms": "Өмд",
  "cat.Base Layers": "Биед ойр давхарга", "cat.Accessories": "Хэрэгсэл",
  "home.newSeason": "Шинэ улирал", "home.category": "Ангилал", "home.recommended": "Санал болгох",
  "home.freshFits": "Дараагийн дасгалд шинэ хувцас!", "home.newArrival": "Шинэ ирэлт",
  "home.allBrands": "Бүх брэнд", "home.seeAllBrands": "Бүгдийг үзэх",
  "home.justDropped": "Шинээр ирсэн", "home.newArrivals": "Шинэ бараа", "home.browseAll": "Бүх барааг үзэх",
  "home.promoKicker": "Хязгаарлагдмал хугацаа", "home.promoTitle": "Улирлын дунд хямдрал · 30% хүртэл",
  "home.promoDesc": "Дасгалын хувцсаа шинэчил. Сонгосон гадуур, дээд, доод хувцас — нөөц дуустал.",
  "home.promoCta": "Хямдралыг үзэх",
  "home.newsKicker": "Шинэ бараа", "home.newsTitle": "Эхэлж мэдээрэй.",
  "home.newsDesc": "Шинэ бараа, нөөц, гишүүдийн хямдралыг хамгийн түрүүнд. Спам байхгүй — зөвхөн хэрэгтэйг нь.",
  "home.s1Kicker": "Шинэ улирал", "home.s1Top": "Онцгой", "home.s1Accent": "Пүүз", "home.s1Desc": "Шинэ пүүзнүүд ирлээ. Энэ долоо хоногт 30% хүртэл хямдрал.",
  "home.s2Kicker": "Хүйтэн цаг", "home.s2Top": "Өвлийн", "home.s2Accent": "Гадуур хувцас", "home.s2Desc": "Дулаалгатай, хөдөлгөөнд таатай давхаргууд.",
  "home.s3Kicker": "Шинээр ирсэн", "home.s3Top": "Шинэхэн", "home.s3Accent": "Бараа", "home.s3Desc": "Хамгийн сүүлийн дасгалын хувцас одоо дэлгүүрт.",
  "news.placeholder": "ta@email.com", "news.subscribe": "Бүртгүүлэх", "news.subscribed": "Жагсаалтад орлоо — VEXO-д тавтай морил.",
  "news.policy": "Бүртгүүлснээр та нууцлалын бодлогыг зөвшөөрнө. Хүссэн үедээ цуцлах боломжтой.",
  "cart.title": "Таны сагс", "cart.emptyTitle": "Сагс хоосон байна", "cart.emptyDesc": "Энд чимээгүй байна — танд тохирох зүйл олъё.",
  "cart.summary": "Захиалгын дүн", "cart.subtotal": "Дэд дүн", "cart.shipping": "Хүргэлт", "cart.tax": "Татвар (ойролцоо)",
  "cart.total": "Нийт", "cart.promo": "Урамшууллын код", "cart.checkout": "Төлбөр төлөх", "cart.freeNote": "Улсын хэмжээнд үнэгүй энгийн хүргэлт",
  "co.title": "Төлбөр", "co.cart": "Сагс", "co.information": "Мэдээлэл", "co.payment": "Төлбөр", "co.confirm": "Баталгаажуулах",
  "co.contact": "Холбоо барих", "co.email": "Имэйл", "co.emailOffers": "Мэдээ, урамшуулал имэйлээр авах",
  "co.shippingAddress": "Хүргэлтийн хаяг", "co.firstName": "Нэр", "co.lastName": "Овог",
  "co.address": "Хаяг", "co.city": "Хот", "co.postal": "Шуудангийн код", "co.country": "Улс", "co.phone": "Утас",
  "co.shippingMethod": "Хүргэлтийн төрөл", "co.standard": "Энгийн — 3-5 ажлын өдөр", "co.standardSub": "Хяналттай, даатгалтай",
  "co.express": "Шуурхай — 1-2 ажлын өдөр", "co.expressSub": "Тэргүүлэх хүргэлт",
  "co.wireTitle": "Wire — QPay ба банкны апп", "co.wireSub": "QPay-аар уншуулах эсвэл дурын банкны аппаар төлөх",
  "co.wireNote": "Та Wire дээр төлбөрөө баталгаажуулаад буцаж ирнэ.",
  "co.payWire": "Wire-ээр төлөх", "co.starting": "Төлбөр эхлүүлж байна…",
  "co.terms": "Захиалга өгснөөр та Үйлчилгээний нөхцөл, Нууцлалыг зөвшөөрнө.",
  "co.order": "Захиалга", "co.secure": "256-bit SSL · PCI стандарт",
  "proc.title": "Төлбөр баталгаажуулж байна", "proc.desc": "QPay эсвэл банкны аппаасаа хүсэлтийг зөвшөөрнө үү. Энэ хуудас автоматаар шинэчлэгдэнэ.",
  "proc.waiting": "Wire-ийн баталгаажуулалтыг хүлээж байна…",
  "ok.title": "Захиалга баталгаажлаа", "ok.desc": "Баталгаажуулах имэйл илгээгдлээ. Таны бараа савлагдаж байна — 24 цагийн дотор хяналтын мэдээлэл ирнэ.",
  "ok.orderNo": "Захиалгын дугаар", "ok.eta": "Хүргэх хугацаа", "ok.total": "Нийт",
  "ok.viewOrders": "Захиалга үзэх", "ok.continue": "Үргэлжлүүлэн дэлгүүр хэсэх",
  "auth.signIn": "Нэвтрэх", "auth.createAccount": "Бүртгүүлэх", "auth.welcomeBack": "Тавтай морил.",
  "auth.createTitle": "Бүртгэл үүсгэх.", "auth.signInDesc": "Захиалгаа хянаж, бараагаа удирдахын тулд нэвтэрнэ үү.",
  "auth.createDesc": "VEXO-д нэгдээрэй — шинэ бараа, нөөц, үнэгүй хүргэлт.",
  "auth.password": "Нууц үг", "auth.remember": "Намайг сана", "auth.forgot": "Нууц үг мартсан уу?",
  "auth.or": "эсвэл үргэлжлүүлэх", "auth.haveAccount": "Бүртгэлтэй юу?", "auth.noAccount": "VEXO-д шинэ юу?",
  "acc.welcome": "Тавтай морил", "acc.signOut": "Гарах", "acc.overview": "Тойм", "acc.orders": "Захиалга",
  "acc.wishlist": "Хадгалсан", "acc.addresses": "Хаягууд", "acc.settings": "Тохиргоо",
  "acc.statOrders": "Захиалга", "acc.statSpent": "Зарцуулсан", "acc.statWishlist": "Хадгалсан", "acc.statPoints": "Оноо",
  "acc.recentOrder": "Сүүлийн захиалга", "acc.noOrders": "Захиалга алга", "acc.startShopping": "Дэлгүүр хэсэх",
  "acc.defaultAddress": "Үндсэн хаяг", "acc.paymentMethod": "Төлбөрийн хэрэгсэл", "acc.profileSettings": "Профайл тохиргоо",
  "acc.saveChanges": "Хадгалах",
  "foot.tagline": "Улирал бүрт бэлэн бай. Аливаа нөхцөлд зориулсан гүйцэтгэлийн дасгалын хувцас.",
  "foot.shop": "Дэлгүүр", "foot.support": "Тусламж", "foot.brand": "Брэнд", "foot.flagship": "Дэлгүүр",
  "foot.rights": "© 2026 VEXO Athletic Inc.", "foot.slogan": "Бэлэн бай · Улирал бүрт",
};

const DICTS: Record<Lang, Dict> = { en, mn };

export function tFor(lang: Lang) {
  const d = DICTS[lang] || mn;
  return (key: string) => d[key] ?? en[key] ?? key;
}
