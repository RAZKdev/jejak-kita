import { Country, City } from './schema';

export const BASELINE_COUNTRIES: Country[] = [
  {
    id: 'jp',
    name: 'Jepang',
    local_name: '日本 (Japan)',
    code: 'JP',
    is_priority: true,
    currency_code: 'JPY',
    description: 'Destinasi prioritas utama. Transportasi teratur, kuliner variatif, dan fasilitas publik sangat ramah pejalan kaki.',
  },
  {
    id: 'kr',
    name: 'Korea Selatan',
    local_name: '대한민국 (South Korea)',
    code: 'KR',
    is_priority: true,
    currency_code: 'KRW',
    description: 'Destinasi prioritas utama. Perpaduan budaya dinasti dan gaya hidup modern dengan akses transit yang nyaman.',
  },
  {
    id: 'cn',
    name: 'China',
    local_name: '中国 (China)',
    code: 'CN',
    is_priority: true,
    currency_code: 'CNY',
    description: 'Destinasi prioritas utama. Situs sejarah peradaban megah dan jalur kereta cepat antarkota modern.',
  },
  {
    id: 'sg',
    name: 'Singapura',
    local_name: 'Singapore',
    code: 'SG',
    is_priority: false,
    currency_code: 'SGD',
    description: 'Destinasi alternatif. Dekat dari Indonesia, ramah lansia/keluarga, fasilitas aksesibilitas pedestrian nomor satu.',
  },
  {
    id: 'my',
    name: 'Malaysia',
    local_name: 'Malaysia',
    code: 'MY',
    is_priority: false,
    currency_code: 'MYR',
    description: 'Destinasi alternatif. Pilihan kuliner halal yang sangat melimpah, biaya terjangkau, dan kedekatan bahasa.',
  },
  {
    id: 'tw',
    name: 'Taiwan',
    local_name: '台灣 (Taiwan)',
    code: 'TW',
    is_priority: false,
    currency_code: 'TWD',
    description: 'Destinasi alternatif. Keramahan warga lokal, pasar malam legendaris, dan sistem kereta cepat yang efisien.',
  },
  {
    id: 'th',
    name: 'Thailand',
    local_name: 'ประเทศไทย (Thailand)',
    code: 'TH',
    is_priority: false,
    currency_code: 'THB',
    description: 'Destinasi alternatif. Kekayaan kuil bersejarah, kehangatan budaya, dan variasi belanja yang menarik.',
  },
];

export const BASELINE_CITIES: City[] = [
  // Jepang
  { id: 'tokyo', country_id: 'jp', name: 'Tokyo', local_name: '東京', is_priority: true, description: 'Metropolis modern dengan taman tenang dan transit efisien.' },
  { id: 'kyoto', country_id: 'jp', name: 'Kyoto', local_name: '京都', is_priority: true, description: 'Pusat tradisi, kuil bersejarah, dan atmosfer klasik yang tenang.' },
  { id: 'osaka', country_id: 'jp', name: 'Osaka', local_name: '大阪', is_priority: true, description: 'Kota kuliner bersahabat dengan akses mudah ke wilayah Kansai.' },

  // Korea Selatan
  { id: 'seoul', country_id: 'kr', name: 'Seoul', local_name: '서울', is_priority: true, description: 'Ibukota dinamis dengan istana Joseon dan area belanja nyaman.' },
  { id: 'busan', country_id: 'kr', name: 'Busan', local_name: '부산', is_priority: true, description: 'Kota pelabuhan pesisir dengan udara segar dan pemandangan laut.' },
  { id: 'gyeongju', country_id: 'kr', name: 'Gyeongju', local_name: '경주', is_priority: true, description: 'Museum terbuka bersejarah Silla dengan ritme kota yang santai.' },

  // China
  { id: 'beijing', country_id: 'cn', name: 'Beijing', local_name: '北京', is_priority: true, description: 'Kota Terlarang dan Tembok Besar dengan warisan ribuan tahun.' },
  { id: 'shanghai', country_id: 'cn', name: 'Shanghai', local_name: '上海', is_priority: true, description: 'Pesisir modern dengan arsitektur klasik The Bund dan taman Yu Garden.' },
  { id: 'xian', country_id: 'cn', name: "Xi'an", local_name: '西安', is_priority: true, description: 'Titik awal Jalur Sutra dan prajurit terakota yang legendaris.' },

  // Alternatif
  { id: 'singapore-city', country_id: 'sg', name: 'Singapura', local_name: 'Singapore', is_priority: false, description: 'Kota taman yang bersih dan sangat ramah pedestrian.' },
  { id: 'kuala-lumpur', country_id: 'my', name: 'Kuala Lumpur', local_name: 'Kuala Lumpur', is_priority: false, description: 'Pusat belanja, Menara Kembar Petronas, dan kenyamanan transit.' },
  { id: 'penang', country_id: 'my', name: 'Penang', local_name: 'George Town', is_priority: false, description: 'Kota warisan budaya UNESCO dan surga kuliner legendaris.' },
  { id: 'taipei', country_id: 'tw', name: 'Taipei', local_name: '台北', is_priority: false, description: 'Kota modern dengan pemandian air panas dan museum kelas dunia.' },
  { id: 'tainan', country_id: 'tw', name: 'Tainan', local_name: '台南', is_priority: false, description: 'Kota tertua Taiwan dengan kekayaan kuliner tradisional tempo dulu.' },
  { id: 'bangkok', country_id: 'th', name: 'Bangkok', local_name: 'กรุงเทพฯ', is_priority: false, description: 'Pusat budaya tepi sungai Chao Phraya dan pasar belanja semarak.' },
];
