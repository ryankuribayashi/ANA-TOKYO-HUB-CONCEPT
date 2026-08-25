const AIRPORTS = {
    'NRT': { name: 'Tokyo Mega Hub', nameJP: '東京メガハブ', city: 'Tokyo', country: 'Japan', lat: 35.7647, lng: 140.3865, hub: true },
    'KIX': { name: 'Kansai International Airport', nameJP: '関西国際空港', city: 'Osaka', country: 'Japan', lat: 34.4347, lng: 135.2440, hub: true },
    // ── North America ──────────────────────────────────────────────────────────
    'JFK': { name: 'John F. Kennedy Intl', nameJP: 'ジョン・F・ケネディ国際空港', city: 'New York', country: 'USA', lat: 40.6413, lng: -73.7781 },
    'LAX': { name: 'Los Angeles Intl', nameJP: 'ロサンゼルス国際空港', city: 'Los Angeles', country: 'USA', lat: 33.9425, lng: -118.4081 },
    'SFO': { name: 'San Francisco Intl', nameJP: 'サンフランシスコ国際空港', city: 'San Francisco', country: 'USA', lat: 37.6213, lng: -122.3790 },
    'ORD': { name: "Chicago O'Hare Intl", nameJP: 'シカゴ・オヘア国際空港', city: 'Chicago', country: 'USA', lat: 41.9742, lng: -87.9073 },
    'SEA': { name: 'Seattle-Tacoma Intl', nameJP: 'シアトル・タコマ国際空港', city: 'Seattle', country: 'USA', lat: 47.4502, lng: -122.3088 },
    'IAH': { name: 'George Bush Intercontinental', nameJP: 'ジョージ・ブッシュ・インターコンチネンタル空港', city: 'Houston', country: 'USA', lat: 29.9902, lng: -95.3368 },
    'BOS': { name: 'Boston Logan Intl', nameJP: 'ボストン・ローガン国際空港', city: 'Boston', country: 'USA', lat: 42.3656, lng: -71.0096 },
    'IAD': { name: 'Washington Dulles Intl', nameJP: 'ワシントン・ダレス国際空港', city: 'Washington DC', country: 'USA', lat: 38.9531, lng: -77.4565 },
    'DEN': { name: 'Denver Intl', nameJP: 'デンバー国際空港', city: 'Denver', country: 'USA', lat: 39.8561, lng: -104.6737 },
    'DTW': { name: 'Detroit Metropolitan', nameJP: 'デトロイト・メトロポリタン空港', city: 'Detroit', country: 'USA', lat: 42.2162, lng: -83.3554 },
    'ATL': { name: 'Hartsfield-Jackson Atlanta Intl', nameJP: 'ハーツフィールド・ジャクソン・アトランタ国際空港', city: 'Atlanta', country: 'USA', lat: 33.6407, lng: -84.4277 },
    'DFW': { name: 'Dallas/Fort Worth Intl', nameJP: 'ダラス/フォートワース国際空港', city: 'Dallas', country: 'USA', lat: 32.8998, lng: -97.0403 },
    'MSP': { name: 'Minneapolis-Saint Paul Intl', nameJP: 'ミネアポリス・セントポール国際空港', city: 'Minneapolis', country: 'USA', lat: 44.8848, lng: -93.2223 },
    'SAN': { name: 'San Diego Intl', nameJP: 'サンディエゴ国際空港', city: 'San Diego', country: 'USA', lat: 32.7338, lng: -117.1933 },
    'HNL': { name: 'Daniel K. Inouye Intl', nameJP: 'ダニエル・K・イノウエ国際空港', city: 'Honolulu', country: 'USA', lat: 21.3245, lng: -157.9251 },
    'EWR': { name: 'Newark Liberty Intl', nameJP: 'ニューアーク・リバティ国際空港', city: 'Newark', country: 'USA', lat: 40.6895, lng: -74.1745, metro: 'New York' },
    'PHL': { name: 'Philadelphia Intl', nameJP: 'フィラデルフィア国際空港', city: 'Philadelphia', country: 'USA', lat: 39.8744, lng: -75.2424 },
    'LAS': { name: 'Harry Reid Intl', nameJP: 'ハリー・リード国際空港', city: 'Las Vegas', country: 'USA', lat: 36.0840, lng: -115.1537 },
    'SLC': { name: 'Salt Lake City Intl', nameJP: 'ソルトレイクシティ国際空港', city: 'Salt Lake City', country: 'USA', lat: 40.7884, lng: -111.9778 },
    'PHX': { name: 'Phoenix Sky Harbor Intl', nameJP: 'フェニックス・スカイハーバー国際空港', city: 'Phoenix', country: 'USA', lat: 33.4373, lng: -112.0078 },
    'CLT': { name: 'Charlotte Douglas Intl', nameJP: 'シャーロット・ダグラス国際空港', city: 'Charlotte', country: 'USA', lat: 35.2140, lng: -80.9431 },
    'PDX': { name: 'Portland Intl', nameJP: 'ポートランド国際空港', city: 'Portland', country: 'USA', lat: 45.5898, lng: -122.5951 },
    'MIA': { name: 'Miami Intl', nameJP: 'マイアミ国際空港', city: 'Miami', country: 'USA', lat: 25.7959, lng: -80.2870 },
    'MCO': { name: 'Orlando Intl', nameJP: 'オーランド国際空港', city: 'Orlando', country: 'USA', lat: 28.4312, lng: -81.3081 },
    'IND': { name: 'Indianapolis Intl', nameJP: 'インディアナポリス国際空港', city: 'Indianapolis', country: 'USA', lat: 39.7173, lng: -86.2944 },
    'AUS': { name: 'Austin-Bergstrom Intl', nameJP: 'オースティン・バーグストローム国際空港', city: 'Austin', country: 'USA', lat: 30.1975, lng: -97.6664 },
    'STL': { name: 'St. Louis Lambert Intl', nameJP: 'セントルイス・ランバート国際空港', city: 'St. Louis', country: 'USA', lat: 38.7487, lng: -90.3700 },
    'MCI': { name: 'Kansas City Intl', nameJP: 'カンザスシティ国際空港', city: 'Kansas City', country: 'USA', lat: 39.2976, lng: -94.7139 },
    'ANC': { name: 'Ted Stevens Anchorage Intl', nameJP: 'テッド・スティーブンス・アンカレッジ国際空港', city: 'Anchorage', country: 'USA', lat: 61.1741, lng: -149.9963 },
    'YVR': { name: 'Vancouver Intl', nameJP: 'バンクーバー国際空港', city: 'Vancouver', country: 'Canada', lat: 49.1967, lng: -123.1815 },
    'YYZ': { name: 'Toronto Pearson Intl', nameJP: 'トロント・ピアソン国際空港', city: 'Toronto', country: 'Canada', lat: 43.6777, lng: -79.6248 },
    'YYC': { name: 'Calgary Intl', nameJP: 'カルガリー国際空港', city: 'Calgary', country: 'Canada', lat: 51.1315, lng: -114.0106 },
    'YUL': { name: 'Montréal-Trudeau Intl', nameJP: 'モントリオール・トルドー国際空港', city: 'Montreal', country: 'Canada', lat: 45.4706, lng: -73.7408 },
    'MEX': { name: 'Mexico City Intl', nameJP: 'メキシコシティ国際空港', city: 'Mexico City', country: 'Mexico', lat: 19.4361, lng: -99.0719 },
    'MTY': { name: 'Monterrey Mariano Escobedo Intl', nameJP: 'モンテレー国際空港', city: 'Monterrey', country: 'Mexico', lat: 25.7749, lng: -100.1067 },
    'SJC': { name: 'Norman Y. Mineta San José Intl', nameJP: 'ノーマン・Y・ミネタ・サンノゼ国際空港', city: 'San Jose', country: 'USA', lat: 37.3639, lng: -121.9289 },
    'PTY': { name: 'Tocumen Intl', nameJP: 'トクメン国際空港', city: 'Panama City', country: 'Panama', lat: 9.0714, lng: -79.3835 },
    // ── Asia — China ──────────────────────────────────────────────────────────
    'PEK': { name: 'Beijing Capital Intl', nameJP: '北京首都国際空港', city: 'Beijing', country: 'China', lat: 40.0799, lng: 116.6031 },
    'PVG': { name: 'Shanghai Pudong Intl', nameJP: '上海浦東国際空港', city: 'Shanghai', country: 'China', lat: 31.1434, lng: 121.8052 },
    'HKG': { name: 'Hong Kong Intl', nameJP: '香港国際空港', city: 'Hong Kong', country: 'Hong Kong', lat: 22.3080, lng: 113.9185 },
    'CAN': { name: 'Guangzhou Baiyun Intl', nameJP: '広州白雲国際空港', city: 'Guangzhou', country: 'China', lat: 23.3924, lng: 113.2988 },
    'SZX': { name: 'Shenzhen Bao\'an Intl', nameJP: '深圳宝安国際空港', city: 'Shenzhen', country: 'China', lat: 22.6393, lng: 113.8107 },
    'MFM': { name: 'Macau Intl', nameJP: 'マカオ国際空港', city: 'Macau', country: 'Macau', lat: 22.1496, lng: 113.5915 },
    'HGH': { name: 'Hangzhou Xiaoshan Intl', nameJP: '杭州蕭山国際空港', city: 'Hangzhou', country: 'China', lat: 30.2295, lng: 120.4344 },
    'TSN': { name: 'Tianjin Binhai Intl', nameJP: '天津浜海国際空港', city: 'Tianjin', country: 'China', lat: 39.1244, lng: 117.3460 },
    'CTU': { name: 'Chengdu Tianfu Intl', nameJP: '成都天府国際空港', city: 'Chengdu', country: 'China', lat: 30.3128, lng: 104.4438 },
    'XIY': { name: 'Xi\'an Xianyang Intl', nameJP: '西安咸陽国際空港', city: "Xi'an", country: 'China', lat: 34.4471, lng: 108.7516 },
    // ── Asia — Korea ──────────────────────────────────────────────────────────
    'ICN': { name: 'Seoul Incheon Intl', nameJP: '仁川国際空港', city: 'Seoul', country: 'South Korea', lat: 37.4602, lng: 126.4407 },
    'GMP': { name: 'Seoul Gimpo Intl', nameJP: '金浦国際空港', city: 'Seoul', country: 'South Korea', lat: 37.5583, lng: 126.7906, metro: 'Seoul' },
    'PUS': { name: 'Gimhae Intl', nameJP: '金海国際空港', city: 'Busan', country: 'South Korea', lat: 35.1795, lng: 128.9384 },
    'TAE': { name: 'Daegu Intl', nameJP: '大邱国際空港', city: 'Daegu', country: 'South Korea', lat: 35.8969, lng: 128.6589 },
    'KWJ': { name: 'Gwangju Airport', nameJP: '光州空港', city: 'Gwangju', country: 'South Korea', lat: 35.1264, lng: 126.8089 },
    'CJU': { name: 'Jeju Intl', nameJP: '済州国際空港', city: 'Jeju', country: 'South Korea', lat: 33.5113, lng: 126.4930 },
    // ── Asia — Taiwan ─────────────────────────────────────────────────────────
    'TPE': { name: 'Taipei Taoyuan Intl', nameJP: '台北桃園国際空港', city: 'Taipei', country: 'Taiwan', lat: 25.0797, lng: 121.2342 },
    'KHH': { name: 'Kaohsiung Intl', nameJP: '高雄国際空港', city: 'Kaohsiung', country: 'Taiwan', lat: 22.5771, lng: 120.3496 },
    // ── Asia — Southeast Asia ─────────────────────────────────────────────────
    'BKK': { name: 'Bangkok Suvarnabhumi', nameJP: 'バンコク・スワンナプーム国際空港', city: 'Bangkok', country: 'Thailand', lat: 13.6900, lng: 100.7501 },
    'HKT': { name: 'Phuket Intl', nameJP: 'プーケット国際空港', city: 'Phuket', country: 'Thailand', lat: 8.1132, lng: 98.3169 },
    'MNL': { name: 'Ninoy Aquino Intl', nameJP: 'ニノイ・アキノ国際空港', city: 'Manila', country: 'Philippines', lat: 14.5086, lng: 121.0194 },
    'CEB': { name: 'Mactan-Cebu Intl', nameJP: 'マクタン・セブ国際空港', city: 'Cebu', country: 'Philippines', lat: 10.3075, lng: 123.9791 },
    'CGK': { name: 'Soekarno-Hatta Intl', nameJP: 'スカルノ・ハッタ国際空港', city: 'Jakarta', country: 'Indonesia', lat: -6.1256, lng: 106.6559 },
    'SUB': { name: 'Juanda Intl', nameJP: 'ジュアンダ国際空港', city: 'Surabaya', country: 'Indonesia', lat: -7.3798, lng: 112.7869 },
    'DPS': { name: 'Ngurah Rai Intl', nameJP: 'デンパサール・ングラライ国際空港', city: 'Denpasar', country: 'Indonesia', lat: -8.7482, lng: 115.1672 },
    'KUL': { name: 'Kuala Lumpur Intl', nameJP: 'クアラルンプール国際空港', city: 'Kuala Lumpur', country: 'Malaysia', lat: 2.7456, lng: 101.7099 },
    'SIN': { name: 'Singapore Changi', nameJP: 'シンガポール・チャンギ空港', city: 'Singapore', country: 'Singapore', lat: 1.3644, lng: 103.9915 },
    'SGN': { name: 'Tan Son Nhat Intl', nameJP: 'タンソンニャット国際空港', city: 'Ho Chi Minh City', country: 'Vietnam', lat: 10.8188, lng: 106.6520 },
    'HAN': { name: 'Noi Bai Intl', nameJP: 'ノイバイ国際空港', city: 'Hanoi', country: 'Vietnam', lat: 21.2212, lng: 105.8072 },
    'RGN': { name: 'Yangon Intl', nameJP: 'ヤンゴン国際空港', city: 'Yangon', country: 'Myanmar', lat: 16.9073, lng: 96.1332 },
    'PNH': { name: 'Phnom Penh Intl', nameJP: 'プノンペン国際空港', city: 'Phnom Penh', country: 'Cambodia', lat: 11.5466, lng: 104.8440 },
    'VTE': { name: 'Wattay Intl', nameJP: 'ワッタイ国際空港', city: 'Vientiane', country: 'Laos', lat: 17.9883, lng: 102.5633 },
    // ── Asia — South Asia ─────────────────────────────────────────────────────
    'DEL': { name: 'Indira Gandhi Intl', nameJP: 'インディラ・ガンジー国際空港', city: 'New Delhi', country: 'India', lat: 28.5665, lng: 77.1031 },
    'BOM': { name: 'Chhatrapati Shivaji Maharaj Intl', nameJP: 'チャトラパティ・シヴァージー・マハラージ国際空港', city: 'Mumbai', country: 'India', lat: 19.0896, lng: 72.8656 },
    'BLR': { name: 'Kempegowda Intl', nameJP: 'ケンペゴウダ国際空港', city: 'Bangalore', country: 'India', lat: 13.1986, lng: 77.7066 },
    'HYD': { name: 'Rajiv Gandhi Intl', nameJP: 'ラジブ・ガンジー国際空港', city: 'Hyderabad', country: 'India', lat: 17.2403, lng: 78.4294 },
    'KHI': { name: 'Jinnah Intl', nameJP: 'ジンナー国際空港', city: 'Karachi', country: 'Pakistan', lat: 24.9065, lng: 67.1608 },
    'DAC': { name: 'Hazrat Shahjalal Intl', nameJP: 'ハズラット・シャージャラール国際空港', city: 'Dhaka', country: 'Bangladesh', lat: 23.8433, lng: 90.3978 },
    'KTM': { name: 'Tribhuvan Intl', nameJP: 'トリブバン国際空港', city: 'Kathmandu', country: 'Nepal', lat: 27.6966, lng: 85.3591 },
    'CMB': { name: 'Bandaranaike Intl', nameJP: 'バンダラナイケ国際空港', city: 'Colombo', country: 'Sri Lanka', lat: 7.1808, lng: 79.8841 },
    'MLE': { name: 'Velana Intl', nameJP: 'ヴェラナ国際空港', city: 'Malé', country: 'Maldives', lat: 4.1918, lng: 73.5290 },
    // ── Asia — Other ──────────────────────────────────────────────────────────
    'GUM': { name: 'Antonio B. Won Pat Intl', nameJP: 'アントニオ・B・ウォンパット国際空港', city: 'Guam', country: 'Guam', lat: 13.4834, lng: 144.7961 },
    'ULN': { name: 'Chinggis Khaan Intl', nameJP: 'チンギス・ハーン国際空港', city: 'Ulaanbaatar', country: 'Mongolia', lat: 47.8431, lng: 106.7666 },
    // ── Europe — UK & Western ─────────────────────────────────────────────────
    'LHR': { name: 'London Heathrow', nameJP: 'ロンドン・ヒースロー空港', city: 'London', country: 'UK', lat: 51.4700, lng: -0.4543 },
    'CDG': { name: 'Paris Charles de Gaulle', nameJP: 'パリ・シャルル・ド・ゴール空港', city: 'Paris', country: 'France', lat: 49.0097, lng: 2.5479 },
    'AMS': { name: 'Amsterdam Schiphol', nameJP: 'アムステルダム・スキポール空港', city: 'Amsterdam', country: 'Netherlands', lat: 52.3086, lng: 4.7639 },
    'BRU': { name: 'Brussels Airport', nameJP: 'ブリュッセル空港', city: 'Brussels', country: 'Belgium', lat: 50.9014, lng: 4.4844 },
    'DUB': { name: 'Dublin Airport', nameJP: 'ダブリン空港', city: 'Dublin', country: 'Ireland', lat: 53.4213, lng: -6.2700 },
    'LIS': { name: 'Lisbon Humberto Delgado', nameJP: 'リスボン・ウンベルト・デルガド空港', city: 'Lisbon', country: 'Portugal', lat: 38.7813, lng: -9.1359 },
    // ── Europe — Germany & Central ────────────────────────────────────────────
    'FRA': { name: 'Frankfurt Airport', nameJP: 'フランクフルト空港', city: 'Frankfurt', country: 'Germany', lat: 50.0379, lng: 8.5622 },
    'MUC': { name: 'Munich Airport', nameJP: 'ミュンヘン空港', city: 'Munich', country: 'Germany', lat: 48.3538, lng: 11.7861 },
    'BER': { name: 'Berlin Brandenburg Airport', nameJP: 'ベルリン・ブランデンブルク空港', city: 'Berlin', country: 'Germany', lat: 52.3667, lng: 13.5033 },
    'VIE': { name: 'Vienna Intl Airport', nameJP: 'ウィーン国際空港', city: 'Vienna', country: 'Austria', lat: 48.1103, lng: 16.5697 },
    'ZRH': { name: 'Zurich Airport', nameJP: 'チューリッヒ空港', city: 'Zurich', country: 'Switzerland', lat: 47.4647, lng: 8.5492 },
    'GVA': { name: 'Geneva Airport', nameJP: 'ジュネーブ空港', city: 'Geneva', country: 'Switzerland', lat: 46.2381, lng: 6.1089 },
    'PRG': { name: 'Prague Václav Havel Airport', nameJP: 'プラハ・ヴァーツラフ・ハヴェル空港', city: 'Prague', country: 'Czech Republic', lat: 50.1008, lng: 14.2600 },
    'BUD': { name: 'Budapest Ferenc Liszt Intl', nameJP: 'ブダペスト・フェレンツ・リスト国際空港', city: 'Budapest', country: 'Hungary', lat: 47.4298, lng: 19.2611 },
    'WAW': { name: 'Warsaw Chopin Airport', nameJP: 'ワルシャワ・ショパン空港', city: 'Warsaw', country: 'Poland', lat: 52.1672, lng: 20.9679 },
    // ── Europe — Scandinavia ──────────────────────────────────────────────────
    'ARN': { name: 'Stockholm Arlanda', nameJP: 'ストックホルム・アーランダ空港', city: 'Stockholm', country: 'Sweden', lat: 59.6519, lng: 17.9186 },
    'HEL': { name: 'Helsinki-Vantaa Airport', nameJP: 'ヘルシンキ・ヴァンター空港', city: 'Helsinki', country: 'Finland', lat: 60.3172, lng: 24.9633 },
    'CPH': { name: 'Copenhagen Airport', nameJP: 'コペンハーゲン空港', city: 'Copenhagen', country: 'Denmark', lat: 55.6179, lng: 12.6560 },
    'OSL': { name: 'Oslo Gardermoen', nameJP: 'オスロ・ガーデルモーエン空港', city: 'Oslo', country: 'Norway', lat: 60.1939, lng: 11.1004 },
    // ── Europe — Mediterranean ────────────────────────────────────────────────
    'IST': { name: 'Istanbul Airport', nameJP: 'イスタンブール空港', city: 'Istanbul', country: 'Turkey', lat: 41.2608, lng: 28.7418 },
    'FCO': { name: 'Rome Fiumicino', nameJP: 'ローマ・フィウミチーノ空港', city: 'Rome', country: 'Italy', lat: 41.8003, lng: 12.2389 },
    'MXP': { name: 'Milan Malpensa', nameJP: 'ミラノ・マルペンサ空港', city: 'Milan', country: 'Italy', lat: 45.6306, lng: 8.7281 },
    'BCN': { name: 'Barcelona El Prat', nameJP: 'バルセロナ・エル・プラット空港', city: 'Barcelona', country: 'Spain', lat: 41.2971, lng: 2.0785 },
    'MAD': { name: 'Adolfo Suárez Madrid–Barajas', nameJP: 'マドリード・バラハス空港', city: 'Madrid', country: 'Spain', lat: 40.4936, lng: -3.5668 },
    'ATH': { name: 'Athens Eleftherios Venizelos', nameJP: 'アテネ・エレフテリオス・ヴェニゼロス空港', city: 'Athens', country: 'Greece', lat: 37.9364, lng: 23.9445 },
    'ZAG': { name: 'Zagreb Airport', nameJP: 'ザグレブ空港', city: 'Zagreb', country: 'Croatia', lat: 45.7429, lng: 16.0688 },
    // ── Europe — Eastern ──────────────────────────────────────────────────────
    // ── Middle East ───────────────────────────────────────────────────────────
    'DOH': { name: 'Hamad Intl Airport', nameJP: 'ハマド国際空港', city: 'Doha', country: 'Qatar', lat: 25.2731, lng: 51.6081 },
    'AUH': { name: 'Abu Dhabi Intl Airport', nameJP: 'アブダビ国際空港', city: 'Abu Dhabi', country: 'UAE', lat: 24.4330, lng: 54.6511 },
    'DXB': { name: 'Dubai International Airport', nameJP: 'ドバイ国際空港', city: 'Dubai', country: 'UAE', lat: 25.2532, lng: 55.3657 },
    // ── Africa ────────────────────────────────────────────────────────────────
    'CAI': { name: 'Cairo Intl Airport', nameJP: 'カイロ国際空港', city: 'Cairo', country: 'Egypt', lat: 30.1219, lng: 31.4056 },
    'ADD': { name: 'Addis Ababa Bole Intl', nameJP: 'アディスアベバ・ボレ国際空港', city: 'Addis Ababa', country: 'Ethiopia', lat: 8.9779, lng: 38.7993 },
    'JNB': { name: 'O.R. Tambo Intl', nameJP: 'O.R.タンボ国際空港', city: 'Johannesburg', country: 'South Africa', lat: -26.1367, lng: 28.2411 },
    // ── Oceania ───────────────────────────────────────────────────────────────
    'SYD': { name: 'Sydney Kingsford Smith', nameJP: 'シドニー・キングスフォード・スミス空港', city: 'Sydney', country: 'Australia', lat: -33.9399, lng: 151.1753 },
    'MEL': { name: 'Melbourne Airport', nameJP: 'メルボルン空港', city: 'Melbourne', country: 'Australia', lat: -37.6690, lng: 144.8410 },
    'BNE': { name: 'Brisbane Airport', nameJP: 'ブリスベン空港', city: 'Brisbane', country: 'Australia', lat: -27.3842, lng: 153.1175 },
    'PER': { name: 'Perth Airport', nameJP: 'パース空港', city: 'Perth', country: 'Australia', lat: -31.9403, lng: 115.9674 },
    'AKL': { name: 'Auckland Airport', nameJP: 'オークランド空港', city: 'Auckland', country: 'New Zealand', lat: -37.0082, lng: 174.7850 },
    'CNS': { name: 'Cairns Airport', nameJP: 'ケアンズ空港', city: 'Cairns', country: 'Australia', lat: -16.8858, lng: 145.7552 },
    'TSA': { name: 'Taipei Songshan Airport', nameJP: '台北松山空港', city: 'Taipei', country: 'Taiwan', lat: 25.0694, lng: 121.5526 },
    'OKA': { name: 'Naha Airport', nameJP: '那覇空港', city: 'Naha', country: 'Japan', lat: 26.1958, lng: 127.6460 },
    'FUK': { name: 'Fukuoka Airport', nameJP: '福岡空港', city: 'Fukuoka', country: 'Japan', lat: 33.5853, lng: 130.4508 },
    'ITM': { name: 'Osaka Itami Airport', nameJP: '大阪伊丹空港', city: 'Osaka', country: 'Japan', lat: 34.7854, lng: 135.4382 },
    'NGO': { name: 'Chubu Centrair International Airport', nameJP: '中部国際空港', city: 'Nagoya', country: 'Japan', lat: 34.8583, lng: 136.8050 },
    'CTS': { name: 'New Chitose Airport', nameJP: '新千歳空港', city: 'Sapporo', country: 'Japan', lat: 42.7752, lng: 141.6922 },
    // ── Codeshare-only cities (booked via partner connection, not ANA-served) ──
    'CMN': { name: 'Mohammed V Intl', nameJP: 'カサブランカ・モハメド5世国際空港', city: 'Casablanca', country: 'Morocco', lat: 33.3675, lng: -7.5900 },
    'LOS': { name: 'Murtala Muhammed Intl', nameJP: 'ラゴス・ムルタラ・ムハンマド国際空港', city: 'Lagos', country: 'Nigeria', lat: 6.5774, lng: 3.3212 },
    'NBO': { name: 'Jomo Kenyatta Intl', nameJP: 'ナイロビ・ジョモケニヤッタ国際空港', city: 'Nairobi', country: 'Kenya', lat: -1.3192, lng: 36.9278 },
    'GRU': { name: 'São Paulo/Guarulhos Intl', nameJP: 'サンパウロ・グアルーリョス国際空港', city: 'São Paulo', country: 'Brazil', lat: -23.4356, lng: -46.4731 },
    'SCL': { name: 'Arturo Merino Benítez Intl', nameJP: 'サンティアゴ国際空港', city: 'Santiago', country: 'Chile', lat: -33.3930, lng: -70.7858 },
    'EZE': { name: 'Ministro Pistarini Intl', nameJP: 'ブエノスアイレス・エセイサ国際空港', city: 'Buenos Aires', country: 'Argentina', lat: -34.8222, lng: -58.5358 },
    'GIG': { name: 'Rio de Janeiro/Galeão Intl', nameJP: 'リオデジャネイロ・ガレアン国際空港', city: 'Rio de Janeiro', country: 'Brazil', lat: -22.8090, lng: -43.2436 },
    'BOG': { name: 'El Dorado Intl', nameJP: 'ボゴタ・エルドラード国際空港', city: 'Bogotá', country: 'Colombia', lat: 4.7016, lng: -74.1469 },
    'LIM': { name: 'Jorge Chávez Intl', nameJP: 'リマ・ホルヘチャベス国際空港', city: 'Lima', country: 'Peru', lat: -12.0219, lng: -77.1143 },
    'NAN': { name: 'Nadi Intl', nameJP: 'ナンディ国際空港', city: 'Nadi', country: 'Fiji', lat: -17.7554, lng: 177.4434 },
    'PPT': { name: 'Faa\'a Intl', nameJP: 'パペーテ・ファアア国際空港', city: 'Papeete', country: 'French Polynesia', lat: -17.5537, lng: -149.6069 },
};

function searchAirports(query) {
    if (!query || query.length < 1) return [];
    const q = query.toUpperCase().trim();
    const results = [];
    for (const [code, airport] of Object.entries(AIRPORTS)) {
        if (
            code.startsWith(q) ||
            airport.city.toUpperCase().includes(q) ||
            airport.name.toUpperCase().includes(q) ||
            airport.country.toUpperCase().includes(q) ||
            (airport.metro && airport.metro.toUpperCase().includes(q))
        ) {
            results.push({ code, ...airport });
        }
    }
    return results.slice(0, 6);
}
