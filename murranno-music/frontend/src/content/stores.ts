// Store network from the current murrannomusic.co "Stores we distribute music to" list, grouped by where they reach.
export const STORE_REGIONS = [
  {
    region: 'Global streaming',
    note: 'The services your listeners open every day.',
    tone: 'mm-pink',
    stores: ['Spotify', 'Apple Music', 'iTunes', 'YouTube Music', 'Amazon Music', 'Deezer', 'Tidal', 'Pandora', 'Napster', 'iHeartRadio', 'Qobuz', '7digital'],
  },
  {
    region: 'Africa & the Middle East',
    note: 'Home markets, where the next wave is already playing.',
    tone: 'mm-yellow',
    stores: ['Boomplay', 'Audiomack', 'MusicTime', 'Spinlet', 'Ayoba', 'Anghami'],
  },
  {
    region: 'Asia & beyond',
    note: 'India, China, Korea, Russia, Latin America and more.',
    tone: 'mm-blue',
    stores: ['JioSaavn', 'Gaana', 'Wynk', 'Hungama', 'Tencent (QQ, KuGou, Kuwo)', 'NetEase Cloud Music', 'Melon, Genie, Bugs & FLO', 'KKBOX', 'JOOX', 'Yandex Music', 'Zvooq', 'BOOM', 'Claro música', 'Kuack', 'Q.SIC', 'TIMMUSIC'],
  },
  {
    region: 'Social, video & discovery',
    note: 'Where songs go viral and get identified.',
    tone: 'mm-lilac',
    stores: ['TikTok', 'Douyin', 'Instagram & Facebook', 'Snapchat', 'CapCut', 'Resso', 'Shazam', 'Gracenote', 'Peloton Music', 'Soundtrack Your Brand', 'PlayNetwork', 'TouchTunes'],
  },
] as const;
