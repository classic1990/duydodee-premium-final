---
name: skill-creator-v2
description: ขั้นสูงสำหรับการสร้างและปรับปรุง Skill อื่นๆ โดยใช้กระบวนการ Draft, Test (Benchmarking), Review และ Iteration เพื่อให้ได้ Skill ที่แม่นยำและมีประสิทธิภาพสูงสุด
---

# Skill Creator V2 (Advanced Edition)

Skill นี้คือเครื่องมือสำหรับช่วยสร้าง Skill ใหม่ๆ หรือปรับปรุง Skill ที่มีอยู่แล้วผ่านกระบวนการที่เป็นระบบ (Research -> Draft -> Test -> Evaluate -> Iterate)

## High-Level Process
1. **Understand Intent:** ทำความเข้าใจว่าต้องการให้ Skill ทำอะไร
2. **Draft Skill:** เขียน SKILL.md เริ่มต้น
3. **Test Prompts:** สร้างเคสทดสอบ (Test cases)
4. **Evaluation:** ตรวจสอบผลลัพธ์ทั้งเชิงคุณภาพ (Qualitative) และปริมาณ (Quantitative)
5. **Iteration:** ปรับปรุงตาม Feedback จนกว่าจะพอใจ

## Creating a Skill
### 1. Capture Intent
ถามคำถามเพื่อทำความเข้าใจ:
- Skill นี้ช่วยให้ Claude ทำอะไรได้?
- ควรจะทำงานเมื่อไหร่ (Trigger context)?
- Output ที่คาดหวังคืออะไร?

### 2. Anatomy of a Skill
```
skill-name/
├── SKILL.md (คำแนะนำหลัก)
├── scripts/ (โค้ดสำหรับงานที่ต้องทำซ้ำๆ)
├── references/ (เอกสารอ้างอิงหรือ Schema)
└── assets/ (ไฟล์ Template หรือรูปภาพ)
```

## Writing Guide
- ใช้ประโยคคำสั่ง (Imperative form)
- เน้นอธิบาย "ทำไม (Why)" แทนที่จะใช้แค่คำว่า "ต้อง (MUST)"
- รักษาความกระชับ (Keep it lean) เพื่อประหยัด Context window

---

### [เนื้อหาเพิ่มเติมจากผู้ใช้]
*(ส่วนนี้คือคู่มือการทำ Evaluation และ Iteration ตามที่คุณส่งมา)*

### Test Cases & Running Evaluation
- สร้าง `evals/evals.json` เพื่อเก็บ Prompts
- รันการทดสอบเทียบกับ Baseline (แบบมี Skill กับไม่มี Skill)
- ใช้ `grader.md` ในการตรวจให้คะแนน
- สร้าง Viewer เพื่อให้ผู้ใช้รีวิวผ่าน Browser

### Description Optimization
- สร้าง Eval Queries 20 รายการ (Should-trigger vs Should-not-trigger)
- รัน Optimization Loop เพื่อหาคำอธิบาย (Description) ที่ดีที่สุดในการเรียกใช้ Skill

---
*หมายเหตุ: Skill นี้อ้างอิงขั้นตอนจากระบบขั้นสูง หากต้องการรันสคริปต์ Benchmark หรือ Grader จำเป็นต้องมีไฟล์ Python/Node.js ที่เกี่ยวข้องเตรียมไว้ในโฟลเดอร์ scripts/*
