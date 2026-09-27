const express = require("express");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static("public"));

const paletteByCategory = {
  "การนอน": ["#ffd7a6", "#f6b771"],
  "พฤติกรรม": ["#d9c5ff", "#b39ae9"],
  "ร่างกาย": ["#ffc1cf", "#fba1b5"],
  "ประสาทสัมผัส": ["#cfe2ff", "#a5c7ff"],
  "ประวัติศาสตร์": ["#c7f2d3", "#8ad9a4"],
  "ทั่วไป": ["#d8d9ff", "#b7b8f7"]
};

const catPhotoPool = [
  "/cats/cat-1.jpg",
  "/cats/cat-2.jpg",
  "/cats/cat-3.jpg",
  "/cats/cat-4.jpg",
  "/cats/cat-5.jpg",
  "/cats/cat-6.jpg",
  "/cats/cat-7.jpg",
  "/cats/cat-8.jpg",
  "/cats/cat-9.jpg",
  "/cats/cat-10.jpg",
  "/cats/cat-11.jpg",
  "/cats/cat-12.jpg",
  "/cats/cat-13.jpg",
  "/cats/cat-14.jpg",
  "/cats/cat-15.jpg",
  "/cats/cat-16.jpg"
];

function buildCatImage(fact) {
  const index = ((fact.id - 1) % catPhotoPool.length + catPhotoPool.length) % catPhotoPool.length;
  return catPhotoPool[index];
}

const rawFacts = [
  {
    id: 1,
    text: "แมวใช้เวลาส่วนใหญ่ไปกับการนอน",
    detail: "แมวเป็นสัตว์ที่ใช้เวลานอนค่อนข้างมาก โดยสามารถนอนได้หลายชั่วโมงต่อวัน การนอนช่วยให้แมวพักฟื้นร่างกายและเก็บพลังงานเอาไว้สำหรับช่วงเวลาที่ตื่นและทำกิจกรรมต่าง ๆ",
    category: "การนอน",
    color: "sleep",
    cat: "🐱"
  },
  {
    id: 2,
    text: "ลูกแมวเกิดมาพร้อมกับดวงตาที่ปิดอยู่",
    detail: "ลูกแมวแรกเกิดจะยังไม่สามารถลืมตาได้ทันที เพราะดวงตายังอยู่ในช่วงพัฒนา โดยทั่วไปลูกแมวจะเริ่มลืมตาหลังจากเกิดได้ประมาณหนึ่งสัปดาห์ และการมองเห็นจะค่อย ๆ พัฒนาขึ้นตามอายุ",
    category: "ร่างกาย",
    color: "body",
    cat: "😺"
  },
  {
    id: 3,
    text: "แมวใช้หนวดช่วยรับรู้สิ่งรอบตัว",
    detail: "หนวดของแมวไม่ได้มีไว้เพียงเพื่อความสวยงาม แต่เป็นอวัยวะรับสัมผัสที่สำคัญ หนวดช่วยให้แมวรับรู้การเคลื่อนไหวของอากาศและช่วยประเมินสภาพแวดล้อมรอบตัว",
    category: "ประสาทสัมผัส",
    color: "sense",
    cat: "🐈"
  },
  {
    id: 4,
    text: "แมวสามารถหมุนใบหูเพื่อหาตำแหน่งของเสียง",
    detail: "กล้ามเนื้อบริเวณหูของแมวช่วยให้สามารถขยับและหมุนใบหูเพื่อรับเสียงจากทิศทางต่าง ๆ ได้ ความสามารถนี้ช่วยให้แมวรับรู้สิ่งที่เกิดขึ้นรอบตัวได้อย่างรวดเร็ว",
    category: "ประสาทสัมผัส",
    color: "sense",
    cat: "😻"
  },
  {
    id: 5,
    text: "แมวแต่ละตัวมีลักษณะเฉพาะของจมูกที่แตกต่างกัน",
    detail: "พื้นผิวและลวดลายบริเวณจมูกของแมวแต่ละตัวมีความแตกต่างกัน จึงสามารถมองได้ว่าเป็นลักษณะเฉพาะตัวอย่างหนึ่งของแมวแต่ละตัว คล้ายกับความแตกต่างของลายนิ้วมือในมนุษย์",
    category: "ร่างกาย",
    color: "body",
    cat: "😸"
  },
  {
    id: 6,
    text: "แมวโตมีฟันทั้งหมด 30 ซี่",
    detail: "เมื่อโตเต็มวัย แมวบ้านโดยทั่วไปจะมีฟันจำนวน 30 ซี่ ส่วนลูกแมวจะมีฟันน้ำนม 26 ซี่ ก่อนที่ฟันน้ำนมจะค่อย ๆ หลุดและถูกแทนที่ด้วยฟันแท้เมื่อโตขึ้น",
    category: "ร่างกาย",
    color: "body",
    cat: "😼"
  },
  {
    id: 7,
    text: "แมวไม่สามารถรับรสหวานได้เหมือนมนุษย์",
    detail: "ระบบรับรสของแมวแตกต่างจากมนุษย์ โดยแมวไม่มีตัวรับรสหวานที่ทำงานได้ตามปกติ ดังนั้นแมวจึงไม่สามารถรับรู้รสหวานได้ในแบบเดียวกับมนุษย์",
    category: "ประสาทสัมผัส",
    color: "sense",
    cat: "😽"
  },
  {
    id: 8,
    text: "แมวใช้เสียงครางเพื่อสื่อสารและแสดงพฤติกรรมหลายรูปแบบ",
    detail: "เสียงครางของแมวเป็นเสียงที่พบได้บ่อย และอาจเกิดขึ้นในหลายสถานการณ์ แมวมักครางเมื่อรู้สึกผ่อนคลาย แต่เสียงครางก็สามารถเกิดขึ้นในสถานการณ์อื่น ๆ ได้เช่นกัน จึงควรดูพฤติกรรมโดยรวมของแมวประกอบด้วย",
    category: "พฤติกรรม",
    color: "behavior",
    cat: "🐱"
  },
  {
    id: 9,
    text: "แมวใช้การเลียขนเพื่อทำความสะอาดร่างกาย",
    detail: "แมวใช้เวลาส่วนหนึ่งในแต่ละวันไปกับการเลียขนและดูแลความสะอาดของตัวเอง พฤติกรรมนี้ช่วยดูแลขนและเป็นหนึ่งในพฤติกรรมตามธรรมชาติที่พบได้ทั่วไปในแมว",
    category: "พฤติกรรม",
    color: "behavior",
    cat: "😺"
  },
  {
    id: 10,
    text: "แมวสามารถกระโดดได้สูงเมื่อเทียบกับขนาดตัว",
    detail: "แมวมีโครงสร้างร่างกายและกล้ามเนื้อที่ช่วยให้สามารถกระโดดและปีนป่ายได้ดี ขาหลังที่แข็งแรงช่วยส่งแรงในการกระโดด ทำให้แมวสามารถเคลื่อนที่ขึ้นไปยังพื้นที่สูงได้อย่างคล่องตัว",
    category: "พฤติกรรม",
    color: "behavior",
    cat: "🐈‍⬛"
  },
  {
    id: 11,
    text: "แมวใช้กลิ่นเป็นส่วนหนึ่งในการสื่อสาร",
    detail: "แมวมีการใช้กลิ่นเป็นหนึ่งในวิธีสื่อสารกับแมวตัวอื่น โดยสามารถทิ้งกลิ่นไว้ตามบริเวณต่าง ๆ ผ่านพฤติกรรมหลายรูปแบบ กลิ่นจึงมีบทบาทสำคัญต่อการรับรู้ข้อมูลเกี่ยวกับสภาพแวดล้อม",
    category: "พฤติกรรม",
    color: "behavior",
    cat: "😻"
  },
  {
    id: 12,
    text: "แมวมีเปลือกตาชั้นที่สาม",
    detail: "แมวมีเยื่อบาง ๆ ที่เรียกว่าเปลือกตาชั้นที่สามอยู่บริเวณดวงตา โครงสร้างนี้มีบทบาทในการช่วยปกป้องและดูแลพื้นผิวของดวงตา ซึ่งเป็นหนึ่งในลักษณะทางกายภาพที่น่าสนใจของแมว",
    category: "ร่างกาย",
    color: "body",
    cat: "🙀"
  },
  {
    id: 13,
    text: "ชาวอียิปต์โบราณให้ความสำคัญกับแมว",
    detail: "ชาวอียิปต์โบราณให้ความเคารพแมวและมีความเชื่อมโยงระหว่างแมวกับเทพี Bastet ซึ่งเป็นหนึ่งในเหตุผลที่แมวมีบทบาทสำคัญในวัฒนธรรมและประวัติศาสตร์ของอียิปต์โบราณ",
    category: "ประวัติศาสตร์",
    color: "history",
    cat: "🐈"
  },
  {
    id: 14,
    text: "แมวชอบพักผ่อนในบริเวณที่รู้สึกปลอดภัย",
    detail: "แมวมักเลือกสถานที่พักผ่อนที่ทำให้รู้สึกปลอดภัยและสบาย เช่น บริเวณที่เงียบหรือพื้นที่ที่สามารถสังเกตสิ่งรอบตัวได้ พฤติกรรมการเลือกพื้นที่พักเป็นส่วนหนึ่งของธรรมชาติของแมว",
    category: "การนอน",
    color: "sleep",
    cat: "😴"
  },
  {
    id: 15,
    text: "แมวสามารถใช้การเคลื่อนไหวของหูเพื่อแสดงความสนใจ",
    detail: "การเปลี่ยนทิศทางของใบหูสามารถเกิดขึ้นเมื่อแมวกำลังสนใจเสียงหรือสิ่งที่เกิดขึ้นรอบตัว การสังเกตหูร่วมกับท่าทางอื่น ๆ สามารถช่วยให้เราเข้าใจพฤติกรรมของแมวได้มากขึ้น",
    category: "พฤติกรรม",
    color: "behavior",
    cat: "😸"
  },
  {
    id: 16,
    text: "แมวมีพฤติกรรมการดูแลตัวเองเป็นประจำ",
    detail: "การเลียขนและทำความสะอาดร่างกายเป็นพฤติกรรมตามธรรมชาติของแมว แมวใช้ลิ้นในการดูแลขนและร่างกายของตัวเองเป็นประจำ จึงเป็นเหตุผลหนึ่งที่แมวมักใช้เวลาในการทำความสะอาดตัวเอง",
    category: "พฤติกรรม",
    color: "behavior",
    cat: "😽"
  }
];

const facts = rawFacts.map(fact => ({
  ...fact,
  th: fact.text,
  image: buildCatImage(fact)
}));

let watchlist = [];
let history = [];

function sortFacts(items, algorithm) {
  const a = [...items];

  if (algorithm === "insertion") {
    for (let i = 1; i < a.length; i++) {
      const key = a[i];
      let j = i - 1;
      while (j >= 0 && a[j].text.length < key.text.length) {
        a[j + 1] = a[j];
        j--;
      }
      a[j + 1] = key;
    }
    return a;
  }

  if (algorithm === "bubble") {
    for (let i = 0; i < a.length - 1; i++) {
      for (let j = 0; j < a.length - 1 - i; j++) {
        if (a[j].text.length < a[j + 1].text.length) {
          [a[j], a[j + 1]] = [a[j + 1], a[j]];
        }
      }
    }
    return a;
  }

  for (let i = 0; i < a.length - 1; i++) {
    let max = i;
    for (let j = i + 1; j < a.length; j++) {
      if (a[j].text.length > a[max].text.length) max = j;
    }
    [a[i], a[max]] = [a[max], a[i]];
  }
  return a;
}

app.get("/facts", (req, res) => {
  const algorithm = req.query.sort || "selection";
  const start = performance.now();
  const data = sortFacts(facts, algorithm);
  const ms = (performance.now() - start).toFixed(3);

  res.json({ algorithm, count: data.length, ms, data });
});

app.get("/watchlist", (req, res) => {
  res.json({
    items: watchlist,
    size: watchlist.length,
    next: watchlist[0] || null
  });
});

app.post("/watchlist", (req, res) => {
  const fact = facts.find(x => x.id === Number(req.body.id));
  if (!fact) return res.status(404).json({ error: "ไม่พบข้อมูลนี้" });

  watchlist.push(fact);
  history.push({
    action: "ADD",
    fact,
    time: new Date().toLocaleTimeString("th-TH")
  });

  res.status(201).json({
    message: `เพิ่ม “${fact.th}” เข้ากอง Stack แล้ว`,
    size: watchlist.length
  });
});

app.delete("/watchlist/process", (req, res) => {
  if (!watchlist.length) return res.status(400).json({ error: "Stack ว่างอยู่" });

  const fact = watchlist.shift();
  history.push({
    action: "POP",
    fact,
    time: new Date().toLocaleTimeString("th-TH")
  });

  res.json({ message: "นำข้อมูลล่าสุดออกจาก Stack แล้ว", size: watchlist.length });
});

app.get("/history", (req, res) => {
  res.json({ history: [...history].reverse(), size: history.length });
});

app.post("/undo", (req, res) => {
  if (!history.length) return res.status(400).json({ error: "ยังไม่มีประวัติให้ย้อนกลับ" });

  const last = history.pop();

  if (last.action === "ADD") {
    const index = watchlist.findIndex(x => x.id === last.fact.id);
    if (index !== -1) watchlist.splice(index, 1);
  } else if (last.action === "POP") {
    watchlist.unshift(last.fact);
  }

  res.json({ message: "ย้อนกลับการทำงานล่าสุดแล้ว", size: watchlist.length });
});

app.listen(PORT, () => {
  console.log(`🚀 Meow Museum เปิดที่ http://localhost:${PORT}`);
});
