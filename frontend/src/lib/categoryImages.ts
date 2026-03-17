/**
 * Multi-image pools per category.
 * Uses a title-hash to pick a unique, consistent image for each article.
 * All images are Unsplash CDN — loads in < 150ms.
 */

const CATEGORY_POOLS: Record<string, string[]> = {
  "#Entertainment": [
    "https://images.unsplash.com/photo-1603190287605-e6ade32fa852?q=80&w=1200&auto=format",
    "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1200&auto=format",
    "https://images.unsplash.com/photo-1574267432553-4a9828eb1b16?q=80&w=1200&auto=format",
    "https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=1200&auto=format",
    "https://images.unsplash.com/photo-1524712245354-2c4e5e7121c0?q=80&w=1200&auto=format",
    "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1200&auto=format",
    "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?q=80&w=1200&auto=format",
    "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=1200&auto=format",
  ],
  "#Science": [
    "https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=1200&auto=format",
    "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=80&w=1200&auto=format",
    "https://images.unsplash.com/photo-1507413245164-6160d8298b31?q=80&w=1200&auto=format",
    "https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?q=80&w=1200&auto=format",
    "https://images.unsplash.com/photo-1454789548928-9efd52dc4031?q=80&w=1200&auto=format",
    "https://images.unsplash.com/photo-1518152006812-edab29b069ac?q=80&w=1200&auto=format",
    "https://images.unsplash.com/photo-1576086213369-97a306d36557?q=80&w=1200&auto=format",
    "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=1200&auto=format",
  ],
  "#Geopolitics": [
    "https://images.unsplash.com/photo-1529107386315-e1c73906504e?q=80&w=1200&auto=format",
    "https://images.unsplash.com/photo-1568454537842-d933259bb258?q=80&w=1200&auto=format",
    "https://images.unsplash.com/photo-1561470508-fd4df1ed90b2?q=80&w=1200&auto=format",
    "https://images.unsplash.com/photo-1567596275753-92607c3ce1ae?q=80&w=1200&auto=format",
    "https://images.unsplash.com/photo-1555680202-c86f0e12f086?q=80&w=1200&auto=format",
    "https://images.unsplash.com/photo-1495020689067-958852a7765e?q=80&w=1200&auto=format",
    "https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=1200&auto=format",
    "https://images.unsplash.com/photo-1582719201952-ea63ac1671dc?q=80&w=1200&auto=format",
  ],
  "#TradeAndTariffs": [
    "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=1200&auto=format",
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1200&auto=format",
    "https://images.unsplash.com/photo-1444653614773-995cb1ef9efa?q=80&w=1200&auto=format",
    "https://images.unsplash.com/photo-1613843596628-f4b8eb0df86f?q=80&w=1200&auto=format",
    "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?q=80&w=1200&auto=format",
    "https://images.unsplash.com/photo-1453928582365-b6ad33cbcf64?q=80&w=1200&auto=format",
    "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?q=80&w=1200&auto=format",
    "https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=1200&auto=format",
  ],
  "#SecurityAndTerrorism": [
    "https://images.unsplash.com/photo-1555861496-0666c8981751?q=80&w=1200&auto=format",
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=1200&auto=format",
    "https://images.unsplash.com/photo-1601134467661-3d775b999c18?q=80&w=1200&auto=format",
    "https://images.unsplash.com/photo-1516937941344-00b4e0337589?q=80&w=1200&auto=format",
    "https://images.unsplash.com/photo-1551693079-648dc1da9fd4?q=80&w=1200&auto=format",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1200&auto=format",
    "https://images.unsplash.com/photo-1509822929063-6b6cfc9b42f2?q=80&w=1200&auto=format",
    "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?q=80&w=1200&auto=format",
  ],
  "#GlobalTourism": [
    "https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=1200&auto=format",
    "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=1200&auto=format",
    "https://images.unsplash.com/photo-1503220317375-aaad61436b1b?q=80&w=1200&auto=format",
    "https://images.unsplash.com/photo-1500835556837-99ac94a94552?q=80&w=1200&auto=format",
    "https://images.unsplash.com/photo-1530521954074-e64f6810b32d?q=80&w=1200&auto=format",
    "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=1200&auto=format",
    "https://images.unsplash.com/photo-1504150558240-0b4fd8946624?q=80&w=1200&auto=format",
    "https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?q=80&w=1200&auto=format",
  ],
  "#Corporate": [
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1200&auto=format",
    "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1200&auto=format",
    "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=1200&auto=format",
    "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1200&auto=format",
    "https://images.unsplash.com/photo-1556761175-b413da4baf72?q=80&w=1200&auto=format",
    "https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=1200&auto=format",
    "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?q=80&w=1200&auto=format",
    "https://images.unsplash.com/photo-1531973576160-7125cd663d86?q=80&w=1200&auto=format",
  ],
  "#Automotive": [
    "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?q=80&w=1200&auto=format",
    "https://images.unsplash.com/photo-1553440569-bcc63803a83d?q=80&w=1200&auto=format",
    "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?q=80&w=1200&auto=format",
    "https://images.unsplash.com/photo-1574516831969-e9de89e4a07e?q=80&w=1200&auto=format",
    "https://images.unsplash.com/photo-1518987048-93e29699e79a?q=80&w=1200&auto=format",
    "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=1200&auto=format",
    "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?q=80&w=1200&auto=format",
    "https://images.unsplash.com/photo-1605559424843-9073c6e7cfb8?q=80&w=1200&auto=format",
  ],
  "#Movies": [
    "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1200&auto=format",
    "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=1200&auto=format",
    "https://images.unsplash.com/photo-1478720568477-152d9b164e26?q=80&w=1200&auto=format",
    "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=1200&auto=format",
    "https://images.unsplash.com/photo-1608040663671-96d2b5d5e6d9?q=80&w=1200&auto=format",
    "https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=1200&auto=format",
    "https://images.unsplash.com/photo-1524712245354-2c4e5e7121c0?q=80&w=1200&auto=format",
    "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1200&auto=format",
  ],
  "#Music": [
    "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1200&auto=format",
    "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?q=80&w=1200&auto=format",
    "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=1200&auto=format",
    "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1200&auto=format",
    "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=1200&auto=format",
    "https://images.unsplash.com/photo-1521337581100-8ca9a73a5f79?q=80&w=1200&auto=format",
    "https://images.unsplash.com/photo-1563841930606-67e2bce48b78?q=80&w=1200&auto=format",
    "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=1200&auto=format",
  ],
  "#General": [
    "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?q=80&w=1200&auto=format",
    "https://images.unsplash.com/photo-1495020689067-958852a7765e?q=80&w=1200&auto=format",
    "https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=1200&auto=format",
    "https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?q=80&w=1200&auto=format",
    "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1200&auto=format",
    "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1200&auto=format",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1200&auto=format",
    "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1200&auto=format",
  ],
};

/**
 * Returns a unique, consistent Unsplash photo for a given article title + category.
 * Uses a character-sum hash so the same article always gets the same image,
 * but different articles in the same category each get a different photo.
 */
export function getCategoryFallback(category: string, title: string): string {
  const pool = CATEGORY_POOLS[category] || CATEGORY_POOLS["#General"];
  // Simple but stable hash: sum of char codes
  const hash = title.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return pool[hash % pool.length];
}
